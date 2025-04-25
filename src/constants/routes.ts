export const VENDOR_ROUTES = {
  HOME: '/vendor/restaurants',
  DASHBOARD: 'dashboard',
  ORDERS: 'orders',
  PROFILE: 'profile',
  CATEGORY: 'category',
  ADDONS: 'addons',
  VENDOR_PROFILE: 'vendor-profile', 
  RATINGS: 'ratings',
  TIMINGS: 'timings',
  OFFERS: 'offers',
  MENU: 'menu',
  LOCATIONS: 'locations'
} as const;

const ADMIN_MENU_ITEMS = [
  { icon: 'User', label: 'Restaurant Profile', path: VENDOR_ROUTES.PROFILE },
  { icon: 'BarChart', label: 'Dashboard', path: VENDOR_ROUTES.DASHBOARD },
  { icon: 'ShoppingBag', label: 'Orders', path: VENDOR_ROUTES.ORDERS },
  { icon: 'Store', label: 'Vendor Profile', path: VENDOR_ROUTES.VENDOR_PROFILE },
  { icon: 'Star', label: 'Ratings', path: VENDOR_ROUTES.RATINGS },
  { icon: 'Tag', label: 'Offers', path: VENDOR_ROUTES.OFFERS },
  { icon: 'Menu', label: 'Menu', path: VENDOR_ROUTES.MENU },
  { icon: 'LayoutGrid', label: 'Category', path: VENDOR_ROUTES.CATEGORY },
  { icon: 'PlusSquare', label: 'Add-ons', path: VENDOR_ROUTES.ADDONS },
  { icon: 'Clock', label: 'Timings', path: VENDOR_ROUTES.TIMINGS },
  { icon: 'MapPin', label: 'Locations', path: VENDOR_ROUTES.LOCATIONS }
];

const VENDOR_MENU_ITEMS = [
  { icon: 'BarChart', label: 'Dashboard', path: VENDOR_ROUTES.DASHBOARD },
  { icon: 'User', label: 'Profile', path: VENDOR_ROUTES.PROFILE },
  { icon: 'ShoppingBag', label: 'Orders', path: VENDOR_ROUTES.ORDERS },
  { icon: 'Store', label: 'Vendor Profile', path: VENDOR_ROUTES.VENDOR_PROFILE },
  { icon: 'Star', label: 'Ratings', path: VENDOR_ROUTES.RATINGS },
  { icon: 'Tag', label: 'Offers', path: VENDOR_ROUTES.OFFERS },
  { icon: 'Menu', label: 'Menu', path: VENDOR_ROUTES.MENU },
  { icon: 'LayoutGrid', label: 'Category', path: VENDOR_ROUTES.CATEGORY },
  { icon: 'PlusSquare', label: 'Add-ons', path: VENDOR_ROUTES.ADDONS },
  { icon: 'Clock', label: 'Timings', path: VENDOR_ROUTES.TIMINGS }
];