import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, Eye, Pencil, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddEventOrganizerModal from '../components/AddEventOrganizerModal';
import ViewOrganizerDetailsModal from '../components/ViewOrganizerDetailsModal';
import EditEventOrganizerModal from '../components/EditEventOrganizerModal';

interface EventOrganizer {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  username: string;
  password: string;
  eventPortfolio: number;
  events: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

export default function EventOrganizers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState<EventOrganizer | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Mock data - replace with actual API call
  const [organizers, setOrganizers] = useState<EventOrganizer[]>([
    {
      id: 'ORG-001',
      name: 'Event Masters Pro',
      contactNumber: '+1234567890',
      email: 'contact@eventmasters.com',
      username: 'eventmasters',
      password: '********',
      eventPortfolio: 15,
      events: [
        { id: '1', name: 'Summer Festival', type: 'F' },
        { id: '2', name: 'Wedding Expo', type: 'W' },
      ]
    },
    {
      id: 'ORG-002',
      name: 'Celebration Experts',
      contactNumber: '+1987654321',
      email: 'info@celebrationexperts.com',
      username: 'celebration',
      password: '********',
      eventPortfolio: 8,
      events: [
        { id: '3', name: 'Food Festival', type: 'F' },
      ]
    },
    {
      id: 'ORG-003',
      name: 'Prime Events',
      contactNumber: '+1122334455',
      email: 'contact@primeevents.com',
      username: 'primeevents',
      password: '********',
      eventPortfolio: 12,
      events: [
        { id: '4', name: 'Tech Conference', type: 'C' },
        { id: '5', name: 'Music Festival', type: 'F' },
      ]
    },
  ]);

  const handleAddOrganizer = (data: { name: string; contactNumber: string; email: string; username: string; password: string }) => {
    const newOrganizer: EventOrganizer = {
      id: `ORG-${String(organizers.length + 1).padStart(3, '0')}`,
      name: data.name,
      contactNumber: data.contactNumber,
      email: data.email,
      username: data.username,
      password: data.password,
      eventPortfolio: 0,
      events: [],
    };
    setOrganizers([...organizers, newOrganizer]);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrganizers = organizers.filter(organizer => 
    organizer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    organizer.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrganizers.length / itemsPerPage);
  const paginatedOrganizers = filteredOrganizers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewEvents = (organizerId: string) => {
    navigate(`/dashboard/event-organizers/${organizerId}`);
  };

  const handleViewDetails = (organizerId: string) => {
    const organizer = organizers.find(org => org.id === organizerId);
    if (organizer) {
      setSelectedOrganizer(organizer);
      setIsDetailsModalOpen(true);
    }
  };

  const handleEditOrganizer = (organizerId: string) => {
    const organizer = organizers.find(org => org.id === organizerId);
    if (organizer) {
      setSelectedOrganizer(organizer);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateOrganizer = (updatedData: { name: string; contactNumber: string; email: string; username: string; password: string }) => {
    if (selectedOrganizer) {
      const updatedOrganizers = organizers.map(org => 
        org.id === selectedOrganizer.id 
          ? { ...org, ...updatedData }
          : org
      );
      setOrganizers(updatedOrganizers);
      setIsEditModalOpen(false);
      setSelectedOrganizer(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{t('eventOrganizers.title')}</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('eventOrganizers.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            {t('eventOrganizers.addOrganizer')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
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
            {paginatedOrganizers.map((organizer) => (
              <tr 
                key={organizer.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewDetails(organizer.id)}
              >
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {organizer.id}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyId(organizer.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title={copiedId === organizer.id ? "Copied!" : "Copy ID"}
                    >
                      {copiedId === organizer.id ? (
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
                      {organizer.eventPortfolio} Events
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditOrganizer(organizer.id);
                      }}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      title={t('eventOrganizers.editOrganizer')}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(organizer.id);
                      }}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      title={t('eventOrganizers.viewDetails')}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
        <div>
          {t('eventOrganizers.pagination.showing', {
            start: (currentPage - 1) * itemsPerPage + 1,
            end: Math.min(currentPage * itemsPerPage, filteredOrganizers.length),
            total: filteredOrganizers.length
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span>
            {t('eventOrganizers.pagination.page', {
              current: currentPage,
              total: totalPages
            })}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

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