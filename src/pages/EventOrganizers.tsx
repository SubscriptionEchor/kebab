import { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, Eye, Pencil, Copy, Check, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EVENT_MANAGERS, CREATE_EVENT_MANAGER, UPDATE_EVENT_MANAGER } from '../lib/graphql/queries/eventOrganizers';
import { useNavigate } from 'react-router-dom';
import AddEventOrganizerModal from '../components/AddEventOrganizerModal';
import ViewOrganizerDetailsModal from '../components/ViewOrganizerDetailsModal';
import EditEventOrganizerModal from '../components/EditEventOrganizerModal';
import LoadingState from '../components/LoadingState';
import Pagination from '../components/Pagination';
import { toast } from 'sonner';

interface EventOrganizer {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  password: string;
  eventPortfolio: number;
  events: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  onSubmit: (data: { name: string; contactNumber: string; email: string; password: string }) => void;
}

interface KebabMenuProps {
  onEdit: () => void;
  onView: () => void;
}

const KebabMenu: React.FC<KebabMenuProps> = ({ onEdit, onView }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Pencil className="h-4 w-4" />
            {t('eventOrganizers.editOrganizer')}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Eye className="h-4 w-4" />
            {t('eventOrganizers.viewDetails')}
          </button>
        </div>
      )}
    </div>
  );
};

export default function EventOrganizers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState<EventOrganizer | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Fetch event managers data
  const { data, loading, error, refetch } = useQuery(GET_EVENT_MANAGERS, {
    variables: { input: { page: currentPage, limit: itemsPerPage, searchTerm: searchQuery || undefined } },
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Failed to fetch event managers:', error);
      toast.error('Failed to load event managers');
    }
  });

  const [editEventManager, { loading: isEditing }] = useMutation(UPDATE_EVENT_MANAGER, {
    refetchQueries: [{ query: GET_EVENT_MANAGERS, variables: { input: { page: currentPage, limit: itemsPerPage, searchTerm: searchQuery || undefined } } }],
    onCompleted: () => {
      toast.success('Event organizer updated successfully');
      setIsEditModalOpen(false);
      setSelectedOrganizer(null);
    },
    onError: (error) => {
      console.error('Failed to update event organizer:', error);
      toast.error(error.message || 'Failed to update event organizer');
    }
  });

  // Transform API data to match our component's expected format
  const organizers = data?.getEventManagers?.eventManagerList?.map(manager => ({
    id: manager._id,
    displayId: manager.vendorDisplayNumber.toString(),
    name: manager.name || 'N/A',
    contactNumber: 'N/A',
    email: manager.email,
    password: '********',
    eventPortfolio: manager.events?.length || 0,
  })) || [];

  // Total pages from API pagination
  const totalPages = data?.getEventManagers?.pagination?.pages || 1;

  const [createEventManager, { loading: isCreating }] = useMutation(CREATE_EVENT_MANAGER, {
    refetchQueries: [{ query: GET_EVENT_MANAGERS, variables: { input: { page: currentPage, limit: itemsPerPage, searchTerm: searchQuery || undefined } } }],
    onCompleted: () => {
      toast.success('Event organizer added successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error('Failed to create event organizer:', error);
      toast.error(error.message || 'Failed to create event organizer');
    }
  });

  const handleAddOrganizer = (data: { name: string; contactNumber: string; email: string; password: string }) => {
    createEventManager({
      variables: {
        eventManagerInput: {
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.contactNumber
        }
      }
    });
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleViewEvents = (organizerId: string) => {
    navigate(`/dashboard/event-organizers/${organizerId}`);
  };

  const handleViewDetails = (organizerId: string) => {
    const organizer = organizers.find(org => org.id === organizerId);
    if (organizer) {
      setSelectedOrganizer({
        ...organizer,
        onSubmit: () => {} // Placeholder to satisfy the type
      });
      setIsDetailsModalOpen(true);
    }
  };

  const handleEditOrganizer = (organizerId: string) => {
    const organizer = organizers.find(org => org.id === organizerId);
    if (organizer) {
      setSelectedOrganizer({
        ...organizer,
        onSubmit: () => {} // Placeholder to satisfy the type
      });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateOrganizer = (updatedData: { name: string; contactNumber: string; email: string; password: string }) => {
    if (selectedOrganizer) {
      editEventManager({
        variables: {
          eventManagerId: selectedOrganizer.id,
          eventManagerInput: {
            name: updatedData.name,
            phone: updatedData.contactNumber,
            email: updatedData.email,
            password: updatedData.password
          }
        }
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{t('eventOrganizers.title')}</h1>
        <div className="flex items-center gap-4">
          {organizers.length > 0 && (
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t('eventOrganizers.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t('eventOrganizers.addOrganizer')}
          </button>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-red-500 font-medium">Failed to load event organizers</div>
            <p className="text-gray-600 text-sm max-w-md text-center">
              There was an error loading the event organizers. Please try again or contact support if the problem persists.
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
            >
              Retry
            </button>
          </div>
        </div>
      ) : loading ? (
        <LoadingState rows={5} />
      ) : organizers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchQuery.trim()
              ? `No event organizers found matching "${searchQuery}"`
              : "No event organizers found"}
          </p>
          {searchQuery.trim() && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-brand-primary hover:text-brand-primary/80 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                  {t('eventOrganizers.id')}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[250px]">
                  {t('eventOrganizers.name')}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                  Event Portfolio
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                  {t('eventOrganizers.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizers.map((organizer) => (
                <tr 
                  key={organizer.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleViewDetails(organizer.id);
                  }}
                >
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      {organizer.displayId}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyId(organizer.displayId);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title={copied === organizer.displayId ? "Copied!" : "Copy ID"}
                      >
                        {copied === organizer.displayId ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {organizer.name}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full text-xs">
                        {organizer.eventPortfolio || 0} Events
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewEvents(organizer.id);
                        }}
                        className="px-3 py-1.5 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors text-sm font-medium"
                      >
                        {t('eventOrganizers.viewEvents')}
                      </button>
                      <KebabMenu
                        onEdit={() => handleEditOrganizer(organizer.id)}
                        onView={() => handleViewDetails(organizer.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {organizers.length > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <AddEventOrganizerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddOrganizer}
      />

      <ViewOrganizerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrganizer(null);
        }}
        organizer={selectedOrganizer}
      />

      <EditEventOrganizerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOrganizer(null);
        }}
        organizer={selectedOrganizer}
        onSubmit={handleUpdateOrganizer}
      />
    </div>
  );
}