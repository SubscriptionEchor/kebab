import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Store, ChevronDown, Key, LogOut, ArrowLeft, EyeOff, Eye } from 'lucide-react';
import Pagination from '../components/Pagination';
import LoadingState from '../components/LoadingState';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { GET_RESTAURANT_BY_OWNER } from '../lib/graphql/queries/vendors';
import { GET_RESTAURANT } from '../lib/graphql/queries/restaurants';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import LogoutDialog from '../components/LogoutDialog';
import { VENDOR_RESET_PASSWORD } from '../lib/graphql/mutations/auth';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';



interface Restaurant {
  id: number;
  name: string;
  description: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Closed';
  rating: string;
  reviewCount: number;
  profileImage: string;
  bannerImage: string;
  cuisine: string;
}

export default function VendorRestaurants() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { userEmail, userType, userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [vendorEmail, setVendorEmail] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isResetting, setIsResetting] = useState(false);

  const { t } = useTranslation();

  const [resetPassword] = useMutation(VENDOR_RESET_PASSWORD, {
    onCompleted: () => {
      toast.success(t('vendorrestaurant.passwordresetsuccess'));
      setShowResetPasswordDialog(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error) => {
      console.error('Failed to reset password:', error);
      toast.error(t('vendorrestaurant.passwordresetfailed'));
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
      toast.error(t('vendorrestaurant.detailserror'));
    }
  });

  const handleRestaurantClick = async (restaurantId: string) => {
    try {
      await getRestaurant({ variables: { id: restaurantId } });
    } catch (error) {
      console.error('Error navigating to restaurant:', error);
      toast.error(t('vendorrestaurant.detailserror'));
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const rowsPerPage = 15; // Show 15 restaurants per page

  const { data, loading: isLoading, error } = useQuery(GET_RESTAURANT_BY_OWNER, {
    variables: { id: userType === 'VENDOR' ? userId : vendorId },
    skip: !userId && !vendorId,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.restaurantByOwner?.email) {
        setVendorEmail(data.restaurantByOwner.email);
      }
    },
    onError: (error) => {
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
      console.error('Failed to fetch vendor restaurants:', errorMessage);
      toast.error(errorMessage || t('vendorrestaurant.loadfailed'));
    }
  });

  const restaurants = useMemo(() => {
    if (!data?.restaurantByOwner?.restaurants) return [];
    return data.restaurantByOwner.restaurants.map((restaurant: any) => ({
      id: restaurant._id,
      name: restaurant.name,
      location: restaurant.address || t('vendorrestaurant.locationna'),
      status: restaurant.isActive,
      rating: restaurant.reviewAverage?.toFixed(1) || '0.0',
      reviewCount: restaurant.reviewCount || 0,
      profileImage: restaurant.logo || 'https://placehold.co/100x100',
      bannerImage: restaurant.image || 'https://placehold.co/800x300',
      cuisine: restaurant.shopType || t('vendorrestaurant.defaultcuisine')
    }));
  }, [data, t]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant: Restaurant) => {
      return (statusFilter === 'all' ||
        (statusFilter === 'active' && restaurant.status) ||
        (statusFilter === 'closed' && !restaurant.status)) &&
        (restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.location.toLowerCase().includes(searchQuery.toLowerCase()))
    });
  }, [searchQuery, restaurants, statusFilter, t]);

  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRestaurants.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRestaurants, currentPage]);

  const totalPages = Math.ceil(filteredRestaurants.length / rowsPerPage);

  const handleResetPassword = () => {
    setShowResetPasswordDialog(true);
  };

  const handlePasswordSubmit = async () => {
    if (!passwordForm.oldPassword?.trim() || !passwordForm.newPassword?.trim() || !passwordForm.confirmPassword?.trim()) {
      toast.error(t('vendorrestaurant.allfieldsrequired'));
      return;
    }
    if (passwordForm.newPassword?.trim() === passwordForm.oldPassword?.trim()) {
      toast.error(t('vendorrestaurant.newpasswordmustdiffer'));
      return;
    }
    if (passwordForm.newPassword?.trim() !== passwordForm.confirmPassword?.trim()) {
      toast.error(t('vendorrestaurant.passwordsmatch'));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error(t('vendorrestaurant.passwordlength'));
      return;
    }
    setIsResetting(true);
    try {
      await resetPassword({
        variables: {
          oldPassword: passwordForm.oldPassword?.trim(),
          newPassword: passwordForm.newPassword?.trim()
        }
      });
    } catch (error) {
      // error handled in mutation
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div>
      <div className="mx-8 my-8 space-y-6">
        {userType === 'VENDOR' && <Header />}

        {/* Welcome & Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {userType === 'VENDOR' ? (
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center">
                  <Store className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    {t('vendorrestaurant.welcomeback', { email: vendorEmail || userEmail })}
                  </h1>
                  <p className="text-gray-600">
                    {t('vendorrestaurant.manageinfo')}
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center mr-2">
                    <span className="text-sm font-medium text-black">
                      {(vendorEmail || userEmail)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="mr-2">{vendorEmail || userEmail}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                      {vendorEmail || userEmail}
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowResetPasswordDialog(true);
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      {t('vendorrestaurant.resetpassword')}
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowLogoutDialog(true);
                      }}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('vendorrestaurant.signout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {t('vendorrestaurant.dashboardwelcome')}
                </h1>
                <p className="text-gray-600">
                  {t('vendorrestaurant.dashboarddesc', { vendorId })}
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('vendorrestaurant.backtodashboard')}
              </button>
            </div>
          )}
        </div>

        {/* Click outside handler */}
        {showProfileDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfileDropdown(false)}
          />
        )}

        <LogoutDialog
          isOpen={showLogoutDialog}
          onClose={() => setShowLogoutDialog(false)}
        />

        {showResetPasswordDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{t('vendorrestaurant.resetpassword')}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {t('vendorrestaurant.resetpasswordinfo')}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vendorrestaurant.currentpassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                      placeholder={t('vendorrestaurant.entercurrentpassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vendorrestaurant.newpassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                      placeholder={t('vendorrestaurant.enternewpassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vendorrestaurant.confirmpassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                      placeholder={t('vendorrestaurant.confirmnewpassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowResetPasswordDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={isResetting}
                >
                  {t('vendorrestaurant.cancel')}
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={isResetting}
                  className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isResetting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                      {t('vendorrestaurant.resetting')}
                    </>
                  ) : (
                    t('vendorrestaurant.resetpassword')
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{t('vendorrestaurant.totalrestaurants')}</h3>
              <span className="text-2xl font-bold text-brand-primary">
                {restaurants.length}
              </span>
            </div>
          </div>
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{t('vendorrestaurant.activerestaurants')}</h3>
              <span className="text-2xl font-bold text-green-600">
                {restaurants.filter((r: { status: string }) => r.status === t('vendorrestaurant.active')).length}
              </span>
            </div>
          </div> */}
        </div>

        {/* Restaurants Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{t('vendorrestaurant.restaurantlist')}</h2>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'all' | 'active' | 'closed');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white mr-2"
              >
                <option value="all">{t('vendorrestaurant.allstatus')}</option>
                <option value="active">{t('vendorrestaurant.activeonly')}</option>
                <option value="closed">{t('vendorrestaurant.closedonly')}</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('vendorrestaurant.searchrestaurant')}
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

          {error ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-red-500 font-medium">{t('vendorrestaurant.loadfailed')}</div>
                <p className="text-gray-600 text-sm max-w-md text-center">
                  {t('vendorrestaurant.loadfaileddesc')}
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <LoadingState rows={6} />
          ) : !restaurants.length ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('vendorrestaurant.norestaurantsfound')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
              {paginatedRestaurants.map((restaurant: Restaurant, index: number) => (
                <div
                  onClick={() => handleRestaurantClick(restaurant.id.toString())}
                  key={restaurant.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] group"
                  style={{ transitionDelay: `${index * 100}ms`, minHeight: '320px' }}
                >
                  <div className="relative h-48">
                    <img
                      src={restaurant.bannerImage}
                      alt={`${restaurant.name} ${t('vendorrestaurant.banner')}`}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`status-badge ${restaurant.status === t('vendorrestaurant.active')
                        ? 'bg-green-100 text-green-800 ring-1 ring-green-500/10'
                        : 'bg-gray-100 text-gray-800 ring-1 ring-gray-500/10'
                        }`}>
                        {restaurant.status ? t('vendorrestaurant.active') : t('vendorrestaurant.closed')}
                      </span>
                    </div>
                  </div>
                  <div className="relative px-6 pt-4 pb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-lg border-2 border-white shadow-sm overflow-hidden bg-brand-accent flex items-center justify-center">
                        {restaurant.profileImage ? (
                          <img
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                            src={restaurant.profileImage}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                        <Store className={`h-6 w-6 text-black ${restaurant.profileImage ? 'hidden' : ''}`} />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate leading-tight mb-2">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{restaurant.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center text-amber-500">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        <span className="font-medium">{restaurant.rating}</span>
                        <span className="text-gray-500 ml-1 text-sm">({formatCount(restaurant.reviewCount)})</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestaurantClick(restaurant.id.toString());
                        }}
                        className="px-4 py-1.5 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-all duration-200 whitespace-nowrap"
                      >
                        {t('vendorrestaurant.viewdetails')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
