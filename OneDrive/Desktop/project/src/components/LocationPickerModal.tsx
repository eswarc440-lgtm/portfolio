/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Search, 
  Compass, 
  Loader2, 
  Check, 
  Map as MapIcon, 
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';

interface SelectedLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: SelectedLocation) => void;
  initialLat?: number;
  initialLon?: number;
  title?: string;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialLat = 16.5062, // Default: Vijayawada
  initialLon = 80.6480, // Default: Vijayawada
  title = "Select Operational Coordinates"
}) => {
  const safeLat = typeof initialLat === 'number' && !isNaN(initialLat) ? initialLat : 16.5062;
  const safeLon = typeof initialLon === 'number' && !isNaN(initialLon) ? initialLon : 80.6480;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mapType, setMapType] = useState<'street' | 'satellite' | 'terrain'>('street');
  const [mapCenter, setMapCenter] = useState<[number, number]>([safeLat, safeLon]);
  const [markerPos, setMarkerPos] = useState<[number, number]>([safeLat, safeLon]);
  
  // Geocoded address components
  const [resolvedAddress, setResolvedAddress] = useState<Partial<SelectedLocation>>({
    latitude: safeLat,
    longitude: safeLon,
    address: 'Fetching location address...',
    city: 'Vijayawada',
    district: 'NTR District',
    state: 'Andhra Pradesh',
    country: 'India',
    pincode: '520001'
  });
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const { coordinates: gpsCoords, loading: gpsLoading, error: gpsError, refetch: refetchGps } = useGeolocation();

  // Reverse Geocoding via Nominatim
  const performReverseGeocoding = async (lat: number, lon: number) => {
    setGeocodingLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      
      const addr = data.address || {};
      const fullAddress = data.display_name || `Coordinates: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      const city = addr.city || addr.town || addr.village || addr.suburb || 'Vijayawada';
      const district = addr.county || addr.district || 'NTR District';
      const state = addr.state || 'Andhra Pradesh';
      const country = addr.country || 'India';
      const pincode = addr.postcode || '520001';

      setResolvedAddress({
        latitude: lat,
        longitude: lon,
        address: fullAddress,
        city,
        district,
        state,
        country,
        pincode
      });
    } catch (err) {
      console.warn('Nominatim reverse-geocoding failed, using local fallback:', err);
      // Fallback details centered on Vijayawada
      setResolvedAddress({
        latitude: lat,
        longitude: lon,
        address: `Custom Position near Latitude ${lat.toFixed(5)}°, Longitude ${lon.toFixed(5)}°`,
        city: 'Vijayawada',
        district: 'NTR District',
        state: 'Andhra Pradesh',
        country: 'India',
        pincode: '520001'
      });
    } finally {
      setGeocodingLoading(false);
    }
  };

  // Forward Geocoding Search
  const handleSearch = async (queryStr: string = searchQuery) => {
    if (!queryStr.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);

    // Check if query is coordinates like "16.5062,80.6480"
    const coordMatch = queryStr.match(/^([-+]?\d{1,2}(?:\.\d+)?)\s*,\s*([-+]?\d{1,3}(?:\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      updateMapPosition(lat, lon);
      setSearchLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.warn('Nominatim forward-geocoding failed:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchResultClick = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    updateMapPosition(lat, lon);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  // Helper to update map marker and map view smoothly
  const updateMapPosition = (lat: number, lon: number) => {
    setMarkerPos([lat, lon]);
    setMapCenter([lat, lon]);
    
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 14);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      }
    }
    performReverseGeocoding(lat, lon);
  };

  // Handle GPS location retrieval
  const handleUseGps = () => {
    refetchGps();
  };

  useEffect(() => {
    if (gpsCoords) {
      updateMapPosition(gpsCoords.latitude, gpsCoords.longitude);
    }
  }, [gpsCoords]);

  // Initializing Leaflet Map
  useEffect(() => {
    if (!isOpen) return;

    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    // Destroy existing map if it was initialized
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: mapCenter,
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });
    mapRef.current = map;

    // Define tile layer
    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    if (mapType === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapType === 'terrain') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    }

    const tileLayer = L.tileLayer(url, { maxZoom: 19 });
    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Custom Blue Pin icon
    const customIcon = L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-10 w-10 rounded-full bg-rose-500 opacity-25 animate-ping"></span>
          <div style="background-color: #f43f5e; border: 3px solid white; border-radius: 50% 50% 50% 0; width: 32px; height: 32px; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
            <div style="background-color: white; border-radius: 50%; width: 10px; height: 10px; transform: rotate(45deg);"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    // Create Draggable Marker
    const marker = L.marker(markerPos, {
      icon: customIcon,
      draggable: true
    }).addTo(map);
    markerRef.current = marker;

    // Marker drag events
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setMarkerPos([position.lat, position.lng]);
      performReverseGeocoding(position.lat, position.lng);
    });

    // Map Click coordinates selection
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setMarkerPos([lat, lng]);
      performReverseGeocoding(lat, lng);
    });

    // Run reverse geocoding on startup coordinates
    performReverseGeocoding(safeLat, safeLon);

    // Force map size refresh safely
    const sizeTimeout = setTimeout(() => {
      if (map && map._container) {
        try {
          map.invalidateSize();
        } catch (e) {
          console.debug("Ignored map size refresh error:", e);
        }
      }
    }, 200);

    return () => {
      clearTimeout(sizeTimeout);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.debug("Ignored map removal error:", e);
        }
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, [isOpen]);

  // Update map layer on mapType changes
  useEffect(() => {
    const L = (window as any).L;
    if (mapRef.current && L && mapRef.current._container) {
      if (tileLayerRef.current) {
        try {
          mapRef.current.removeLayer(tileLayerRef.current);
        } catch (e) {
          console.debug("Ignored layer removal error:", e);
        }
      }

      let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      if (mapType === 'satellite') {
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      } else if (mapType === 'terrain') {
        url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      }

      const tileLayer = L.tileLayer(url, { maxZoom: 19 });
      tileLayer.addTo(mapRef.current);
      tileLayerRef.current = tileLayer;
    }
  }, [mapType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col w-full max-w-5xl h-[85vh] md:h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Block */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-850 tracking-tight">{title}</h3>
              <p className="text-xs text-slate-400">Drag pin or search to determine spatial coordinates</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search, Layer Picker, GPS Controller Panel */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/20 flex flex-col md:flex-row gap-3">
          
          {/* Autocomplete Input */}
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder="Search location (e.g. Vijayawada, Benz Circle, 16.505, 80.605)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-xl px-4 py-2.5 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all hover:border-slate-300 shadow-sm text-slate-800"
            />
            <Search className="absolute left-4 top-3 h-4.5 w-4.5 text-slate-400" />
            <button 
              onClick={() => handleSearch()}
              className="absolute right-2 top-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-all"
            >
              Search
            </button>

            {/* Suggestions list popup */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-[10000] max-h-48 overflow-y-auto overflow-x-hidden p-1.5">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchResultClick(result)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-600 border-b border-slate-50 last:border-0 transition-all line-clamp-1 flex items-center gap-2"
                  >
                    <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Map Type Switcher */}
            <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-0.5 flex">
              {(['street', 'satellite', 'terrain'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMapType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    mapType === t 
                      ? 'bg-white text-slate-850 shadow-sm border border-slate-200/50' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Use GPS Button */}
            <button
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="flex items-center gap-2 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-600 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {gpsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Compass className="h-4 w-4" />
              )}
              {gpsLoading ? 'Locating...' : 'My Location'}
            </button>
          </div>
        </div>

        {/* Map Stage & Coordinate Details Grid */}
        <div className="flex-1 flex flex-col md:flex-row relative">
          
          {/* Map canvas */}
          <div ref={mapContainerRef} className="flex-1 bg-slate-50 z-10 min-h-[250px]" />

          {/* Location details card sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/50 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-4 w-4 text-slate-500" />
                Selected Footprint Info
              </h4>

              {geocodingLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                  <span className="text-xs font-medium">Resolving address...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Coordinates Badge */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Latitude</div>
                      <div className="text-sm font-mono font-bold text-slate-800">{markerPos[0].toFixed(6)}</div>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-100" />
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Longitude</div>
                      <div className="text-sm font-mono font-bold text-slate-800">{markerPos[1].toFixed(6)}</div>
                    </div>
                  </div>

                  {/* Address Component list */}
                  <div className="space-y-3.5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Address</span>
                      <span className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed">
                        {resolvedAddress.address}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">District</span>
                        <span className="text-xs font-bold text-slate-700 truncate block">
                          {resolvedAddress.district}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">State</span>
                        <span className="text-xs font-bold text-slate-700 truncate block">
                          {resolvedAddress.state}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Pincode</span>
                        <span className="text-xs font-bold text-slate-700 truncate block">
                          {resolvedAddress.pincode}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Country</span>
                        <span className="text-xs font-bold text-slate-700 truncate block">
                          {resolvedAddress.country}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Actions */}
            <div className="mt-6 space-y-2.5">
              <button
                onClick={() => {
                  onSelect({
                    latitude: markerPos[0],
                    longitude: markerPos[1],
                    address: resolvedAddress.address || '',
                    city: resolvedAddress.city || '',
                    district: resolvedAddress.district || '',
                    state: resolvedAddress.state || '',
                    country: resolvedAddress.country || '',
                    pincode: resolvedAddress.pincode || ''
                  });
                  onClose();
                }}
                disabled={geocodingLoading}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white py-3 px-4 rounded-xl font-bold shadow-md shadow-rose-600/10 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Confirm Coordinates
              </button>
              <button
                onClick={onClose}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 px-4 rounded-xl font-bold transition-all text-xs text-center cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
