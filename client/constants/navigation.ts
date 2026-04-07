// Navigation route names
export const ROUTES = {
  // Auth routes
  LOGIN: 'login',
  
  // Tab routes
  RESTAURANTS: 'index',
  HISTORY: 'history',
  PROFILE: 'profile',
  
  // Restaurant routes
  RESTAURANT_DETAIL: '[id]',
  ORDER_CONFIRMATION_MODAL: 'modal',
} as const;

// Tab configuration
export const TAB_ROUTES = [
  {
    name: 'restaurants',
    path: '(restaurant)',
    title: 'Restaurants',
    icon: 'utensils',
  },
  {
    name: 'history',
    path: 'history',
    title: 'History',
    icon: 'history',
  },
  {
    name: 'profile',
    path: 'profile',
    title: 'Profile',
    icon: 'user',
  },
] as const;
