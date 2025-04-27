import { Outlet } from 'react-router-dom';
import StallSidebar from '../../components/StallSidebar';
import StallBreadcrumbs from '../../components/StallBreadcrumbs';

export default function StallDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <StallSidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6">
          <div className="mb-6">
            <StallBreadcrumbs />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
} 