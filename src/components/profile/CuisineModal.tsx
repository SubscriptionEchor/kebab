import { useState } from 'react';
import { Search, X } from 'lucide-react';
import LoadingState from '../LoadingState';

interface CuisineModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCuisines: string[];
  onCuisinesChange: (cuisines: string[]) => void;
  cuisines: any[];
  cuisinesError?: Error;
}

export default function CuisineModal({
  isOpen,
  onClose,
  selectedCuisines,
  onCuisinesChange,
  cuisines,
  cuisinesError
}: CuisineModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    if (checked) {
      onCuisinesChange([...selectedCuisines, cuisine]);
    } else {
      onCuisinesChange(selectedCuisines.filter(name => name !== cuisine));
    }
  };

  if (!isOpen) return null;

  const filteredCuisines = cuisines.filter(cuisine =>
    cuisine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Select Cuisines</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="p-6 max-h-[400px] overflow-y-auto">
          {cuisinesError ? (
            <div className="text-center py-4">
              <p className="text-red-600 mb-2">{cuisinesError.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-brand-primary hover:text-brand-primary/80"
              >
                Try again
              </button>
            </div>
          ) : filteredCuisines.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">
                {searchQuery
                  ? `No cuisines found matching "${searchQuery}"`
                  : 'No cuisines available'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-brand-primary hover:text-brand-primary/80 mt-2"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredCuisines.map((cuisine) => (
                <label key={cuisine._id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedCuisines.includes(cuisine.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onCuisinesChange([...selectedCuisines, cuisine.name]);
                      } else {
                        onCuisinesChange(selectedCuisines.filter(name => name !== cuisine.name));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{cuisine.name}</p>
                    <p className="text-sm text-gray-500">
                      {cuisine.description || `${cuisine.shopType} cuisine`}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors"
          >
            Apply Selection
          </button>
        </div>
      </div>
    </div>
  );
}