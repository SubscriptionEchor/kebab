import { User, Tag, Clock, MapPin, LogOut, X, Menu, ArrowLeft, Star, Store, Key } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMutation } from '@apollo/client';
import { VENDOR_RESET_PASSWORD } from '../lib/graphql/mutations/auth';
import LogoutDialog from './LogoutDialog';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { VENDOR_ROUTES } from '../constants/routes';
import { useTranslation } from 'react-i18next';

const ADMIN_MENU_ITEMS = [
  { icon: User, label: 'Restaurant Profile', path: 'profile' },
  { icon: Store, label: 'Vendor Profile', path: 'vendor-profile' },
  { icon: Star, label: 'Ratings', path: 'ratings' },
  { icon: Tag, label: 'Offers', path: 'offers' },
  { icon: Menu, label: 'Menu', path: 'menu' },
  { icon: Clock, label: 'Timings', path: 'timings' },
  { icon: MapPin, label: 'Locations', path: 'locations' }
];

const VENDOR_MENU_ITEMS = [
  { icon: User, label: 'Profile', path: 'profile' },
  // { icon: Store, label: 'Vendor Profile', path: 'vendor-profile' },
  { icon: Menu, label: 'Menu', path: 'menu' },
  { icon: Tag, label: 'Offers', path: 'offers' },
  { icon: Star, label: 'Ratings', path: 'ratings' },
  { icon: Clock, label: 'Timings', path: 'timings' }
];

const getMenuItems = (userType: string | null, restaurantId: string | null) => {
  return userType === 'ADMIN' && restaurantId ? ADMIN_MENU_ITEMS : VENDOR_MENU_ITEMS;
};

export default function VendorSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userEmail, userType } = useAuth();
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useTranslation();
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isResetting, setIsResetting] = useState(false);

  const [resetPassword] = useMutation(VENDOR_RESET_PASSWORD, {
    onCompleted: () => {
      toast.success(t('vendor.passwordresetsuccessfully'));
      setShowResetPasswordDialog(false);
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error) => {
      console.error('Failed to reset password:', error);
      toast.error(error.message || t('vendor.failedtoresetpassword'));
    }
  });

  const pathSegments = location.pathname.split('/');
  const restaurantId = pathSegments.find(segment => segment.match(/^[0-9a-fA-F]{24}$/)) || null;
  const basePath = pathSegments.slice(0, pathSegments.indexOf(restaurantId || '') + 1).join('/');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const menuItems = getMenuItems(userType, restaurantId);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('vendor-sidebar');
      if (sidebar && !sidebar.contains(event.target as Node) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleBackToHome = () => {
    navigate(VENDOR_ROUTES.HOME, { replace: true });
  };

  const handleResetPassword = () => {
    setShowResetPasswordDialog(true);
  };

  const handlePasswordSubmit = async () => {
    // Validate passwords
    if (!passwordForm.oldPassword?.trim() || !passwordForm.newPassword?.trim() || !passwordForm.confirmPassword?.trim()) {
      toast.error(t('vendor.allfieldsrequired'));
      return;
    }
    if (passwordForm.newPassword?.trim() === passwordForm.oldPassword?.trim()) {
      toast.error(t('vendor.newpasswordshouldnotsame'));
      return;
    }

    if (passwordForm.newPassword?.trim() !== passwordForm.confirmPassword?.trim()) {
      toast.error(t('vendor.newpassworddonotmatch'));
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error(t('vendor.newpasswordminlength'));
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
      // Error is handled by mutation error handler
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <div
        id="vendor-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:shadow-none'}`}
        style={{ height: '100vh' }}>
        <div className="flex flex-col h-24 justify-center border-b border-gray-200 px-6">
          <span className="text-xl font-bold text-black font-display">
            {t('vendor.dashboard')}
          </span>
          <div className="flex items-center mt-2">
            <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center mr-2">
              <span className="text-sm font-medium text-black">
                {userEmail?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-700 truncate">{userEmail}</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-hidden">
          {userType === 'VENDOR' ? (
            <button
              onClick={handleBackToHome}
              className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors mb-4"
            >
              <ArrowLeft className="mr-3 h-5 w-5" />
              {t('vendor.backtohome')}
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard', { replace: true })}
              className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors mb-4"
            >
              <ArrowLeft className="mr-3 h-5 w-5" />
              {t('vendor.backtoadmin')}
            </button>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.split('/').pop() === item.path.replace('/', '');
            const fullPath = restaurantId ? `${basePath}/${item.path}` : item.path;
            return (
              <Link
                key={fullPath}
                to={fullPath}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-brand-accent text-black'
                  : 'text-gray-700 hover:bg-gray-100'
                  } active:bg-gray-200`}>
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4 space-y-2">
          {userType == "VENDOR" && (
            <button
              onClick={handleResetPassword}
              className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Key className="mr-3 h-5 w-5" />
              {t('vendor.resetpassword')}
            </button>
          )}
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            {t('vendor.signout')}
          </button>
        </div>
      </div>

      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      />

      {showResetPasswordDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('vendor.resetpassword')}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t('vendor.resetpasswordmessage')}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('vendor.entercurrentpassword')}
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                    placeholder={t('vendor.entercurrentpassword')}
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
                  {t('vendor.enternewpassword')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                    placeholder={t('vendor.enternewpassword')}
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
                  {t('vendor.confirmnewpassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                    placeholder={t('vendor.confirmnewpassword')}
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
                {t('vendor.cancel')}
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={isResetting}
                className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isResetting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                    {t('vendor.resetting')}
                  </>
                ) : (
                  t('vendor.resetpassword')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity" />
      )}

      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label={t('vendor.openmenu')}
          className="fixed bottom-4 right-4 lg:hidden bg-brand-primary text-black p-3 rounded-full shadow-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 z-50">
          <Menu className="h-6 w-6" />
        </button>
      )}
    </>
  );
}
