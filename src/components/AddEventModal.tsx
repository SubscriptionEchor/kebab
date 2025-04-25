import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Icon, LeafletMouseEvent } from 'leaflet';
import debounce from 'lodash/debounce';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TextField } from '@mui/material';
import dayjs from 'dayjs';
import { getEnvVar } from '../utils/env';
import 'leaflet/dist/leaflet.css';

const OSM_SEARCH_URL = getEnvVar('MAPS_URL');
const TILE_URL = getEnvVar('TILES_URL');

// Create a custom theme to match your app's styling
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

// Fix for default marker icon
const icon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
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
  };
  isEditing?: boolean;
}

function SetViewOnClick({ coords }: { coords: [number, number] }) {
  const map = useMap();
  map.setView(coords, map.getZoom());
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (e: LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onMapClick
  });
  return null;
}

const defaultPosition: [number, number] = [25.2048, 55.2708]; // Dubai coordinates as default

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

export default function AddEventModal({ isOpen, onClose, onSubmit, initialData, isEditing = false }: AddEventModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: {
      lat: defaultPosition[0],
      lng: defaultPosition[1]
    },
    address: '',
    searchLocation: ''
  });
  const [position, setPosition] = useState<[number, number]>(defaultPosition);
  const [searchResults, setSearchResults] = useState<Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>>([]);
  const [showResults, setShowResults] = useState(false);

  // Character limits
  const EVENT_NAME_LIMIT = 50;
  const ADDRESS_LIMIT = 200;

  // Initialize form data with initialData if provided
  useEffect(() => {
    if (initialData && isEditing) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        searchLocation: initialData.address
      }));
      setPosition([initialData.location.lat, initialData.location.lng]);
    }
  }, [initialData, isEditing]);

  // Debounced search function
  const searchAddress = debounce(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(
        `${OSM_SEARCH_URL}/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to search address:', error);
      setSearchResults([]);
      setShowResults(false);
    }
  }, 300);

  const handleEventNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= EVENT_NAME_LIMIT) {
      setFormData(prev => ({ ...prev, name: value }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, searchLocation: value }));
    searchAddress(value);
  };

  const handleResultSelect = (result: { display_name: string; lat: string; lon: string }) => {
    const newPosition: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)];
    setPosition(newPosition);
    setFormData(prev => ({
      ...prev,
      address: result.display_name,
      searchLocation: result.display_name,
      location: {
        lat: newPosition[0],
        lng: newPosition[1]
      }
    }));
    setShowResults(false);
  };

  const handleMapClick = (e: LeafletMouseEvent) => {
    const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
    setPosition(newPosition);
    setFormData(prev => ({
      ...prev,
      location: {
        lat: newPosition[0],
        lng: newPosition[1]
      }
    }));

    // Reverse geocode to get address
    fetch(`${OSM_SEARCH_URL}/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
      .then(response => response.json())
      .then(data => {
        if (data.display_name) {
          setFormData(prev => ({
            ...prev,
            address: data.display_name,
            searchLocation: data.display_name
          }));
        }
      })
      .catch(error => console.error('Failed to reverse geocode:', error));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleStartTimeChange = (value: dayjs.Dayjs | null) => {
    if (value) {
      setFormData(prev => ({
        ...prev,
        startTime: value.format('HH:mm')
      }));
    }
  };

  const handleEndTimeChange = (value: dayjs.Dayjs | null) => {
    if (value) {
      setFormData(prev => ({
        ...prev,
        endTime: value.format('HH:mm')
      }));
    }
  };

  // Handle address change with limit
  const handleAddressTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= ADDRESS_LIMIT) {
      setFormData(prev => ({ ...prev, address: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-6 ${
            isOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-auto relative">
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
                    value={formData.name}
                    onChange={handleEventNameChange}
                    fullWidth
                    required
                    variant="outlined"
                    inputProps={{
                      maxLength: EVENT_NAME_LIMIT
                    }}
                    helperText={`${formData.name.length}/${EVENT_NAME_LIMIT} characters`}
                    FormHelperTextProps={{
                      sx: {
                        marginLeft: 'auto',
                        marginRight: 0,
                        textAlign: 'right',
                        color: formData.name.length === EVENT_NAME_LIMIT ? 'error.main' : 'text.secondary'
                      }
                    }}
                  />
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
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calendar View */}
                  {formData.startDate && formData.endDate && (
                    <DateRangeCalendar
                      startDate={formData.startDate}
                      endDate={formData.endDate}
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
                        value={formData.startTime ? dayjs(formData.startTime, 'HH:mm') : null}
                        onChange={handleStartTimeChange}
                        ampm={false}
                        minutesStep={15}
                        skipDisabled
                        views={['hours', 'minutes']}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            InputProps: {
                              startAdornment: (
                                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                              ),
                            },
                          },
                          popper: {
                            sx: {
                              '& .MuiPaper-root': {
                                border: '1px solid #E5E7EB',
                              },
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
                        value={formData.endTime ? dayjs(formData.endTime, 'HH:mm') : null}
                        onChange={handleEndTimeChange}
                        ampm={false}
                        minutesStep={15}
                        skipDisabled
                        views={['hours', 'minutes']}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            InputProps: {
                              startAdornment: (
                                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                              ),
                            },
                          },
                          popper: {
                            sx: {
                              '& .MuiPaper-root': {
                                border: '1px solid #E5E7EB',
                              },
                            },
                          },
                        }}
                        format="HH:mm"
                      />
                    </div>
                  </div>

                  {/* Time Display */}
                  {formData.startTime && formData.endTime && (
                    <TimeDisplay
                      startTime={formData.startTime}
                      endTime={formData.endTime}
                    />
                  )}
                </div>

                {/* Location Search */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Search Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.searchLocation}
                      onChange={handleAddressChange}
                      placeholder="Search for a location"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleResultSelect(result)}
                            className="w-full px-4 py-3 text-sm text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <p className="font-medium text-gray-900">{result.display_name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {result.lat}, {result.lon}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Map */}
                <div className="h-72 w-full rounded-lg overflow-hidden border border-gray-200">
                  <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url={TILE_URL}
                      attribution="Kebab Maps"
                    />
                    <Marker position={position} icon={icon} />
                    <SetViewOnClick coords={position} />
                    <MapClickHandler onMapClick={handleMapClick} />
                  </MapContainer>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.address}
                      onChange={handleAddressTextChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      rows={3}
                      required
                      maxLength={ADDRESS_LIMIT}
                    />
                    <div className={`text-xs mt-1 text-right ${
                      formData.address.length === ADDRESS_LIMIT ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {formData.address.length}/{ADDRESS_LIMIT} characters
                    </div>
                  </div>
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
                  >
                    {isEditing ? 'Update Event' : 'Add Event'}
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