import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home, Plus } from 'lucide-react';
import { useState } from 'react';
import AddStallModal from '../components/AddStallModal';

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

export default function EventDetails() {
  const { t } = useTranslation();
  const { organizerId, eventId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stalls, setStalls] = useState<Stall[]>([
    {
      id: '1',
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
    },
    {
      id: '2',
      name: 'Pizza Corner',
      cuisine: 'Italian',
      profilePhoto: 'https://example.com/pizza-corner.jpg',
      timings: {
        monday: { startTime: '11:00', endTime: '19:00' },
        tuesday: { startTime: '11:00', endTime: '19:00' },
        wednesday: { startTime: '11:00', endTime: '19:00' },
        thursday: { startTime: '11:00', endTime: '19:00' },
        friday: { startTime: '11:00', endTime: '19:00' },
        saturday: { startTime: '11:00', endTime: '19:00' },
        sunday: { startTime: '11:00', endTime: '19:00' },
      }
    }
  ]);

  console.log('EventDetails - Mounted with params:', { organizerId, eventId });

  const handleAddStall = (data: {
    name: string;
    cuisine: string;
    profilePhoto: File | null;
    timings: {
      [key: string]: {
        startTime: string;
        endTime: string;
      };
    };
  }) => {
    // In a real application, you would upload the profile photo to a storage service
    // and get back a URL. For now, we'll use a placeholder URL.
    const newStall: Stall = {
      id: String(stalls.length + 1),
      name: data.name,
      cuisine: data.cuisine,
      profilePhoto: 'https://example.com/placeholder.jpg', // Replace with actual photo URL
      timings: data.timings
    };
    setStalls([...stalls, newStall]);
  };

  const handleViewStall = (stallId: string) => {
    console.log('EventDetails - Viewing stall:', { stallId, organizerId, eventId });
    navigate(`/event-organizers/${organizerId}/events/${eventId}/stalls/${stallId}`);
  };

  return (
    <div className="p-6">
      {/* Breadcrumbs */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li className="flex items-center">
            <Link
              to="/dashboard"
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" />
            <Link
              to="/dashboard/event-organizers"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Event Organizers
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" />
            <Link
              to={`/dashboard/event-organizers/${organizerId}`}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Event Organizer Details
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" />
            <span className="text-sm text-gray-700 font-medium">
              Event Details
            </span>
          </li>
        </ol>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Event Details</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add New Stall
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Search Stalls
          </button>
        </div>
      </div>

      {/* Stalls Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stall Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cuisine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profile Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timings
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stalls.map((stall) => (
              <tr key={stall.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {stall.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stall.cuisine}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={stall.profilePhoto}
                    alt={stall.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="space-y-1">
                    {Object.entries(stall.timings).map(([day, timing]) => (
                      <div key={day} className="flex items-center gap-2">
                        <span className="font-medium capitalize">{day}:</span>
                        <span>{timing.startTime} - {timing.endTime}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => handleViewStall(stall.id)}
                    className="text-brand-primary hover:text-brand-primary/80 font-medium mr-4"
                  >
                    View
                  </button>
                  <button
                    className="text-brand-primary hover:text-brand-primary/80 font-medium mr-4"
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddStallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStall}
      />
    </div>
  );
} 