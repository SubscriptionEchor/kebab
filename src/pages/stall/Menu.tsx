import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Upload, X, Save, Edit2, Trash2 } from 'lucide-react';
import Select from 'react-select';
import { toast } from 'sonner';
import LoadingState from '../../components/LoadingState';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  variations: Variation[];
  dietary?: string;
  allergens?: string[];
  tags?: string[];
  addons?: Addon[];
}

interface Variation {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  maxQuantity: number;
}

interface Category {
  id: string;
  name: string;
}

const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'halal', label: 'Halal' }
];

const ALLERGENS = [
  { value: 'nuts', label: 'Nuts' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'soy', label: 'Soy' },
  { value: 'gluten', label: 'Gluten' }
];

const TAGS = [
  { value: 'spicy', label: 'Spicy' },
  { value: 'popular', label: 'Popular' },
  { value: 'new', label: 'New' },
  { value: 'recommended', label: 'Recommended' }
];

export default function Menu() {
  const { t } = useTranslation();
  const { stallId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock data
  const [categories] = useState<Category[]>([
    { id: 'all', name: 'All Items' },
    { id: 'appetizers', name: 'Appetizers' },
    { id: 'main', name: 'Main Course' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'beverages', name: 'Beverages' }
  ]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Classic Burger',
      description: 'Juicy beef patty with fresh vegetables',
      price: 12.99,
      category: 'main',
      image: 'https://example.com/burger.jpg',
      isAvailable: true,
      variations: [
        { id: 'v1', name: 'Regular', price: 12.99, isDefault: true },
        { id: 'v2', name: 'Large', price: 14.99, isDefault: false }
      ],
      dietary: 'halal',
      allergens: ['gluten', 'dairy'],
      tags: ['popular'],
      addons: [
        { id: 'a1', name: 'Extra Cheese', price: 1.50, maxQuantity: 1 },
        { id: 'a2', name: 'Bacon', price: 2.00, maxQuantity: 1 }
      ]
    },
    {
      id: '2',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with caesar dressing',
      price: 8.99,
      category: 'appetizers',
      image: 'https://example.com/salad.jpg',
      isAvailable: true,
      variations: [
        { id: 'v3', name: 'Regular', price: 8.99, isDefault: true },
        { id: 'v4', name: 'Large', price: 10.99, isDefault: false }
      ],
      dietary: 'vegetarian',
      allergens: ['eggs', 'dairy'],
      tags: ['healthy'],
      addons: [
        { id: 'a3', name: 'Grilled Chicken', price: 3.00, maxQuantity: 1 },
        { id: 'a4', name: 'Extra Dressing', price: 0.50, maxQuantity: 2 }
      ]
    }
  ]);

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleAddItem = () => {
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm(t('menu.deleteconfirm'))) {
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      toast.success(t('menu.itemdeleted'));
    }
  };

  const handleToggleAvailability = (itemId: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, isAvailable: !item.isAvailable }
        : item
    ));
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('menu.title')}</h1>
        <LoadingState rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('menu.title')}</h1>
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-brand-primary text-black rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('menu.additem')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-brand-primary text-black'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('menu.searchitems')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-gray-100 relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200';
                }}
              />
              {item.tags && item.tags.length > 0 && (
                <div className="absolute top-2 left-2 flex gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-semibold text-gray-900">
                    €{item.variations.find(v => v.isDefault)?.price.toFixed(2)}
                  </span>
                  {item.variations.length > 1 && (
                    <span className="text-xs text-gray-500">+{item.variations.length - 1} variations</span>
                  )}
                </div>
              </div>
              
              {/* Tags and Dietary Info */}
              <div className="flex flex-wrap gap-2 mb-4">
                {item.dietary && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {item.dietary}
                  </span>
                )}
                {item.allergens && item.allergens.map(allergen => (
                  <span key={allergen} className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    {allergen}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleToggleAvailability(item.id)}
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.isAvailable ? t('menu.available') : t('menu.unavailable')}
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="p-1 text-gray-600 hover:text-gray-900"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingItem ? t('menu.edititem') : t('menu.additem')}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* Add/Edit form will go here */}
          </div>
        </div>
      )}
    </div>
  );
} 