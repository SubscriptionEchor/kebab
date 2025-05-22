import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home, Plus, Search, ChevronDown, Pencil, Trash2, Calendar, Filter, Copy, Check, Power, Store, MoreVertical, Eye, X, Star } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import AddStallModal from '../components/AddStallModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ExistingStallModal from '../components/ExistingStallModal';
import KebabMenu from '../components/KebabMenu';
import { useQuery, useMutation } from '@apollo/client';
import { GET_STALLS_BY_EVENT_ID, UPDATE_EVENT } from '../lib/graphql/queries/eventOrganizers';
import { DELETE_STALL, UPDATE_STALL_STATUS, LINK_STALL_TO_EVENT } from '../lib/graphql/mutations/stalls';
import LoadingState from '../components/LoadingState';
import { toast } from 'sonner';

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

interface ApiStall {
  _id: string;
  restaurantDisplayNumber?: string;
  name: string;
  image: string;
  cuisines: string[];
  isActive: boolean;
  isAvailable: boolean;
  openingTimes: {
    day: string;
    times: {
      startTime: string[];
      endTime: string[];
    }[];
    isOpen: boolean;
  }[];
  reviewAverage: number;
  reviewCount: number;
  phone: string;
}

interface FormData {
  name: string;
  cuisine: string;
  username: string;
  password: string;
  country: string;
  profilePhoto: File | null;
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
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);
  const [isExistingStallModalOpen, setIsExistingStallModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    cuisine: '',
    username: '',
    password: '',
    country: 'GERMANY',
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
  const [overviewData] = useState({
    totalSales: 12500,
    totalOrders: 450
  });
  
  // State for stall details modal
  const [showStallDetails, setShowStallDetails] = useState(false);
  const [stallDetails, setStallDetails] = useState<any>(null);
  const [isLoadingStallDetails, setIsLoadingStallDetails] = useState(false);

  // Delete stall mutation
  const [deleteStall] = useMutation(DELETE_STALL, {
    refetchQueries: [{ query: GET_STALLS_BY_EVENT_ID, variables: { eventId } }],
    onCompleted: () => {
      toast.success("Stall deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting stall:", error);
      toast.error("Failed to delete stall");
    }
  });

  // Update stall status mutation
  const [updateStallStatus] = useMutation(UPDATE_STALL_STATUS, {
    refetchQueries: [{ query: GET_STALLS_BY_EVENT_ID, variables: { eventId } }],
    onCompleted: () => {
      toast.success("Stall status updated successfully");
    },
    onError: (error) => {
      console.error("Error updating stall status:", error);
      toast.error("Failed to update stall status");
    }
  });

  // Link stall to event mutation
  const [linkStallToEvent] = useMutation(LINK_STALL_TO_EVENT, {
    refetchQueries: [{ query: GET_STALLS_BY_EVENT_ID, variables: { eventId } }],
    onError: (error) => {
      console.error('Error linking stall to event:', error);
      toast.error('Failed to add stall to event');
    }
  });

  // Fetch stalls data from API
  const { data: stallsData, loading: stallsLoading, error: stallsError } = useQuery(GET_STALLS_BY_EVENT_ID, {
    variables: { eventId },
    skip: !eventId,
    onCompleted: (data) => {
      if (data?.getStallsByEventId) {
        const formattedStalls = data.getStallsByEventId.map((stall: ApiStall) => {
          // Convert API stall format to our local format
          const timings: { [key: string]: { startTime: string; endTime: string; isOpen: boolean } } = {};
          
          // Process opening times
          stall.openingTimes?.forEach(time => {
            const day = time.day.toLowerCase();
            const dayKey = day === 'mon' ? 'monday' : 
                          day === 'tue' ? 'tuesday' : 
                          day === 'wed' ? 'wednesday' : 
                          day === 'thu' ? 'thursday' : 
                          day === 'fri' ? 'friday' : 
                          day === 'sat' ? 'saturday' : 'sunday';
            
            if (time.times && time.times.length > 0) {
              const startTimeArr = time.times[0].startTime;
              const endTimeArr = time.times[0].endTime;
              
              timings[dayKey] = {
                startTime: startTimeArr.length >= 2 ? `${startTimeArr[0]}:${startTimeArr[1]}` : '09:00',
                endTime: endTimeArr.length >= 2 ? `${endTimeArr[0]}:${endTimeArr[1]}` : '17:00',
                isOpen: time.isOpen
              };
            } else {
              timings[dayKey] = { startTime: '09:00', endTime: '17:00', isOpen: false };
            }
          });
          
          // Fill in any missing days
          ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
            if (!timings[day]) {
              timings[day] = { startTime: '09:00', endTime: '17:00', isOpen: false };
            }
          });
          
          return {
            id: stall.restaurantDisplayNumber || stall._id, // Use restaurantDisplayNumber as stall ID
            name: stall.name,
            cuisine: stall.cuisines?.length > 0 ? stall.cuisines[0] : 'Various',
            profilePhoto: stall.image || '/images/default-stall.png',
            isActive: stall.isActive && stall.isAvailable,
            timings
          };
        });
        
        setStalls(formattedStalls);
      }
    }
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Stall;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});

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

  const handleAddStall = async (data: FormData) => {
    if (selectedStallForEdit) {
      try {
        // Update existing stall
        setStalls(prevStalls => prevStalls.map(stall => 
          stall.id === selectedStallForEdit.id 
            ? { ...stall, name: data.name, cuisine: data.cuisine, timings: data.timings }
            : stall
        ));
        setSelectedStallForEdit(null);
      } catch (error) {
        console.error("Error updating stall:", error);
        toast.error("Failed to update stall");
      }
    } else {
      try {
        // The actual API call is handled in the AddStallModal component
        // Here we just update the local state with the new stall
        const newStall: Stall = {
          id: generateStallId(), // This will be replaced by the actual ID from the API
          name: data.name,
          cuisine: data.cuisine,
          profilePhoto: 'https://example.com/placeholder.jpg',
          isActive: true,
          timings: data.timings
        };
        setStalls([...stalls, newStall]);
      } catch (error) {
        console.error("Error adding stall:", error);
        toast.error("Failed to add stall");
      }
    }
  };

  const handleViewStall = (stallId: string) => {
    // Find the stall in our local state to get the MongoDB ID
    const stall = stalls.find(s => s.id === stallId);
    if (!stall) {
      toast.error("Stall not found");
      return;
    }
    
    // Get the actual MongoDB ID from the stalls data
    const stallData = stallsData?.getStallsByEventId?.find(
      (s: any) => s.restaurantDisplayNumber === stallId || s._id === stallId
    );
    
    if (!stallData) {
      toast.error("Stall data not found");
      return;
    }
    
    // Navigate to the stall dashboard using the MongoDB ID
    navigate(`/vendor/restaurants/${stallData._id}`, {
      state: { restaurantData: stallData }
    });
  };

  const handleDeleteClick = (stallId: string) => {
    setSelectedStallId(stallId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStallId) return;

    setIsDeleting(true);
    
    try {
      // Call the delete mutation
      await deleteStall({
        variables: {
          id: selectedStallId
        }
      });
      
      // Update local state
      setStalls(prevStalls => prevStalls.filter(stall => stall.id !== selectedStallId));
      setIsDeleteModalOpen(false);
      setSelectedStallId(null);
    } catch (error) {
      console.error("Error deleting stall:", error);
      toast.error("Failed to delete stall");
    } finally {
      setIsDeleting(false);
    }
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

  const handleExistingStallAdd = async (stall: any) => {
    try {
      // Call the linkStallToEvent mutation
      const { data } = await linkStallToEvent({
        variables: {
          eventId: eventId,
          restaurantId: stall.id
        }
      });

      if (data?.linkStallToEvent) {
        // Convert the response data to match our local stall format
        const linkedStall = data.linkStallToEvent;
        const formattedStall: Stall = {
          id: linkedStall.restaurantDisplayNumber || linkedStall._id,
          name: linkedStall.name,
          cuisine: linkedStall.cuisines?.[0] || 'Various',
          profilePhoto: linkedStall.image || '/images/default-stall.png',
          isActive: linkedStall.isActive && linkedStall.isAvailable,
          timings: linkedStall.openingTimes.reduce((acc: any, time: any) => {
            const day = time.day.toLowerCase();
            const dayKey = day === 'mon' ? 'monday' : 
                          day === 'tue' ? 'tuesday' : 
                          day === 'wed' ? 'wednesday' : 
                          day === 'thu' ? 'thursday' : 
                          day === 'fri' ? 'friday' : 
                          day === 'sat' ? 'saturday' : 'sunday';
            
            acc[dayKey] = {
              startTime: time.times?.[0]?.startTime?.join(':') || '09:00',
              endTime: time.times?.[0]?.endTime?.join(':') || '17:00',
              isOpen: time.isOpen
            };
            return acc;
          }, {})
        };

        // Update local state with the new stall
        setStalls(prevStalls => [...prevStalls, formattedStall]);
        toast.success('Stall added successfully');
        setIsExistingStallModalOpen(false);
      }
    } catch (error) {
      console.error('Error linking stall to event:', error);
      toast.error('Failed to add stall to event');
    }
  };

  const handleExistingStallEdit = (stall: Stall) => {
    // Open the AddStallModal with the selected stall data for editing
    setFormData({
      name: stall.name,
      cuisine: stall.cuisine,
      username: '',
      password: '',
      country: 'GERMANY',
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
      username: '',
      password: '',
      country: 'GERMANY',
      profilePhoto: null,
      timings: stall.timings
    });
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

  const handleViewStallDetails = async (stallId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsLoadingStallDetails(true);
    
    // Find the stall in our local state to get the MongoDB ID
    const stall = stalls.find(s => s.id === stallId);
    if (!stall) {
      toast.error("Stall not found");
      setIsLoadingStallDetails(false);
      return;
    }
    
    // Get the actual MongoDB ID from the stalls data
    const stallData = stallsData?.getStallsByEventId?.find(
      (s: any) => s.restaurantDisplayNumber === stallId || s._id === stallId
    );
    
    if (!stallData) {
      toast.error("Stall data not found");
      setIsLoadingStallDetails(false);
      return;
    }
    
    const mongoDbId = stallData._id;
    
    try {
      // Make API call to fetch stall details
      const response = await fetch('https://del-qa-api.kebapp-chefs.com/graphql', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'authorization': localStorage.getItem('kebab_admin_auth') ? 
            `Bearer ${JSON.parse(localStorage.getItem('kebab_admin_auth') || '{}').token}` : '',
          'content-type': 'application/json',
          'lang': 'en',
        },
        body: JSON.stringify({
          operationName: 'Restaurant',
          variables: { id: mongoDbId },
          query: `query Restaurant($id: String) {
            restaurant(id: $id) {
              username
              password
              _id
              name
              image
              phone
              logo
              address
              reviewCount
              reviewAverage
              shopType
              cuisines
              googleMapLink
              __typename
              orderPrefix
              onboardingApplicationId
              owner {
                email
                _id
                __typename
              }
              __typename
            }
          }`
        })
      });
      
      const result = await response.json();
      
      if (result.data?.restaurant) {
        setStallDetails(result.data.restaurant);
        setShowStallDetails(true);
      } else {
        throw new Error("Failed to fetch stall details");
      }
    } catch (error) {
      console.error("Error fetching stall details:", error);
      toast.error("Failed to fetch stall details");
    } finally {
      setIsLoadingStallDetails(false);
    }
  };

  const handleCopyStallId = (stallId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(stallId);
    toast.success("Stall ID copied to clipboard");
  };

  const handleToggleStall = async (stallId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isTogglingStatus === stallId) return;
    
    setIsTogglingStatus(stallId);
    
    try {
      // Call the update status mutation
      await updateStallStatus({
        variables: {
          id: stallId,
          isAvailable: !currentStatus
        }
      });
      
      // Update local state
      setStalls(prevStalls => 
        prevStalls.map(stall => 
          stall.id === stallId 
            ? { ...stall, isActive: !stall.isActive }
            : stall
        )
      );
    } catch (error) {
      console.error("Error toggling stall status:", error);
      toast.error("Failed to update stall status");
    } finally {
      setIsTogglingStatus(null);
    }
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
              {t('eventDetails.breadcrumbs.dashboard')}
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" />
            <Link
              to="/dashboard/event-organizers"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {t('eventDetails.breadcrumbs.eventOrganizers')}
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" />
            <Link
              to={`/dashboard/event-organizers/${organizerId}`}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {t('eventDetails.breadcrumbs.organizerDetails')}
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" />
            <span className="text-sm text-gray-700 font-medium">
              {t('eventDetails.pageTitle')}
            </span>
          </li>
        </ol>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{t('eventDetails.pageTitle')}</h1>
      </div>

      {/* Overview Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('eventDetails.overview.title')}</h2>
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
              <span className="text-gray-400">{t('eventDetails.overview.dateRangeSeparator')}</span>
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
                <option value="all">{t('eventDetails.overview.filter.allStalls')}</option>
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
                <p className="text-sm text-gray-500">{t('eventDetails.overview.totalSales')}</p>
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
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{t('eventDetails.overview.totalOrders')}</p>
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
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stalls Table */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('eventDetails.stalls.title')}</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t('eventDetails.stalls.searchPlaceholder')}
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
                {t('eventDetails.stalls.addNew')}
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={handleAddNewStall}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t('eventDetails.stalls.newStall')}
                  </button>
                  <button
                    onClick={handleAddExistingStall}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                    {t('eventDetails.stalls.existingStall')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {stallsLoading ? (
            <div className="p-6">
              <LoadingState rows={3} />
            </div>
          ) : stallsError ? (
            <div className="p-6 text-center">
              <p className="text-red-500 font-medium">Failed to load stalls</p>
              <p className="text-gray-600 mt-2">There was an error loading the stalls. Please try again.</p>
            </div>
          ) : stalls.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stalls found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                This event doesn't have any stalls yet. Add stalls to start managing them.
              </p>
              <button
                onClick={handleAddNewStall}
                className="px-4 py-2 bg-brand-primary text-black rounded-md hover:bg-brand-primary/90 transition-colors inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Stall
              </button>
            </div>
          ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('eventDetails.stalls.table.headers.stallId')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    {t('eventDetails.stalls.table.headers.stallName')}
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
                    {t('eventDetails.stalls.table.headers.cuisine')}
                    {sortConfig?.key === 'cuisine' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('eventDetails.stalls.table.headers.profilePhoto')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('eventDetails.stalls.table.headers.operatingHours')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('eventDetails.stalls.table.headers.status')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('eventDetails.stalls.table.headers.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStalls.length === 0 ? (
                <tr>
                  {/* <td colSpan={7} className="px-6 py-12 text-center"> */}
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="h-12 w-12 mb-4 text-gray-400" />
                      <p className="text-lg font-medium">{t('eventDetails.stalls.table.empty.noStalls')}</p>
                      <p className="text-sm mt-1">{t('eventDetails.stalls.table.empty.adjustSearch')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedStalls.map((stall) => (
                  <tr key={stall.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-600 tracking-wider">{stall.id || 'N/A'}</span>
                        <button
                          onClick={(e) => handleCopyStallId(stall.id, e)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title={t('eventDetails.stalls.table.copyStallId')}
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
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {formatTimings(stall.timings).map((timing, index) => (
                          <div key={index} className="mb-1 last:mb-0">
                            <span className="font-medium">{timing.days.join(', ')}</span>
                            <span className="mx-2">•</span>
                            <span>{timing.time}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => handleToggleStall(stall.id, stall.isActive, e)}
                        className={`p-2 rounded-full ${stall.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                        disabled={isTogglingStatus === stall.id}
                      >
                        {isTogglingStatus === stall.id ? (
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewStall(stall.id);
                          }}
                          className="px-3 py-1.5 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
                          disabled={isLoadingStallDetails}
                        >
                          {isLoadingStallDetails ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                          ) : (
                            <Eye className="h-4 w-4 mr-1" />
                          )}
                          {t('eventDetails.stalls.table.view')}
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
          )}
        </div>
      </div>

      {/* Add Stall Modal */}
      {isModalOpen && (
        <AddStallModal
          eventId={eventId || ''}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStallForEdit(null);
          }}
          onSubmit={handleAddStall}
          initialData={selectedStallForEdit ? formData : undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          isSubmitting={isDeleting}
          title={t('eventDetails.stalls.table.delete.title')}
          message={t('eventDetails.stalls.table.delete.message')}
        />
      )}

      {/* Existing Stall Modal */}
      {isExistingStallModalOpen && (
        <ExistingStallModal
          isOpen={isExistingStallModalOpen}
          onClose={() => setIsExistingStallModalOpen(false)}
          onAdd={handleExistingStallAdd}
          ownerId={organizerId}
        />
      )}
      
      {/* Stall Details Modal */}
      {showStallDetails && stallDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Stall Details</h2>
              <button
                onClick={() => setShowStallDetails(false)}
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Stall ID</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-sm font-mono text-gray-900">{stallDetails.restaurantDisplayNumber || stallDetails._id}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(stallDetails.restaurantDisplayNumber || stallDetails._id);
                          toast.success("ID copied to clipboard");
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{stallDetails.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Cuisine</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {stallDetails.cuisines?.map((cuisine: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-accent text-black">
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{stallDetails.phone || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{stallDetails.address || 'Not provided'}</p>
                  </div>
                </div>
                
                {/* Credentials & Ratings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Credentials & Ratings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Username</label>
                    <p className="mt-1 text-sm text-gray-900">{stallDetails.username || 'Not set'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Password</label>
                    <p className="mt-1 text-sm text-gray-900">{stallDetails.password}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Order Prefix</label>
                    <p className="mt-1 text-sm text-gray-900">{stallDetails.orderPrefix || 'Not set'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Ratings</label>
                    <div className="mt-1 flex items-center">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900">{stallDetails.reviewAverage?.toFixed(1) || '0.0'}</span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{stallDetails.reviewCount || 0} reviews</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Owner</label>
                    <p className="mt-1 text-sm text-gray-900">{stallDetails.owner?.email || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
              
              {/* Images */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Profile Image</label>
                    <div className="h-48 w-full bg-gray-100 rounded-lg overflow-hidden">
                      {stallDetails.image ? (
                        <img 
                          src={stallDetails.image} 
                          alt={`${stallDetails.name} profile`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default-stall.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Logo</label>
                    <div className="h-48 w-full bg-gray-100 rounded-lg overflow-hidden">
                      {stallDetails.logo ? (
                        <img 
                          src={stallDetails.logo} 
                          alt={`${stallDetails.name} logo`} 
                          className="w-full h-full object-contain p-4"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default-logo.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-6 border-t border-gray-200">
              <button
                onClick={() => setShowStallDetails(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowStallDetails(false);
                  handleViewStall(stallDetails._id);
                }}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
              >
                Manage Stall
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}