import React from 'react';
import { Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FormDataType {
  stallId: string;
  email: string;
  phone: string;
  name: string;
  address: string;
  stallType: string;
  username?: string;
  password?: string;
  minimumOrder?: string;
  preparationTime?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

interface StallProfileViewProps {
  formData: FormDataType;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  stallImage: FileWithPreview | null;
  stallLogo: FileWithPreview | null;
  handleImageChange: (type: 'image' | 'logo', file: any) => void;
  defaultLogo: string;
}

export default function StallProfileView({
  formData,
  handleInputChange,
  stallImage,
  stallLogo,
  handleImageChange,
  defaultLogo,
}: StallProfileViewProps) {
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      handleImageChange(type, fileWithPreview);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stallprofile.basicinformation')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('stallprofile.stallname')}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t('stallprofile.phone')}
              </label>
              <input
                type="text"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('stallprofile.email')}
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                {t('stallprofile.address')}
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stallprofile.images')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stall Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('stallprofile.stallimage')}
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={stallImage?.preview || defaultLogo}
                    alt="Stall"
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                  {stallImage && (
                    <button
                      type="button"
                      onClick={() => handleImageChange('image', null)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                  <Upload className="h-4 w-4 mr-2" />
                  {t('common.upload')}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'image')}
                  />
                </label>
              </div>
            </div>

            {/* Stall Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('stallprofile.stalllogo')}
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={stallLogo?.preview || defaultLogo}
                    alt="Logo"
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                  {stallLogo && (
                    <button
                      type="button"
                      onClick={() => handleImageChange('logo', null)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                  <Upload className="h-4 w-4 mr-2" />
                  {t('common.upload')}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stallprofile.additionalsettings')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="minimumOrder" className="block text-sm font-medium text-gray-700">
                {t('stallprofile.minimumorder')}
              </label>
              <input
                type="number"
                name="minimumOrder"
                id="minimumOrder"
                value={formData.minimumOrder}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700">
                {t('stallprofile.preparationtime')}
              </label>
              <input
                type="number"
                name="preparationTime"
                id="preparationTime"
                value={formData.preparationTime}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 