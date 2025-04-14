import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import { GET_RESTAURANT } from '../../lib/graphql/queries/restaurants';
import RatingsView from '../../components/profile/RatingsView';
import LoadingState from '../../components/LoadingState';
import { UPDATE_RATING_DATA } from '../../lib/graphql/mutations/ratings';
import { Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import RatingsComponent from '../../components/Ratings';

export default function Ratings({ newRestaurant }: any) {
  const { t } = useTranslation();
  const { userType } = useAuth();
  const { restaurantId } = useParams();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    reviewAverage: 0,
    reviewCount: 0,
    googleMapLink: ''
  });

  const { data, loading, error } = useQuery(GET_RESTAURANT, {
    variables: { id: restaurantId },
    fetchPolicy: 'cache-and-network',
    pollInterval: 0,
    onCompleted: (data) => {
      if (data?.restaurant) {
        setFormData({
          reviewAverage: parseFloat(data.restaurant.reviewAverage) || 0,
          reviewCount: parseInt(data.restaurant.reviewCount) || 0,
          googleMapLink: data.restaurant.googleMapLink || ''
        });
      }
    },
    onError: (error) => {
      console.error('Failed to fetch restaurant ratings:', error);
      const statusCode = (error.networkError as any)?.statusCode;
      if (statusCode === 400) {
        toast.error(t('ratings.invalidrequest'));
      } else {
        toast.error(t('ratings.errorloadingratings'));
      }
    },
    skip: newRestaurant
  });

  const [updateRatingData] = useMutation(UPDATE_RATING_DATA, {
    onCompleted: (data) => {
      if (data?.updateRatingDataAndGoogleLinkData) {
        const { reviewAverage, reviewCount, googleMapLink } = data.updateRatingDataAndGoogleLinkData;

        setFormData({
          reviewAverage: reviewAverage || 0,
          reviewCount: reviewCount || 0,
          googleMapLink: googleMapLink || ''
        });

        toast.success(t('ratings.ratingdataupdated'));
        setIsUpdating(false);
        setIsEditing(false);
      }
    },
    onError: (error) => {
      console.error('Failed to update rating data:', error);
      toast.error(error.message || t('ratings.failedtoupdateratingdata'));
      setIsUpdating(false);
    }
  });

  const handleSave = async () => {
    if (!restaurantId) {
      toast.error(t('ratings.restaurantidrequired'));
      return;
    }

    if (formData.reviewAverage < 0 || formData.reviewAverage > 5) {
      toast.error(t('ratings.averageratingrange'));
      return;
    }

    if (formData.reviewCount < 0) {
      toast.error(t('ratings.reviewcountnegative'));
      return;
    }

    if (!formData.googleMapLink.trim()) {
      toast.error(t('ratings.googlemapslinkrequired'));
      return;
    }

    setIsUpdating(true);

    try {
      await updateRatingData({
        variables: {
          input: {
            reviewAverage: parseFloat(formData.reviewAverage.toFixed(2)),
            reviewCount: Math.round(formData.reviewCount),
            googleMapLink: formData.googleMapLink
          }
        },
        context: {
          headers: {
            'restaurantId': restaurantId
          }
        }
      });
    } catch (error) {
      console.error('Failed to update rating data:', error);
      toast.error(t('ratings.failedtoupdateratingdata'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (data?.restaurant) {
      setFormData({
        reviewAverage: parseFloat(data.restaurant.reviewAverage) || 0,
        reviewCount: parseInt(data.restaurant.reviewCount || '0') || 0,
        googleMapLink: data.restaurant.googleMapLink || ''
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('ratings.title')}</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <LoadingState rows={5} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('ratings.title')}</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 text-center">
            <p className="text-red-500 font-medium">{t('ratings.failedtoloadratings')}</p>
            <p className="text-gray-600 text-sm mt-2">
              {t('ratings.errorloadingratings')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const restaurant = data?.restaurant;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('ratings.title')}</h1>
        <div className="flex items-center space-x-4">
          {isEditing && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>{t('ratings.cancel')}</span>
            </button>
          )}
          {userType == "ADMIN" && (
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isUpdating || (isEditing && !formData.googleMapLink.trim())}
              className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  {t('ratings.updating')}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{t('ratings.savechanges')}</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4" />
                      <span>{t('ratings.editratings')}</span>
                    </>
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <RatingsComponent isEditing={isEditing} formData={formData} setFormData={setFormData} />
    </div>
  );
}
