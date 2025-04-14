import React, { useState, useEffect } from 'react';
import { Save, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@apollo/client';
import { uploadImage } from '../../lib/api/upload';
import { GET_RESTAURANT } from '../../lib/graphql/queries/restaurants';
import { EDIT_RESTAURANT } from '../../lib/graphql/mutations/restaurants';
import { useAuth } from '../../contexts/AuthContext';
import { GET_CUISINES } from '../../lib/graphql/queries/cuisines';
import { useParams, useLocation } from 'react-router-dom';
import CuisineModal from '../../components/profile/CuisineModal';
import RestaurantProfileView from '../../components/profile/RestaurantProfileView';
import LoadingState from '../../components/LoadingState';
import { useTranslation } from 'react-i18next';

interface FileWithPreview extends File {
  preview?: string;
}

export default function RestaurantProfile() {
  const { t } = useTranslation();
  const { userType } = useAuth();
  const { restaurantId } = useParams();
  const [showCuisineModal, setShowCuisineModal] = useState(false);
  const [restaurantImage, setRestaurantImage] = useState<FileWithPreview | null>(null);
  const [restaurantLogo, setRestaurantLogo] = useState<FileWithPreview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultLogo = 'https://placehold.co/100x100';

  const [editRestaurant] = useMutation(EDIT_RESTAURANT, {
    // onCompleted: () => {
    //   toast.success(t('restaurantprofile.profileupdated'));
    // },
    onError: (error) => {
      console.error('Failed to update restaurant:', error);
      toast.error(t('restaurantprofile.failedtoupdaterestaurantprofile'));
    }
  });
  const [formData, setFormData] = useState({
    restaurantId: '',
    email: '',
    phone: '',
    name: '',
    address: '',
    shopType: '',
    cuisines: [] as string[]
  });

  const { data: restaurantData, loading: restaurantLoading, error: restaurantError } = useQuery(GET_RESTAURANT, {
    variables: { id: restaurantId },
    onCompleted: (data) => {
      if (data?.restaurant) {
        setFormData({
          restaurantId: data.restaurant._id || '',
          email: data.restaurant.owner?.email || '',
          phone: data.restaurant.phone || '',
          name: data.restaurant.name || '',
          address: data.restaurant.address || '',
          shopType: data.restaurant.shopType || '',
          cuisines: data.restaurant.cuisines || []
        });

        if (data.restaurant.image) {
          setRestaurantImage({ preview: data.restaurant.image } as FileWithPreview);
        }
        if (data.restaurant.logo) {
          setRestaurantLogo({ preview: data.restaurant.logo } as FileWithPreview);
        }
      }
    },
    onError: (error) => {
      console.error('Failed to fetch restaurant details:', error);
      toast.error(t('restaurantprofile.failedtoloadrestaurantdetails'));
    }
  });
  const { data: cuisinesData, loading: cuisinesLoading, error: cuisinesError } = useQuery(GET_CUISINES);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error(t('restaurantprofile.restaurantnamerequired'));
      return;
    }

    const toastId = toast.loading(t('restaurantprofile.updatingrestaurantprofile'));
    setIsSubmitting(true);

    try {
      // Only upload new images if they've changed
      let newImageUrl = restaurantImage?.preview;
      let newLogoUrl = restaurantLogo?.preview;

      // Upload new restaurant image if changed
      if (restaurantImage?.preview?.includes('blob')) {
        const formData = new FormData();
        formData.append('file', restaurantImage);
        const uploadResult = await uploadImage(formData);
        if (uploadResult.success && uploadResult.url) {
          newImageUrl = uploadResult.url;
        } else {
          throw new Error(t('restaurantprofile.failedtouploadrestaurantimage'));
        }
      }

      // Upload new logo if changed
      if (restaurantLogo?.preview?.includes('blob')) {
        const formData = new FormData();
        formData.append('file', restaurantLogo);
        const uploadResult = await uploadImage(formData);
        if (uploadResult.success && uploadResult.url) {
          newLogoUrl = uploadResult.url;
        } else {
          throw new Error(t('restaurantprofile.failedtouploadrestaurantlogo'));
        }
      }

      const restaurantInput = {
        _id: formData.restaurantId,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        shopType: restaurantData?.restaurant?.shopType || 'Restaurant',
        cuisines: formData.cuisines,
        username: restaurantData?.restaurant?.username,
        password: restaurantData?.restaurant?.password,
        minimumOrder: restaurantData?.restaurant?.minimumOrder,
        tax: restaurantData?.restaurant?.tax,
        isAvailable: restaurantData?.restaurant?.isAvailable,
        orderPrefix: restaurantData?.restaurant?.orderPrefix,
        orderId: restaurantData?.restaurant?.orderId,
        slug: restaurantData?.restaurant?.slug,
        location: restaurantData?.restaurant?.location,
        openingTimes: restaurantData?.restaurant?.openingTimes
      };

      // Only include image/logo if they were changed
      if (newImageUrl) {
        restaurantInput['image'] = newImageUrl;
      }
      if (newLogoUrl) {
        restaurantInput['logo'] = newLogoUrl;
      }

      const { data } = await editRestaurant({
        variables: { restaurantInput }
      });

      if (!data?.editRestaurant) {
        throw new Error(t('restaurantprofile.failedtoupdaterestaurantprofile'));
      }

      toast.success(t('restaurantprofile.profileupdated'), { id: toastId });
    } catch (error) {
      console.error('Failed to update restaurant:', error);
      toast.error(
        error instanceof Error ? error.message : t('restaurantprofile.failedtoupdaterestaurantprofile'),
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (type: 'image' | 'logo', file: any) => {
    if (type === 'image') {
      setRestaurantImage(file);
    } else {
      setRestaurantLogo(file);
    }
  };

  if (restaurantLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{t('restaurantprofile.title')}</h1>
        </div>
        <LoadingState rows={6} />
      </div>
    );
  }

  if (restaurantError) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-red-500 font-medium">{t('restaurantprofile.failedtoloadrestaurantdetails')}</div>
          <p className="text-gray-600 text-sm max-w-md text-center">
            {t('restaurantprofile.errorloadingrestaurantdetails')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('restaurantprofile.title')}</h1>
        <button

          onClick={handleSave}
          disabled={isSubmitting}

          className=" px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
              {t('restaurantprofile.saving')}
            </>
          ) : (
            <>

              <Save className="h-4 w-4 mr-2" />

              {t('restaurantprofile.savechanges')}
            </>
          )}
        </button>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            <RestaurantProfileView
              formData={formData}
              restaurantImage={restaurantImage}
              restaurantLogo={restaurantLogo}
              onInputChange={handleInputChange}
              onImageChange={handleImageChange}
              onShowCuisineModal={() => setShowCuisineModal(true)}
              cuisinesLoading={cuisinesLoading}
              cuisinesError={cuisinesError}
              newRestaurant={false}
            />
          </div>
        </div>
      </div>

      {/* Cuisine Selection Modal */}
      {showCuisineModal && (
        <CuisineModal
          isOpen={showCuisineModal}
          onClose={() => setShowCuisineModal(false)}
          selectedCuisines={formData.cuisines}
          onCuisinesChange={(cuisines) => setFormData(prev => ({ ...prev, cuisines }))}
          cuisines={cuisinesData?.cuisines || []}
        />
      )}
    </div>
  );
}
