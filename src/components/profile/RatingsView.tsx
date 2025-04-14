import { Star } from 'lucide-react';
import { formatDate } from '../../utils/date';

interface Rating {
  _id: string;
  rating: number;
  review: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  order: {
    _id: string;
    orderId: string;
  };
}

interface RatingsViewProps {
  ratings: Rating[];
  averageRating?: number;
  totalRatings?: number;
}

export default function RatingsView({ ratings, averageRating = 0, totalRatings = 0 }: RatingsViewProps) {
  const ratingDistribution = {
    5: ratings.filter(r => r.rating === 5).length,
    4: ratings.filter(r => r.rating === 4).length,
    3: ratings.filter(r => r.rating === 3).length,
    2: ratings.filter(r => r.rating === 2).length,
    1: ratings.filter(r => r.rating === 1).length,
  };

  if (!ratings.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Star className="h-8 w-8 text-gray-300" />
            <p className="text-gray-500">No ratings or reviews yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        {/* Rating Summary */}
        <div className="flex items-start justify-between mb-8 border-b border-gray-200 pb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              {averageRating.toFixed(1)}
            </h2>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Based on {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2 min-w-[200px]">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex items-center min-w-[48px]">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="h-4 w-4 text-gray-400 ml-1" />
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{
                      width: `${(ratingDistribution[rating as keyof typeof ratingDistribution] / totalRatings) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 min-w-[32px]">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Reviews List */}
        <div className="space-y-6">
          {ratings.map((rating) => (
            <div 
              key={rating._id}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < rating.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {rating.user.name}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(rating.createdAt)}
                </span>
              </div>
              
              <p className="text-gray-600">{rating.review}</p>
              
              <div className="flex items-center text-sm text-gray-500">
                <span>Order #{rating.order.orderId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}