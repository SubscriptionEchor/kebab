import { useState, useEffect } from 'react';
import { MapPin, Save } from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  Popup,
} from 'react-leaflet';
import { Icon, LeafletMouseEvent } from 'leaflet';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import {
  useQuery,
  useMutation,
  useLazyQuery,
} from '@apollo/client';
import { GET_RESTAURANT, GET_RESTAURANT_LOCATION } from '../../lib/graphql/queries/restaurants';
import { CHECK_ZONE_RESTRICTIONS } from '../../lib/graphql/queries/zones';
import { ADMIN_DASHBOARD_BOOTSTRAP } from '../../lib/graphql/queries/admin';
import { UPDATE_RESTAURANT_LOCATION } from '../../lib/graphql/mutations/restaurants';
import LoadingState from '../../components/LoadingState';
import throttle from 'lodash/throttle';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import { config } from '../../constants';
import MapsComponent from '../../components/Maps';
// Assume t is a translation function available in your project, e.g. from i18next


interface OperationalZone {
  identifier: string;
  fallBackCoordinates: {
    latitude: number;
    longitude: number;
  };
}

interface ZoneResponse {
  data: {
    checkZoneRestrictions: {
      selectedZone: string | null;
      fallbackZone: string | null;
    };
  };
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
}



function SetViewOnClick({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (e: LeafletMouseEvent) => void;
}) {
  useMapEvents({
    click: onMapClick,
  });

  return null;
}



export default function RestaurantLocations() {
  const { t } = useTranslation();
  const { restaurantId } = useParams();
  const [position, setPosition] = useState<[number, number]>([52.52, 13.405]);
  const [isValidZone, setIsValidZone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [operationalZones, setOperationalZones] = useState<OperationalZone[]>([]);

  const [checkZoneRestrictions] = useLazyQuery(CHECK_ZONE_RESTRICTIONS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      const { selectedZone, fallbackZone } = data.checkZoneRestrictions;
      const isValid = Boolean(selectedZone);
      setIsValidZone(isValid);

      if (!isValid) {
        if (fallbackZone) {
          toast.error(t('location.fallbackzone'), {
            description: t('location.fallbackdescription'),
          });
        } else {
          toast.error(t('location.outsidezones'), {
            description: t('location.outsidezonesdescription'),
          });
        }
      } else if (selectedZone) {
        toast.success(t('location.activedelivery'));
      }
    },
    onError: (error) => {
      console.error('Failed to check zone restrictions:', error);
      toast.error(t('location.failedtovalidatelocation'));
      setIsValidZone(false);
    },
  });

  // Query for operational zones


  const { data, loading, error } = useQuery(GET_RESTAURANT_LOCATION, {
    variables: { id: restaurantId },
    onCompleted: (data) => {
      if (data?.restaurant) {
        if (data.restaurant.location?.coordinates) {
          const [longitude, latitude] = data.restaurant.location.coordinates;
          setPosition([parseFloat(latitude), parseFloat(longitude)]);
          // Validate initial position
          checkZoneRestrictions({
            variables: {
              inputValues: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
              },
            },
          });
        }
      }
    },
    onError: (error) => {
      console.error('Failed to fetch restaurant location:', error);
      toast.error(t('location.errorloadinglocation'));
    },
  });

  const validateZone = async (lat: number, lng: number): Promise<boolean> => {
    try {
      const { data } = await checkZoneRestrictions({
        variables: {
          inputValues: {
            latitude: lat,
            longitude: lng,
          },
        },
      });
      return Boolean(data?.checkZoneRestrictions?.selectedZone);
    } catch (error) {
      console.error('Failed to check zone restrictions:', error);
      toast.error(t('location.failedtovalidatelocation'));
      return false;
    }
  };

  const [updateLocation] = useMutation(UPDATE_RESTAURANT_LOCATION, {
    onCompleted: () => {
      toast.success(t('location.locationupdated'));
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error('Failed to update location:', error);
      toast.error(t('location.failedtoupdatelocation'));
      setIsSubmitting(false);
    },
  });

  const handleMapClick = async (e: LeafletMouseEvent) => {
    const BERLIN_BOUNDS = {
      north: 52.6755,
      south: 52.3382,
      east: 13.7611,
      west: 13.0878,
    };

    const isInBerlin =
      e.latlng.lat >= BERLIN_BOUNDS.south &&
      e.latlng.lat <= BERLIN_BOUNDS.north &&
      e.latlng.lng >= BERLIN_BOUNDS.west &&
      e.latlng.lng <= BERLIN_BOUNDS.east;

    if (!isInBerlin) {
      toast.error(t('location.locationmustinberlin'), {
        description: t('location.berlindescription'),
      });
      return;
    }

    setPosition([e.latlng.lat, e.latlng.lng]);

    try {
      const { data } = await checkZoneRestrictions({
        variables: {
          inputValues: {
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
          },
        },
      });

      const { selectedZone, fallbackZone } = data.checkZoneRestrictions;
      const isValid = Boolean(selectedZone);
      setIsValidZone(isValid);

      if (!isValid) {
        if (fallbackZone) {
          toast.error(t('location.fallbackzone'), {
            description: t('location.fallbackdescription'),
          });
        } else {
          toast.error(t('location.outsidezones'), {
            description: t('location.outsidezonesdescription'),
          });
        }
      } else if (selectedZone) {
        toast.success(t('location.activedelivery'));
      }
    } catch (error) {
      console.error('Failed to check zone restrictions:', error);
      toast.error(t('location.failedtovalidatelocation'));
      setIsValidZone(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await updateLocation({
        variables: {
          id: restaurantId,
          location: {
            latitude: position[0],
            longitude: position[1],
          },
        },
      });
    } catch (error) {
      console.error('Failed to update location:', error);
      toast.error(t('location.failedtoupdatelocation'));
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('location.title')}
        </h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 text-center">
            <p className="text-red-500 font-medium">{t('location.failedtoloadlocation')}</p>
            <p className="text-gray-600 text-sm mt-2">
              {t('location.errorloadinglocation')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('location.title')}
        </h1>
        <LoadingState rows={3} />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('location.title')}
        </h1>
        <button
          onClick={handleSave}
          disabled={isSubmitting || !isValidZone}
          className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? t('location.saving') : t('location.savechanges')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Map Section */}
        <MapsComponent 
          position={position} 
          setIsValidZone={setIsValidZone} 
          setPosition={setPosition}
          searchText={searchText}
          setSearchText={setSearchText}
          country={data?.restaurant?.country || 'GERMANY'}
        />

        {/* Address Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('location.locationdetails')}
              </h2>
              <div className="space-y-4">
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {t('location.currentcoordinates')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {t('location.latitude')}
                      </label>
                      <input
                        type="text"
                        value={position[0].toFixed(6)}
                        readOnly
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md cursor-pointer"
                        title={t('location.updatetitle')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {t('location.longitude')}
                      </label>
                      <input
                        type="text"
                        value={position[1].toFixed(6)}
                        readOnly
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md cursor-pointer"
                        title={t('location.updatetitle')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {t('location.instructions')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">
                  1
                </span>
                {t('location.instruction1')}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">
                  2
                </span>
                {t('location.instruction2')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
