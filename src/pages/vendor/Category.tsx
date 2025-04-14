import { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Search, Edit2, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

// Mock data for categories - in a real app, this would come from an API
interface Category {
  id: string;
  title: string;
  description: string;
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
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load mock data - in a real app, this would be a GraphQL query
  useEffect(() => {
    // Simulating data loading
    const mockCategories = localStorage.getItem(`categories-${restaurantId}`);
    if (mockCategories) {
      setCategories(JSON.parse(mockCategories));
    }
  }, [restaurantId]);

  // Save categories to localStorage
  const saveCategories = (newCategories: Category[]) => {
    localStorage.setItem(`categories-${restaurantId}`, JSON.stringify(newCategories));
    setCategories(newCategories);
  };

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    return categories.filter(category => 
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleAddCategory = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setFormData({
      title: '',
      description: ''
    });
    setShowForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setFormData({
      title: category.title,
      description: category.description
    });
    setShowForm(true);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const newCategories = categories.filter(category => category.id !== id);
      saveCategories(newCategories);
      toast.success('Category deleted successfully');
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('Category title is required');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      if (isEditing && currentCategory) {
        // Update existing category
        const updatedCategories = categories.map(category => 
          category.id === currentCategory.id 
            ? { ...category, title: formData.title, description: formData.description }
            : category
        );
        saveCategories(updatedCategories);
        toast.success('Category updated successfully');
      } else {
        // Create new category
        const newCategory: Category = {
          id: Date.now().toString(),
          title: formData.title,
          description: formData.description
        };
        saveCategories([...categories, newCategory]);
        toast.success('Category created successfully');
      }

      setIsSubmitting(false);
      setShowForm(false);
      setFormData({ title: '', description: '' });
    }, 500);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ title: '', description: '' });
  };
  
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
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                placeholder="Enter category title"
              />
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                placeholder="Describe this category"
              />
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
                    Description
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">{category.description}</div>
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
                          onClick={() => handleDeleteCategory(category.id)}
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
      )}
    </div>
  );
}