import { useState } from 'react';
import { X, Search, Store } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_STALLS_BY_OWNER } from '../lib/graphql/queries/stalls';
import LoadingState from './LoadingState';
import { useTranslation } from 'react-i18next';

interface ExistingStallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (stall: any) => void;
  ownerId?: string;
}

export default function ExistingStallModal({
  isOpen,
  onClose,
  onAdd,
  ownerId = "default-owner" // You should pass the actual owner ID from parent
}: ExistingStallModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();
  const { data, loading, error } = useQuery(GET_STALLS_BY_OWNER, {
    variables: { ownerId },
    skip: !ownerId
  });

  const filteredStalls = data?.getStallsByOwner?.filter((stall: any) =>
    stall.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{t('existingStallModal.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t('existingStallModal.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {loading ? (
            <LoadingState rows={3} />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load stalls</p>
            </div>
          ) : filteredStalls.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('existingStallModal.noResults')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto">
              {filteredStalls.map((stall: any) => (
                <div
                  key={stall._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                      {stall.image ? (
                        <img
                          src={stall.image}
                          alt={stall.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Store className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{stall.name}</h3>
                      <p className="text-sm text-gray-500">{stall.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onAdd({
                          id: stall._id,
                          name: stall.name,
                          cuisine: 'Various',
                          profilePhoto: stall.image || '/images/default-stall.png',
                          isActive: stall.isActive && stall.isAvailable,
                          timings: {
                            monday: { startTime: '09:00', endTime: '17:00', isOpen: true },
                            tuesday: { startTime: '09:00', endTime: '17:00', isOpen: true },
                            wednesday: { startTime: '09:00', endTime: '17:00', isOpen: true },
                            thursday: { startTime: '09:00', endTime: '17:00', isOpen: true },
                            friday: { startTime: '09:00', endTime: '17:00', isOpen: true },
                            saturday: { startTime: '09:00', endTime: '17:00', isOpen: true },
                            sunday: { startTime: '09:00', endTime: '17:00', isOpen: true }
                          }
                        });
                        onClose();
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
