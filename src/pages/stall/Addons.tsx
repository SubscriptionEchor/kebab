// src/components/StallAddons.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Addon {
  id: string;
  name: string;
  price: number;
  maxQuantity: number;
  isAvailable: boolean;
}

export default function StallAddons() {
  const { t } = useTranslation();
  const { stallId } = useParams<{ stallId: string }>();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    maxQuantity: '1'
  });

  useEffect(() => {
    // Mock fetch
    const mockAddons: Addon[] = [
      { id: '1', name: 'Extra Cheese', price: 1.5, maxQuantity: 1, isAvailable: true },
      { id: '2', name: 'Extra Sauce', price: 0.75, maxQuantity: 2, isAvailable: true },
      { id: '3', name: 'Add Bacon', price: 2.0, maxQuantity: 1, isAvailable: true }
    ];
    setAddons(mockAddons);
    setIsLoading(false);
  }, [stallId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAddon = async () => {
    try {
      const newAddon: Addon = {
        id: Math.random().toString(),
        name: formData.name,
        price: parseFloat(formData.price),
        maxQuantity: parseInt(formData.maxQuantity),
        isAvailable: true
      };
      setAddons(prev => [...prev, newAddon]);
      setShowAddModal(false);
      setFormData({ name: '', price: '', maxQuantity: '1' });
      toast.success(t('stalladdons.added'));
    } catch {
      toast.error(t('stalladdons.addfailed'));
    }
  };

  const handleEditAddon = async () => {
    if (!editingAddon) return;
    try {
      setAddons(prev =>
        prev.map(a =>
          a.id === editingAddon.id
            ? {
                ...a,
                name: formData.name,
                price: parseFloat(formData.price),
                maxQuantity: parseInt(formData.maxQuantity)
              }
            : a
        )
      );
      setEditingAddon(null);
      setFormData({ name: '', price: '', maxQuantity: '1' });
      toast.success(t('stalladdons.updated'));
    } catch {
      toast.error(t('stalladdons.updatefailed'));
    }
  };

  const handleDeleteAddon = async (addonId: string) => {
    if (!confirm(t('stalladdons.confirmDelete'))) return;
    try {
      setAddons(prev => prev.filter(a => a.id !== addonId));
      toast.success(t('stalladdons.deleted'));
    } catch {
      toast.error(t('stalladdons.deletefailed'));
    }
  };

  const handleToggleAvailability = async (addonId: string) => {
    try {
      setAddons(prev =>
        prev.map(a =>
          a.id === addonId ? { ...a, isAvailable: !a.isAvailable } : a
        )
      );
      toast.success(t('stalladdons.availabilityupdated'));
    } catch {
      toast.error(t('stalladdons.availabilityupdatefailed'));
    }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('stalladdons.title')}
        </h1>
        <button
          onClick={() => {
            setShowAddModal(true);
            setEditingAddon(null);
            setFormData({ name: '', price: '', maxQuantity: '1' });
          }}
          className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('stalladdons.addNew')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('stalladdons.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('stalladdons.price')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('stalladdons.maxQuantity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('stalladdons.availability')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('stalladdons.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {addons.map(addon => (
                <tr key={addon.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {addon.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    €{addon.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {addon.maxQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleToggleAvailability(addon.id)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        addon.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {addon.isAvailable
                        ? t('stalladdons.available')
                        : t('stalladdons.unavailable')}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingAddon(addon);
                          setFormData({
                            name: addon.name,
                            price: addon.price.toString(),
                            maxQuantity: addon.maxQuantity.toString()
                          });
                          setShowAddModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddon(addon.id)}
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
                {editingAddon
                  ? t('stalladdons.editAddon')
                  : t('stalladdons.addNew')}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAddon(null);
                  setFormData({ name: '', price: '', maxQuantity: '1' });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                editingAddon ? handleEditAddon() : handleAddAddon();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('stalladdons.name')}
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
                  {t('stalladdons.price')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">€</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="block w-full pl-7 rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('stalladdons.maxQuantity')}
                </label>
                <input
                  type="number"
                  name="maxQuantity"
                  value={formData.maxQuantity}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAddon(null);
                    setFormData({ name: '', price: '', maxQuantity: '1' });
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
                  {editingAddon
                    ? t('stalladdons.editAddon')
                    : t('stalladdons.addNew')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
