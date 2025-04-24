import { useState, useEffect, useMemo } from 'react';
import { X, Search, Edit, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

interface ExistingStallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (stall: Stall) => void;
  onEdit: (stall: Stall) => void;
}

export default function ExistingStallModal({
  isOpen,
  onClose,
  onAdd,
  onEdit
}: ExistingStallModalProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const dayAbbreviations: { [key: string]: string } = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  };

  // Mock data - replace with actual API call
  const [allStalls] = useState<Stall[]>([
    {
      id: '1',
      name: 'Taco Stand',
      cuisine: 'Mexican',
      profilePhoto: '/images/default-stall.png',
      timings: {
        monday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        tuesday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        wednesday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        thursday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        friday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        saturday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        sunday: { startTime: '10:00', endTime: '18:00', isOpen: true }
      }
    },
    // Add more mock stalls as needed
  ]);

  const filteredStalls = useMemo(() => {
    const searchTerms = debouncedSearchQuery.toLowerCase().trim().split(/\s+/);
    
    return allStalls.filter(stall => {
      if (searchTerms.length === 0 || searchTerms[0] === '') return true;

      const stallData = {
        name: stall.name.toLowerCase(),
        cuisine: stall.cuisine.toLowerCase(),
        // Create a string of all timing information
        timings: Object.entries(stall.timings)
          .filter(([_, timing]) => timing.isOpen)
          .map(([day, timing]) => `${day} ${timing.startTime} ${timing.endTime}`)
          .join(' ').toLowerCase()
      };

      // Check if all search terms match any of the stall data
      return searchTerms.every(term =>
        stallData.name.includes(term) ||
        stallData.cuisine.includes(term) ||
        stallData.timings.includes(term)
      );
    });
  }, [debouncedSearchQuery, allStalls]);

  const handleStallSelect = (stall: Stall) => {
    // If the clicked stall is already selected, unselect it
    if (selectedStall?.id === stall.id) {
      setSelectedStall(null);
    } else {
      setSelectedStall(stall);
    }
  };

  const handleAdd = () => {
    if (selectedStall) {
      onAdd(selectedStall);
      setSelectedStall(null);
      setSearchQuery('');
      onClose();
    }
  };

  const handleEdit = () => {
    if (selectedStall) {
      onEdit(selectedStall);
      setSelectedStall(null);
      setSearchQuery('');
      onClose();
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="min-h-screen w-full py-8 px-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full relative flex flex-col max-h-[90vh]">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Select Existing Stall</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* Search Input - Sticky */}
              <div className="sticky top-0 bg-white pb-4 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search stalls by name or cuisine"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              {/* Stalls List */}
              <div className="mb-6">
                {filteredStalls.length > 0 ? (
                  <div className="space-y-2">
                    {filteredStalls.map((stall) => (
                      <div
                        key={stall.id}
                        onClick={() => handleStallSelect(stall)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedStall?.id === stall.id
                            ? 'border-brand-primary bg-brand-primary/5'
                            : 'border-gray-200 hover:border-brand-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img
                              src={stall.profilePhoto}
                              alt={stall.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">{stall.name}</h3>
                              <p className="text-sm text-gray-500">{stall.cuisine}</p>
                            </div>
                          </div>
                          {selectedStall?.id === stall.id && (
                            <div className="flex items-center text-brand-primary text-sm">
                              <span className="mr-2">Selected</span>
                              <div className="h-2 w-2 rounded-full bg-brand-primary"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No stalls found matching your search.
                  </div>
                )}
              </div>

              {/* Selected Stall Details */}
              {selectedStall && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-6 text-lg">Stall Information</h3>
                  <div className="space-y-8">
                    {/* Profile and Basic Info Section */}
                    <div className="flex items-start gap-8 bg-white p-6 rounded-lg border border-gray-200">
                      {/* Left Column - Profile Photo */}
                      <div className="flex-shrink-0">
                        <div className="space-y-2">
                          <img
                            src={selectedStall.profilePhoto}
                            alt={selectedStall.name}
                            className="h-32 w-32 rounded-lg object-cover border-2 border-gray-100 shadow-sm"
                          />
                          <p className="text-xs text-gray-500 text-center mt-2">Profile Photo</p>
                        </div>
                      </div>
                      
                      {/* Right Column - Basic Info */}
                      <div className="flex-grow space-y-6">
                        {/* Basic Details Group */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-2">Basic Details</h4>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">Stall Name</p>
                              <p className="text-base font-medium text-gray-900">{selectedStall.name}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">Cuisine Type</p>
                              <p className="text-base font-medium text-gray-900">{selectedStall.cuisine}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">Stall ID</p>
                              <p className="text-base font-medium text-gray-900">{selectedStall.id}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operating Hours Section */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-2 mb-4">Operating Hours</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {formatTimings(selectedStall.timings).map((timing, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-4 p-3 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-[180px]">
                              <span className="text-sm font-medium text-gray-900">
                                {timing.days.join(', ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {timing.time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0 bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            {selectedStall && (
              <>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit & Add
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add to Event
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 