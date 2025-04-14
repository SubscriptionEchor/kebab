import { Outlet } from 'react-router-dom';
import RestaurantSidebar from '../../components/RestaurantSidebar';
import RestaurantBreadcrumbs from '../../components/RestaurantBreadcrumbs';

export default function RestaurantDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <RestaurantSidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6">
          <div className="mb-6">
            <RestaurantBreadcrumbs />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}