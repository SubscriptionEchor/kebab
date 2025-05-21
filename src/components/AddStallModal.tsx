import { useState, useRef, useEffect } from 'react';
import { X, Upload, Clock, Check, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { CREATE_STALL } from '../lib/graphql/mutations/stalls';
import { toast } from 'sonner';
import { uploadImage } from '../lib/api/upload';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

interface AddStallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
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
  }) => void;
  eventId: string;
  initialData?: {
    name: string;
    cuisine: string;
    timings: {
      [key: string]: {
        startTime: string;
        endTime: string;
        isOpen: boolean;
      };
    };
  };
}

const DAYS = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' }
];

const CUISINES = [
  'Arabian',
  'Chinese',
  'Indian',
  'Italian',
  'Japanese',
  'Korean',
  'Mexican',
  'Thai',
  'Turkish',
  'Vietnamese',
  'Other'
];

const STALL_NAME_LIMIT = 50;

// Create a custom theme to match your app's styling
const theme = createTheme({
  palette: {
    primary: {
      main: '#10B981', // brand-primary color
    },
    background: {
      default: '#ffffff',
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
          '& .MuiInputBase-input::placeholder': {
            color: '#9CA3AF',
            opacity: 1,
          },
          '& .MuiInputAdornment-root .MuiIconButton-root': {
            color: '#4B5563',
          },
          '& .MuiOutlinedInput-input': {
            padding: '0.75rem 1rem',
          },
        },
        input: {
          padding: '0.75rem 1rem',
          fontSize: '0.875rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#4B5563',
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
            '&.Mui-focused': {
              color: '#10B981',
            },
          },
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#10B981',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: '0.75rem 1rem',
          fontSize: '0.875rem',
          '&:focus': {
            backgroundColor: 'transparent',
          },
        },
        icon: {
          color: '#4B5563',
          right: '0.75rem',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          padding: '0.75rem 1rem',
          fontSize: '0.875rem',
          '&:hover': {
            backgroundColor: '#F3F4F6',
          },
          '&.Mui-selected': {
            backgroundColor: '#ECFDF5',
            '&:hover': {
              backgroundColor: '#D1FAE5',
            },
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          marginTop: '0.5rem',
        },
      },
    },
  },
});

export default function AddStallModal({ isOpen, onClose, onSubmit, eventId, initialData }: AddStallModalProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [createStall, { loading: isCreatingStall }] = useMutation(CREATE_STALL);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    cuisine: initialData?.cuisine || '',
    username: '',
    password: '',
    country: 'GERMANY',
    profilePhoto: null as File | null,
    timings: initialData?.timings || DAYS.reduce((acc, day) => ({
      ...acc,
      [day.id]: { startTime: '09:00', endTime: '17:00', isOpen: false }
    }), {} as { [key: string]: { startTime: string; endTime: string; isOpen: boolean } })
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [commonTiming, setCommonTiming] = useState({
    startTime: '09:00',
    endTime: '17:00'
  });
  const [isCommonHoursEnabled, setIsCommonHoursEnabled] = useState(false);

  // Reset form when modal is closed or initialData changes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        cuisine: '',
        username: '',
        password: '',
        country: 'GERMANY',
        profilePhoto: null,
        timings: DAYS.reduce((acc, day) => ({
          ...acc,
          [day.id]: { startTime: '09:00', endTime: '17:00', isOpen: false }
        }), {} as { [key: string]: { startTime: string; endTime: string; isOpen: boolean } })
      });
      setPreviewUrl(null);
    } else if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name,
        cuisine: initialData.cuisine,
        timings: initialData.timings
      }));
    }
  }, [isOpen, initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadImage(formData);
      
      if (result.success && result.url) {
        setPreviewUrl(result.url);
        setFormData(prev => ({ ...prev, profilePhoto: file }));
        toast.success("Image uploaded successfully");
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= STALL_NAME_LIMIT) {
      setFormData({ ...formData, name: value });
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      timings: {
        ...prev.timings,
        [day]: {
          ...prev.timings[day],
          isOpen: !prev.timings[day].isOpen
        }
      }
    }));
  };

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      timings: {
        ...prev.timings,
        [day]: {
          ...prev.timings[day],
          [field]: value
        }
      }
    }));
  };

  const handleCommonTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setCommonTiming(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyCommonTiming = () => {
    setFormData(prev => ({
      ...prev,
      timings: Object.keys(prev.timings).reduce((acc, day) => ({
        ...acc,
        [day]: {
          startTime: commonTiming.startTime,
          endTime: commonTiming.endTime,
          isOpen: true // Enable all days
        }
      }), prev.timings)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.cuisine) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Format timings for API
      const openingTimes = Object.entries(formData.timings).map(([day, timing]) => {
        const dayCode = day.substring(0, 3).toUpperCase();
        return {
          day: dayCode,
          times: timing.isOpen ? [{
            startTime: timing.startTime.split(':'),
            endTime: timing.endTime.split(':')
          }] : [],
          isOpen: timing.isOpen
        };
      });

      // Get image URL from preview if available
      const imageUrl = previewUrl || null;

      // Create stall via API
      const { data } = await createStall({
        variables: {
          restaurant: {
            name: formData.name,
            cuisines: [formData.cuisine],
            username: formData.username,
            password: formData.password,
            country: formData.country.toLowerCase(),
            image: imageUrl,
            openingTimes,
            address: "Event Location",
            location: {
              type: "Point",
              coordinates: [11.7504214, 52.88458019999999] // Default coordinates
            }
          },
          eventId: eventId // Explicitly use the eventId prop
        }
      });

      if (data?.createStall) {
        toast.success("Stall created successfully");
        
        // Pass the created stall to parent component
        onSubmit({
          name: formData.name,
          cuisine: formData.cuisine,
          username: formData.username,
          password: formData.password,
          country: formData.country,
          profilePhoto: formData.profilePhoto,
          timings: formData.timings
        });

        // Clear form data
        setFormData({
          name: '',
          cuisine: '',
          username: '',
          password: '',
          country: 'GERMANY',
          profilePhoto: null,
          timings: DAYS.reduce((acc, day) => ({
            ...acc,
            [day.id]: { startTime: '09:00', endTime: '17:00', isOpen: false }
          }), {} as { [key: string]: { startTime: string; endTime: string; isOpen: boolean } })
        });

        // Clear preview URL and revoke object URL to prevent memory leaks
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);

        // Reset common hours
        setCommonTiming({
          startTime: '09:00',
          endTime: '17:00'
        });
        setIsCommonHoursEnabled(false);

        // Close modal
        onClose();
      }
    } catch (error) {
      console.error("Error creating stall:", error);
      toast.error("Failed to create stall");
    }
  };

  if (!isOpen) return null;

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start md:items-center justify-center z-50 overflow-y-auto">
          <div className="relative w-full max-w-3xl my-4 mx-auto p-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="sticky top-0 z-20 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Add New Stall</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-6 space-y-8 max-h-[calc(100vh-16rem)] overflow-y-auto">
                  {/* Stall Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Stall Name
                    </label>
                    <TextField
                      fullWidth
                      value={formData.name}
                      onChange={handleNameChange}
                      variant="outlined"
                      placeholder="Enter your stall name"
                      required
                      InputProps={{
                        endAdornment: (
                          <span className={`text-sm ${
                            formData.name.length === STALL_NAME_LIMIT ? 'text-red-500' : 'text-gray-400'
                          }`}>
                            {formData.name.length}/{STALL_NAME_LIMIT}
                          </span>
                        ),
                      }}
                    />
                  </div>

                  {/* Cuisine Dropdown */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Cuisine Type
                    </label>
                    <TextField
                      select
                      fullWidth
                      value={formData.cuisine}
                      onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                      label={t('addStall.cuisine')}
                      SelectProps={{
                        renderValue: (value: unknown) => {
                          if (typeof value === 'string') {
                            return value;
                          }
                          return '';
                        }
                      }}
                    >
                      {CUISINES.map(cuisine => (
                        <MenuItem key={cuisine} value={cuisine}>
                          {cuisine}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>

                  {/* Profile Photo Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Photo
                    </label>
                    <div className="w-full" onClick={() => fileInputRef.current?.click()}>
                      {previewUrl ? (
                        <div className="relative group rounded-xl overflow-hidden">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/default-stall.png';
                            }}
                          />
                          <div
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                          >
                            <div className="text-white text-center">
                              <Upload className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">Change Photo</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-200 cursor-pointer"
                        >
                          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                          <p className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Operating Hours</h3>
                      
                      {/* Common Time Settings */}
                      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-600">Set Common Hours</p>
                          <button
                            type="button"
                            onClick={() => setIsCommonHoursEnabled(!isCommonHoursEnabled)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                              isCommonHoursEnabled
                                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {isCommonHoursEnabled ? (
                              <>
                                <X className="h-4 w-4" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                Enable
                              </>
                            )}
                          </button>
                        </div>
                        
                        {isCommonHoursEnabled && (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="col-span-1 sm:col-span-2">
                                <TimePicker
                                  label="Common Start Time"
                                  value={dayjs(commonTiming.startTime, 'HH:mm')}
                                  onChange={(value) => {
                                    if (value) {
                                      handleCommonTimeChange('startTime', value.format('HH:mm'));
                                    }
                                  }}
                                  ampm={false}
                                  slotProps={{
                                    textField: {
                                      size: "small",
                                      fullWidth: true,
                                    },
                                  }}
                                />
                              </div>
                              <div className="col-span-1 sm:col-span-2">
                                <TimePicker
                                  label="Common End Time"
                                  value={dayjs(commonTiming.endTime, 'HH:mm')}
                                  onChange={(value) => {
                                    if (value) {
                                      handleCommonTimeChange('endTime', value.format('HH:mm'));
                                    }
                                  }}
                                  ampm={false}
                                  slotProps={{
                                    textField: {
                                      size: "small",
                                      fullWidth: true,
                                    },
                                  }}
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={applyCommonTiming}
                              className="w-full sm:w-auto px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-gray-200"
                            >
                              <Clock className="h-4 w-4" />
                              Apply to All Days
                            </button>
                          </>
                        )}
                      </div>

                      {/* Days Grid */}
                      <div className="space-y-3">
                        {DAYS.map(day => (
                          <div key={day.id} 
                               className={`rounded-xl transition-colors ${
                                 formData.timings[day.id].isOpen 
                                   ? 'bg-white border border-gray-200' 
                                   : 'bg-gray-50'
                               }`}
                          >
                            <div className="p-4">
                              <div className="flex items-center gap-3 mb-4">
                                <button
                                  type="button"
                                  onClick={() => handleDayToggle(day.id)}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                    formData.timings[day.id].isOpen
                                      ? 'bg-brand-primary text-white'
                                      : 'border-2 border-gray-300 hover:border-brand-primary'
                                  }`}
                                >
                                  {formData.timings[day.id].isOpen && <Check className="w-4 h-4" />}
                                </button>
                                <span className="font-medium text-gray-700">{day.label}</span>
                              </div>

                              {formData.timings[day.id].isOpen && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <TimePicker
                                    label="Start Time"
                                    value={dayjs(formData.timings[day.id].startTime, 'HH:mm')}
                                    onChange={(value) => {
                                      if (value) {
                                        handleTimeChange(day.id, 'startTime', value.format('HH:mm'));
                                      }
                                    }}
                                    ampm={false}
                                    slotProps={{
                                      textField: {
                                        size: "small",
                                        fullWidth: true,
                                      },
                                    }}
                                  />
                                  <TimePicker
                                    label="End Time"
                                    value={dayjs(formData.timings[day.id].endTime, 'HH:mm')}
                                    onChange={(value) => {
                                      if (value) {
                                        handleTimeChange(day.id, 'endTime', value.format('HH:mm'));
                                      }
                                    }}
                                    ampm={false}
                                    slotProps={{
                                      textField: {
                                        size: "small",
                                        fullWidth: true,
                                      },
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Username and Password */}
                <div className="space-y-6 px-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Login Credentials</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Country Selection */}
                <div className="px-6 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <FormControl fullWidth variant="outlined">
                    <Select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value as string })}
                      required
                    >
                      <MenuItem value="GERMANY">Germany</MenuItem>
                      <MenuItem value="AUSTRIA">Austria</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 z-20 bg-white px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                    disabled={isCreatingStall}
                  >
                    {isCreatingStall ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Add Stall
                      </>
                    )}
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