import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <Sidebar />
      <main className="flex-1 overflow-auto w-full">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}