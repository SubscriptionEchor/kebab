import { Outlet } from 'react-router-dom';
import VendorSidebar from '../../components/VendorSidebar';
import Header from '../../components/Header';

export default function VendorDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <VendorSidebar />
      <main className="flex-1 overflow-auto w-full">
        <div className="page-container">
          <Header />
          <Outlet />
        </div>
      </main>
    </div>
  );
}