import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './lib/graphql/client';
import { ZonesProvider } from './contexts/ZonesContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import VendorOrders from './pages/vendor/Orders';
import VendorRestaurantsList from './pages/vendor/RestaurantsList';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Banners from './pages/Banners';
import Cuisines from './pages/Cuisines';
import RestaurantSections from './pages/RestaurantSections';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantProfile from './pages/restaurant/Profile';
import VendorProfile from './pages/restaurant/VendorProfile';
import Ratings from './pages/restaurant/Ratings';
import Category from './pages/vendor/Category';
import Addons from './pages/vendor/Addons';
import RestaurantTimings from './pages/restaurant/Timings';
import RestaurantLocations from './pages/restaurant/Locations';
import VendorRestaurants from './pages/VendorRestaurants';
import RestaurantOnboarding from './pages/RestaurantOnboarding';
import Vendors from './pages/Vendors';
import Restaurants from './pages/Restaurants';
import ActiveRestaurants from './pages/restaurants/Active';
import ApprovedRestaurants from './pages/restaurants/Approved';
import RejectedRestaurants from './pages/restaurants/Rejected';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorTimings from './pages/vendor/Timings';
import VendorLocation from './pages/vendor/Location';
import EventOrganizers from './pages/EventOrganizers';
import { Toaster } from 'sonner';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { ToasterProps } from 'sonner';
import Offers from './pages/restaurant/Offers';
import { useEffect } from 'react';
import i18n from './i18';
import Menu from './pages/vendor/Menu';
import VendorDashboardPage from './pages/vendor/Dashboard';
type ToasterPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

function AppRoutes() {
  const { userType } = useAuth();

  useEffect(() => {
    const storedLang = localStorage.getItem('selectedLanguage');
    if (storedLang ) {
      i18n.changeLanguage(storedLang);
    }
  }, [i18n]);
  
  return (
    <>
      <Toaster {...toasterProps} />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <RequireAuth>
            <Navigate to={userType === 'VENDOR' ? '/vendor/restaurants' : '/dashboard'} replace />
          </RequireAuth>
        } />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        >
          <Route index element={<Home />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="vendors/:vendorId/restaurants" element={<VendorRestaurants />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="sections" element={<RestaurantSections />} />
          <Route path="banners" element={<Banners />} />
          <Route path="cuisines" element={<Cuisines />} />
          <Route path="event-organizers" element={<EventOrganizers />} />
          <Route path="onboarding" element={<RestaurantOnboarding />}>
            <Route index element={<Navigate to="active" replace />} />
            <Route path="active" element={<ActiveRestaurants />} />
            <Route path="approved" element={<ApprovedRestaurants />} />
            <Route path="rejected" element={<RejectedRestaurants />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Shared Restaurant Management Routes */}
        <Route
          path="/dashboard/vendors/:vendorId/restaurants/:restaurantId"
          element={
            <RequireAuth>
              <RestaurantDashboard />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<RestaurantProfile />} />
          <Route path="vendor-profile" element={<VendorProfile />} />
          <Route path="ratings" element={<Ratings />} />
          <Route path="timings" element={<RestaurantTimings />} />
          <Route path="locations" element={<RestaurantLocations />} />
        </Route>

        {/* Vendor Dashboard Routes */}
        <Route
          path="/vendor/restaurants"
          element={<RequireAuth><VendorRestaurants /></RequireAuth>}
        />

        {/* Vendor Profile Routes */}
        <Route
          path="/vendor"
          element={<RequireAuth><VendorRestaurantsList /></RequireAuth>}
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<VendorProfile />} />
          <Route path="timings" element={<VendorTimings />} />
          <Route path="location" element={<VendorLocation />} />
        </Route>

        {/* Restaurant Management Routes for Vendor */}
        <Route
          path="/vendor/restaurants/:restaurantId"
          element={<RequireAuth><VendorDashboard /></RequireAuth>}
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="dashboard" element={<VendorDashboardPage />} />
          <Route path="profile" element={<RestaurantProfile />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="vendor-profile" element={<VendorProfile />} />
          <Route path="ratings" element={<Ratings />} />
          <Route path="category" element={<Category />} />
          <Route path="addons" element={<Addons />} />
          <Route path="offers" element={<Offers />} />
         <Route path="menu" element={<Menu />} />
          <Route path="timings" element={<RestaurantTimings />} />
          <Route path="locations" element={<RestaurantLocations />} />
        </Route>

        {/* Catch-All Route */}
        <Route path="*" element={
          <RequireAuth>
            <Navigate to={userType === 'VENDOR' ? '/vendor/restaurants' : '/dashboard'} replace />
          </RequireAuth>
        } />
      </Routes>
    </>
  );
}

const toasterProps = {
  position: 'top-right' as ToasterPosition,
  richColors: true,
  closeButton: true,
  expand: true,
  offset: 16,
  gap: 12,
  duration: 4000,
  pauseWhenPageIsHidden: true,
  toastOptions: {
    style: {
      maxWidth: '420px',
      padding: '12px',
      background: 'white',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    },
    className: 'toast-notification',
  },
};

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, userType, isLoading } = useAuth();
  const location = useLocation();
  const isVendorRoute = location.pathname.startsWith('/vendor/');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only restrict vendor access, admins can access all routes
  if (userType === 'VENDOR' && !isVendorRoute) {
    // Redirect vendors to their restaurant list page
    return <Navigate to="/vendor/restaurants" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <CurrencyProvider>
          <ZonesProvider>
            <AppRoutes />
          </ZonesProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}