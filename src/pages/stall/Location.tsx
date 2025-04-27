import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_STALL } from '../../lib/graphql/queries/stalls';
import { UPDATE_STALL_LOCATION } from '../../lib/graphql/mutations/stalls';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import LoadingState from '../../components/LoadingState';

interface Location {
  type: string;
  coordinates: [number, number];
}

function LocationMarker({ position, setPosition }: { position: [number, number]; setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return <Marker position={position} />;
}

export default function Location() {
  const { t } = useTranslation();
  const { stallId } = useParams();
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [isEditing, setIsEditing] = useState(false);

  const { data, loading } = useQuery(GET_STALL, {
    variables: { id: stallId },
    onCompleted: (data) => {
      if (data?.stall?.location?.coordinates) {
        setPosition(data.stall.location.coordinates);
      }
    },
  });

  const [updateLocation] = useMutation(UPDATE_STALL_LOCATION, {
    onCompleted: () => {
      toast.success(t('location.locationupdated'));
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Failed to update location:', error);
      toast.error(t('location.failedtoupdatelocation'));
    },
  });

  const handleSave = async () => {
    try {
      await updateLocation({
        variables: {
          stallId,
          location: {
            type: 'Point',
            coordinates: position,
          },
        },
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('location.location')}</h1>
        <div className="flex space-x-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              {t('common.edit')}
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                {t('common.save')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="h-[600px]">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {isEditing ? (
              <LocationMarker position={position} setPosition={setPosition} />
            ) : (
              <Marker position={position} />
            )}
          </MapContainer>
        </div>
      </div>

      {isEditing && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {t('location.clicktosetlocation')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 