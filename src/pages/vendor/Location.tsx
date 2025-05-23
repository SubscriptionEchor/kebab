import { useState, useEffect } from 'react';
import { MapPin, Save } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Icon, LeafletMouseEvent } from 'leaflet';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import { getEnvVar } from '../../utils/env';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const icon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function SetViewOnClick({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (e: LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onMapClick
  });
  
  return null;
}

export default function VendorLocation() {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>>([]);
  const [showResults, setShowResults] = useState(false);
  const [country, setCountry] = useState('GERMANY');

  // Update OSM search URL when country changes
  const OSM_SEARCH_URL = getEnvVar('MAPS_URL', country);
  const TILE_URL = getEnvVar('TILES_URL');

  // Debounced search function
  const searchAddress = debounce(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(
        `${OSM_SEARCH_URL}/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to search address:', error);
      setSearchResults([]);
      setShowResults(false);
    }
  }, 300);

  // Handle address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    searchAddress(value);
  };

  // Handle search result selection
  const handleResultSelect = (result: { display_name: string; lat: string; lon: string }) => {
    setAddress(result.display_name);
    setPosition([parseFloat(result.lat), parseFloat(result.lon)]);
    setShowResults(false);
    toast.success('Location updated');
  };

  const handleAddressSearch = async () => {
    if (!address.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${OSM_SEARCH_URL}/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        toast.success('Location updated');
      } else {
        toast.error('Address not found');
      }
    } catch (error) {
      toast.error('Failed to search address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (e: LeafletMouseEvent) => {
    setPosition([e.latlng.lat, e.latlng.lng]);
  };

  const handleSave = () => {
    if (!address.trim()) {
      toast.error('Please enter an address');
      return;
    }
    toast.success('Location saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Restaurant Location</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-[600px] relative">
            {/* Country Selection Dropdown */}
            <div className="absolute top-4 right-4 z-[1000] bg-white rounded-md shadow-sm border border-gray-200">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="px-3 py-2 text-sm border-0 focus:ring-0 focus:outline-none bg-transparent"
              >
                <option value="GERMANY">Germany</option>
                <option value="AUSTRIA">Austria</option>
              </select>
            </div>
            <MapContainer
              center={position}
              zoom={13} 
              style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url={TILE_URL}
                attribution="Kebab Maps"
              />
              <Marker position={position} icon={icon} />
              <SetViewOnClick coords={position} />
              <MapClickHandler onMapClick={handleMapClick} />
            </MapContainer>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={handleAddressChange}
                      placeholder="Enter restaurant address"
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                    />
                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => handleResultSelect(result)}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <p className="font-medium text-gray-900">{result.display_name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {result.lat}, {result.lon}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAddressSearch}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Searching...' : 'Search Address'}
                </button>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Coordinates</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Latitude (Click map to update)
                      </label>
                      <input
                        type="text"
                        value={position[0].toFixed(6)}
                        readOnly
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md cursor-pointer"
                        title="Click on the map to update coordinates"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Longitude (Click map to update)
                      </label>
                      <input
                        type="text"
                        value={position[1].toFixed(6)}
                        readOnly
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md cursor-pointer"
                        title="Click on the map to update coordinates"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Instructions</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">1</span>
                Select your country from the dropdown
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">2</span>
                Enter your restaurant's address in the search box
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">3</span>
                Click "Search Address" to locate on map
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">4</span>
                Fine-tune the location by clicking on the map
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium mr-2">5</span>
                Click "Save Changes" to update your location
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}