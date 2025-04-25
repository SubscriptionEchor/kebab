import { X } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getEnvVar } from '../utils/env';

const TILE_URL = getEnvVar('TILES_URL');

// Fix for default marker icon
const icon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface ViewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    name: string;
    startDate: string;
    endDate: string;
    dailyTimings: string;
    location: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export default function ViewEventModal({ isOpen, onClose, event }: ViewEventModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex justify-between items-start p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>
            <p className="text-sm text-gray-500 mt-1">View complete information about this event</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6">
          {/* Event Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Event Name
            </label>
            <div className="text-gray-900">
              {event.name}
            </div>
          </div>

          {/* Event Schedule */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Event Schedule
            </label>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Start Date</div>
                  <div className="text-gray-900">{event.startDate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">End Date</div>
                  <div className="text-gray-900">{event.endDate}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Daily Timings</div>
                <div className="text-gray-900">{event.dailyTimings}</div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Location
            </label>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Location Name</div>
                <div className="text-gray-900">{event.location}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Address</div>
                <div className="text-gray-900">{event.address}</div>
              </div>
              {/* Map View */}
              <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={[event.coordinates.lat, event.coordinates.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    url={TILE_URL}
                    attribution="Kebab Maps"
                  />
                  <Marker 
                    position={[event.coordinates.lat, event.coordinates.lng]}
                    icon={icon}
                  />
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 