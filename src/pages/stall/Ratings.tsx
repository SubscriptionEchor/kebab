import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_STALL_RATINGS } from '../../lib/graphql/queries/ratings';
import { useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LoadingState from '../../components/LoadingState';

interface Rating {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
  order: {
    orderNumber: string;
  };
}

export default function Ratings() {
  const { t } = useTranslation();
  const { stallId } = useParams();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const { data, loading } = useQuery(GET_STALL_RATINGS, {
    variables: { stallId },
  });

  if (loading) return <LoadingState />;

  const ratings = data?.stallRatings || [];
  const filteredRatings = selectedRating
    ? ratings.filter((rating: Rating) => rating.rating === selectedRating)
    : ratings;

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((acc: number, curr: Rating) => acc + curr.rating, 0) /
          ratings.length
        ).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('ratings.ratings')}</h1>
        <div className="flex items-center space-x-2">
          <Star className="h-6 w-6 text-yellow-400 fill-current" />
          <span className="text-2xl font-semibold">{averageRating}</span>
          <span className="text-gray-500">({ratings.length})</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="flex space-x-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              selectedRating === rating
                ? 'bg-brand-100 text-brand-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {rating}
            <Star className="h-4 w-4 ml-1" />
          </button>
        ))}
      </div>

      {/* Ratings List */}
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {filteredRatings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">{t('ratings.noratings')}</div>
        ) : (
          filteredRatings.map((rating: Rating) => (
            <div key={rating._id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{rating.user.name}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < rating.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {t('ratings.order')}: {rating.order.orderNumber}
                </div>
              </div>
              <p className="mt-2 text-gray-700">{rating.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 