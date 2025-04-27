import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, X, Save, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
}

export default function StallCategory() {
  const { t } = useTranslation();
  const { stallId } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    // In a real app, fetch categories from API
    // For now, using mock data
    const mockCategories: Category[] = [
      {
        id: '1',
        name: 'Appetizers',
        description: 'Start your meal right',
        order: 1,
        isActive: true
      },
      {
        id: '2',
        name: 'Main Course',
        description: 'Delicious main dishes',
        order: 2,
        isActive: true
      },
      {
        id: '3',
        name: 'Desserts',
        description: 'Sweet endings',
        order: 3,
        isActive: true
      }
    ];
    setCategories(mockCategories);
    setIsLoading(false);
  }, [stallId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCategory = async () => {
    try {
      // In a real app, make API call to add category
      const newCategory: Category = {
        id: Math.random().toString(),
        name: formData.name,
        description: formData.description,
        order: categories.length + 1,
        isActive: true
      };
      setCategories(prev => [...prev, newCategory]);
      setShowAddModal(false);
      setFormData({ name: '', description: '' });
      toast.success(t('category.added'));
    } catch (error) {
      toast.error(t('category.addfailed'));
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;
    try {
      // In a real app, make API call to update category
      setCategories(prev =>
        prev.map(cat =>
          cat.id === editingCategory.id
            ? { ...cat, name: formData.name, description: formData.description }
            : cat
        )
      );
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      toast.success(t('category.updated'));
    } catch (error) {
      toast.error(t('category.updatefailed'));
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm(t('category.deleteconfirm'))) return;
    try {
      // In a real app, make API call to delete category
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast.success(t('category.deleted'));
    } catch (error) {
      toast.error(t('category.deletefailed'));
    }
  };

  const handleMoveCategory = (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(cat => cat.id === categoryId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === categories.length - 1)
    ) return;

    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newCategories[currentIndex], newCategories[targetIndex]] = [
      newCategories[targetIndex],
      newCategories[currentIndex]
    ];

    // Update order numbers
    newCategories.forEach((cat, index) => {
      cat.order = index + 1;
    });

    setCategories(newCategories);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('category.title')}</h1>
        <button
          onClick={() => {
            setShowAddModal(true);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
          }}
          className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('category.add')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('category.order')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('category.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('category.description')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('category.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category, index) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMoveCategory(category.id, 'up')}
                        disabled={index === 0}
                        className={`p-1 rounded hover:bg-gray-100 ${
                          index === 0 ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveCategory(category.id, 'down')}
                        disabled={index === categories.length - 1}
                        className={`p-1 rounded hover:bg-gray-100 ${
                          index === categories.length - 1 ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      {category.order}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{category.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setFormData({
                            name: category.name,
                            description: category.description
                          });
                          setShowAddModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-gray-600 hover:text-red-600"
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {editingCategory ? t('category.edit') : t('category.add')}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setFormData({ name: '', description: '' });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingCategory ? handleEditCategory() : handleAddCategory();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('category.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('category.description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingCategory ? t('common.save') : t('common.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 