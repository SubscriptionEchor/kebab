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
  const { stallId } = useParams<{ stallId: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    // simulate API fetch
    const mock: Category[] = [
      { id: '1', name: 'Appetizers',   description: 'Start your meal right', order: 1, isActive: true },
      { id: '2', name: 'Main Course',  description: 'Delicious main dishes', order: 2, isActive: true },
      { id: '3', name: 'Desserts',     description: 'Sweet endings',         order: 3, isActive: true },
    ];
    setCategories(mock);
    setIsLoading(false);
  }, [stallId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = () => {
    const newCat: Category = {
      id: Math.random().toString(),
      name: formData.name,
      description: formData.description,
      order: categories.length + 1,
      isActive: true,
    };
    setCategories(prev => [...prev, newCat]);
    setShowAddModal(false);
    setFormData({ name: '', description: '' });
    toast.success(t('stallcategory.added'));
  };

  const handleEditCategory = () => {
    if (!editingCategory) return;
    setCategories(prev =>
      prev.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, name: formData.name, description: formData.description }
          : cat
      )
    );
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    toast.success(t('stallcategory.updated'));
  };

  const handleDeleteCategory = (id: string) => {
    if (!confirm(t('stallcategory.deleteconfirm'))) return;
    setCategories(prev => prev.filter(cat => cat.id !== id));
    toast.success(t('stallcategory.deleted'));
  };

  const handleMove = (id: string, dir: 'up' | 'down') => {
    const idx = categories.findIndex(c => c.id === id);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === categories.length - 1)) return;
    const arr = [...categories];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    arr.forEach((c, i) => (c.order = i + 1));
    setCategories(arr);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('stallcategory.title')}
        </h1>
        <button
          onClick={() => {
            setShowAddModal(true);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
          }}
          className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('stallcategory.addNew')}
        </button>
      </div>

      {/* table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('stallcategory.order')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('stallcategory.name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('stallcategory.description')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('stallcategory.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((cat, i) => (
              <tr key={cat.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMove(cat.id, 'up')}
                      disabled={i === 0}
                      className={`p-1 rounded hover:bg-gray-100 ${
                        i === 0 ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMove(cat.id, 'down')}
                      disabled={i === categories.length - 1}
                      className={`p-1 rounded hover:bg-gray-100 ${
                        i === categories.length - 1 ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    {cat.order}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cat.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {cat.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setFormData({ name: cat.name, description: cat.description });
                        setShowAddModal(true);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
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

      {/* modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {editingCategory ? t('stallcategory.editCategory') : t('stallcategory.addNew')}
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
              onSubmit={e => {
                e.preventDefault();
                editingCategory ? handleEditCategory() : handleAddCategory();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('stallcategory.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('stallcategory.description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
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
                  className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingCategory ? t('common.save') : t('stallcategory.addNew')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
