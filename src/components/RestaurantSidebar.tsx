import {
  ArrowLeft,
  User,
  Tag,
  Clock,
  MapPin,
  UtensilsCrossed,
  Store,
  Star
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const menuItems = ([
  { icon: User,   label: 'restaurantSidebar.menu.restaurantProfile', path: 'profile' },
  { icon: Store,  label: 'restaurantSidebar.menu.vendorProfile',     path: 'vendor-profile' },
  { icon: Star,   label: 'restaurantSidebar.menu.ratings',           path: 'ratings' },
  { icon: Clock,  label: 'restaurantSidebar.menu.timings',           path: 'timings' },
  { icon: MapPin, label: 'restaurantSidebar.menu.locations',         path: 'locations' },
] as const).map((item, i) => ({
  ...item,
  delay: i * 100,
}));

export default function RestaurantSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.split('/').pop();

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      {/* Back to Dashboard */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-medium">
            {t('restaurantSidebar.backToDashboard')}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all hover-lift ${
                isActive
                  ? 'bg-brand-accent text-black'
                  : 'text-gray-700 hover:bg-gray-100'
              } fade-enter fade-enter-active`}
              style={{ transitionDelay: `${item.delay}ms` }}
            >
              <Icon className="mr-3 h-5 w-5" />
              {t(item.label)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="mr-3 h-5 w-5" />
          {t('restaurantSidebar.backToAdmin')}
        </button>
      </div>
    </div>
  );
}
