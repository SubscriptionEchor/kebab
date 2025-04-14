import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LOADING_SPINNER = "h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin";

interface RequireAuthProps {
  children: JSX.Element;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, userType, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={LOADING_SPINNER} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vendor route protection
  if (userType === 'VENDOR') {
    const isVendorRoute = location.pathname.startsWith('/vendor');
    const isDashboardRoute = location.pathname.startsWith('/dashboard');
    
    // If vendor tries to access dashboard or non-vendor routes, redirect to vendor home
    if (isDashboardRoute || !isVendorRoute) {
      return <Navigate to="/vendor/restaurants" replace />;
    }
  }

  // Admin route protection
  if (userType === 'ADMIN') {
    const isVendorRoute = location.pathname.startsWith('/vendor');
    
    // If admin tries to access vendor routes, redirect to admin dashboard
    if (isVendorRoute) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}