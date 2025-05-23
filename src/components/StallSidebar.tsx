// src/components/StallSidebar.tsx
import {
  ArrowLeft,
  User,
  Clock,
  MapPin,
  Store,
  Star,
  ShoppingBag,
  Menu,
  BarChart2,
  Tag,
  LayoutGrid,
  PlusSquare
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const menuItems = ([
  { icon: BarChart2, labelKey: 'stall.menu.dashboard',    path: 'dashboard'      },
  { icon: User,       labelKey: 'stall.menu.stallProfile', path: 'profile'        },
  { icon: Store,      labelKey: 'stall.menu.vendorProfile',path: 'vendor-profile' },
  { icon: ShoppingBag,labelKey: 'stall.menu.orders',        path: 'orders'         },
  { icon: Menu,       labelKey: 'stall.menu.menu',          path: 'menu'           },
  { icon: LayoutGrid, labelKey: 'stall.menu.category',      path: 'category'       },
  { icon: PlusSquare, labelKey: 'stall.menu.addOns',        path: 'addons'         },
  { icon: Tag,        labelKey: 'stall.menu.offers',        path: 'offers'         },
  { icon: Star,       labelKey: 'stall.menu.ratings',       path: 'ratings'        },
  { icon: Clock,      labelKey: 'stall.menu.timings',       path: 'timings'        },
  { icon: MapPin,     labelKey: 'stall.menu.location',      path: 'location'       }
] as const).map((item, i) => ({
  ...item,
  delay: i * 100
}));

export default function StallSidebar() {
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
            {t('stall.sidebar.backToDashboard')}
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
              {t(item.labelKey)}
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
          {t('stall.sidebar.backToAdmin')}
        </button>
      </div>
    </div>
  );
}
