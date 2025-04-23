import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EventOrganizer {
  id: string;
  name: string;
  eventPortfolio: number; // Number of events under management
  events: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

export default function EventOrganizers() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAddOrganizer = () => {
    // Handle add organizer logic here
    console.log('Add new organizer');
  };

  // Mock data - replace with actual API call
  const mockOrganizers: EventOrganizer[] = [
    {
      id: 'ORG-001',
      name: 'Event Masters Pro',
      eventPortfolio: 15,
      events: [
        { id: '1', name: 'Summer Festival', type: 'F' },
        { id: '2', name: 'Wedding Expo', type: 'W' },
      ]
    },
    {
      id: 'ORG-002',
      name: 'Celebration Experts',
      eventPortfolio: 8,
      events: [
        { id: '3', name: 'Food Festival', type: 'F' },
      ]
    },
    {
      id: 'ORG-003',
      name: 'Prime Events',
      eventPortfolio: 12,
      events: [
        { id: '4', name: 'Tech Conference', type: 'C' },
        { id: '5', name: 'Music Festival', type: 'F' },
      ]
    },
    // Add more mock data as needed
  ];

  const filteredOrganizers = mockOrganizers.filter(organizer => 
    organizer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    organizer.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrganizers.length / itemsPerPage);
  const paginatedOrganizers = filteredOrganizers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            onClick={handleAddOrganizer}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Add Event Organizer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                {t('eventOrganizers.id')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('eventOrganizers.name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                Event Portfolio
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                {t('eventOrganizers.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedOrganizers.map((organizer) => (
              <tr key={organizer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {organizer.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {organizer.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm">
                      {organizer.eventPortfolio} Events
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => {/* Handle view events */}}
                    className="text-brand-primary hover:text-brand-primary/80 font-medium"
                  >
                    View events
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrganizers.length)} of {filteredOrganizers.length} organizers
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
            Page {currentPage} of {totalPages}
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
    </div>
  );
} 