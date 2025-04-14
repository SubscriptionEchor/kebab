import { useState } from 'react';
import { Save, Upload, X, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_RESTAURANT_BY_OWNER } from '../../lib/graphql/queries/vendors';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface FileWithPreview extends File {
  preview?: string;
}

export default function VendorProfile() {
  const { userEmail, signOut } = useAuth();
  const navigate = useNavigate();
  const [vendorImage, setVendorImage] = useState<FileWithPreview | null>(null);
  const { data: vendorData } = useQuery(GET_RESTAURANT_BY_OWNER, {
    variables: { id: userEmail },
    onError: (error: Error) => {
      console.error('Failed to fetch vendor data:', error);
      toast.error('Failed to load vendor details');
    }
  });

  const [activeTab, setActiveTab] = useState('vendor-profile');
  const { restaurantId } = useParams();
  const location = useLocation();
  const hasOnboardingId = location.state?.restaurantData?.onboardingApplicationId;
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: vendorData?.restaurantByOwner?.email || '',
    phone: '+1234567890',
    address: '123 Vendor Street, City, Country',
  });

  // Update form data when vendor data is loaded
  useEffect(() => {
    if (vendorData?.restaurantByOwner) {
      setFormData(prev => ({
        ...prev,
        email: vendorData.restaurantByOwner.email || ''
      }));
    }
  }, [vendorData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.preview = URL.createObjectURL(file);
      setVendorImage(fileWithPreview);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.preview = URL.createObjectURL(file);
      setVendorImage(fileWithPreview);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = () => {
    if (vendorImage?.preview) URL.revokeObjectURL(vendorImage.preview);
    setVendorImage(null);
  };

  const handleSave = () => {
    toast.success('Profile updated successfully');
  };

  const handleSignOut = () => {
    signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('vendor-profile')}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
              ${
                activeTab === 'vendor-profile'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }
            `}
          >
            Vendor Profile
          </button>
          {hasOnboardingId && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${
                  activeTab === 'profile'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              Profile
            </button>
          )}
          <button
            onClick={() => setActiveTab('rating')}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
              ${
                activeTab === 'rating'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }
            `}
          >
            Ratings
          </button>
        </nav>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
              >
                {vendorImage ? (
                  <div className="relative">
                    <img
                      src={vendorImage.preview}
                      alt="Profile preview"
                      className="h-48 w-full object-cover rounded-md"
                    />
                    <button
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <div className="flex justify-center">
                      <label className="cursor-pointer inline-flex items-center px-3 py-1.5 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors">
                        <Upload className="h-4 w-4 mr-1" />
                        Choose Image
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">or drag and drop</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}