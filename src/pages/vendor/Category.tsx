import { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Search, Edit2, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_CATEGORY, GET_CATEGORY_MENU, UPDATE_CATEGORY, DELETE_CATEGORY } from '../../lib/graphql/queries/category';

// Mock data for categories - in a real app, this would come from an API
interface Category {
  _id: string;
  name: string;
  foodList: any[];
}

export default function Category() {
  const { t } = useTranslation();
  const { restaurantId } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    foodlist: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false);

  const [CREATE_CATEGORY_MENU] = useMutation(CREATE_CATEGORY)
  const [UPDATE_CATEGORY_MENU] = useMutation(UPDATE_CATEGORY)
  const [DELETE_CATEGORY_MENU] = useMutation(DELETE_CATEGORY)

  const [categoryMenu, setCategoryMenu] = useState([])

  const { data, error, loading } = useQuery(GET_CATEGORY_MENU, {
    variables: {
      restaurantId: restaurantId
    },
  });

  useEffect(() => {
    if (data?.getMenu?.food) {
      setCategoryMenu(data?.getMenu?.food)
    }

    if (data?.getMenu?.categoryData?.length) {
      const foodMap = {};
      data.getMenu.food.forEach(food => {
        foodMap[food._id] = food;
      });
      const categoriesWithFoods = data.getMenu.categoryData.map(category => {
        const foods = category.foodList.map(id => foodMap[id]).filter(Boolean);
        return {
          ...category,
          foods
        };
      });
      setCategories(categoriesWithFoods)
    }
  }, [data])




  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) {
      return categories
    }
    return categories.filter(category =>
      category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);


  const handleAddCategory = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setFormData({
      title: '',
      foodlist: []
    });
    setShowForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setFormData({
      title: category.name,
      foodlist: category.foodList
    });
    setShowForm(true);
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {

        setIsLoading(true);
        const { data, errors } = await DELETE_CATEGORY_MENU({
          variables: {
            deleteCategoryNewId: categoryToDelete,
            restaurantId
          }
        })
        if (errors) {
          return toast.error(JSON.stringify(errors) || "failed to create category")
        }
        const newCategories = categories.filter(category => category._id !== categoryToDelete);
        setCategories(newCategories)
        toast.success('Category deleted successfully');
        setShowDeleteDialog(false);
        setCategoryToDelete(null);
      } catch (error) {
        toast.error('Failed to delete category');
      } finally {
        setIsLoading(false);
      }
    }
  };



  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Category title is required');
      return;
    }
    if (!formData?.foodlist?.length) {
      toast.error('Atleast one food is required');
      return;
    }

    // setIsSubmitting(true);

    let payload = {
      active: true,
      name: formData?.title,
      foodList: formData?.foodlist
    }
    if (isEditing) {
      payload['_id'] = currentCategory?._id
    }

    setIsSubmitting(true);
    try {
      if (currentCategory?._id) {
        const { data, errors } = await UPDATE_CATEGORY_MENU({
          variables: {
            restaurantId: restaurantId,
            input: payload,
            updateCategoryNewId: currentCategory?._id
          }
        })

        if (errors) {
          toast.error(JSON.stringify(errors) || 'Failed to create category');
          return;
        }
        if (data) {
          setCategories(prev => prev.map(item => {
            if (item?._id == data?.updateCategoryNew?._id) {
              let foods = []
              data?.updateCategoryNew?.foodList?.every((item) => foods.push(categoryMenu.find(ci => ci?._id == item)))
              return {
                ...data?.updateCategoryNew,
                foods
              }
            }
            return item
          }))
          setFormData({ title: '', foodlist: [] });
          setIsEditing(false)
          setShowForm(false)
        }
      }
      else {
        const { data, errors } = await CREATE_CATEGORY_MENU({
          variables: {
            restaurantId: restaurantId,
            input: payload
          }
        })
        if (errors) {
          toast.error(JSON.stringify(errors) || 'Failed to create category');
          return;
        }
        if (data) {
          let foods = []
          data?.createCategoryNew?.foodList?.every((item) => foods.push(categoryMenu.find(ci => ci?._id == item)))
          setCategories(prev => [...prev, { ...data?.createCategoryNew, foods }])
          setFormData({ title: '', foodlist: [] });
          setIsEditing(false)
          setShowForm(false)
        }
      }
    }
    catch (e) {
      console.log(e)
    }
    finally {
      setIsSubmitting(false)
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ title: '', foodlist: [] });
  };

  const onChangeStatus = async (category: any) => {
    const updatedCategories = categories.map((c: any) =>
      c._id === category._id ? { ...c, active: !c?.active } : c
    );
    setCategories(updatedCategories)
    toast.success("Status updated successfully!")
    let payload = {
      _id: category?._id,
      active: !category?.active,
      foodList: category?.foodList,
      name: category?.name
    }
    const { data, errors } = await UPDATE_CATEGORY_MENU({
      variables: {
        restaurantId: restaurantId,
        input: payload,
        updateCategoryNewId: category?._id
      }
    })
    if (errors) {
      toast.error(JSON.stringify(errors) || "Failed to update status")
      return
    }


  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Menu Categories</h1>
        {!showForm && (
          <div className="flex items-center space-x-4">
            {categories.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>
            )}
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Category Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                placeholder="Enter category title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="foodlist" className="block text-sm font-medium text-gray-700 mb-1">
                Food List
              </label>
              <select
                id="foodlist"
                name="foodlist"
                onChange={(e) => {
                  const selectedItem = e.target.value;
                  if (selectedItem && !formData.foodlist.includes(selectedItem)) {
                    setFormData({ ...formData, foodlist: [...formData.foodlist, selectedItem] });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
              >
                <option value="">Select a food item</option>
                {categoryMenu?.map((item: any) => {
                  return <option value={item?._id}>{item?.name}</option>
                })}
                {/* <option value="Pizza">Pizza</option>
                <option value="Burger">Burger</option>
                <option value="Salad">Salad</option> */}
              </select>
            </div>
            <div className="mt-4">
              {formData?.foodlist?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Food Items</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData?.foodlist?.map((food, index) => {
                      let foodObj = categoryMenu?.find((item: any) => item?._id == food) as any
                      return (
                        <div key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                          <p className="text-sm font-medium text-gray-900 mr-2">{foodObj?.name}</p>
                          <button
                            onClick={() => {
                              const newFoodList = formData.foodlist.filter((_, i) => i !== index);
                              setFormData({ ...formData, foodlist: newFoodList });
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Category' : 'Create Category'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PlusCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Start organizing your menu by adding categories. Categories help customers navigate your menu more easily.
            </p>
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors inline-flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Category
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dishes
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category: any) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2 flex">
                        {category?.foods?.slice(0, 2).map((food, index) => (
                          <p key={index} className='p-1 me-2 bg-gray-200 rounded-lg'>{food?.name}</p>
                        ))}
                        {category?.foods?.length > 2 && (
                          <p className='p-1 me-2 bg-yellow-200 rounded-lg'>+{category.foods.length - 2} more</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={category?.active}
                          onChange={() => onChangeStatus(category)}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-brand-primary hover:text-brand-primary/80"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="text-red-500 hover:text-red-700"
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
          {filteredCategories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found matching your search</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-brand-primary hover:text-brand-primary/80 text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )
      }
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Delete Category</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this category?</p>
            <div className="flex justify-end gap-3">
              <button
                disabled={isLoading}
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}