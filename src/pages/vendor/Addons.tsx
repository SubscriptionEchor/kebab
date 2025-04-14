import { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Search, Edit2, Trash2, ArrowLeft, Save, DollarSign, X, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import Select from 'react-select';

// Types
interface Dish {
  id: string;
  name: string;
  currentPrice: string;
  newPrice: string;
}

interface Addon {
  id: string;
  title: string;
  description: string;
  minQuantity: string;
  maxQuantity: string;
  dishes: Dish[];
}

// Sample dishes for dropdown
const SAMPLE_DISHES = [
  { value: 'dish1', label: 'Margherita Pizza', price: '12.99' },
  { value: 'dish2', label: 'Chicken Tikka', price: '14.99' },
  { value: 'dish3', label: 'Vegetable Pasta', price: '10.99' },
  { value: 'dish4', label: 'Beef Burger', price: '13.99' },
  { value: 'dish5', label: 'Caesar Salad', price: '8.99' },
];

export default function Addons() {
  const { t } = useTranslation();
  const { restaurantId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [addons, setAddons] = useState<Addon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddon, setCurrentAddon] = useState<Addon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [currentDish, setCurrentDish] = useState<{ value: string; label: string; price: string } | null>(null);
  const [newPrice, setNewPrice] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<Addon>({
    id: '',
    title: '',
    description: '',
    minQuantity: '0',
    maxQuantity: '1',
    dishes: []
  });
  
  // Load addons from localStorage
  useEffect(() => {
    const savedAddons = localStorage.getItem(`addons-${restaurantId}`);
    if (savedAddons) {
      setAddons(JSON.parse(savedAddons));
    }
  }, [restaurantId]);
  
  // Save addons to localStorage
  const saveAddons = (newAddons: Addon[]) => {
    localStorage.setItem(`addons-${restaurantId}`, JSON.stringify(newAddons));
    setAddons(newAddons);
  };
  
  // Filter addons based on search query
  const filteredAddons = useMemo(() => {
    return addons.filter(addon => 
      addon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addon.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [addons, searchQuery]);
  
  // Custom styles for react-select
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
  
  const handleAddAddon = () => {
    setIsEditing(false);
    setCurrentAddon(null);
    setFormData({
      id: '',
      title: '',
      description: '',
      minQuantity: '0',
      maxQuantity: '1',
      dishes: []
    });
    setShowForm(true);
  };
  
  const handleEditAddon = (addon: Addon) => {
    setIsEditing(true);
    setCurrentAddon(addon);
    setFormData({...addon});
    setShowForm(true);
  };
  
  const handleDeleteAddon = (id: string) => {
    if (confirm('Are you sure you want to delete this add-on?')) {
      const newAddons = addons.filter(addon => addon.id !== id);
      saveAddons(newAddons);
      toast.success('Add-on deleted successfully');
    }
  };
  
  const handleCancel = () => {
    setShowForm(false);
  };
  
  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('Add-on title is required');
      return;
    }
    
    if (parseInt(formData.maxQuantity) < parseInt(formData.minQuantity)) {
      toast.error('Maximum quantity must be greater than or equal to minimum quantity');
      return;
    }
    
    if (formData.dishes.length === 0) {
      toast.error('Please add at least one dish to this add-on');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (isEditing && currentAddon) {
        // Update existing addon
        const updatedAddons = addons.map(addon => 
          addon.id === currentAddon.id ? {...formData} : addon
        );
        saveAddons(updatedAddons);
        toast.success('Add-on updated successfully');
      } else {
        // Create new addon
        const newAddon: Addon = {
          ...formData,
          id: Date.now().toString()
        };
        saveAddons([...addons, newAddon]);
        toast.success('Add-on created successfully');
      }
      
      setIsSubmitting(false);
      setShowForm(false);
    }, 500);
  };
  
  // Handle dish selection
  const handleDishSelect = (selectedOption: any) => {
    if (!selectedOption) return;
    
    setCurrentDish(selectedOption);
    setNewPrice(selectedOption.price);
    setShowPriceModal(true);
  };
  
  // Add dish with custom price
  const handleAddDish = () => {
    if (!currentDish) return;
    
    const newDish: Dish = {
      id: currentDish.value,
      name: currentDish.label,
      currentPrice: currentDish.price,
      newPrice: newPrice
    };
    
    setFormData(prev => ({
      ...prev,
      dishes: [...prev.dishes, newDish]
    }));
    
    setShowPriceModal(false);
    setCurrentDish(null);
    setNewPrice('');
    
    toast.success('Dish added successfully');
  };
  
  // Remove dish from selected dishes
  const handleRemoveDish = (dishId: string) => {
    setFormData(prev => ({
      ...prev,
      dishes: prev.dishes.filter(dish => dish.id !== dishId)
    }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Menu Add-ons</h1>
        {!showForm && (
          <div className="flex items-center space-x-4">
            {addons.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search add-ons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>
            )}
            <button
              onClick={handleAddAddon}
              className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Add-on
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Add-on' : 'Create New Add-on'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                placeholder="e.g., Choose your sauce"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({...formData, minQuantity: e.target.value})}
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
                  value={formData.maxQuantity}
                  onChange={(e) => setFormData({...formData, maxQuantity: e.target.value})}
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
            
            {/* Selected Dishes */}
            {formData.dishes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Dishes with Price</h4>
                <div className="space-y-2">
                  {formData.dishes.map((dish) => (
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
                    {isEditing ? 'Update Add-on' : 'Create Add-on'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : addons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PlusCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No add-ons yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Create add-ons to enhance your menu items. Add-ons allow customers to customize their orders with extra options.
            </p>
            <button
              onClick={handleAddAddon}
              className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors inline-flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Add-on
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
                    Add-on Name
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dishes
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAddons.map((addon) => (
                  <tr key={addon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{addon.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">{addon.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {addon.minQuantity} - {addon.maxQuantity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {addon.dishes.slice(0, 2).map((dish) => (
                          <span key={dish.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-accent text-black">
                            {dish.name}
                          </span>
                        ))}
                        {addon.dishes.length > 2 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{addon.dishes.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleEditAddon(addon)}
                          className="text-brand-primary hover:text-brand-primary/80"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddon(addon.id)}
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
          {filteredAddons.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No add-ons found matching your search</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-brand-primary hover:text-brand-primary/80 text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Price Modal */}
      {showPriceModal && currentDish && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Set Price for {currentDish.label}</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Price
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
                  New Price
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
                Cancel
              </button>
              <button
                onClick={handleAddDish}
                className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}