import { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../components/Pagination';
import { toast } from 'sonner';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import type { Cuisine } from '../types/cuisines';
import { GET_CUISINES } from '../lib/graphql/queries/cuisines';
import { DELETE_CUISINE, EDIT_CUISINE, CREATE_CUISINE } from '../lib/graphql/mutations/cuisines';
import LoadingState from '../components/LoadingState';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { useTranslation } from 'react-i18next';

export default function Cuisines() {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cuisineName, setCuisineName] = useState('');
  const [description, setDescription] = useState('');
  const [shopType, setShopType] = useState('Restaurant');
  const [retryCount, setRetryCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [cuisineToDelete, setCuisineToDelete] = useState<{ id: string; name: string } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingCuisineId, setEditingCuisineId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const MAX_RETRIES = 3;
  const rowsPerPage = 10;
  const { t } = useTranslation();

  const [createCuisine, { loading: isCreating }] = useMutation(CREATE_CUISINE, {
    refetchQueries: [{ query: GET_CUISINES }],
    onError: (error: ApolloError) => {
      toast.dismiss();
      console.error('Failed to create cuisine:', error);
      toast.error(error.message || t('cuisines.failedtocreatecuisine'));
    },
    onCompleted: (data) => {
      if (data.createCuisine) {
        toast.dismiss();
        toast.success(t('cuisines.cuisinecreatedsuccessfully'), {
          description: `${data.createCuisine.name} ${t('cuisines.hasbeensuccessfullyadded') || ''}`
        });
        // Reset form and switch to list view
        setCuisineName('');
        setDescription('');
        setShopType('Restaurant');
        setActiveTab('active');
      }
    }
  });

  const [editCuisine, { loading: isUpdating }] = useMutation(EDIT_CUISINE, {
    refetchQueries: [{ query: GET_CUISINES }],
    onError: (error) => {
      toast.dismiss();
      console.error('Failed to edit cuisine:', error);
      toast.error(error.message || t('cuisines.failedtoeditcuisine'));
    },
    onCompleted: (data) => {
      if (data.editCuisine) {
        toast.dismiss();
        toast.success(t('cuisines.cuisineupdatedsuccessfully'), {
          description: `${data.editCuisine.name} ${t('cuisines.hasbeenupdated') || ''}`
        });
        // Reset form and switch to list view
        setCuisineName('');
        setDescription('');
        setShopType('Restaurant');
        setEditMode(false);
        setEditingCuisineId(null);
        setActiveTab('active');
      }
    }
  });

  const { data: cuisinesData, loading: cuisinesLoading, error: cuisinesError, refetch } = useQuery(GET_CUISINES, {
    onError: (error) => {
      console.error('Failed to fetch cuisines:', error);
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          refetch();
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      }
    }
  });

  const [deleteCuisine] = useMutation(DELETE_CUISINE, {
    refetchQueries: [{ query: GET_CUISINES }],
    onError: (error) => {
      console.error('Failed to delete cuisine:', error);
      toast.error(t('cuisines.failedtodeletecuisine'));
    }
  });

  const handleSaveCuisine = () => {
    if (!cuisineName.trim()) {
      toast.error(t('cuisines.missinginformation'), {
        description: t('cuisines.pleaseenteracuisinename'),
        duration: 4000
      });
      return;
    }
    if (!description.trim()) {
      toast.error(t('cuisines.missinginformation'), {
        description: t('cuisines.pleaseenteradescription'),
        duration: 4000
      });
      return;
    }

    toast.loading(editMode ? t('cuisines.updatingcuisine') : t('cuisines.creatingcuisine'));

    if (editMode && editingCuisineId) {
      editCuisine({
        variables: {
          cuisineInput: {
            _id: editingCuisineId,
            name: cuisineName,
            description: description,
            shopType: shopType.toLowerCase()
          }
        }
      });
    } else {
      createCuisine({
        variables: {
          cuisineInput: {
            name: cuisineName,
            description: description,
            shopType: shopType.toLowerCase()
          }
        }
      });
    }
  };

  const handleDeleteClick = (cuisine: Cuisine) => {
    setCuisineToDelete({
      id: cuisine._id,
      name: cuisine.name
    });
    setShowDeleteConfirmation(true);
  };

  const handleDelete = async (cuisineId: string) => {
    setIsDeleting(cuisineId);

    try {
      const { data } = await deleteCuisine({
        variables: { id: cuisineId.toString() }
      });

      if (data?.deleteCuisine) {
        toast.success(t('cuisines.cuisinedeletedsuccessfully'));
        setShowDeleteConfirmation(false);
        setCuisineToDelete(null);
      } else {
        throw new Error(t('cuisines.failedtodeletecuisine'));
      }
    } catch (error) {
      console.error('Failed to delete cuisine:', error);
      toast.error(t('cuisines.failedtodeletecuisine'));
    }

    setIsDeleting(null);
  };

  const handleEditCuisine = (cuisine: Cuisine) => {
    setActiveTab('add');
    setEditMode(true);
    setEditingCuisineId(cuisine._id);
    setCuisineName(cuisine.name);
    setDescription(cuisine.description);
    setShopType(cuisine.shopType);
  };

  const filteredCuisines = useMemo(() => {
    const cuisines = cuisinesData?.cuisines || [];
    const filtered = cuisines.filter((cuisine: Cuisine) => {
      const query = searchQuery.toLowerCase().trim();
      return !query ? true :
        cuisine.name.toLowerCase().includes(query) ||
        cuisine.description.toLowerCase().includes(query) ||
        cuisine.shopType.toLowerCase().includes(query);
    });

    // Sort the filtered results
    return filtered.sort((a: Cuisine, b: Cuisine) => {
      let comparison = 0;
      comparison = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [searchQuery, cuisinesData, sortBy, sortOrder]);

  const paginatedCuisines = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredCuisines.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredCuisines, currentPage]);

  const totalPages = Math.ceil(filteredCuisines.length / rowsPerPage);

  return (
    <div className="space-y-6">
      <DeleteConfirmation
        key={showDeleteConfirmation ? 'open' : 'closed'}
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setCuisineToDelete(null);
        }}
        onConfirm={() => cuisineToDelete && handleDelete(cuisineToDelete.id)}
        title={t('cuisines.deletecuisine')}
        message={
          t('cuisines.deletecuisinemessage') +
          ` ${cuisineToDelete?.name}` +
          t('cuisines.thisactioncannotbeundone')
        }
        isDeleting={!!isDeleting}
      />
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('active');
              setEditMode(false);
              setEditingCuisineId(null);
              setCuisineName('');
              setDescription('');
              setShopType('Restaurant');
            }}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
              ${activeTab === 'active'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }
            `}
          >
            {t('cuisines.activecuisines')}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
              ${activeTab === 'add'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }
            `}
          >
            {t('cuisines.addoreditcuisines')}
          </button>
        </nav>
      </div>

      {activeTab === 'add' ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editMode ? t('cuisines.editcuisine') : t('cuisines.addnewcuisine')}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {editMode
                  ? t('cuisines.updatedetailscuisine') 
                  : t('cuisines.enterdetailscuisine') 
                }
              </p>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Name Input */}
                <div>
                  <label htmlFor="cuisineName" className="block text-sm font-medium text-gray-600">
                    {t('cuisines.cuisinename')}
                  </label>
                  <input
                    id="cuisineName"
                    type="text"
                    placeholder={t('cuisines.entercuisinename')}
                    value={cuisineName}
                    onChange={(e) => setCuisineName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                  />
                </div>

                {/* Shop Type Input */}
                <div>
                  <label htmlFor="shopType" className="block text-sm font-medium text-gray-600">
                    {t('cuisines.shoptype')}
                  </label>
                  <input
                    id="shopType"
                    value={shopType}
                    readOnly
                    disabled
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-600">
                  {t('cuisines.description')}
                </label>
                <input
                  id="description"
                  type="text"
                  placeholder={t('cuisines.enterdescription')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                />
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right rounded-b-lg border-t border-gray-200">
              <button
                onClick={handleSaveCuisine}
                disabled={isCreating || isUpdating}
                className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
              >
                {(isCreating || isUpdating) ? (
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {editMode ? t('cuisines.updatecuisine') : t('cuisines.addcuisine')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">{t('cuisines.restaurantcuisines')}</h1>
            <div className="flex items-center space-x-4">
              {/* Sort Options */}
              <select
                value={sortBy}
                disabled
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white appearance-none"
              >
                <option value="name">{t('cuisines.sortbyname')}</option>
              </select>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(current => current === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? t('cuisines.ascending') : t('cuisines.descending')}
              </button>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('cuisines.searchcuisines')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {cuisinesError ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-red-500 font-medium">{t('cuisines.failedtoloadcuisines')}</div>
                <p className="text-gray-600 text-sm max-w-md text-center">
                  {t('cuisines.errorloadingcuisines')}
                </p>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
                >
                  {t('cuisines.retry')}
                </button>
              </div>
            </div>
          ) : cuisinesLoading ? (
            <LoadingState rows={5} />
          ) : !cuisinesData?.cuisines || cuisinesData.cuisines.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('cuisines.nocuisinesfound')}</p>
              <button
                onClick={() => setActiveTab('add')}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('cuisines.addyourfirstcuisine')}
              </button>
            </div>
          ) : filteredCuisines.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <p className="text-gray-500">{t('cuisines.nocuisinesmatching')} "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-brand-primary hover:text-brand-primary/80 font-medium"
                >
                  {t('cuisines.clearsearch')}
                </button>
              </div>
            </div>
          ) : (
            <div className="table-container">
              <div className="table-wrapper">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="table-header" style={{ width: '25%' }}>
                        {t('cuisines.cuisinename')}
                      </th>
                      <th className="table-header" style={{ width: '35%' }}>
                        {t('cuisines.description')}
                      </th>
                      <th className="table-header" style={{ width: '20%' }}>
                        {t('cuisines.shoptype')}
                      </th>
                      <th className="table-header text-right" style={{ width: '20%' }}>
                        {t('cuisines.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedCuisines?.length > 0 && paginatedCuisines?.map((cuisine: any) => (
                      <tr key={cuisine._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="table-cell table-cell-primary">
                          <div className="flex items-center space-x-2">
                            <span>{cuisine.name}</span>
                            {editingCuisineId === cuisine._id && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-accent text-black">
                                {t('cuisines.editing')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          {cuisine.description}
                        </td>
                        <td className="table-cell text-left">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                            {t(`cuisines.${cuisine.shopType}`)}
                          </span>
                        </td>
                        <td className="table-cell text-right space-x-4">
                          <div className="flex items-center justify-end space-x-3">
                            <div className="flex items-center bg-gray-100 rounded-md divide-x divide-gray-200">
                              <button
                                onClick={() => handleEditCuisine(cuisine)}
                                className="p-1.5 text-gray-700 hover:text-brand-primary hover:bg-gray-200 rounded-l-md transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                disabled={isDeleting === cuisine._id}
                                onClick={() => handleDeleteClick(cuisine)}
                                className={`p-1.5 text-gray-700 hover:text-red-600 hover:bg-gray-200 rounded-r-md transition-colors ${isDeleting === cuisine._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {isDeleting === cuisine._id ? (
                                  <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
