import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Icon, LeafletMouseEvent } from 'leaflet';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers';
import { ThemeProvider, createTheme, MenuItem } from '@mui/material';
import { TextField, Select, FormControl, InputLabel } from '@mui/material';
import dayjs from 'dayjs';
import { getEnvVar } from '../utils/env';
import MapsComponent from './Maps';
import { toast } from 'sonner';
import { useMutation } from '@apollo/client';
import { CREATE_EVENT } from '../lib/graphql/queries/eventOrganizers';
import 'leaflet/dist/leaflet.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#10B981', // brand-primary color
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          backgroundColor: '#fff',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#10B981',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#10B981',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#6B7280',
            '&.Mui-focused': {
              color: '#10B981',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: '0.5rem',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem',
          margin: '0.125rem 0',
          '&:hover': {
            backgroundColor: '#F3F4F6',
          },
          '&.Mui-selected': {
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#059669',
            },
          },
        },
      },
    },
  },
});

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
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
  }) => void;
  initialData?: {
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
  };
  isEditing?: boolean;
  organizerId: string; // Added organizerId prop
} 

// Default position (Berlin coordinates)
const defaultPosition: [number, number] = [52.5200, 13.4050];

function DateRangeCalendar({ startDate, endDate }: { startDate: string; endDate: string }) {
  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);
  const today = new Date();
  
  // Get the first day of the month for the calendar
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  // Create calendar grid
  const days = [];
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  
  // Add empty cells for days before the first of the month
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-8" />);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const isInRange = date >= startDateTime && date <= endDateTime;
    const isStart = date.toDateString() === startDateTime.toDateString();
    const isEnd = date.toDateString() === endDateTime.toDateString();
    
    days.push(
      <div
        key={day}
        className={`h-8 flex items-center justify-center text-sm ${
          isInRange
            ? 'bg-brand-primary/10 text-brand-primary font-medium'
            : 'text-gray-700'
        } ${isStart ? 'rounded-l-lg' : ''} ${isEnd ? 'rounded-r-lg' : ''}`}
      >
        {day}
      </div>
    );
  }
  
  return (
    <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
      <div className="text-center mb-4">
        <h3 className="font-medium">
          {firstDay.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
}

function formatTo24Hour(timeString: string): string {
  if (!timeString) return '';
  return timeString; // No need to convert since we're using type="time" with 24-hour format
}

function TimeDisplay({ startTime, endTime }: { startTime: string; endTime: string }) {
  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-100">
      <div className="flex items-center justify-center gap-12">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500 mb-3">Start Time</div>
          <div className="text-3xl font-semibold text-brand-primary flex items-center gap-3">
            <Clock className="h-6 w-6" />
            {startTime}
          </div>
        </div>
        <div className="h-12 w-px bg-gray-200"></div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500 mb-3">End Time</div>
          <div className="text-3xl font-semibold text-brand-primary flex items-center gap-3">
            <Clock className="h-6 w-6" />
            {endTime}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddEventModal({ isOpen, onClose, onSubmit, initialData, isEditing = false, organizerId }: AddEventModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.name || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [startTime, setStartTime] = useState(initialData?.startTime || '');
  const [endTime, setEndTime] = useState(initialData?.endTime || '');
  const [position, setPosition] = useState<[number, number]>(
    initialData?.location
      ? [initialData.location.lat, initialData.location.lng] 
      : defaultPosition
  );
  const [isValidZone, setIsValidZone] = useState(true);
  const [address, setAddress] = useState(initialData?.address || '');
  const [searchText, setSearchText] = useState(initialData?.address || '');
  const [country, setCountry] = useState<string>(initialData?.country || 'GERMANY');
  const [createEvent, { loading: isCreating }] = useMutation(CREATE_EVENT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data with initialData if provided
  useEffect(() => {
    if (initialData && isEditing) {
      setTitle(initialData.name);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      if (initialData.location) {
        setPosition([initialData.location.lat, initialData.location.lng]);
      }
      setAddress(initialData.address);
      if (initialData.country) {
        setCountry(initialData.country);
      }
    }
  }, [initialData, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidZone) {
      toast.error("Please select a valid location");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const eventData = {
        name: title,
        startDate,
        endDate,
        startTime,
        endTime,
        location: {
          lat: position[0],
          lng: position[1],
        },
        address,
        country
      };
      
      // If we're in a real implementation, call the API
      if (!isEditing) {
        try {
          const { data } = await createEvent({
            variables: {
              eventInput: {
                ownerId: organizerId, // Using organizerId from props
                name: title,
                address: address,
                location: {
                  type: "Point",
                  coordinates: [position[1], position[0]] // API expects [lng, lat]
                },
                startDate: startDate,
                endDate: endDate,
                startTime: startTime,
                endTime: endTime,
                country: country.toLowerCase()
              }
            }
          });
          
          if (data?.createEvent) {
            toast.success("Event created successfully");
          }
        } catch (error) {
          console.error("Error creating event:", error);
          toast.error(`Error creating event: ${error.message}`);
          throw error;
        }
      }
      
      // Call the onSubmit callback with the form data
      onSubmit(eventData);
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 pb-6 border-b mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {isEditing ? 'Edit Event' : 'Add New Event'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {isEditing 
                        ? 'Update the event information below'
                        : 'Fill in the details to create a new event'}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Event Name */}
                <div>
                  <TextField
                    label="Event Name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </div>

                {/* Country Selection */}
                <div>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="country-select-label">Country</InputLabel>
                    <Select
                      labelId="country-select-label"
                      id="country-select"
                      value={country}
                      onChange={(e) => setCountry(e.target.value as string)}
                      label="Country"
                      required
                    >
                      <MenuItem value="GERMANY">Germany</MenuItem>
                      <MenuItem value="AUSTRIA">Austria</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                {/* Date Selection */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calendar View */}
                  {startDate && endDate && (
                    <DateRangeCalendar
                      startDate={startDate}
                      endDate={endDate}
                    />
                  )}
                </div>

                {/* Time Selection */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Start Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <TimePicker
                        value={startTime ? dayjs(startTime, 'HH:mm') : null}
                        onChange={(value) => {
                          if (value) {
                            setStartTime(value.format('HH:mm'));
                          }
                        }}
                        ampm={false}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            InputProps: {
                              startAdornment: (
                                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                              ),
                            },
                          },
                        }}
                        format="HH:mm"
                      />
                    </div>
                    {/* End Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <TimePicker
                        value={endTime ? dayjs(endTime, 'HH:mm') : null}
                        onChange={(value) => {
                          if (value) {
                            setEndTime(value.format('HH:mm'));
                          }
                        }}
                        ampm={false}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            InputProps: {
                              startAdornment: (
                                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                              ),
                            },
                          },
                        }}
                        format="HH:mm"
                      />
                    </div>
                  </div>

                  {/* Time Display */}
                  {startTime && endTime && (
                    <TimeDisplay
                      startTime={startTime}
                      endTime={endTime}
                    />
                  )}
                </div>

                {/* Map Component */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
                  <MapsComponent 
                    position={position} 
                    setPosition={setPosition} 
                    setIsValidZone={setIsValidZone}
                    searchText={searchText}
                    setSearchText={setSearchText}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                    rows={3}
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : isEditing ? 'Update Event' : 'Add Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
}