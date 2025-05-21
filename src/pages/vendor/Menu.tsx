import { useState, useRef, useEffect, useContext } from 'react';
import { PlusCircle, Save, X, Upload, ChevronDown, ChevronRight, Check, Trash2, Plus, DollarSign, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { toast } from 'sonner';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_MENU, GET_MENU, UPDATE_MENU, DELETE_MENU, OUT_OF_STOCK } from '../../lib/graphql/queries/menu';
import { useParams } from 'react-router-dom';
import { uploadImage } from '../../lib/api/upload';

// Types
interface MenuItemFormData {
  internalName: string;
  title: string;
  description: string;
  category: { value: string; label: string } | null;
  dietary: { value: string; label: string } | null;
  allergens: readonly { value: string; label: string }[];
  tags: readonly { value: string; label: string }[];
  showInMenu: boolean;
  image: File | null;
  imagePreview: string | null;
  variations: Variation[];
}

interface Variation {
  id: string;
  title: string;
  price: string;
  discounted: boolean;
  discountPrice: string;
  selectedOptions?: OptionItem[];
}

interface OptionItem {
  id: string;
  name: string;
  description: string;
  quantity: string;
  selected: boolean;
}

interface Dish {
  id: string;
  name: string;
  currentPrice: string;
  newPrice: string;
}

interface CustomOption {
  title: string;
  description: string;
  minQuantity: string;
  maxQuantity: string;
  dishes: Dish[];
}

interface MenuItem {
  internalName: String;
  id: string;
  title: string;
  description: string;
  category: { value: string; label: string } | null;
  price: string;
  imagePreview?: string | null;
  outOfStock: boolean;
}

type OptionsTab = 'available' | 'custom';

// Constants
const CATEGORIES = [
  { value: 'appetizers', label: 'Appetizers' },
  { value: 'main-courses', label: 'Main Courses' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'sides', label: 'Sides' },
  { value: 'specials', label: 'Specials' },
];

const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'dairy-free', label: 'Dairy Free' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

const ALLERGENS = [
  { value: 'nuts', label: 'Nuts' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'soy', label: 'Soy' },
  { value: 'fish', label: 'Fish' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'sesame', label: 'Sesame' },
];

const TAGS = [
  { value: 'spicy', label: 'Spicy' },
  { value: 'popular', label: 'Popular' },
  { value: 'new', label: 'New' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'chefs-special', label: "Chef's Special" },
  { value: 'organic', label: 'Organic' },
  { value: 'local', label: 'Local' },
];

const SAMPLE_DISHES = [
  { value: 'dish1', label: 'Margherita Pizza', price: '12.99' },
  { value: 'dish2', label: 'Chicken Tikka', price: '14.99' },
  { value: 'dish3', label: 'Vegetable Pasta', price: '10.99' },
  { value: 'dish4', label: 'Beef Burger', price: '13.99' },
  { value: 'dish5', label: 'Caesar Salad', price: '8.99' },
];

const AVAILABLE_OPTIONS: OptionItem[] = [
  {
    id: '1',
    name: 'Choose your beverages',
    description: 'Select your preferred drinks',
    quantity: '0 - 2',
    selected: false
  },
  {
    id: '2',
    name: 'Select your sides',
    description: 'Choose complementary sides',
    quantity: '0 - 3',
    selected: false
  },
  {
    id: '3',
    name: 'Add extra toppings',
    description: 'Customize with additional toppings',
    quantity: '0 - 5',
    selected: false
  }
];

export default function Menu() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [currentVariationId, setCurrentVariationId] = useState<string | null>(null);
  const [availableOptions, setAvailableOptions] = useState<any>([]);
  const [activeOptionsTab, setActiveOptionsTab] = useState<OptionsTab>('available');
  const [selectedDishes, setSelectedDishes] = useState<Dish[]>([]);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [currentDish, setCurrentDish] = useState<{ value: string; label: string; price: string } | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [customOption, setCustomOption] = useState<CustomOption>({
    title: '',
    description: '',
    minQuantity: '0',
    maxQuantity: '1',
    dishes: []
  });
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { bootStrapData } = useCurrency();
  const { restaurantId } = useParams();

  // Initialize menuItems from localStorage
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const savedItems = localStorage.getItem('menuItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });

  // Save menuItems to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
  }, [menuItems]);

  const initialFormState: MenuItemFormData = {
    internalName: "",
    title: '',
    description: '',
    category: null,
    dietary: null,
    allergens: [],
    tags: [],
    showInMenu: true,
    image: null,
    imagePreview: null,
    variations: [
      {
        id: '1',
        title: 'Regular',
        price: '',
        discounted: false,
        discountPrice: '',
      },
    ],
  };

  const [formData, setFormData] = useState<any>(initialFormState);
  const [menuData, setMenuData] = useState<any>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [variations, setVariations] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const [CREATE_NEW_MENU] = useMutation(CREATE_MENU);
  const [UPDATE_NEW_MENU] = useMutation(UPDATE_MENU);
  const [DELETE_NEW_MENU] = useMutation(DELETE_MENU);
  const [OUT_OF_STOCK_MENU] = useMutation(OUT_OF_STOCK);

  const { data, loading, error, refetch } = useQuery(GET_MENU, {
    variables: {
      restaurantId: restaurantId
    },
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
      console.error('Failed to fetch restaurant applications:', errorMessage);
      toast.error(errorMessage || t('rejected.failedtofetchapplications'));
    },
  });

  useEffect(() => {
    if (data?.getMenu?.food?.length) {
      setMenuData(data?.getMenu?.food);
    }
    if (data?.getMenu?.optionSetList?.length) {
      let updatedOptionSetList = data?.getMenu?.optionSetList.map(optionSet => {
        return {
          ...optionSet,
          dishes: optionSet.optionData?.map(option => {
            const food = data?.getMenu?.food.find(food => food?._id === option.foodId);
            return {
              ...option,
              name: food?.name || null
            };
          }) || []
        };
      });
      setVariations(updatedOptionSetList);
    }
  }, [data]);

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      if (Math.abs(aspectRatio - 4 / 3) > 0.1) {
        toast.error('Please upload an image with a 4:3 aspect ratio');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    };

    img.onerror = () => {
      toast.error('Failed to load image');
    };

    img.src = URL.createObjectURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-brand-primary', 'bg-brand-accent/10');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-brand-primary', 'bg-brand-accent/10');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    // Additional validation and handling as in handleImageChange
  };

  // Variation handlers
  const handleVariationChange = (id: string, field: keyof Variation, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    }));
  };

  const addVariation = () => {
    const newId = String(formData.variations.length + 1);
    setFormData((prev) => ({
      ...prev,
      variations: [
        ...prev.variations,
        {
          id: newId,
          title: '',
          price: '',
          discounted: false,
          discountPrice: '',
        },
      ],
    }));
  };

  const removeVariation = (id: string) => {
    if (formData.variations.length <= 1) {
      toast.error('You must have at least one variation');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.filter((v) => v.id !== id),
    }));
  };

  // Options handlers
  const toggleOptionSelection = (optionId: string) => {
    if (!availableOptions?.length) {
      setAvailableOptions([optionId]);
    } else {
      if (availableOptions.includes(optionId)) {
        setAvailableOptions((prev) => prev.filter((opt: any) => opt !== optionId));
      } else {
        setAvailableOptions((prev) => [...prev, optionId]);
      }
    }
  };

  const handleOpenOptionsPanel = (variationId: string) => {
    setCurrentVariationId(variationId);
    setShowOptionsPanel(true);
    const currentVariation = formData.variations.find((v) => v.id === variationId);
    setAvailableOptions(currentVariation?.optionSetList || []);
    setActiveOptionsTab('available');
  };

  const handleSaveOptions = () => {
    if (!currentVariationId) return;

    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((variation) =>
        variation.id === currentVariationId
          ? { ...variation, optionSetList: availableOptions }
          : variation
      ),
    }));

    toast.success('Options saved successfully');
    setShowOptionsPanel(false);
  };

  const handleCustomOptionChange = (field: keyof CustomOption, value: string) => {
    setCustomOption((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDishSelect = (selectedOption: any) => {
    if (!selectedOption) return;

    setCurrentDish(selectedOption);
    setNewPrice(selectedOption.price);
    setShowPriceModal(true);
  };

  const handleAddDish = () => {
    if (!currentDish) return;
    const newDish: Dish = {
      id: currentDish.value,
      name: currentDish.label,
      currentPrice: currentDish.price,
      newPrice: newPrice,
    };

    setSelectedDishes((prev) => [...prev, newDish]);
    setShowPriceModal(false);
    setCurrentDish(null);
    setNewPrice('');
  };

  const handleRemoveDish = (dishId: string) => {
    setSelectedDishes((prev) => prev.filter((dish) => dish.id !== dishId));
  };

  // Helper function to transform item data
  const transformItemData = (item: any) => {
    const diet = bootStrapData?.dietaryOptions?.find((item1: any) => item1?.enumVal == item?.dietaryType?.[0]);

    const allergen = item?.allergen?.map((item: string) =>
      bootStrapData?.allergens?.find((allergen: any) => allergen?.enumVal === item)
    )
      .filter(Boolean)
      .map((allergen: any) => ({
        ...allergen,
        label: allergen?.displayName,
        value: allergen?.enumVal
      }));

    const tags = item?.tags?.map((item: string) =>
      bootStrapData?.foodTags?.find((tag: any) => tag?.enumVal === item)
    )
      .filter(Boolean)
      .map((tag: any) => ({
        ...tag,
        label: tag?.displayName,
        value: tag?.enumVal
      }));

    return {
      id: item?._id,
      internalName: item?.internalName,
      title: item.name,
      description: item.description,
      dietary: diet ? {
        ...diet,
        label: diet?.displayName,
        value: diet?.enumVal
      } : null,
      allergens: allergen,
      tags: tags,
      showInMenu: !item?.hiddenFromMenu,
      image: item?.imageData?.images?.[0]?.url || null,
      imagePreview: item?.imageData?.images?.[0]?.url || null,
      variations: item?.variationList?.map((item: any, index: number) => ({
        ...item,
        price: String(item?.price),
        discounted: Boolean(item?.discountedPrice),
        discountPrice: String(item?.discountedPrice),
        id: index + 1
      }))
    };
  };

  // Edit and Delete handlers
  const handleEdit = (item: any) => {
    setEditItemId(item.id);
    setFormData(transformItemData(item));
    setShowForm(true);
  };

  const toggleStatus = async (item: any) => {
    const payload = transformItemData(item);

    try {
      const newMenuItem: any = {
        internalName: payload.internalName,
        active: !item?.active,
        allergen: payload.allergens?.map((item: any) => item?.value),
        dietaryType: [payload.dietary?.value],
        hasVariation: payload.variations?.length > 1,
        hiddenFromMenu: !payload.showInMenu,
        name: payload.title,
        description: payload.description,
        outOfStock: false,
        tags: payload.tags?.map((item: any) => item?.value),
        variationList: payload.variations?.map((item: any) => ({
          title: item?.title,
          optionSetList: item?.optionSetList || [],
          outOfStock: false,
          discountedPrice: parseFloat(item?.discountPrice),
          price: parseFloat(item?.price),
          "type": "ACTUAL_VARIATION",
        }))
      };

      const imageData = {
        images: [{
          type: "MAIN",
          url: payload.imagePreview?.includes("blob")
            ? await (async () => {
              const imageFormData = new FormData();
              imageFormData.append("file", payload.image);
              const uploadResult = await uploadImage(imageFormData) as any;

              if (!uploadResult?.success) {
                toast.error(uploadResult?.error || "Failed to upload image");
                return null;
              }

              return uploadResult.url;
            })()
            : payload.image
        }]
      };

      if (imageData.images[0].url) {
        newMenuItem.imageData = imageData;
      }

      const { data } = await UPDATE_NEW_MENU({
        variables: {
          restaurantId,
          input: { ...newMenuItem, _id: payload.id },
          updateFoodNewId: payload.id
        }
      });

      if (!data?.updateFoodNew) {
        throw new Error('Failed to update menu item');
      }

      setMenuData((prev: any) =>
        prev.map((item: any) =>
          item._id === payload.id ? data.updateFoodNew : item
        )
      );

      toast.success('Menu item updated successfully');
      return data.updateFoodNew;

    } catch (error: any) {
      toast.error(error.message || 'Failed to update menu item');
      throw error;
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (!itemToDelete) return;
      setIsDeleting(true);

      const { data } = await DELETE_NEW_MENU({
        variables: {
          restaurantId,
          deleteFoodNewId: itemToDelete
        }
      });

      setMenuData((prev: any) => prev.filter((item: any) => item._id !== itemToDelete));
      toast.success(t('menus.table.delete'));
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(t('menus.table.deleting'));
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleOutOfStock = async (id: string) => {
    try {
      await OUT_OF_STOCK_MENU({
        variables: {
          foodId: id,
          restaurantId
        }
      });
      setMenuData((prev) =>
        prev.map((item: any) =>
          item?._id === id ? { ...item, outOfStock: !item.outOfStock } : item
        )
      );
      toast.success(t('menus.table.outOfStock'));
    } catch (e) {
      console.log(e);
      toast.error('Failed to toggle out of stock');
    }
  };

  // Form submission
  const handleSubmit = async () => {
    setIsLoading(true);

    // Validate form
    if (!formData.title.trim()) {
      toast.error(t('menus.form.title') + ' is required');
      setIsLoading(false);
      return;
    }
    if (!formData.internalName.trim()) {
      toast.error(t('menus.form.internalName') + ' is required');
      setIsLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      toast.error(t('menus.form.description') + ' is required');
      setIsLoading(false);
      return;
    }
    if (!formData?.allergens?.length) {
      toast.error('At least one ' + t('menus.form.allergens') + ' is required');
      setIsLoading(false);
      return;
    }
    if (!formData?.dietary) {
      toast.error('At least one ' + t('menus.form.dietary') + ' is required');
      setIsLoading(false);
      return;
    }
    if (!formData?.image) {
      toast.error(t('menus.form.image') + ' is required');
      setIsLoading(false);
      return;
    }
    if (!formData?.variations?.length) {
      toast.error('At least one ' + t('menus.form.variations') + ' is required');
      setIsLoading(false);
      return;
    }
    for (const variation of formData.variations) {
      if (!variation.title.trim()) {
        toast.error(t('menus.form.variations') + ' title is required');
        setIsLoading(false);
        return;
      }

      if (!variation?.price?.trim() || isNaN(parseFloat(variation.price))) {
        toast.error('Valid price is required for all ' + t('menus.form.variations'));
        setIsLoading(false);
        return;
      }

      if (variation.discounted && (!variation.discountPrice.trim() || isNaN(parseFloat(variation.discountPrice)))) {
        toast.error('Valid discount price is required for discounted ' + t('menus.form.variations'));
        setIsLoading(false);
        return;
      }
    }

    const newMenuItem: any = {
      internalName: formData?.internalName,
      active: true,
      allergen: formData?.allergens?.map((item: any) => item?.value),
      dietaryType: [formData?.dietary?.value],
      hasVariation: formData?.variations?.length > 1,
      hiddenFromMenu: !formData?.showInMenu,
      name: formData.title,
      description: formData.description,
      outOfStock: false,
      tags: formData?.tags?.map((item: any) => item?.value),
      variationList: formData?.variations?.map((item: any) => ({
        title: item?.title,
        optionSetList: item?.optionSetList || [],
        outOfStock: false,
        discountedPrice: parseFloat(item?.discountPrice),
        price: parseFloat(item?.price),
        "type": "ACTUAL_VARIATION",
      }))
    };
    const imageData = {
      images: [{
        type: "MAIN",
        url: formData?.imagePreview?.includes("blob")
          ? await (async () => {
            const imageFormData = new FormData();
            imageFormData.append("file", formData?.image);
            const uploadResult = await uploadImage(imageFormData) as any;

            if (!uploadResult?.success) {
              toast.error(uploadResult?.error || "Failed to upload image");
              return null;
            }

            return uploadResult.url;
          })()
          : formData?.image
      }]
    };

    if (imageData.images[0].url) {
      newMenuItem.imageData = imageData;
    }
    try {
      try {
        const mutation = formData?.id ? UPDATE_NEW_MENU : CREATE_NEW_MENU;
        const variables = formData?.id ? {
          restaurantId,
          input: { ...newMenuItem, _id: formData.id },
          updateFoodNewId: formData.id
        } : {
          restaurantId,
          input: newMenuItem
        };

        const { data, errors } = await mutation({ variables });

        if (errors) {
          throw new Error(Array.isArray(errors) ? errors[0].message : 'Operation failed');
        }

        const updatedItem = formData?.id ? data?.updateFoodNew : data?.createFoodNew;

        if (!updatedItem) {
          throw new Error('No data received from server');
        }

        setMenuData((prev: any) =>
          formData?.id
            ? prev.map((item: any) => item._id === updatedItem._id ? updatedItem : item)
            : [...prev, updatedItem]
        );
        setFormData({
          internalName: "",
          title: '',
          description: '',
          category: null,
          dietary: null,
          allergens: [],
          tags: [],
          showInMenu: true,
          image: null,
          imagePreview: null,
          variations: [
            {
              id: '1',
              title: 'Regular',
              price: '',
              discounted: false,
              discountPrice: '',
            },
          ]
        });

        setShowForm(false);
        toast.success(t(formData?.id ? 'menus.form.update' : 'menus.form.save'));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      toast.error(t('menus.form.saving'));
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(initialFormState);
    setEditItemId(null);
  };

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: '#e5e7eb',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#d1d5db',
      },
    }),
    option: (base: any, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#EDCC27'
        : state.isFocused
          ? '#F4E7B0'
          : base.backgroundColor,
      color: state.isSelected ? 'black' : 'inherit',
      '&:active': {
        backgroundColor: '#EDCC27',
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: '#F4E7B0',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: 'black',
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: 'black',
      '&:hover': {
        backgroundColor: '#EDCC27',
        color: 'black',
      },
    }),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('menus.pageTitle')}</h1>
        {showForm ? (
          <div className="flex space-x-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  {t('menus.form.saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editItemId ? t('menus.form.update') : t('menus.form.save')}
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {t('menus.addButton')}
          </button>
        )}
      </div>

      {!showForm ? (
        menuData?.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <PlusCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('menus.table.empty.noItems')}</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Start building your restaurant menu by adding categories and items. Your customers will be able to browse and order from this menu.
              </p>
              <button
                onClick={() => {
                  setFormData({
                    internalName: "",
                    title: '',
                    description: '',
                    category: null,
                    dietary: null,
                    allergens: [],
                    tags: [],
                    showInMenu: true,
                    image: null,
                    imagePreview: null,
                    variations: [
                      {
                        id: '1',
                        title: 'Regular',
                        price: '',
                        discounted: false,
                        discountPrice: '',
                      },
                    ]
                  });
                  setShowForm(true);
                }}
                className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors inline-flex items-center"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {t('menus.table.empty.createFirst')}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('menus.pageTitle')}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('menus.table.headers.image')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('menus.table.headers.title')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('menus.table.headers.category')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('menus.table.headers.description')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('menus.table.headers.price')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('menus.table.headers.outOfStock')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('menus.table.headers.status')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('menus.table.headers.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menuData?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.imageData?.images[0]?.url ? (
                          <img
                            src={item.imageData?.images[0]?.url}
                            alt={item.name}
                            className="h-12 w-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-12 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category?.label || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate">{item.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate">{bootStrapData?.currencyConfig?.currencySymbol} {item?.variationList?.[0]?.price || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => toggleOutOfStock(item?._id)}
                          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 ease-in-out ${!item.outOfStock ? 'bg-gray-200' : 'bg-brand-primary'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${!item.outOfStock ? 'translate-x-1' : 'translate-x-6'}`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => toggleStatus(item)}
                          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 ease-in-out ${!item.active ? 'bg-gray-200' : 'bg-brand-primary'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${!item.active ? 'translate-x-1' : 'translate-x-6'}`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800"
                            title={t('menus.table.edit')}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item?._id)}
                            className="text-red-600 hover:text-red-800"
                            title={t('menus.table.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">{editItemId ? t('menus.form.editTitle') : t('menus.form.addTitle')}</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('menus.form.title')}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                  placeholder={t('menus.form.title')}
                />
              </div>
              <div>
                <label htmlFor="internalName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('menus.form.internalName')}
                </label>
                <input
                  type="text"
                  id="internalName"
                  name="internalName"
                  value={formData.internalName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                  placeholder={t('menus.form.internalName')}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('menus.form.description')}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                  placeholder={t('menus.form.description')}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInMenu"
                  name="showInMenu"
                  checked={formData.showInMenu}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                />
                <label htmlFor="showInMenu" className="ml-2 block text-sm text-gray-700">
                  {t('menus.form.showInMenu')}
                </label>
              </div>

              {/* Category & Dietary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('menus.form.dietary')}
                  </label>
                  <Select
                    id="dietary"
                    options={bootStrapData?.dietaryOptions?.map((item: any) => ({ ...item, value: item?.enumVal, label: item?.displayName }))}
                    value={formData.dietary}
                    onChange={(option) => setFormData((prev) => ({ ...prev, dietary: option }))}
                    placeholder={t('menus.form.dietary')}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={selectStyles}
                  />
                </div>
              </div>

              {/* Allergens & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="allergens" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('menus.form.allergens')}
                  </label>
                  <Select
                    id="allergens"
                    options={bootStrapData?.allergens?.map((item: any) => ({ ...item, value: item?.enumVal, label: item?.displayName }))}
                    value={formData.allergens}
                    onChange={(options) => setFormData((prev) => ({ ...prev, allergens: options }))}
                    placeholder={t('menus.form.allergens')}
                    isMulti
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={selectStyles}
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('menus.form.tags')}
                  </label>
                  <Select
                    id="tags"
                    options={bootStrapData?.foodTags?.map((item: any) => ({ ...item, value: item?.enumVal, label: item?.displayName }))}
                    value={formData.tags}
                    onChange={(options) => setFormData((prev) => ({ ...prev, tags: options }))}
                    placeholder={t('menus.form.tags')}
                    isMulti
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={selectStyles}
                  />
                </div>
              </div>

              {/* Variations Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('menus.form.variations')}</h3>
                <div className="space-y-4">
                  {formData.variations.map((variation) => (
                    <div key={variation.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-md font-medium text-gray-900">{t('menus.form.variations')} {variation.id}</h4>
                        {formData.variations.length > 1 && (
                          <button
                            onClick={() => removeVariation(variation.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`variation-title-${variation.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            {t('menus.form.title')}
                          </label>
                          <input
                            type="text"
                            id={`variation-title-${variation.id}`}
                            value={variation.title}
                            onChange={(e) => handleVariationChange(variation.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                            placeholder="e.g., Regular, Large, etc."
                          />
                        </div>

                        <div>
                          <label htmlFor={`variation-price-${variation.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            {t('menus.table.headers.price')}
                          </label>
                          <input
                            type="text"
                            id={`variation-price-${variation.id}`}
                            value={variation.price}
                            onChange={(e) => handleVariationChange(variation.id, 'price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`variation-discounted-${variation.id}`}
                          checked={variation.discounted}
                          onChange={(e) => handleVariationChange(variation.id, 'discounted', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                        />
                        <label htmlFor={`variation-discounted-${variation.id}`} className="ml-2 block text-sm text-gray-700">
                          Discounted
                        </label>
                      </div>

                      {variation.discounted && (
                        <div>
                          <label htmlFor={`variation-discount-price-${variation.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Discount Price
                          </label>
                          <input
                            type="text"
                            id={`variation-discount-price-${variation.id}`}
                            value={variation.discountPrice}
                            onChange={(e) => handleVariationChange(variation.id, 'discountPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                            placeholder="0.00"
                          />
                        </div>
                      )}

                      <div>
                        <button
                          onClick={() => handleOpenOptionsPanel(variation.id)}
                          className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors"
                        >
                          {variation.selectedOptions && variation.selectedOptions.length > 0 ? t('menus.optionsPanel.editOptions') : t('menus.optionsPanel.chooseOptions')}
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addVariation}
                    className="w-full py-2 text-sm font-medium text-brand-primary border border-dashed border-brand-primary rounded-md hover:bg-brand-accent/10 transition-colors"
                  >
                    {t('menus.form.addVariation')}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('menus.form.image')}
              </label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-brand-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  {formData.imagePreview ? (
                    <div className="relative">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="mx-auto h-48 w-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({ ...prev, image: null, imagePreview: null }));
                        }}
                        className="absolute top-2 right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-brand-primary hover:text-brand-primary/80"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <span>{t('menus.form.upload')}</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                          />
                        </label>
                        <p className="pl-1">{t('menus.form.orDrag')}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Options Panel */}
      {showOptionsPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('menus.optionsPanel.availableOptions')}</h2>
              <button
                onClick={() => setShowOptionsPanel(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveOptionsTab('available')}
                className={`px-4 py-2 text-sm font-medium ${activeOptionsTab === 'available'
                  ? 'border-b-2 border-brand-primary text-brand-primary'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {t('menus.optionsPanel.availableOptions')}
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {activeOptionsTab === 'available' ? (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Select options to include with this variation
                  </p>

                  <div className="space-y-3">
                    {variations.map((option) => (
                      <div
                        key={option._id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${availableOptions?.includes(option?._id)
                          ? 'border-brand-primary bg-brand-accent/10'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                        onClick={() => toggleOptionSelection(option?._id)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 mt-0.5">
                            <input
                              type="checkbox"
                              checked={availableOptions?.includes(option?._id)}
                              onChange={() => toggleOptionSelection(option?._id)}
                              className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                            />
                          </div>
                          <div className="ml-3 flex-1 ">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-900">{option.title}</p>
                              <p className="text-sm text-gray-500">Quantity: {option?.minQty}-{option?.maxQty}</p>
                            </div>
                            <p className="text-sm text-gray-500">{option.internalName}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('menus.form.title')}
                    </label>
                    <input
                      type="text"
                      value={customOption.title}
                      onChange={(e) => handleCustomOptionChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                      placeholder="e.g., Choose your sauce"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('menus.form.description')}
                    </label>
                    <input
                      type="text"
                      value={customOption.description}
                      onChange={(e) => handleCustomOptionChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                      placeholder="e.g., Select your preferred sauce"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={customOption.minQuantity}
                        onChange={(e) => handleCustomOptionChange('minQuantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={customOption.maxQuantity}
                        onChange={(e) => handleCustomOptionChange('maxQuantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Choose Dish
                    </label>
                    <Select
                      options={SAMPLE_DISHES}
                      onChange={handleDishSelect}
                      placeholder="Select a dish"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={selectStyles}
                    />
                  </div>

                  {selectedDishes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Dishes with Price</h4>
                      <div className="space-y-2">
                        {selectedDishes.map((dish) => (
                          <div key={dish.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{dish.name}</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <span className="line-through mr-2">${dish.currentPrice}</span>
                                <span className="text-brand-primary font-medium">${dish.newPrice}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveDish(dish.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t border-gray-200">
              <button
                onClick={handleSaveOptions}
                className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors"
              >
                {t('menus.optionsPanel.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Modal */}
      {showPriceModal && currentDish && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('menus.priceModal.title', { dish: currentDish.label })}</h2>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('menus.priceModal.currentPrice')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={currentDish.price}
                    disabled
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('menus.priceModal.newPrice')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPriceModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t('menus.priceModal.cancel')}
              </button>
              <button
                onClick={handleAddDish}
                className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors"
              >
                {t('menus.priceModal.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('menus.table.delete')}</h2>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this menu item? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t('menus.table.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('menus.table.deleting')}
                  </>
                ) : (
                  t('menus.table.delete')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}