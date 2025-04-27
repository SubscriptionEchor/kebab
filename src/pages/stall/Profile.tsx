import React, { useState, useEffect } from 'react';
import { Save, Upload, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingState from '../../components/LoadingState';
import QRCode from 'qrcode.react';

interface FileWithPreview extends File {
  preview?: string;
}

interface FormDataType {
  stallId: string;
  email: string;
  phone: string;
  name: string;
  address: string;
  cuisine: string;
  username: string;
  password: string;
  orderPrefix: string;
  minimumOrder: string;
  preparationTime: string;
  logo?: string | null;
}

export default function StallProfile() {
  const { t } = useTranslation();
  const { stallId } = useParams();
  const [stallImage, setStallImage] = useState<FileWithPreview | null>(null);
  const [stallLogo, setStallLogo] = useState<FileWithPreview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const defaultLogo = 'https://placehold.co/100x100';

  const [formData, setFormData] = useState<FormDataType>({
    stallId: '',
    email: '',
    phone: '',
    name: '',
    address: '',
    cuisine: '',
    username: '',
    password: '',
    orderPrefix: '',
    minimumOrder: '15',
    preparationTime: '30',
    logo: null
  });

  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      setFormData({
        stallId: stallId || 'STL123456',
        email: 'taco@example.com',
        phone: '+1234567890',
        name: 'Taco Stand',
        address: '123 Food Court Lane',
        cuisine: 'Mexican',
        username: 'tacostand',
        password: '********',
        orderPrefix: 'TS',
        minimumOrder: '15',
        preparationTime: '30',
        logo: null
      });
      setIsLoading(false);
    }, 1000);
  }, [stallId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (type: 'image' | 'logo', file: FileWithPreview) => {
    if (type === 'image') {
      setStallImage(file);
    } else {
      setStallLogo(file);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(t('stallvendorprofile.idCopied'));
  };

  const handleCopyUrl = () => {
    const stallUrl = `https://kebapp-chefs.com/stall/${formData.stallId}`;
    navigator.clipboard.writeText(stallUrl);
    toast.success(t('stallvendorprofile.urlCopied'));
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.name}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t('stallvendorprofile.qrDownloaded'));
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading(t('stallprofile.saving'));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t('stallprofile.profileupdated'), { id: toastId });
    } catch (error) {
      console.error('Failed to update stall:', error);
      toast.error(t('stallprofile.failedtoupdatestallprofile'), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{t('stallprofile.title')}</h1>
        </div>
        <LoadingState rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('stallprofile.title')}</h1>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
              {t('stallprofile.saving')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('stallprofile.savechanges')}
            </>
          )}
        </button>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            {/* Stall ID */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.stallId')}</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{formData.stallId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyId(formData.stallId)}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Copy className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* App Credentials */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('stallvendorprofile.appCredentials')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.username')}</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder={t('stallvendorprofile.enterUsername')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.password')}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t('stallvendorprofile.enterPassword')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>
            </div>

            {/* Order Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('stallvendorprofile.orderSettings')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.orderPrefix')}</label>
                  <input
                    type="text"
                    name="orderPrefix"
                    value={formData.orderPrefix}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.minimumOrder')}</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      name="minimumOrder"
                      value={formData.minimumOrder}
                      onChange={handleInputChange}
                      className="block w-full pl-7 rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('stallvendorprofile.deliveryTime')}</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="preparationTime"
                      value={formData.preparationTime}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{t('stallvendorprofile.minutes')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('stallvendorprofile.qrCode')}</h2>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <QRCode
                    value={`https://kebapp-chefs.com/stall/${formData.stallId}`}
                    size={150}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: formData.logo || stallLogo?.preview || '',
                      excavate: true,
                      width: 30,
                      height: 30,
                    }}
                  />
                </div>
                <div className="space-y-4 w-full">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">{t('stallvendorprofile.stallUrl')}</p>
                    <div className="flex items-center w-full">
                      <input
                        type="text"
                        value={`https://kebapp-chefs.com/stall/${formData.stallId}`}
                        readOnly
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-l-md bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="px-3 py-2 bg-brand-primary text-black rounded-r-md hover:bg-brand-primary/90 transition-colors"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={downloadQRCode}
                      className="px-3 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors"
                    >
                      {t('stallvendorprofile.downloadQr')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('stallprofile.basicinfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('stallprofile.stallname')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('stallprofile.cuisine')}
                  </label>
                  <input
                    type="text"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('stallprofile.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('stallprofile.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('stallprofile.images')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('stallprofile.stallimage')}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-brand-primary transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-brand-primary hover:text-brand-primary/90 focus-within:outline-none">
                          <span>{t('stallprofile.uploadfile')}</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageChange('image', file as FileWithPreview);
                          }} />
                        </label>
                        <p className="pl-1">{t('stallprofile.uploadfilesize.image')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('stallprofile.stalllogo')}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-brand-primary transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-brand-primary hover:text-brand-primary/90 focus-within:outline-none">
                          <span>{t('stallprofile.uploadfile')}</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageChange('logo', file as FileWithPreview);
                          }} />
                        </label>
                        <p className="pl-1">{t('stallprofile.uploadfilesize.logo')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 