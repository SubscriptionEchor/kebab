import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, ChevronRight, Power, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AddEventModal from '../components/AddEventModal';

interface Event {
  id: string;
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  isActive: boolean;
}

export default function EventOrganizerDetails() {
  const { t } = useTranslation();
  const { organizerId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Summer Music Festival',
      startDate: '2024-07-15',
      startTime: '14:00',
      endDate: '2024-07-17',
      endTime: '23:00',
      location: {
        lat: 40.7128,
        lng: -74.0060
      },
      address: 'Central Park, New York, NY 10024',
      isActive: true
    },
    {
      id: '2',
      name: 'Tech Conference 2024',
      startDate: '2024-08-20',
      startTime: '09:00',
      endDate: '2024-08-22',
      endTime: '18:00',
      location: {
        lat: 37.7749,
        lng: -122.4194
      },
      address: 'Moscone Center, 747 Howard St, San Francisco, CA 94103',
      isActive: true
    },
    {
      id: '3',
      name: 'Food & Wine Expo',
      startDate: '2024-09-10',
      startTime: '11:00',
      endDate: '2024-09-12',
      endTime: '20:00',
      location: {
        lat: 41.8781,
        lng: -87.6298
      },
      address: 'McCormick Place, 2301 S King Dr, Chicago, IL 60616',
      isActive: false
    }
  ]);

  // Mock organizer data - replace with actual API call
  const [organizer] = useState({
    id: organizerId,
    name: organizerId === 'ORG-001' ? 'Event Masters Pro' :
          organizerId === 'ORG-002' ? 'Celebration Experts' :
          organizerId === 'ORG-003' ? 'Prime Events' : ''
  });

  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const handleAddEvent = (data: {
    name: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    location: {
      lat: number;
      lng: number;
    };
    address: string;
  }) => {
    const newEvent: Event = {
      id: String(events.length + 1),
      ...data,
      isActive: true
    };
    setEvents([...events, newEvent]);
    setIsModalOpen(false);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = (data: {
    name: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    location: {
      lat: number;
      lng: number;
    };
    address: string;
  }) => {
    if (selectedEvent) {
      const updatedEvents = events.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, ...data }
          : event
      );
      setEvents(updatedEvents);
      setIsEditModalOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const handleViewEvent = (event: Event) => {
    navigate(`/dashboard/event-organizers/${organizerId}/events/${event.id}`);
  };

  const handleToggleEvent = (eventId: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId
          ? { ...event, isActive: !event.isActive }
          : event
      )
    );
  };

  const handleDropdownToggle = (eventId: string) => {
    setDropdownOpen(dropdownOpen === eventId ? null : eventId);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (!(event.target as HTMLElement).closest('.dropdown-container')) {
      setDropdownOpen(null);
    }
  };

  // Add event listener for clicking outside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate('/dashboard/event-organizers')}
          className="text-gray-600 hover:text-brand-primary transition-colors text-sm font-medium"
        >
          Event Organizers
        </button>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-900">{organizer.name}</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Event Organizer Details</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add New Event
        </button>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[22%]">
                Event Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[11%]">
                Start Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[11%]">
                End Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[13%]">
                Event Timings
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {event.name}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-500">
                    {event.startDate}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-500">
                    {event.endDate}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-500">
                    {event.startTime} - {event.endTime}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-500 truncate">
                    {event.address}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleEvent(event.id)}
                    className={`p-2 rounded-full transition-colors ${
                      event.isActive 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={event.isActive ? 'Deactivate Event' : 'Activate Event'}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end items-center gap-2">
                    <button
                      onClick={() => handleViewEvent(event)}
                      className="inline-flex items-center px-3 py-1.5 bg-brand-primary text-white text-xs font-medium hover:bg-brand-primary/90 rounded transition-colors"
                    >
                      View Event
                    </button>
                    <div className="relative dropdown-container">
                      <button
                        onClick={() => handleDropdownToggle(event.id)}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {dropdownOpen === event.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                          <button
                            onClick={() => {
                              handleEditEvent(event);
                              setDropdownOpen(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit Event
                          </button>
                          <button
                            onClick={() => {
                              handleViewDetails(event);
                              setDropdownOpen(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEvent}
      />

      {/* Edit Event Modal */}
      {selectedEvent && (
        <AddEventModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
          onSubmit={handleUpdateEvent}
          initialData={selectedEvent}
          isEditing={true}
        />
      )}

      {/* View Event Details Modal */}
      {selectedEvent && (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 ${isViewModalOpen ? '' : 'hidden'}`}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-semibold">Event Details</h2>
                <p className="text-sm text-gray-500 mt-1">View complete information about this event</p>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Event Name</h3>
                <p className="text-lg font-medium">{selectedEvent.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Event Schedule</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{selectedEvent.startDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium">{selectedEvent.endDate}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Daily Timings</p>
                    <p className="font-medium">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{selectedEvent.address}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedEvent.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <p className="font-medium">{selectedEvent.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 