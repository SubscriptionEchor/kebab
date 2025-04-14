import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Store, ChevronDown, Key, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RESTAURANT_BY_OWNER } from '../../lib/graphql/queries/vendors';
import { VENDOR_RESET_PASSWORD } from '../../lib/graphql/mutations/auth';
import { ADMIN_DASHBOARD_BOOTSTRAP } from '../../lib/graphql/queries/admin';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingState from '../../components/LoadingState';
import LogoutDialog from '../../components/LogoutDialog';
import { toast } from 'sonner';
import { getCurrencySymbol } from '../../utils/currency';

interface Restaurant {
  id: number;
  name: string;
  description: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Closed';
  rating: string;
  reviewCount: number;
  totalOrders: number;
  profileImage: string;
  bannerImage: string;
  cuisine: string;
  onboardingApplicationId?: string;
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1624821588855-a3ffb0b050ff?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZCUyMHBhdHRlcm58ZW58MHx8MHx8fDA%3D';

export default function VendorRestaurantsList() {
  const navigate = useNavigate();
  const { userEmail, userType, userId, signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const currencySymbol = getCurrencySymbol();

  // Vendor email state
  const [vendorEmail, setVendorEmail] = useState<string | null>(null);

  const [resetPassword] = useMutation(VENDOR_RESET_PASSWORD, {
    onCompleted: () => {
      toast.success('Password reset successfully');
      setShowResetPasswordDialog(false);
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error) => {
      console.error('Failed to reset password:', error);
      toast.error(error.message || 'Failed to reset password');
    }
  });

  const handlePasswordSubmit = async () => {
    // Validate passwords
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword({
        variables: {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        }
      });
    } catch (error) {
      // Error is handled by mutation error handler
    } finally {
      setIsResetting(false);
    }
  };

  // Fetch currency config
  useQuery(ADMIN_DASHBOARD_BOOTSTRAP, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.adminDashboardBootstrap?.currencyConfig) {
        localStorage.setItem(
          'kebab_currency_config',
          JSON.stringify(data.adminDashboardBootstrap.currencyConfig)
        );
      }
    },
    onError: (error) => {
      console.error('Failed to fetch currency config:', error);
    }
  });

  const { data, loading: isLoading, error } = useQuery(GET_RESTAURANT_BY_OWNER, {
    variables: { id: userId },
    skip: !userId,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.restaurantByOwner?.email) {
        setVendorEmail(data.restaurantByOwner.email);
      }
    },
    onError: (error) => {
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
      console.error('Failed to fetch vendor restaurants:', errorMessage);
      toast.error(errorMessage || 'Failed to fetch restaurants. Please try again.');
    }
  });

  // Set animation flag after initial load
  useEffect(() => {
    if (!isLoading && data) {
      setTimeout(() => setHasAnimated(true), 800);
    }
  }, [isLoading, data]);

  const restaurants = useMemo(() => {
    if (!data?.restaurantByOwner?.restaurants) return [];
    
    return data.restaurantByOwner.restaurants.map((restaurant: any) => ({
      id: restaurant._id,
      name: restaurant.name,
      description: 'Authentic cuisine with a modern twist.',
      location: restaurant.address || 'Location not available',
      onboardingApplicationId: restaurant.onboardingApplicationId,
      status: restaurant.isActive ? 'Active' : 'Closed',
      rating: restaurant.reviewAverage?.toFixed(1) || '0.0',
      reviewCount: restaurant.reviewCount || 0,
      totalOrders: restaurant.totalOrders || 0,
      profileImage: restaurant.logo || PLACEHOLDER_IMAGE,
      bannerImage: restaurant.image || PLACEHOLDER_IMAGE,
      cuisine: restaurant.cuisine || 'Various',
    }));
  }, [data]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant: Restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [restaurants, searchQuery]);

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-grid-pattern" />
        </div>

        {userType === 'VENDOR' ? (
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center">
                <Store className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome back, {vendorEmail || userEmail}
                </h1>
                <p className="text-gray-600">
                  Manage and monitor all your restaurants from one place
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
                    Reset Password
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowLogoutDialog(true);
                    }}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl font-semibold text-gray-900">Vendor Restaurants</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
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
                    Reset Password
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowLogoutDialog(true);
                    }}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

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

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-6"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Total Restaurants</h3>
            <span className="text-2xl font-bold text-brand-primary">
              {restaurants.length}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Active Restaurants</h3>
            <span className="text-2xl font-bold text-green-600">
              {restaurants.filter((r: Restaurant) => r.status === 'Active').length}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
            <span className="text-2xl font-bold text-blue-600">
              {restaurants.reduce((acc: number, r: Restaurant) => acc + r.totalOrders, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Restaurants Grid */}
      <div className="space-y-4 mt-6 overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Your Restaurants</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingState rows={6} />
        ) : error ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-red-500 font-medium">Failed to load restaurants</div>
              <p className="text-gray-600 text-sm max-w-md text-center">
                There was an error loading your restaurants. Please try again or contact support if the problem persists.
              </p>
            </div>
          </div>
        ) : !restaurants.length ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No restaurants found</p>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden"
              initial={false}
            >
              {filteredRestaurants.map((restaurant: Restaurant, index: number) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3,
                    delay: hasAnimated ? 0 : index * 0.1,
                  }}
                  onClick={() => navigate(`/vendor/restaurants/${restaurant.id}`)}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] group ${
                    hasAnimated ? '' : 'shimmer-card'
                  }`}
                  style={{ minHeight: '420px' }}
                >
                  {/* Banner Image */}
                  <div className="relative h-48">
                    <img
                      src={restaurant.bannerImage || PLACEHOLDER_IMAGE}
                      alt={`${restaurant.name} banner`}
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`status-badge ${
                        restaurant.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {restaurant.status}
                      </span>
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="relative px-6 pb-6">
                    <div className="flex items-start -mt-10">
                      <div className="w-20 h-20 rounded-lg border-4 border-white shadow-sm overflow-hidden bg-brand-accent flex items-center justify-center">
                        <img
                          src={restaurant.profileImage || PLACEHOLDER_IMAGE}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0">
                          <span className="text-2xl font-bold text-black">
                            {restaurant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 pt-10">
                        <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
                          {restaurant.onboardingApplicationId && (
                            <p className="text-xs text-gray-400 font-mono">
                              ID: {restaurant.onboardingApplicationId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-gray-600 text-sm line-clamp-2 px-6">
                    {restaurant.description}
                  </p>
                  
                  <div className="mt-4 px-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-amber-500">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        <span className="font-medium">{restaurant.rating}</span>
                        <span className="text-gray-500 ml-1">({restaurant.reviewCount.toLocaleString()})</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{restaurant.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 mt-4">
                    <button
                      className="w-full px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors"
                    >
                      Manage Restaurant
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}