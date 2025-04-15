import { Copy, Plus, Store, Upload } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';
import QRCode from 'qrcode.react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'react';

interface RestaurantProfileViewProps {
  formData: {
    restaurantId?: string;
    email?: string;
    phone?: string;
    name: string;
    address: string;
    shopType?: string;
    cuisines: string[];
    username?: string;
    password?: string;
    orderPrefix?: string;
    minimumOrder?: string;
    deliveryTime?: string;
    logo?: string;
    restaurantLogo?: {
      preview?: string;
    };
  };
  restaurantImage: any;
  restaurantLogo: any;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onImageChange: (type: 'image' | 'logo', file: any) => void;
  onShowCuisineModal: () => void;
  cuisinesLoading: boolean;
  cuisinesError: any;
  newRestaurant: boolean;
}

export default function RestaurantProfileView({
  newRestaurant,
  formData,
  restaurantImage,
  restaurantLogo,
  onInputChange,
  onImageChange,
  onShowCuisineModal,
  cuisinesLoading,
  cuisinesError,
}: RestaurantProfileViewProps) {
  const { t } = useTranslation();
  const { userType } = useAuth();

  const [showQRModal, setShowQRModal] = useState(false);
  const qrCodeRef = useRef(null);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Restaurant ID copied to clipboard');
  };

  const handleCopyUrl = () => {
    const restaurantUrl = `https://kebapp-chefs.com/restaurant/${formData.restaurantId}`;
    navigator.clipboard.writeText(restaurantUrl);
    toast.success('Restaurant URL copied to clipboard');
  };

  const downloadQRCode = () => {
    if (!qrCodeRef.current) return;

    const canvas = qrCodeRef.current.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.name}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('QR Code downloaded successfully');
  };

  const shareQRCode = (platform: 'facebook' | 'twitter' | 'whatsapp') => {
    const restaurantUrl = `https://kebapp-chefs.com/restaurant/${formData.restaurantId}`;
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          restaurantUrl
        )}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          restaurantUrl
        )}&text=${encodeURIComponent(`Check out ${formData.name} on Kebapp!`)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(
          `Check out ${formData.name} on Kebapp: ${restaurantUrl}`
        )}`;
        break;
    }

    window.open(shareUrl, '_blank');
  };

  const isFieldEditable = (fieldName: string): boolean => {
    const adminEditableFields = [
      'name',
      'phone',
      'address',
      'cuisines',
      'username',
      'password',
      'minimumOrder',
      'deliveryTime',
    ];
    const vendorEditableFields = [
      'address',
      'cuisines',
      'username',
      'password',
      'minimumOrder',
      'deliveryTime',
    ];
    if (newRestaurant) {
      return true;
    }
    if (userType === 'ADMIN') {
      return adminEditableFields.includes(fieldName);
    }

    if (userType === 'VENDOR') {
      return vendorEditableFields.includes(fieldName);
    }

    return false;
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!newRestaurant && (
          <div>
            <label
              htmlFor="restaurantId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('restaurantprofile.restaurantid')}
            </label>
            <div className="relative">
              <input
                type="text"
                id="restaurantId"
                name="restaurantId"
                value={formData?.restaurantId}
                disabled
                className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
              />
              <button
                onClick={() => handleCopyId(formData?.restaurantId)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={t('restaurantprofile.copyid')}
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* App Credentials Section */}
        <div className="col-span-2 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
            {t('restaurantprofile.appcredentials')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('restaurantprofile.username')}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData?.username || ''}
                onChange={onInputChange}
                disabled={!isFieldEditable('username')}
                placeholder={t('restaurantprofile.enterusername')}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-shadow ${
                  isFieldEditable('username')
                    ? 'focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary'
                    : 'bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('restaurantprofile.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData?.password || ''}
                onChange={onInputChange}
                disabled={!isFieldEditable('password')}
                placeholder={t('restaurantprofile.enterpassword')}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-shadow ${
                  isFieldEditable('password')
                    ? 'focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary'
                    : 'bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Order Settings Section */}
        <div className="col-span-2 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
            {t('restaurantprofile.ordersettings')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="orderPrefix"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('restaurantprofile.orderprefix')}
              </label>
              <input
                type="text"
                id="orderPrefix"
                name="orderPrefix"
                value={formData?.orderPrefix || ''}
                onChange={onInputChange}
                disabled={true}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="minimumOrder"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('restaurantprofile.minimumorder')}
              </label>
              <input
                type="number"
                id="minimumOrder"
                name="minimumOrder"
                value={formData?.minimumOrder || ''}
                onChange={onInputChange}
                disabled={!isFieldEditable('minimumOrder')}
                placeholder={t('restaurantprofile.enterminimumorder')}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-shadow ${
                  isFieldEditable('minimumOrder')
                    ? 'focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary'
                    : 'bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="deliveryTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('restaurantprofile.deliverytime')} (minutes)
              </label>
              <input
                type="number"
                id="deliveryTime"
                name="deliveryTime"
                value={formData?.deliveryTime || ''}
                onChange={onInputChange}
                disabled={!isFieldEditable('deliveryTime')}
                placeholder={t('restaurantprofile.enterdeliverytime')}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-shadow ${
                  isFieldEditable('deliveryTime')
                    ? 'focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary'
                    : 'bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('restaurantprofile.restaurantname')}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData?.name}
            onChange={onInputChange}
            disabled={!isFieldEditable('name')}
            placeholder={t('restaurantprofile.enterrestaurantname')}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-shadow ${
              isFieldEditable('name')
                ? 'focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary'
                : 'bg-gray-50 cursor-not-allowed'
            }`}
          />
        </div>

        {!newRestaurant && (
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('restaurantprofile.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder={t('restaurantprofile.emailplaceholder')}
              value={formData?.email}
              onChange={onInputChange}
              disabled={!isFieldEditable('email')}
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-shadow ${
                isFieldEditable('name')
                  ? 'focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary'
                  : 'bg-gray-50 cursor-not-allowed'
              }`}
            />
          </div>
        )}

        {!newRestaurant && (
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('restaurantprofile.phone')}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData?.phone}
              onChange={onInputChange}
              disabled={!isFieldEditable('phone')}
              placeholder={t('restaurantprofile.enterphonenumber')}
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-shadow ${
                isFieldEditable('phone')
                  ? 'focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary'
                  : 'bg-gray-50 cursor-not-allowed'
              }`}
            />
          </div>
        )}

        <div className="col-span-2">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('restaurantprofile.address')}
          </label>
          <textarea
            id="address"
            name="address"
            value={formData?.address}
            onChange={onInputChange}
            disabled={!isFieldEditable('address')}
            placeholder={t('restaurantprofile.enterrestaurantaddress')}
            rows={3}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-shadow resize-none ${
              isFieldEditable('address')
                ? 'focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary'
                : 'bg-gray-50 cursor-not-allowed'
            }`}
          />
        </div>

        {!newRestaurant && (
          <div>
            <label
              htmlFor="shopType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('restaurantprofile.shopcategory')}
            </label>
            <input
              type="text"
              id="shopType"
              name="shopType"
              value={formData?.shopType}
              disabled
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('restaurantprofile.cuisines')}
            {cuisinesLoading && (
              <span className="ml-2 text-xs text-gray-500">
                ({t('restaurantprofile.loadingcuisines')})
              </span>
            )}
          </label>
          <div
            className={`flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md ${
              isFieldEditable('cuisines')
                ? 'hover:border-brand-primary transition-colors cursor-pointer'
                : 'bg-gray-50 cursor-not-allowed'
            } min-h-[42px]`}
            onClick={(e) => {
              if (!isFieldEditable('cuisines')) {
                e.preventDefault();
                return;
              }
              onShowCuisineModal();
            }}
          >
            {cuisinesLoading ? (
              <div className="flex items-center text-gray-500 text-sm">
                <div className="h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
                {t('restaurantprofile.loadingcuisines')}
              </div>
            ) : cuisinesError ? (
              <div className="flex items-center text-red-500 text-sm">
                {t('restaurantprofile.failedtoloadcuisines')}
              </div>
            ) : formData?.cuisines?.length > 0 ? (
              formData.cuisines.map((cuisineName) => (
                <span
                  key={cuisineName}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-accent text-black"
                >
                  {cuisineName}
                </span>
              ))
            ) : (
              <div className="flex items-center text-gray-500 text-sm">
                <Plus className="h-4 w-4 mr-1" />
                {t('restaurantprofile.selectcuisines')}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* QR Code Section */}
      {!newRestaurant && formData.restaurantId && (
        <div className="col-span-2 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
            {t('restaurantprofile.qrcode')}
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div
              ref={qrCodeRef}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <QRCode
                value={`https://kebapp-chefs.com/restaurant/${formData.restaurantId}`}
                size={150}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: formData.logo || restaurantLogo?.preview || '',
                  excavate: true,
                  width: 30,
                  height: 30,
                }}
              />
            </div>
            <div className="space-y-4 w-full">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t('restaurantprofile.restauranturl')}
                </p>
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={`https://kebapp-chefs.com/restaurant/${formData.restaurantId}`}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-l-md bg-gray-50"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-2 bg-brand-primary text-black rounded-r-md hover:bg-brand-primary/90 transition-colors"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadQRCode}
                  className="px-3 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors"
                >
                  {t('restaurantprofile.downloadqr')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUpload
          type="image"
          file={restaurantImage}
          onFileChange={(file) => onImageChange('image', file)}
          label={t('restaurantprofile.restaurantimage')}
          disabled={false}
        />
        <ImageUpload
          type="logo"
          file={restaurantLogo}
          onFileChange={(file) => onImageChange('logo', file)}
          label={t('restaurantprofile.restaurantlogo')}
          disabled={false}
        />
      </div>
    </div>
  );
}