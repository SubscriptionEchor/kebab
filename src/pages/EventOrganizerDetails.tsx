import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, ChevronRight, Power, Calendar, Edit, Trash2 } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AddEventModal from '../components/AddEventModal';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EVENTS_BY_MANAGER, CREATE_EVENT, UPDATE_EVENT } from '../lib/graphql/queries/eventOrganizers';
import LoadingState from '../components/LoadingState';
import { toast } from 'sonner';
import KebabMenu from '../components/KebabMenu';

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
  country?: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  
  // Create event mutation
  const [createEvent] = useMutation(CREATE_EVENT, {
    refetchQueries: [{ query: GET_EVENTS_BY_MANAGER, variables: { managerId: organizerId } }],
    onCompleted: (data) => {
      if (data?.createEvent) {
        toast.success("Event created successfully");
      }
    },
    onError: (error) => {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  });
  
  // Update event mutation
  const [updateEvent] = useMutation(UPDATE_EVENT, {
    refetchQueries: [{ query: GET_EVENTS_BY_MANAGER, variables: { managerId: organizerId } }],
    onCompleted: (data) => {
      if (data?.updateEvent) {
        toast.success("Event updated successfully");
      }
    },
    onError: (error) => {
      console.error("Error updating event:", error);
      toast.error(`Failed to update event: ${error.message}`);
    }
  });

  const [organizer] = useState({
    id: organizerId,
    name: organizerId === 'ORG-001' ? 'Event Masters Pro' :
          organizerId === 'ORG-002' ? 'Celebration Experts' :
          organizerId === 'ORG-003' ? 'Prime Events' : 'Unknown Organizer'
  });

  // Fetch events data from API
  const { data: eventsData, loading: eventsLoading, error: eventsError } = useQuery(GET_EVENTS_BY_MANAGER, {
    variables: { managerId: organizerId },
    skip: !organizerId,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.getEventsByManager) {
        const formattedEvents = data.getEventsByManager.map((event: any) => ({
          id: event._id,
          name: event.name,
          startDate: new Date(parseInt(event.startDate)).toISOString().split('T')[0],
          startTime: event.startTime,
          endDate: new Date(parseInt(event.endDate)).toISOString().split('T')[0],
          endTime: event.endTime,
          location: {
            lat: event.location?.coordinates?.[1] || 0,
            lng: event.location?.coordinates?.[0] || 0
          },
          address: event.address || 'No address provided',
          isActive: event.isActive
        }));
        setEvents(formattedEvents);
      }
    },
    onError: (error) => {
      console.error('Failed to fetch events:', error);
    }
  });

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
    country: string;
  }) => {
    try {
      setIsSubmitting(true);
      
      // The actual API call is handled in the AddEventModal component
      // Here we just update the local state with the new event
      const newEvent: Event = {
        id: String(events.length + 1), // This will be replaced by the actual ID from the API
        ...data,
        isActive: true
      };
      
      // Update local state
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
    } catch (error) {
      console.error("Error in handleAddEvent:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    console.log("Edit event called for:", event.name);
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = async (data: {
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
    country: string;
  }) => {
    if (selectedEvent) {
      setIsSubmitting(true);
      try {
        await updateEvent({
          variables: {
            eventId: selectedEvent.id,
            eventUpdateInput: {
              name: data.name,
              startDate: data.startDate,
              endDate: data.endDate,
              startTime: data.startTime,
              endTime: data.endTime,
              address: data.address,
              location: {
                type: "Point",
                coordinates: [data.location.lng, data.location.lat]
              }
            }
          }
        });
        
        // Update local state
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === selectedEvent.id
              ? {
                  ...event,
                  name: data.name,
                  startDate: data.startDate,
                  endDate: data.endDate,
                  startTime: data.startTime,
                  endTime: data.endTime,
                  address: data.address,
                  location: {
                    lat: data.location.lat,
                    lng: data.location.lng
                  }
                }
              : event
          )
        );
        setIsEditModalOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error("Error updating event:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleViewDetails = (event: Event) => {
    console.log("View details called for:", event.name);
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const handleViewEvent = (event: Event) => {
    navigate(`/dashboard/event-organizers/${organizerId}/events/${event.id}`);
  };

  const handleToggleEvent = async (eventId: string, currentStatus: boolean) => {
    try {
      setIsTogglingStatus(eventId);
      
      // Call the update mutation to toggle status
      await updateEvent({
        variables: {
          eventId: eventId,
          eventUpdateInput: {
            isActive: !currentStatus
          }
        }
      });
      
      // Update local state
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId
            ? { ...event, isActive: !event.isActive }
            : event
        )
      );
      
      toast.success(`Event ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error toggling event status:", error);
      toast.error("Failed to update event status");
    } finally {
      setIsTogglingStatus(null);
    }
  };

  // Format date for display
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  return (
    <div className="p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate('/dashboard/event-organizers')}
          className="text-gray-600 hover:text-brand-primary transition-colors text-sm font-medium"
        >
          {t('eventOrganizerDetails.breadcrumbs.eventOrganizers')}
        </button>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-900">{organizer.name}</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{t('eventOrganizerDetails.pageTitle')}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          {t('eventOrganizerDetails.addNewEvent')}
        </button>
      </div>

      {/* Events Table */}
      {eventsLoading ? (
        <LoadingState rows={3} />
      ) : eventsError ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-500 font-medium">Failed to load events</p>
          <p className="text-gray-600 mt-2">There was an error loading the events. Please try again.</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">This organizer doesn't have any events yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-brand-primary text-black rounded-md hover:bg-brand-primary/90 transition-colors inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Event
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[22%]">
                  {t('eventOrganizerDetails.table.headers.eventName')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[11%]">
                  {t('eventOrganizerDetails.table.headers.startDate')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[11%]">
                  {t('eventOrganizerDetails.table.headers.endDate')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[13%]">
                  {t('eventOrganizerDetails.table.headers.eventTimings')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                  {t('eventOrganizerDetails.table.headers.location')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                  {t('eventOrganizerDetails.table.headers.status')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                  {t('eventOrganizerDetails.table.headers.actions')}
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
                      {formatDate(event.startDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-500">
                      {formatDate(event.endDate)}
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
                      onClick={() => handleToggleEvent(event.id, event.isActive)}
                      className={`p-2 rounded-full transition-colors ${
                        event.isActive 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={event.isActive ? t('eventOrganizerDetails.table.deactivateEvent') : t('eventOrganizerDetails.table.activateEvent')}
                      disabled={isTogglingStatus === event.id}
                    >
                      {isTogglingStatus === event.id ? (
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewEvent(event);
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-brand-primary text-white text-xs font-medium hover:bg-brand-primary/90 rounded transition-colors"
                      >
                        {t('eventOrganizerDetails.table.viewEvent')}
                      </button>
                      <div className="relative z-30">
                        <KebabMenu
                          menuItems={[
                            {
                              label: t('eventOrganizerDetails.table.editEvent'),
                              icon: Edit,
                              onClick: () => handleEditEvent(event)
                            },
                            {
                              label: t('eventOrganizerDetails.table.viewDetails'),
                              icon: Eye,
                              onClick: () => handleViewDetails(event)
                            }
                          ]}
                          onEdit={() => {}}
                          onDelete={() => {}}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organizerId={organizerId || ''}
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
          initialData={{
            name: selectedEvent.name,
            startDate: selectedEvent.startDate,
            startTime: selectedEvent.startTime,
            endDate: selectedEvent.endDate,
            endTime: selectedEvent.endTime,
            location: {
              lat: typeof selectedEvent.location.lat === 'string' ? parseFloat(selectedEvent.location.lat) : selectedEvent.location.lat,
              lng: typeof selectedEvent.location.lng === 'string' ? parseFloat(selectedEvent.location.lng) : selectedEvent.location.lng
            },
            address: selectedEvent.address,
            country: selectedEvent.country || 'GERMANY'
          }}
          isEditing={true}
          organizerId={organizerId || ''}
        />
      )}

      {/* View Event Details Modal */}
      {selectedEvent && isViewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-semibold">{t('eventOrganizerDetails.viewModal.title')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('eventOrganizerDetails.viewModal.subtitle')}</p>
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
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t('eventOrganizerDetails.viewModal.eventName')}</h3>
                <p className="text-lg font-medium">{selectedEvent.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t('eventOrganizerDetails.viewModal.eventSchedule')}</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{t('eventOrganizerDetails.viewModal.startDate')}</p>
                      <p className="font-medium">{selectedEvent.startDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('eventOrganizerDetails.viewModal.endDate')}</p>
                      <p className="font-medium">{selectedEvent.endDate}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">{t('eventOrganizerDetails.viewModal.dailyTimings')}</p>
                    <p className="font-medium">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t('eventOrganizerDetails.viewModal.location')}</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{selectedEvent.address}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t('eventOrganizerDetails.viewModal.status')}</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedEvent.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <p className="font-medium">{selectedEvent.isActive ? t('eventOrganizerDetails.viewModal.active') : t('eventOrganizerDetails.viewModal.inactive')}</p>
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
}