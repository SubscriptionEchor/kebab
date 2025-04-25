import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home, Plus, Search, ChevronDown, Pencil, Trash2, Calendar, Filter, Copy, Check, Power } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import AddStallModal from '../components/AddStallModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ExistingStallModal from '../components/ExistingStallModal';
import KebabMenu from '../components/KebabMenu';

interface Stall {
  id: string;
  name: string;
  cuisine: string;
  profilePhoto: string;
  isActive: boolean;
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
      id: 'STL123456',
      name: 'Taco Stand',
      cuisine: 'Mexican',
      profilePhoto: 'https://example.com/taco-stand.jpg',
      isActive: true,
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
      id: 'STL789012',
      name: 'Pizza Corner',
      cuisine: 'Italian',
      profilePhoto: 'https://example.com/pizza-corner.jpg',
      isActive: true,
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
  const [selectedStallForEdit, setSelectedStallForEdit] = useState<Stall | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedStallFilter, setSelectedStallFilter] = useState<string>('all');

  // Mock data for sales and orders
  const [overviewData, setOverviewData] = useState({
    totalSales: 12500,
    totalOrders: 450
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Stall;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});

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

  // Function to generate a 6-digit stall ID with STL prefix
  const generateStallId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // generates 6-digit number
    return `STL${randomNum}`;
  };

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
    if (selectedStallForEdit) {
      // Update existing stall
      setStalls(prevStalls => prevStalls.map(stall => 
        stall.id === selectedStallForEdit.id 
          ? { ...stall, name: data.name, cuisine: data.cuisine, timings: data.timings }
          : stall
      ));
      setSelectedStallForEdit(null);
    } else {
      // Add new stall with generated ID
      const newStall: Stall = {
        id: generateStallId(),
        name: data.name,
        cuisine: data.cuisine,
        profilePhoto: 'https://example.com/placeholder.jpg',
        isActive: true,
        timings: data.timings
      };
      setStalls([...stalls, newStall]);
    }
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

  const handleSort = (key: keyof Stall) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedStalls = useMemo(() => {
    if (!sortConfig) return filteredStalls;

    return [...filteredStalls].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredStalls, sortConfig]);

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

  const handleEditClick = (stall: Stall) => {
    setSelectedStallForEdit(stall);
    setFormData({
      name: stall.name,
      cuisine: stall.cuisine,
      profilePhoto: null,
      timings: stall.timings
    });
    setIsModalOpen(true);
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStallFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStallFilter(e.target.value);
  };

  const getImageUrl = (stall: Stall) => {
    if (!imageCache[stall.id]) {
      const img = new Image();
      img.src = stall.profilePhoto;
      img.onload = () => {
        setImageCache(prev => ({
          ...prev,
          [stall.id]: stall.profilePhoto
        }));
      };
      img.onerror = () => {
        setImageCache(prev => ({
          ...prev,
          [stall.id]: '/images/default-stall.png'
        }));
      };
      return '/images/default-stall.png';
    }
    return imageCache[stall.id];
  };

  const handleCopyStallId = (stallId: string) => {
    navigator.clipboard.writeText(stallId);
    // You might want to show a toast notification here
  };

  const handleToggleStall = (stallId: string) => {
    setStalls(prevStalls => 
      prevStalls.map(stall => 
        stall.id === stallId 
          ? { ...stall, isActive: !stall.isActive }
          : stall
      )
    );
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
      </div>

      {/* Overview Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Overview</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateRangeChange}
                className="text-sm border-none focus:outline-none"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateRangeChange}
                className="text-sm border-none focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedStallFilter}
                onChange={handleStallFilterChange}
                className="text-sm border-none focus:outline-none"
              >
                <option value="all">All Stalls</option>
                {stalls.map(stall => (
                  <option key={stall.id} value={stall.id}>{stall.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Sales Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <h3 className="text-2xl font-semibold mt-1">${overviewData.totalSales.toLocaleString()}</h3>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-semibold mt-1">{overviewData.totalOrders.toLocaleString()}</h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stalls Table */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Stalls</h2>
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stall ID
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Stall Name
                    {sortConfig?.key === 'name' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('cuisine')}
                >
                  <div className="flex items-center gap-2">
                    Cuisine
                    {sortConfig?.key === 'cuisine' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile Photo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operating Hours
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStalls.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="h-12 w-12 mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No stalls found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedStalls.map((stall) => (
                  <tr key={stall.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-600 tracking-wider">{stall.id}</span>
                        <button
                          onClick={() => handleCopyStallId(stall.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy Stall ID"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {stall.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {stall.cuisine}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative h-10 w-10">
                        <img
                          src={getImageUrl(stall)}
                          alt={stall.name}
                          className="h-full w-full rounded-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 rounded-full bg-gray-100 animate-pulse" style={{ display: imageCache[stall.id] ? 'none' : 'block' }} />
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStall(stall.id)}
                        className={`p-2 rounded-full transition-colors ${
                          stall.isActive 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={stall.isActive ? 'Deactivate Stall' : 'Activate Stall'}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewStall(stall.id)}
                          className="px-3 py-1.5 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors"
                        >
                          View
                        </button>
                        <KebabMenu
                          onEdit={() => handleEditClick(stall)}
                          onDelete={() => handleDeleteClick(stall.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddStallModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStallForEdit(null);
        }}
        onSubmit={handleAddStall}
        initialData={selectedStallForEdit ? {
          name: selectedStallForEdit.name,
          cuisine: selectedStallForEdit.cuisine,
          timings: selectedStallForEdit.timings
        } : undefined}
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