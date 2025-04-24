import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home, Plus, Search, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import AddStallModal from '../components/AddStallModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ExistingStallModal from '../components/ExistingStallModal';

interface Stall {
  id: string;
  name: string;
  cuisine: string;
  profilePhoto: string;
  timings: {
    [key: string]: {
      startTime: string;
      endTime: string;
      isOpen: boolean;
    };
  };
}

export default function EventDetails() {
  const { t } = useTranslation();
  const { organizerId, eventId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stalls, setStalls] = useState<Stall[]>([
    {
      id: '1',
      name: 'Taco Stand',
      cuisine: 'Mexican',
      profilePhoto: 'https://example.com/taco-stand.jpg',
      timings: {
        monday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        tuesday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        wednesday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        thursday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        friday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        saturday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        sunday: { startTime: '10:00', endTime: '18:00', isOpen: true },
      }
    },
    {
      id: '2',
      name: 'Pizza Corner',
      cuisine: 'Italian',
      profilePhoto: 'https://example.com/pizza-corner.jpg',
      timings: {
        monday: { startTime: '11:00', endTime: '19:00', isOpen: true },
        tuesday: { startTime: '11:00', endTime: '19:00', isOpen: true },
        wednesday: { startTime: '11:00', endTime: '19:00', isOpen: true },
        thursday: { startTime: '11:00', endTime: '19:00', isOpen: true },
        friday: { startTime: '11:00', endTime: '19:00', isOpen: true },
        saturday: { startTime: '11:00', endTime: '19:00', isOpen: true },
        sunday: { startTime: '11:00', endTime: '19:00', isOpen: true },
      }
    }
  ]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isExistingStallModalOpen, setIsExistingStallModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    cuisine: string;
    profilePhoto: File | null;
    timings: {
      [key: string]: {
        startTime: string;
        endTime: string;
        isOpen: boolean;
      };
    };
  }>({
    name: '',
    cuisine: '',
    profilePhoto: null,
    timings: {
      monday: { startTime: '', endTime: '', isOpen: true },
      tuesday: { startTime: '', endTime: '', isOpen: true },
      wednesday: { startTime: '', endTime: '', isOpen: true },
      thursday: { startTime: '', endTime: '', isOpen: true },
      friday: { startTime: '', endTime: '', isOpen: true },
      saturday: { startTime: '', endTime: '', isOpen: true },
      sunday: { startTime: '', endTime: '', isOpen: true },
    }
  });

  console.log('EventDetails - Mounted with params:', { organizerId, eventId });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddStall = (data: {
    name: string;
    cuisine: string;
    profilePhoto: File | null;
    timings: {
      [key: string]: {
        startTime: string;
        endTime: string;
        isOpen: boolean;
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

  const handleDeleteClick = (stallId: string) => {
    setSelectedStallId(stallId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedStallId) return;

    setIsDeleting(true);
    // Filter out the deleted stall
    setStalls(prevStalls => prevStalls.filter(stall => stall.id !== selectedStallId));
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setSelectedStallId(null);
  };

  const dayAbbreviations: { [key: string]: string } = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  };

  const formatTimings = (timings: { [key: string]: { startTime: string; endTime: string; isOpen: boolean } }) => {
    // Group days with the same timings
    const timingGroups: { [key: string]: string[] } = {};
    
    Object.entries(timings).forEach(([day, timing]) => {
      if (!timing.isOpen) return; // Skip closed days
      
      const timeKey = `${timing.startTime}-${timing.endTime}`;
      if (!timingGroups[timeKey]) {
        timingGroups[timeKey] = [];
      }
      timingGroups[timeKey].push(day);
    });

    // Format each group
    return Object.entries(timingGroups).map(([time, days]) => {
      const [start, end] = time.split('-');
      const formattedDays = formatDayRange(days);
      return {
        days: formattedDays,
        time: `${start} - ${end}`,
      };
    });
  };

  const formatDayRange = (days: string[]) => {
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const sortedDays = days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    
    // Find consecutive ranges
    const ranges: string[] = [];
    let rangeStart = sortedDays[0];
    let prev = sortedDays[0];
    
    for (let i = 1; i <= sortedDays.length; i++) {
      const current = sortedDays[i];
      const prevIndex = dayOrder.indexOf(prev);
      const currentIndex = dayOrder.indexOf(current);
      
      if (i === sortedDays.length || currentIndex !== prevIndex + 1) {
        // End of range
        if (prev === rangeStart) {
          ranges.push(dayAbbreviations[rangeStart]);
        } else {
          ranges.push(`${dayAbbreviations[rangeStart]} - ${dayAbbreviations[prev]}`);
        }
        rangeStart = current;
      }
      prev = current;
    }
    
    return ranges;
  };

  const filteredStalls = stalls.filter(stall => 
    stall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stall.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNewStall = () => {
    setIsModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleAddExistingStall = () => {
    setIsExistingStallModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleExistingStallAdd = (stall: Stall) => {
    // Add the selected stall to the current event's stalls
    setStalls(prevStalls => [...prevStalls, stall]);
  };

  const handleExistingStallEdit = (stall: Stall) => {
    // Open the AddStallModal with the selected stall data for editing
    setFormData({
      name: stall.name,
      cuisine: stall.cuisine,
      profilePhoto: null,
      timings: stall.timings
    });
    setIsModalOpen(true);
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
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search stalls by name or cuisine"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add New Stall
              <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleAddNewStall}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Stall
                </button>
                <button
                  onClick={handleAddExistingStall}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ChevronRight className="h-4 w-4" />
                  Existing Stall
                </button>
              </div>
            )}
          </div>
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
                Operating Hours
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStalls.map((stall) => (
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
                <td className="px-6 py-4">
                  <div className="space-y-1.5">
                    {formatTimings(stall.timings).map((timing, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="font-medium text-gray-900 min-w-[130px]">
                          {timing.days.join(', ')}:
                        </div>
                        <div className="text-gray-600">
                          {timing.time}
                        </div>
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
                    onClick={() => handleDeleteClick(stall.id)}
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

      <ExistingStallModal
        isOpen={isExistingStallModalOpen}
        onClose={() => setIsExistingStallModalOpen(false)}
        onAdd={handleExistingStallAdd}
        onEdit={handleExistingStallEdit}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStallId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Stall"
        message="Are you sure you want to delete this stall? This action cannot be undone."
        isSubmitting={isDeleting}
      />
    </div>
  );
} 