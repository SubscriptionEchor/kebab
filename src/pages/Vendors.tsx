import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { useQuery } from '@apollo/client';
import { GET_VENDORS } from '../lib/graphql/queries/vendors';
import { toast } from 'sonner';
import LoadingState from '../components/LoadingState';
import CopyableId from '../components/CopyableId';
import { useTranslation } from 'react-i18next';
import { useZones } from '../contexts/ZonesContext';
import { debounce } from 'lodash';

interface Restaurant {
  _id: string;
  orderId: string;
  orderPrefix: string;
  slug: string;
  name: string;
  image: string;
  address: string;
  location: {
    coordinates: number[];
    __typename: string;
  };
  zone: {
    _id: string;
    title: string;
    __typename: string;
  };
  shopType: string;
  __typename: string;
}

interface Vendor {
  _id: string;
  email: string;
  userType: string;
  restaurants: Restaurant[];
  __typename: string;
  isActive: boolean;
}

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  // Set default zone to "BERLIN_CITY"
  const [selectedZone, setSelectedZone] = useState('');
  const [zoneSearchQuery, setZoneSearchQuery] = useState('');
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const rowsPerPage = 10;
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { t } = useTranslation();
  const { zoneDetails } = useZones();
  const zoneDropdownRef = useRef<HTMLDivElement>(null);

  // GraphQL query using pagination and zoneIdentifier as variables.
  const { data: vendorsData, loading: vendorsLoading, error: vendorsError, refetch } = useQuery(GET_VENDORS, {
    variables: { input: { page: currentPage, zoneIdentifier: selectedZone } },
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Failed to fetch vendors:', error);
      toast.error(t('vendors.loadfailed'));
    }
  });

  // // Refetch when pagination or zone changes.
  // useEffect(() => {
  //   const inputParams = {
  //     page: currentPage,
  //     limit: rowsPerPage,
  //     ...(selectedZone && { zoneIdentifier: selectedZone }),
  //     ...(searchQuery && { searchTerm: searchQuery }),
  //   };
  //   refetch({
  //     input: inputParams
  //   });
  // }, [currentPage, rowsPerPage, selectedZone, searchQuery, refetch]);

  const debouncedRefetch = useCallback(
    debounce((params) => {
      refetch({ input: params });
    }, 1000),
    [refetch]
  );

  useEffect(() => {
    const inputParams = {
      page: currentPage,
      limit: rowsPerPage,
      ...(selectedZone && { zoneIdentifier: selectedZone }),
      ...(searchQuery && { searchTerm: searchQuery }),
    };

    // Call the debounced refetch
    debouncedRefetch(inputParams);

    // Cancel any pending debounced calls when effect dependencies change or component unmounts
    return () => {
      debouncedRefetch.cancel();
    };
  }, [currentPage, rowsPerPage, selectedZone, searchQuery, debouncedRefetch]);




  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (zoneDropdownRef.current && !zoneDropdownRef.current.contains(event.target as Node)) {
        setIsZoneDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter zones based on the zone search query.
  const filteredZones = useMemo(() => {
    if (!zoneDetails) return [];
    const query = zoneSearchQuery.toLowerCase();
    return zoneDetails.filter(zone => zone.title.toLowerCase().includes(query));
  }, [zoneDetails, zoneSearchQuery,]);

  // const filteredVendors = useMemo(() => {
  //   if (!vendorsData || !vendorsData.vendors || vendorsData.vendors.vendorList?.length === 0) return [];
  //   if (!searchQuery) {
  //     return vendorsData.vendors.vendorList
  //   }
  //   const query = searchQuery.toLowerCase();
  //   return vendorsData.vendors.vendorList.filter(vendor =>
  //     vendor.email.toLowerCase().includes(query) ||
  //     vendor.restaurants?.some(rest =>
  //       rest?.name?.toLowerCase().includes(query)
  //     )
  //   );
  // }, [vendorsData, searchQuery]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('vendors.title')}</h1>
        <div className="flex items-center space-x-4 relative">
          {/* <button
            onClick={() => setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {sortOrder === 'asc' ? `↑ ${t('vendors.ascending')}` : `↓ ${t('vendors.descending')}`}
          </button> */}
          {/* Custom Zone Dropdown */}
          <div className="relative" ref={zoneDropdownRef}>
            <button
              onClick={() => setIsZoneDropdownOpen(prev => !prev)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <span>
                {selectedZone
                  ? zoneDetails?.find(zone => zone.identifier === selectedZone)?.title || selectedZone
                  : t('vendors.allzones')}
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isZoneDropdownOpen && (
              <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg">
                <input
                  type="text"
                  placeholder={t('vendors.searchzones')}
                  value={zoneSearchQuery}
                  onChange={(e) => setZoneSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none"
                />
                <ul className="max-h-60 overflow-auto">
                  <li
                    onClick={() => {
                      setSelectedZone('');
                      setIsZoneDropdownOpen(false);
                    }}
                    className="cursor-pointer hover:bg-gray-100 px-3 py-2"
                  >
                    {t('vendors.allzones')}
                  </li>
                  {filteredZones.map((zone) => (
                    <li
                      key={zone.identifier}
                      onClick={() => {
                        setSelectedZone(zone.identifier);
                        setSearchQuery('')
                        setIsZoneDropdownOpen(false);
                      }}
                      className="cursor-pointer hover:bg-gray-100 px-3 py-2"
                    >
                      {zone.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('vendors.searchvendors')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex-1 flex flex-col">
        {vendorsError ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-red-500 font-medium">{t('vendors.loadfailed')}</div>
              <p className="text-gray-600 text-sm max-w-md text-center">
                {t('vendors.loadfaileddesc')}
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
              >
                {t('vendors.retry')}
              </button>
            </div>
          </div>
        ) : vendorsLoading ? (
          <LoadingState rows={5} />
        ) : !vendorsData || !vendorsData.vendors || vendorsData.vendors.vendorList?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {searchQuery.trim()
                ? t('vendors.novendorsmatching', { query: searchQuery })
                : t('vendors.novendorsfound')}
            </p>
            {searchQuery.trim() && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-brand-primary hover:text-brand-primary/80 font-medium"
              >
                {t('vendors.clearsearch')}
              </button>
            )}
          </div>
        ) : (
          <div className="table-container flex-1 flex flex-col">
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="table-header w-[35%]">{t('vendors.email')}</th>
                    <th className="table-header w-[15%]">{t('vendors.usertype')}</th>
                    <th className="table-header w-[35%]">{t('vendors.restaurants')}</th>
                    <th className="table-header text-right w-[15%]">{t('vendors.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendorsData?.vendors?.vendorList?.map((vendor: Vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="table-cell">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{vendor.email}</div>
                          <div className="text-xs text-gray-500 truncate">
                            <CopyableId label="Vendor ID" value={vendor._id} />
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-accent text-black">
                          {t('vendors.vendor')}
                          {vendor.isActive !== undefined && (
                            <span className={`ml-2 w-2 h-2 rounded-full ${vendor.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          )}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-2">
                          {vendor.restaurants?.length > 0 ? vendor.restaurants.slice(0, 2).map((restaurant) => (
                            <span
                              key={restaurant._id}
                              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 max-w-[200px]"
                              title={restaurant.address}
                            >
                              <div className="flex items-center space-x-2 w-full">
                                {restaurant.image ? (
                                  <img
                                    src={restaurant.image}
                                    alt={restaurant.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center">
                                    <span className="text-black font-medium">
                                      {restaurant.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <span className="truncate max-w-[150px]">{restaurant.name}</span>
                              </div>
                            </span>
                          )) : <p>-</p>}
                          {vendor.restaurants.length > 2 && (
                            <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-brand-accent text-black">
                              +{vendor.restaurants.length - 2} {t('vendors.more')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell text-right">
                        <button
                          onClick={() => navigate(`/dashboard/vendors/${vendor._id}/restaurants`)}
                          className="group inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-brand-accent transition-colors whitespace-nowrap"
                          aria-label={`${t('vendors.viewrestaurants')} for ${vendor.email}`}
                        >
                          <span className="text-brand-primary group-hover:text-black transition-colors">
                            {t('vendors.viewrestaurants')}
                          </span>
                          {vendor.restaurants.length > 0 && (
                            <span
                              className="ml-2 min-w-[1.5rem] h-6 px-2 inline-flex items-center justify-center text-xs font-medium bg-brand-primary text-black rounded-full group-hover:bg-black group-hover:text-white transition-colors"
                              aria-label={`${vendor.restaurants.length} restaurants`}
                            >
                              {vendor.restaurants.length}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-auto px-4 py-3 bg-white border-t border-gray-200">
              {vendorsData?.vendors?.pagination?.pages > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={vendorsData.vendors.pagination.pages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
