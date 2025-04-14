import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { toast } from 'sonner';
import { GET_RESTAURANT_ONBOARDING_APPLICATION } from '../../lib/graphql/queries/onboarding';
import { GET_RESTAURANT } from '../../lib/graphql/queries/restaurants';
import VendorProfileView from '../../components/profile/VendorProfileView';
import LoadingState from '../../components/LoadingState';
import { useTranslation } from 'react-i18next';

export default function VendorProfile() {
  const { t } = useTranslation();
  const location = useLocation();
  const { restaurantId } = useParams();
  const hasOnboardingId = location.state?.restaurantData?.onboardingApplicationId;
  const [applicationId, setApplicationId] = useState<string | null>(hasOnboardingId || null);

  // Query for restaurant data if we don't have onboarding ID
  const { data: restaurantData, loading: restaurantLoading } = useQuery(GET_RESTAURANT, {
    variables: { id: restaurantId },
    skip: !!hasOnboardingId,
    onCompleted: (data) => {
      if (data?.restaurant?.onboardingApplicationId) {
        setApplicationId(data.restaurant.onboardingApplicationId);
      }
    },
    onError: (error) => {
      console.error('Failed to fetch restaurant details:', error);
      toast.error(t('vendorprofile.failedtoloadrestaurantdetails'));
    }
  });

  useEffect(() => {
    if (hasOnboardingId) {
      setApplicationId(hasOnboardingId);
    }
  }, [hasOnboardingId]);

  // Query for vendor profile data
  const { data: vendorData, loading: vendorLoading } = useQuery(GET_RESTAURANT_ONBOARDING_APPLICATION, {
    variables: { applicationId },
    skip: !applicationId?.trim(),
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('🔵 Vendor Profile API Call:');
      console.log('- Application ID:', applicationId);
      console.log('- Response:', data);
      if (data?.getRestaurantOnboardingApplicationById) {
        console.log('- Vendor details:', {
          restaurantName: data.getRestaurantOnboardingApplicationById.restaurantName,
          status: data.getRestaurantOnboardingApplicationById.applicationStatus,
          owners: data.getRestaurantOnboardingApplicationById.beneficialOwners.length
        });
      }
    },
    onError: (error) => {
      if (applicationId && applicationId.trim()) {
        console.error('❌ Vendor Profile API Error:', {
          message: error.message,
          applicationId,
          stack: error.stack,
          networkError: error.networkError,
          graphQLErrors: error.graphQLErrors
        });
        toast.error(t('vendorprofile.failedtoloadvendorprofiledetails'));
      }
    }
  });

  if (restaurantLoading || vendorLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('vendorprofile.title')}</h1>
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <LoadingState rows={8} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!applicationId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('vendorprofile.title')}</h1>
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 text-center">
              <p className="text-gray-500">{t('vendorprofile.novendorprofiledata')}</p>
              <p className="text-sm text-gray-400 mt-2">
                {t('vendorprofile.noonboardingapplication')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">{t('vendorprofile.title')}</h1>
      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            <VendorProfileView
              loading={vendorLoading}
              data={vendorData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
