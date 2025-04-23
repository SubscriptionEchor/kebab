import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home, Settings, Menu, Clock, Image, MapPin, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StallLayout from '../layouts/StallLayout';

interface Stall {
  id: string;
  name: string;
  cuisine: string;
  profilePhoto: string;
  timings: {
    [key: string]: {
      startTime: string;
      endTime: string;
    };
  };
}

const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Menu },
  { id: 'timings', label: 'Timings', icon: Clock },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function StallDetails() {
  const { t } = useTranslation();
  const { organizerId, eventId, stallId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('StallDetails - Mounted with params:', { organizerId, eventId, stallId });
  console.log('StallDetails - Auth status:', { isAuthenticated, user });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        console.log('StallDetails - Checking access permissions');
        // Here you would typically make an API call to verify access
        // For now, we'll just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock access check - in real app, this would be an API call
        const hasAccess = true; // Replace with actual access check
        if (!hasAccess) {
          console.log('StallDetails - Access denied, redirecting');
          navigate('/dashboard');
          return;
        }

        console.log('StallDetails - Access granted');
        setIsLoading(false);
      } catch (err) {
        console.error('StallDetails - Error checking access:', err);
        setError('Failed to verify access permissions');
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [navigate, organizerId, eventId, stallId]);

  // Mock data - replace with actual API call
  const stall: Stall = {
    id: stallId || '1',
    name: 'Taco Stand',
    cuisine: 'Mexican',
    profilePhoto: 'https://example.com/taco-stand.jpg',
    timings: {
      monday: { startTime: '10:00', endTime: '18:00' },
      tuesday: { startTime: '10:00', endTime: '18:00' },
      wednesday: { startTime: '10:00', endTime: '18:00' },
      thursday: { startTime: '10:00', endTime: '18:00' },
      friday: { startTime: '10:00', endTime: '18:00' },
      saturday: { startTime: '10:00', endTime: '18:00' },
      sunday: { startTime: '10:00', endTime: '18:00' },
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Stall Overview</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Stall Name</h3>
                  <p className="mt-1 text-lg">{stall.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Cuisine</h3>
                  <p className="mt-1 text-lg">{stall.cuisine}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'timings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Operating Hours</h2>
            <div className="space-y-4">
              {Object.entries(stall.timings).map(([day, timing]) => (
                <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium capitalize">{day}</span>
                  <span>{timing.startTime} - {timing.endTime}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'photos':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <img
                  src={stall.profilePhoto}
                  alt={stall.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        );
      case 'location':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="h-96 bg-gray-100 rounded-lg">
              {/* Add map component here */}
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Map will be displayed here
              </div>
            </div>
          </div>
        );
      case 'staff':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Staff Members</h2>
            <div className="text-gray-500">Staff management will be implemented here</div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <div className="text-gray-500">Settings will be implemented here</div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    console.log('StallDetails - Rendering loading state');
    return (
      <StallLayout stallName="Loading..." organizerId={organizerId || ''} eventId={eventId || ''}>
        <div className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        </div>
      </StallLayout>
    );
  }

  if (error) {
    console.log('StallDetails - Rendering error state:', error);
    return (
      <StallLayout stallName="Error" organizerId={organizerId || ''} eventId={eventId || ''}>
        <div className="p-6">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </StallLayout>
    );
  }

  console.log('StallDetails - Rendering main content');
  return (
    <StallLayout stallName={stall.name} organizerId={organizerId || ''} eventId={eventId || ''}>
      <div className="p-6">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 pr-6 border-r border-gray-200">
            <div className="flex items-center space-x-3 mb-8">
              <img
                src={stall.profilePhoto}
                alt={stall.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h1 className="text-lg font-semibold">{stall.name}</h1>
                <p className="text-sm text-gray-500">{stall.cuisine}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 pl-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </StallLayout>
  );
} 