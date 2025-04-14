import { Copy, Plus, Store, Upload } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface RestaurantProfileViewProps {
  formData: {
    restaurantId?: string;
    email?: string;
    phone?: string;
    name: string;
    address: string;
    shopType?: string;
    cuisines: string[];
  };
  restaurantImage: any;
  restaurantLogo: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImageChange: (type: 'image' | 'logo', file: any) => void;
  onShowCuisineModal: () => void;
  cuisinesLoading: boolean;
  cuisinesError: any;
  newRestaurant: boolean
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
  cuisinesError
}: RestaurantProfileViewProps) {
  const { t } = useTranslation();
  const { userType } = useAuth();

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Restaurant ID copied to clipboard');
  };

  const isFieldEditable = (fieldName: string): boolean => {
    const adminEditableFields = ['name', 'phone', 'address', 'cuisines'];
    const vendorEditableFields = ['address', 'cuisines'];
    if (newRestaurant) {
      return true
    };
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
        {!newRestaurant && <div>
          <label htmlFor="restaurantId" className="block text-sm font-medium text-gray-700 mb-1">
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
        </div>}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-shadow ${isFieldEditable('name')
              ? 'focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary'
              : 'bg-gray-50 cursor-not-allowed'
              }`}
          />
        </div>

        {!newRestaurant && <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-shadow ${isFieldEditable('name')
              ? 'focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary'
              : 'bg-gray-50 cursor-not-allowed'
              }`}
          />
        </div>}

        {!newRestaurant && <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
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
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-shadow ${isFieldEditable('phone')
              ? 'focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary'
              : 'bg-gray-50 cursor-not-allowed'
              }`}
          />
        </div>}

        <div className="col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
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
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-shadow resize-none ${isFieldEditable('address')
              ? 'focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary'
              : 'bg-gray-50 cursor-not-allowed'
              }`}
          />
        </div>

        {!newRestaurant && <div>
          <label htmlFor="shopType" className="block text-sm font-medium text-gray-700 mb-1">
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
        </div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('restaurantprofile.cuisines')}
            {cuisinesLoading && <span className="ml-2 text-xs text-gray-500">({t('restaurantprofile.loadingcuisines')})</span>}
          </label>
          <div
            className={`flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md ${isFieldEditable('cuisines')
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
