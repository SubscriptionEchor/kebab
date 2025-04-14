import { useMemo } from 'react';
import { Search, Target, Gift, Calendar, Power } from 'lucide-react';
import Pagination from '../Pagination';
import LoadingState from '../LoadingState';
import { getCurrencySymbol } from '../../utils/currency';

interface OfferListProps {
  offers: any[];
  isLoading: boolean;
  error: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  handleToggleStatus: (id: string, status: boolean) => void;
  isToggling: string | null;
}

export default function OfferList({
  offers,
  isLoading,
  error,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  totalPages,
  handleToggleStatus,
  isToggling
}: OfferListProps) {
  const currencySymbol = getCurrencySymbol();

  if (isLoading) {
    return <LoadingState rows={5} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-red-500 font-medium">Failed to load offers</div>
          <p className="text-gray-600 text-sm max-w-md text-center">
            There was an error loading the offers. Please try again or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">
          {searchQuery.trim() 
            ? `No offers found matching "${searchQuery}"`
            : 'No offers found'
          }
        </p>
        {searchQuery.trim() && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-brand-primary hover:text-brand-primary/80 font-medium"
          >
            Clear search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="table-header" style={{ width: '15%' }}>Code</th>
              <th className="table-header" style={{ width: '15%' }}>Type</th>
              <th className="table-header" style={{ width: '15%' }}>Value</th>
              <th className="table-header" style={{ width: '15%' }}>Min. Order</th>
              <th className="table-header" style={{ width: '25%' }}>Duration</th>
              <th className="table-header" style={{ width: '15%' }}>Status</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr key={offer._id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="table-cell">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-accent text-black">
                    {offer.couponCode}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center">
                    {!offer.promotion ? (
                      <Target className="h-4 w-4 mr-2 text-[#F04438]" />
                    ) : (
                      <Gift className="h-4 w-4 mr-2 text-[#F04438]" />
                    )}
                    <span>{offer.promotion ? 'PROMOTION' : 'CAMPAIGN'}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-1">
                    {offer.campaignType === 'PERCENTAGE' ? (
                      <span>{offer.percentageDiscount}% OFF</span>
                    ) : (
                      <span>{offer.flatDiscount}{currencySymbol} OFF</span>
                    )}
                  </div>
                </td>
                <td className="table-cell font-medium">{offer.minimumOrderValue}{currencySymbol}</td>
                <td className="table-cell">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{offer.startDate} - {offer.endDate}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`status-badge ${
                    offer.isActive
                      ? 'bg-green-100 text-green-800 ring-1 ring-green-600/20'
                      : 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20'
                  }`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end pr-6">
                    <button
                      onClick={() => handleToggleStatus(offer._id, offer.isActive)}
                      disabled={isToggling === offer._id}
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                        offer.isActive
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gray-300 hover:bg-gray-400'
                      } ${isToggling === offer._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={offer.isActive ? 'Deactivate offer' : 'Activate offer'}
                    >
                      {isToggling === offer._id ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Power className="h-4 w-4 text-white" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 px-4 py-3 bg-white border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}