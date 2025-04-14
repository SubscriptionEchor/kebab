import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, Power } from 'lucide-react';
import Pagination from '../components/Pagination';
import { toast } from 'sonner';
import { showSuccessConfetti } from '../utils/confetti';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { GET_SECTIONS } from '../lib/graphql/queries/sections';
import { EDIT_SECTION, DELETE_SECTION, CREATE_SECTION } from '../lib/graphql/mutations/sections';
import SectionListSkeleton from '../components/sections/SectionListSkeleton';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { useTranslation } from 'react-i18next';
import { GET_RESTAURANTS_V2 } from '../lib/graphql/queries/restaurants';

interface Restaurant {
  _id: string;
  name: string;
}

interface Section {
  _id: string;
  name: string;
  enabled: boolean;
  restaurants: Restaurant[];
}

interface GetSectionsData {
  sections: Section[];
  restaurants: Restaurant[];
}

export default function RestaurantSections() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'active' | 'add'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [sectionName, setSectionName] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const rowsPerPage = 10;
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingEnabled, setEditingEnabled] = useState(true);
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'restaurants' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [restaurantsError, setRestaurantsError] = useState<any>(null);
  const [restaurantsLoading, setRestaurantsLoading] = useState<boolean>(false);
  const [restaurantsList, setRestaurantsList] = useState<Restaurant[]>([]);
  const [selectedRestaurantNames, setSelectedRestaurantNames] = useState([])

  const [deleteSection] = useMutation(DELETE_SECTION, {
    refetchQueries: [{ query: GET_SECTIONS }],
    onError: (error) => {
      console.error('Failed to delete section:', error);
      toast.error(t('restaurantsections.deletesectionfailed'));
    }
  });

  const [editSection] = useMutation(EDIT_SECTION, {
    onCompleted: (data) => {
      if (data?.editSection) {
        toast.success(t('restaurantsections.sectionupdated'));
        showSuccessConfetti();
        resetForm();
        setActiveTab('active');
      }
    },
    onError: (error) => {
      console.error('Failed to update section:', error);
      toast.error(t('restaurantsections.updatefailed'));
    },
    refetchQueries: [{ query: GET_SECTIONS }]
  });

  const [createSection] = useMutation(CREATE_SECTION, {
    onCompleted: (data) => {
      if (data?.createSection) {
        toast.success(t('restaurantsections.sectioncreated'));
        showSuccessConfetti();
        resetForm();
        setActiveTab('active');
      }
    },
    refetchQueries: [{ query: GET_SECTIONS }],
    onError: (error) => {
      console.error('Failed to create section:', error);
      toast.error(t('restaurantsections.createfailed'));
    }
  });
  const [GET_RESTAURANTS_DATA] = useLazyQuery(GET_RESTAURANTS_V2)
  const { data: sectionsData, loading: sectionsLoading, error: sectionsError, refetch } = useQuery<GetSectionsData>(GET_SECTIONS, {
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Failed to fetch sections:', error);
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          refetch();
        }, Math.pow(2, retryCount) * 1000);
      }
    }
  });

  // const { data: restaurantsData, loading: restaurantsLoading, error: restaurantError } = useQuery<GetSectionsData>(GET_SECTIONS, {
  //   fetchPolicy: 'network-only',

  // });

  useEffect(() => {
    (async () => {
      let { data, loading, error } = await GET_RESTAURANTS_DATA({
        variables: {
          input: restaurantSearchQuery ? { searchTerm: restaurantSearchQuery } : { limit: 10 }
        }
      })
      if (loading) { setRestaurantsLoading(loading) }
      if (error) { setRestaurantsError(error) }
      console.log(data.restaurantListV2)
      if (data?.restaurantListV2?.restaurantList) {
        setRestaurantsList(data.restaurantListV2.restaurantList)
      }
    })()

  }, [restaurantSearchQuery])


  const handleSaveSection = async () => {
    // Validate section name

    if (!sectionName.trim()) {
      toast.error(t('restaurantsections.entersectionnamemessage'));
      (document.getElementById('sectionName') as HTMLInputElement)?.focus();
      return;
    }

    // Check for duplicate section name
    const existingSection = sectionsData?.sections?.find(
      (section: Section) =>
        section.name.toLowerCase() === sectionName.toLowerCase() &&
        (!editMode || section._id !== editingSectionId)
    );

    if (existingSection) {
      toast.error(t('restaurantsections.duplicatesection'));
      (document.getElementById('sectionName') as HTMLInputElement)?.focus();
      return;
    }

    if (selectedRestaurants.length === 0) {
      toast.error(t('restaurantsections.selectatleastoneresaurant'));
      (document.querySelector('input[type="search"]') as HTMLInputElement)?.focus();
      return;
    }

    setIsSubmitting(true);

    if (editMode && editingSectionId) {
      try {
        await editSection({
          variables: {
            section: {
              _id: editingSectionId,
              name: sectionName,
              enabled: editingEnabled,
              restaurants: selectedRestaurants
            }
          }
        });
      } catch (error) {
        console.error('Failed to update section:', error);
        toast.error(t('restaurantsections.updatefailed'));
      }
    } else {
      try {
        await createSection({
          variables: {
            section: {
              name: sectionName,
              enabled: true,
              restaurants: selectedRestaurants
            }
          }
        });
      } catch (error) {
        console.error('Failed to create section:', error);
        toast.error(t('restaurantsections.createfailed'));
      }
    }
    setIsSubmitting(false);
  };

  const handleEditSection = (section: Section) => {
    console.log('Starting section edit:', section);
    setActiveTab('add');
    setEditMode(true);
    setRestaurantSearchQuery('');
    setEditingSectionId(section._id);
    setSectionName(section.name);
    setEditingEnabled(section.enabled);
    setSelectedRestaurants(section.restaurants.map(r => r._id));
    setSelectedRestaurantNames(section.restaurants.map(r => r.name))
    console.log('Section data loaded into edit form:', {
      id: section._id,
      name: section.name,
      enabled: section.enabled,
      restaurants: section.restaurants.map(r => r._id)
    });
  };

  const resetForm = () => {
    setSectionName('');
    setSelectedRestaurants([]);
    setSelectedRestaurantNames([])
    setEditMode(false);
    setEditingEnabled(true);
    setEditingSectionId(null);
    setRestaurantSearchQuery('');
  };

  const handleCancelEdit = () => {
    console.log('Canceling edit operation');
    resetForm();
    setActiveTab('active');
  };

  const handleDeleteClick = (section: Section) => {
    setSectionToDelete({
      id: section._id,
      name: section.name
    });
    setShowDeleteConfirmation(true);
  };

  const handleDelete = async (sectionId: string) => {
    setIsDeleting(sectionId);
    try {
      const { data } = await deleteSection({
        variables: { id: sectionId }
      });

      if (data?.deleteSection) {
        toast.success(t('restaurantsections.sectiondeleted'));
        setShowDeleteConfirmation(false);
        setSectionToDelete(null);
      } else {
        throw new Error(t('restaurantsections.deletesectionfailed'));
      }
    } catch (error) {
      console.error('Failed to delete section:', error);
      toast.error(t('restaurantsections.deletesectionfailed'));
    }
    setIsDeleting(null);
  };

  const handleToggleStatus = async (sectionId: string) => {
    if (isToggling === sectionId) return;
    setIsToggling(sectionId);

    // Find the current section to get its data
    const section = sectionsData?.sections.find(s => s._id === sectionId);
    if (!section) {
      toast.error(t('restaurantsections.sectionnotfound'));
      setIsToggling(null);
      return;
    }

    try {
      await editSection({
        variables: {
          section: {
            _id: sectionId,
            name: section.name,
            enabled: !section.enabled,
            restaurants: section.restaurants.map(r => r._id)
          }
        }
      });
      // toast.success(`Section ${!section.enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Failed to toggle section status:', error);
      toast.error(t('restaurantsections.updatefailed'));
    } finally {
      setIsToggling(null);
    }
  };

  const filteredSections = useMemo(() => {
    const sections = sectionsData?.sections || [];
    const filtered = sections.filter(
      (section) => {
        // Text search filter
        const matchesSearch = section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.restaurants.some(restaurant =>
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        const matchesStatus = statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? section.enabled
            : !section.enabled;
        return matchesSearch && matchesStatus;
      });

    // Sort the filtered results
    const sorted = filtered.sort((a, b) => {
      // If editing a section, show it first
      if (editingSectionId) {
        if (a._id === editingSectionId) return -1;
        if (b._id === editingSectionId) return 1;
      }
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'restaurants':
          comparison = a.restaurants.length - b.restaurants.length;
          break;
        case 'status':
          comparison = Number(a.enabled) - Number(b.enabled);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [searchQuery, sectionsData, editingSectionId, sortBy, sortOrder, statusFilter]);

  const paginatedSections = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredSections.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredSections, currentPage]);

  const totalPages = Math.ceil(filteredSections.length / rowsPerPage);

  return (
    <div className="space-y-6">
      <DeleteConfirmation
        key={showDeleteConfirmation ? 'open' : 'closed'}
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setSectionToDelete(null);
        }}
        onConfirm={() => sectionToDelete && handleDelete(sectionToDelete.id)}
        title={t('restaurantsections.deletesection')}
        message={t('restaurantsections.deleteconfirmation', { name: sectionToDelete?.name })}
        isDeleting={!!isDeleting}
      />

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
              ${activeTab === 'active'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
            `}
          >
            {t('restaurantsections.activesection')}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
              ${activeTab === 'add'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
            `}
          >
            {editMode ? t('restaurantsections.editsection') : t('restaurantsections.addnewsection')}
          </button>
        </nav>
      </div>

      {activeTab === 'add' ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editMode ? t('restaurantsections.editsection') : t('restaurantsections.addnewsection')}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editMode
                      ? t('restaurantsections.updatesectiondetails')
                      : t('restaurantsections.createnewsection')
                    }
                  </p>
                </div>
                {editMode && (
                  <button
                    onClick={() => setEditingEnabled(!editingEnabled)}
                    className={`inline-flex items-center justify-center w-12 h-8 rounded-full transition-colors ${editingEnabled
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    title={editingEnabled ? t('restaurantsections.deactivatesection') : t('restaurantsections.activatesection')}
                  >
                    <Power className="h-4 w-4 text-white" />
                  </button>
                )}
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="sectionName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('restaurantsections.sectionname')}
                </label>
                <input
                  id="sectionName"
                  type="text"
                  placeholder={t('restaurantsections.entersectionname')}
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('restaurantsections.selectrestaurants')}
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('restaurantsections.searchrestaurants')}
                    value={restaurantSearchQuery}
                    onChange={(e) => setRestaurantSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 text-sm w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-200">
                  {restaurantsLoading && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      <div className="h-5 w-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      {t('restaurantsections.loadingrestaurants')}
                    </div>
                  )}

                  {restaurantsError && (
                    <div className="p-4 text-center">
                      <p className="text-sm text-red-600 mb-2">{t('restaurantsections.failedtoloadrestaurants')}</p>
                      <button
                        onClick={() => refetch()}
                        className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
                      >
                        {t('restaurantsections.retry')}
                      </button>
                    </div>
                  )}

                  {!restaurantsLoading && !restaurantsError && restaurantsList?.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      {t('restaurantsections.norestaurantsavailable')}
                    </div>
                  )}

                  {!restaurantsLoading && !restaurantsError && (restaurantsList || [])
                    .filter(restaurant => selectedRestaurants.includes(restaurant._id))
                    .filter(restaurant => {
                      if (!restaurantSearchQuery.trim()) return true;
                      return restaurant.name.toLowerCase().includes(restaurantSearchQuery.toLowerCase());
                    })
                    .map((restaurant) => (
                      <label key={restaurant._id} className="flex items-center space-x-3 px-4 py-3 bg-brand-accent/10 hover:bg-brand-accent/20 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => {
                            setSelectedRestaurants(selectedRestaurants.filter((id) => id !== restaurant._id))
                            setSelectedRestaurantNames(selectedRestaurantNames.filter((name) => name !== restaurant.name))
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary transition-colors"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{restaurant.name}</span>
                          <span className="text-xs text-brand-primary">{t('restaurantsections.selected')}</span>
                        </div>
                      </label>
                    ))}

                  {!sectionsLoading && !sectionsError && (restaurantsList || [])
                    .filter(restaurant => !selectedRestaurants.includes(restaurant._id))
                    .filter(restaurant => {
                      if (!restaurantSearchQuery.trim()) return true;
                      return restaurant.name.toLowerCase().includes(restaurantSearchQuery.toLowerCase());
                    })
                    .map((restaurant) => (
                      <label key={restaurant._id} className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => {
                            setSelectedRestaurantNames([...selectedRestaurantNames, restaurant.name])
                            setSelectedRestaurants([...selectedRestaurants, restaurant._id])
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary transition-colors"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{restaurant.name}</span>
                        </div>
                      </label>
                    ))}
                  {!sectionsLoading && !sectionsError && (restaurantsList || [])
                    .filter(restaurant => {
                      if (!restaurantSearchQuery.trim()) return true;
                      return restaurant.name.toLowerCase().includes(restaurantSearchQuery.toLowerCase());
                    }).length === 0 && (
                      <div className="p-4 text-center text-sm text-gray-500">
                        {restaurantSearchQuery.trim()
                          ? `${t('restaurantsections.norestaurantsfoundmatching')} "${restaurantSearchQuery}"`
                          : t('restaurantsections.norestaurantsavailable')
                        }
                      </div>
                    )}
                </div>
                <p className="mt-3 text-sm text-gray-600  items-center justify-between">
                  {/* <span>
                    <b>{selectedRestaurants.length}</b> {t('restaurantsections.restaurantsselected')}
                  </span> */}
                  {/* {selectedRestaurants.length > 0 && (
                    <button
                      onClick={() => setSelectedRestaurants([])}
                      className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium"
                    >
                      {t('restaurantsections.clearselection')}
                    </button>
                  )} */}
                  {selectedRestaurantNames?.map(item => <p>{item}</p>)}
                </p>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right rounded-b-lg border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {t('restaurantsections.cancel')}
                </button>
                <button
                  onClick={handleSaveSection}
                  disabled={isSubmitting}
                  className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {editMode ? t('restaurantsections.updatesection') : t('restaurantsections.addsection')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">{t('restaurantsections.title')}</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('restaurantsections.searchsections')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white cursor-pointer min-w-[140px] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')] bg-[position:right_16px_center] bg-[length:16px_16px] bg-no-repeat pr-12"
              >
                <option value="all">{t('restaurantsections.allstatus')}</option>
                <option value="active">{t('restaurantsections.active')}</option>
                <option value="inactive">{t('restaurantsections.inactive')}</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'name' | 'restaurants' | 'status');
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white cursor-pointer min-w-[140px] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')] bg-[position:right_16px_center] bg-[length:16px_16px] bg-no-repeat pr-12"
              >
                <option value="name">{t('restaurantsections.sortbyname')}</option>
                <option value="restaurants">{t('restaurantsections.sortbyrestaurant')}</option>
                <option value="status">{t('restaurantsections.sortbystatus')}</option>
              </select>

              <button
                onClick={() => setSortOrder(current => current === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[140px] text-left flex items-center justify-between"
              >
                <span>{sortOrder === 'asc' ? t('restaurantsections.ascending') : t('restaurantsections.descending')}</span>
                <span className="text-gray-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              </button>
            </div>
          </div>

          {sectionsError ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-red-500 font-medium">{t('restaurantsections.failedtoloadsections')}</div>
                <p className="text-gray-600 text-sm max-w-md text-center">
                  {t('restaurantsections.failtoload')}
                </p>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
                >
                  {t('restaurantsections.retry')}
                </button>
              </div>
            </div>
          ) : sectionsLoading ? (
            <SectionListSkeleton />
          ) : !sectionsData?.sections || sectionsData.sections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('restaurantsections.nosectionsfound')}</p>
              <button
                onClick={() => setActiveTab('add')}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('restaurantsections.createsection')}
              </button>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <p className="text-gray-500">{t('restaurantsections.nosectionsfoundmatching', { query: searchQuery })}</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-brand-primary hover:text-brand-primary/80 font-medium"
                >
                  {t('restaurantsections.clearsearch')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="table-container">
                <div className="table-wrapper">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="table-header" style={{ width: '30%' }}>
                          {t('restaurantsections.sectionname')}
                        </th>
                        <th className="table-header" style={{ width: '35%' }}>
                          {t('restaurantsections.restaurants')}
                        </th>
                        <th className="table-header" style={{ width: '15%' }}>
                          {t('restaurantsections.status')}
                        </th>
                        <th className="table-header text-right" style={{ width: '20%' }}>
                          {t('restaurantsections.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedSections.map((section) => (
                        <tr key={section._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="table-cell table-cell-primary">{section.name}</td>
                          <td className="table-cell">
                            <div className="flex flex-wrap gap-2">
                              {section.restaurants.map((restaurant) => (
                                <span
                                  key={restaurant._id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-accent text-black"
                                >
                                  {restaurant.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="table-cell">
                            <button
                              onClick={() => handleToggleStatus(section._id)}
                              disabled={isToggling === section._id}
                              className={`inline-flex items-center justify-center w-12 h-8 rounded-full transition-colors ${section.enabled
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-300 hover:bg-gray-400'} ${isToggling === section._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={section.enabled ? t('restaurantsections.deactivatesection') : t('restaurantsections.activatesection')}
                            >
                              {isToggling === section._id ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Power className="h-4 w-4 text-white" />
                              )}
                            </button>
                          </td>
                          <td className="table-cell text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <div className="flex items-center bg-gray-100 rounded-md divide-x divide-gray-200">
                                <button
                                  onClick={() => handleEditSection(section)}
                                  className="p-1.5 text-gray-700 hover:text-brand-primary hover:bg-gray-200 rounded-l-md transition-colors"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  disabled={isDeleting === section._id}
                                  onClick={() => handleDeleteClick(section)}
                                  className={`p-1.5 text-gray-700 hover:text-red-600 hover:bg-gray-200 rounded-r-md transition-colors ${isDeleting === section._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {isDeleting === section._id ? (
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
              </div>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
