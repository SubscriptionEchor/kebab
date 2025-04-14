export const VENDOR_ROUTES = {
  HOME: '/vendor/restaurants',
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

export const ADMIN_MENU_ITEMS = [
  { icon: 'User', label: 'Restaurant Profile', path: VENDOR_ROUTES.PROFILE },
  { icon: 'Store', label: 'Vendor Profile', path: VENDOR_ROUTES.VENDOR_PROFILE },
  { icon: 'Star', label: 'Ratings', path: VENDOR_ROUTES.RATINGS },
  { icon: 'Tag', label: 'Offers', path: VENDOR_ROUTES.OFFERS },
  { icon: 'Menu', label: 'Menu', path: VENDOR_ROUTES.MENU },
  { icon: 'LayoutGrid', label: 'Category', path: VENDOR_ROUTES.CATEGORY },
  { icon: 'PlusSquare', label: 'Add-ons', path: VENDOR_ROUTES.ADDONS },
  { icon: 'Clock', label: 'Timings', path: VENDOR_ROUTES.TIMINGS },
  { icon: 'MapPin', label: 'Locations', path: VENDOR_ROUTES.LOCATIONS }
];

export const VENDOR_MENU_ITEMS = [
  { icon: 'User', label: 'Profile', path: VENDOR_ROUTES.PROFILE },
  { icon: 'Store', label: 'Vendor Profile', path: VENDOR_ROUTES.VENDOR_PROFILE },
  { icon: 'Star', label: 'Ratings', path: VENDOR_ROUTES.RATINGS },
  { icon: 'Tag', label: 'Offers', path: VENDOR_ROUTES.OFFERS },
  { icon: 'Menu', label: 'Menu', path: VENDOR_ROUTES.MENU },
  { icon: 'LayoutGrid', label: 'Category', path: VENDOR_ROUTES.CATEGORY },
  { icon: 'PlusSquare', label: 'Add-ons', path: VENDOR_ROUTES.ADDONS },
  { icon: 'Clock', label: 'Timings', path: VENDOR_ROUTES.TIMINGS }
];