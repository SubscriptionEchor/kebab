import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Power, Loader2, PlusIcon } from 'lucide-react';
import Pagination from '../components/Pagination';
import { toast } from 'sonner';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { GET_RESTAURANTS, GET_RESTAURANTS_V2 } from '../lib/graphql/queries/restaurants';
import { GET_RESTAURANT } from '../lib/graphql/queries/restaurants';
import { DELETE_RESTAURANT } from '../lib/graphql/mutations/restaurants';
import LoadingState from '../components/LoadingState';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AddNewRestaurant from '../components/AddNewRestaurant';
interface Restaurant {
  _id: string;
  name: string;
  image: string;
  orderPrefix: string;
  slug: string;
  address: string;
  deliveryTime: string;
  minimumOrder: number;
  isActive: boolean;
  commissionRate: number;
  tax: number;
  shopType: string;
  __typename: string;
}
export default function Restaurants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingRestaurantId, setLoadingRestaurantId] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const rowsPerPage = 10;
  const { t } = useTranslation();
  // Local state for the restaurants list
  const [restaurantsList, setRestaurantsList] = useState<Restaurant[]>([]);
  const [searchParam, setSearchParam] = useState<string | null>(null);
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [restaurantsError, setRestaurantsError] = useState<any>(null);
  const [restaurantsLoading, setRestaurantsLoading] = useState<boolean>(false);
  const [retry, setRetry] = useState(false)

  const [GET_RESTAURANTS_DATA] = useLazyQuery(GET_RESTAURANTS_V2)

  const [deleteRestaurant] = useMutation(DELETE_RESTAURANT, {
    onError: (error) => {
      const errorMessage =
        error.graphQLErrors?.[0]?.message || t('restaurants.updatestatusfailed');
      toast.error(errorMessage);
    }
  });
  const [getRestaurant] = useLazyQuery(GET_RESTAURANT, {
    onCompleted: (data) => {
      if (data?.restaurant) {
        navigate(`/vendor/restaurants/${data.restaurant._id}`, {
          state: { restaurantData: data.restaurant }
        });
      }
    },
    onError: (error) => {
      console.error('Failed to fetch restaurant details:', error);
      toast.error(t('restaurants.detailserror'));
    }
  });
  const handleRestaurantClick = async (restaurantId: string) => {
    setLoadingRestaurantId(restaurantId);
    try {
      await getRestaurant({ variables: { id: restaurantId } });
    } catch (error) {
      console.error('Error navigating to restaurant:', error);
      toast.error(t('restaurants.detailserror'));
    } finally {
      setLoadingRestaurantId(null);
    }
  };
  const handleToggleStatus = async (restaurantId: string, currentStatus: boolean) => {
    if (isToggling === restaurantId) return;
    setIsToggling(restaurantId);
    try {
      const { data } = await deleteRestaurant({
        variables: { id: restaurantId },
        optimisticResponse: {
          deleteRestaurant: {
            _id: restaurantId,
            isActive: !currentStatus,
            __typename: 'Restaurant'
          }
        }
      });
      if (data?.deleteRestaurant) {
        setRestaurantsList(prevList =>
          prevList.map((restaurant) =>
            restaurant._id === restaurantId
              ? { ...restaurant, isActive: data.deleteRestaurant.isActive }
              : restaurant
          )
        );
        toast.success(
          currentStatus
            ? t('restaurants.deactivated')
            : t('restaurants.activated')
        );
      } else {
        throw new Error(t('restaurants.noserverresponse'));
      }
    } catch (error) {
      toast.error(t('restaurants.updatestatusfailed'));
    } finally {
      setIsToggling(null);
    }
  };
  // Initial variables setup in useQuery
  // const { data: restaurantsData, loading: restaurantsLoading, error: restaurantsError, refetch } =
  //   useQuery(GET_RESTAURANTS_V2, {
  //     variables: {
  //       input: searchParam ? { search: searchParam } : { limit: pageLimit, page: currentPage },
  //     },
  //     fetchPolicy: 'network-only',
  //     notifyOnNetworkStatusChange: true,
  //     onError: (error) => {
  //       const errorMessage =
  //         error.graphQLErrors?.[0]?.message || t('restaurants.loadfailed');
  //       toast.error(errorMessage);
  //     }
  //   });

  useEffect(() => {
    (async () => {
      let { data, loading, error } = await GET_RESTAURANTS_DATA({
        variables: {
          input: searchQuery ? { searchTerm: searchQuery } : { limit: pageLimit, page: currentPage }
        }
      })
      if (loading) { setRestaurantsLoading(loading) }
      if (error) { setRestaurantsError(error) }
      if (data?.restaurantListV2?.restaurantList) {
        setRestaurantsList(data.restaurantListV2.restaurantList)
      }
      if (data?.restaurantListV2?.pagination) {
        setTotalPages(data.restaurantListV2.pagination?.pages);
      }
    })()

  }, [searchQuery, currentPage, pageLimit, retry])


  const filteredRestaurants = useMemo(() => {
    if (!restaurantsList) return [];
    const query = searchQuery.toLowerCase().trim();
    if (!query) return restaurantsList;
    return restaurantsList.filter((restaurant: Restaurant) =>
      restaurant.name.toLowerCase().includes(query) ||
      restaurant.address.toLowerCase().includes(query) ||
      (restaurant.orderPrefix?.toLowerCase().includes(query) || false)
    );
  }, [searchQuery, restaurantsList, currentPage]);
  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRestaurants.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRestaurants, currentPage]);


  return (
    <div className="space-y-6">
      <AddNewRestaurant setRestaurantsList={setRestaurantsList} isOpen={isOpen} setIsOpen={setIsOpen} newRestaurant={true} />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('restaurants.title')}</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsOpen(true)}
            className='bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center'
            style={{
              padding: '6px 10px',
              cursor: 'pointer',
              border: '1px solid #ccc', // Added border
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px', // adds space between label & arrow

            }}
          >
            {t('restaurants.addnew')}
            <PlusIcon height={20} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('restaurants.searchrestaurant')}
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
      {restaurantsError ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-red-500 font-medium">{t('restaurants.loadfailed')}</div>
            <p className="text-gray-600 text-sm max-w-md text-center">
              {t('restaurants.loadfaileddesc')}
            </p>
            <button
              onClick={() => setRetry(prev => !prev)}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
            >
              {t('restaurants.retry')}
            </button>
          </div>
        </div>
      ) : restaurantsLoading ? (
        <LoadingState rows={5} />
      ) : !restaurantsList?.length ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchQuery.trim()
              ? t('restaurants.norestaurantsmatching', { query: searchQuery })
              : t('restaurants.norestaurantsfound')}
          </p>
          {searchQuery.trim() ? (
            <button
              onClick={() => setSearchQuery('')}
              className="text-brand-primary hover:text-brand-primary/80 font-medium"
            >
              {t('restaurants.clearsearch')}
            </button>
          ) : (
            <button
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('restaurants.addfirst')}
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header" style={{ width: '60px' }}>
                    {t('restaurants.image')}
                  </th>
                  <th className="table-header" style={{ width: '30%' }}>
                    {t('restaurants.restaurantname')}
                  </th>
                  <th className="table-header" style={{ width: '30%' }}>
                    {t('restaurants.address')}
                  </th>
                  <th className="table-header" style={{ width: '15%' }}>
                    {t('restaurants.status')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {restaurantsList.map((restaurant: Restaurant) => (
                  <tr
                    key={restaurant._id}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${isToggling === restaurant._id ? 'opacity-50' : ''
                      }`}
                  >
                    <td className="table-cell">
                      {restaurant.image ? (
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-xs font-medium">
                            {restaurant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td
                      className="table-cell table-cell-primary cursor-pointer hover:text-brand-primary transition-colors"
                      onClick={() => handleRestaurantClick(restaurant._id)}
                    >
                      <div className="flex items-center space-x-2">
                        {loadingRestaurantId === restaurant._id ? (
                          <>
                            <Loader2 className="h-4 w-4 text-brand-primary animate-spin" />
                            <span>{t('restaurants.loadingdetails')}</span>
                          </>
                        ) : (
                          <span className="hover:underline">{restaurant.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell table-cell-text">{restaurant.address}</td>
                    <td className="table-cell text-center">
                      <button
                        onClick={() => handleToggleStatus(restaurant._id, restaurant.isActive)}
                        disabled={isToggling === restaurant._id}
                        className={`inline-flex items-center justify-center w-12 h-8 rounded-full transition-colors ${isToggling === restaurant._id
                          ? 'bg-gray-400'
                          : restaurant.isActive
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        title={
                          restaurant.isActive
                            ? t('restaurants.deactivaterestaurant')
                            : t('restaurants.activaterestaurant')
                        }
                      >
                        {isToggling === restaurant._id ? (
                          <Loader2 className="h-4 w-4 text-white animate-spin" />
                        ) : (
                          <Power className="h-4 w-4 text-white" />
                        )}
                      </button>
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
  );
}