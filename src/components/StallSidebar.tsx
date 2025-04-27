import { ArrowLeft, User, Clock, MapPin, Store, Star, ShoppingBag, Menu, BarChart2, Tag, LayoutGrid, PlusSquare } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const menuItems = ([
  { icon: BarChart2, label: 'Dashboard', path: 'dashboard' },
  { icon: User, label: 'Stall Profile', path: 'profile' },
  { icon: Store, label: 'Vendor Profile', path: 'vendor-profile' },
  { icon: ShoppingBag, label: 'Orders', path: 'orders' },
  { icon: Menu, label: 'Menu', path: 'menu' },
  { icon: LayoutGrid, label: 'Category', path: 'category' },
  { icon: PlusSquare, label: 'Add-ons', path: 'addons' },
  { icon: Tag, label: 'Offers', path: 'offers' },
  { icon: Star, label: 'Ratings', path: 'ratings' },
  { icon: Clock, label: 'Timings', path: 'timings' },
  { icon: MapPin, label: 'Location', path: 'location' }
] as const).map((item, i) => ({
  ...item,
  delay: i * 100,
}));

export default function StallSidebar() {
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
          <span className="font-medium">Back to Dashboard</span>
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
              style={{
                transitionDelay: `${item.delay}ms`,
              }}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
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
          Back to Admin
        </button>
      </div>
    </div>
  );
} 