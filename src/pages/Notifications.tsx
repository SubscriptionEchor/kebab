import { useState, useMemo } from 'react';
import { Bell, Search, Trash2, Check } from 'lucide-react';
import Pagination from '../components/Pagination';
import { toast } from 'sonner';

const notifications = [
  {
    id: 1,
    title: 'New Restaurant Application',
    message: 'Restaurant "Spice Garden" has submitted their application for review. Vendor ID: V-2024-009',
    type: 'application',
    timestamp: '2024-02-15 14:30',
    read: false,
    actionUrl: '/dashboard/onboarding/active'
  },
  {
    id: 2,
    title: 'New Restaurant Application',
    message: 'Restaurant "Golden Plate" has submitted their application for review. Vendor ID: V-2024-010',
    type: 'application',
    timestamp: '2024-02-15 13:15',
    read: false,
    actionUrl: '/dashboard/onboarding/active'
  },
  {
    id: 3,
    type: 'info',
    title: 'System Update',
    message: 'System maintenance scheduled for tomorrow at 2 AM UTC.',
    timestamp: '2024-02-15 12:15',
    read: false,
  },
  {
    id: 4,
    title: 'Order Alert',
    message: 'Unusual spike in order cancellations detected.',
    type: 'error',
    timestamp: '2024-02-15 10:45',
    read: false,
  },
];
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const rowsPerPage = 10;

  const filteredNotifications = useMemo(() => {
    return notifications.filter(
      (notification) =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredNotifications.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredNotifications, currentPage]);

  const totalPages = Math.ceil(filteredNotifications.length / rowsPerPage);

  const handleMarkAsRead = (_id: number) => {
    toast.success('Notification marked as read');
  };

  const handleDelete = (_id: number) => {
    toast.success('Notification deleted');
  };

  const handleViewDetails = (notification: typeof notifications[0]) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        {paginatedNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md ${
              !notification.read ? 'border-l-4 border-l-brand-primary' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`rounded-full p-2 ${
                  notification.type === 'info'
                    ? 'bg-blue-100 text-blue-600' 
                    : notification.type === 'application'
                    ? 'bg-brand-accent text-brand-primary'
                    : notification.type === 'warning'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-400">{notification.timestamp}</p>
                    {notification.actionUrl && (
                      <button
                        onClick={() => handleViewDetails(notification)}
                        className="text-sm font-medium text-brand-primary hover:text-brand-primary/80"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                    title="Mark as read"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Delete notification"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}