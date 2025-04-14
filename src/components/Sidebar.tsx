import { Home, Store, Users, Coffee, LayoutGrid, UtensilsCrossed, ImagePlus, LogOut, X, Menu, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LogoutDialog from './LogoutDialog';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const menuItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Store, label: 'Restaurant Onboarding', path: '/dashboard/onboarding/active' },
  { icon: Users, label: 'Vendors', path: '/dashboard/vendors' },
  { icon: Coffee, label: 'Restaurants', path: '/dashboard/restaurants' },
  { icon: LayoutGrid, label: 'Restaurant Section', path: '/dashboard/sections' },
  { icon: UtensilsCrossed, label: 'Cuisines', path: '/dashboard/cuisines' },
  { icon: ImagePlus, label: 'Banners', path: '/dashboard/banners' }
];

export default function Sidebar() {
  const location = useLocation();
  const { userEmail } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { t } = useTranslation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && !sidebar.contains(event.target as Node) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      <div
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:shadow-none'}`}>
        {/* Logo and User Info */}
        <div className="flex-shrink-0 flex flex-col h-24 justify-center border-b border-gray-200 px-6">
          <span className="text-xl font-bold text-black font-display">{t('sidebar.appname')}</span>
          {userEmail && (
            <span className="text-sm text-gray-500 mt-1">{userEmail}</span>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.includes(item.path.split('/active')[0]);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-brand-accent text-black'
                    : 'text-gray-700 hover:bg-gray-100'
                  } active:bg-gray-200`}>
                <Icon className="mr-3 h-5 w-5" />
                {t(`sidebar.${item.label.toLowerCase().replace(/ /g, '')}`)}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 space-y-2">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
            <LogOut className="mr-3 h-5 w-5" />
            {t('sidebar.signout')}
          </button>
        </div>
      </div>

      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity" />
      )}

      {/* Mobile Menu Toggle */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label={t('sidebar.openmenu')}
          className="fixed bottom-4 right-4 lg:hidden bg-brand-primary text-black p-3 rounded-full shadow-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 z-50">
          <Menu className="h-6 w-6" />
        </button>
      )}
    </>
  );
}
