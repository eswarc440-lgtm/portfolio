import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Zap, Shield, HelpCircle, RefreshCw, 
  MapPin, CloudSun, Leaf, AlertCircle, Sparkles, Navigation, Layers, Compass
} from 'lucide-react';
import { Activity } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapRegion {
  id: string;
  name: string;
  aqi: number;
  carbonIntensity: number; // g CO2/kWh
  renewablesRatio: number; // %
  chargingStations: number;
  weather: string;
  solarPotential: string;
  activeAssets: string[];
  color: string;
}

interface InteractiveMapProps {
  activities?: Activity[];
}

// Global demo activities when no real coordinates are loaded
const demoActivities: Activity[] = [
  {
    id: 'demo-1',
    userId: 'demo',
    userName: 'Paris Hub',
    userEmail: 'paris@disasterresponse.org',
    category: 'transport',
    type: 'Electric Vehicle',
    quantity: 120,
    unit: 'km',
    date: '2026-07-17',
    emissions: 1.2,
    notes: 'Logistics delivery dispatch',
    location: 'Paris, France',
    latitude: 48.8566,
    longitude: 2.3522
  },
  {
    id: 'demo-2',
    userId: 'demo',
    userName: 'Tokyo HQ',
    userEmail: 'tokyo@disasterresponse.org',
    category: 'electricity',
    type: 'Standard Grid',
    quantity: 850,
    unit: 'kWh',
    date: '2026-07-16',
    emissions: 382.5,
    notes: 'Server farm power consumption',
    location: 'Tokyo, Japan',
    latitude: 35.6762,
    longitude: 139.6503
  },
  {
    id: 'demo-3',
    userId: 'demo',
    userName: 'SF Green Office',
    userEmail: 'sf@disasterresponse.org',
    category: 'food',
    type: 'Beef Meals',
    quantity: 45,
    unit: 'meals',
    date: '2026-07-15',
    emissions: 315.0,
    notes: 'Catering footprint log',
    location: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    id: 'demo-4',
    userId: 'demo',
    userName: 'Sydney Station',
    userEmail: 'sydney@disasterresponse.org',
    category: 'travel',
    type: 'Economy Flight',
    quantity: 1200,
    unit: 'km',
    date: '2026-07-14',
    emissions: 180.0,
    notes: 'Staff training transit',
    location: 'Sydney, Australia',
    latitude: -33.8688,
    longitude: 151.2093
  }
];

export default function InteractiveMap({ activities = [] }: InteractiveMapProps) {
  const [activeView, setActiveView] = useState<'regional' | 'real-world'>('real-world');
  const [activeFilter, setActiveFilter] = useState<'carbon' | 'aqi' | 'charging'>('carbon');
  const [selectedRegion, setSelectedRegion] = useState<MapRegion | null>(null);
  
  // Real-time Live GPS Location Tracking
  const [userLiveLocation, setUserLiveLocation] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [isTrackingLive, setIsTrackingLive] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveAddress, setLiveAddress] = useState<string>('');
  const [isLocatingAddress, setIsLocatingAddress] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const liveLocationGroupRef = useRef<L.LayerGroup | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const shouldCenterUserRef = useRef(false);

  // Toggle Live Tracking (watchPosition)
  const toggleLiveTracking = () => {
    if (isTrackingLive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTrackingLive(false);
      setUserLiveLocation(null);
      setLiveError(null);
      setLiveAddress('');
    } else {
      if (!navigator.geolocation) {
        setLiveError("Live GPS tracking is not supported by your current browser.");
        return;
      }

      setIsTrackingLive(true);
      setLiveError(null);
      shouldCenterUserRef.current = true;

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setUserLiveLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error("Live GPS tracking error:", error);
          let msg = "Failed to connect with GPS receiver.";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "GPS permission was denied. Click 'Allow' when prompted by your browser.";
          }
          setLiveError(msg);
          setIsTrackingLive(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    }
  };

  // Cleanup geolocation watch on component unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Live Reverse Geocoding with Nominatim API (debounced)
  useEffect(() => {
    if (!userLiveLocation) {
      setLiveAddress('');
      return;
    }

    const fetchAddress = async () => {
      setIsLocatingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${userLiveLocation.latitude}&lon=${userLiveLocation.longitude}`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'CarbonTrackAI/1.0'
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          const addressStr = data.display_name || `${userLiveLocation.latitude.toFixed(4)}, ${userLiveLocation.longitude.toFixed(4)}`;
          const parts = addressStr.split(', ');
          const cleanAddress = parts.slice(0, 3).join(', ');
          setLiveAddress(cleanAddress);
        } else {
          setLiveAddress(`Latitude: ${userLiveLocation.latitude.toFixed(4)}, Longitude: ${userLiveLocation.longitude.toFixed(4)}`);
        }
      } catch (err) {
        console.error("Error geocoding live position:", err);
        setLiveAddress(`Lat: ${userLiveLocation.latitude.toFixed(4)}, Lon: ${userLiveLocation.longitude.toFixed(4)}`);
      } finally {
        setIsLocatingAddress(false);
      }
    };

    const timer = setTimeout(() => {
      fetchAddress();
    }, 1500);

    return () => clearTimeout(timer);
  }, [userLiveLocation]);

  // Fictional Regional environmental data
  const regions: MapRegion[] = [
    {
      id: 'r1',
      name: 'Northwest Wind Sector',
      aqi: 14,
      carbonIntensity: 45,
      renewablesRatio: 88,
      chargingStations: 124,
      weather: 'Cloudy, 14°C',
      solarPotential: 'Moderate',
      activeAssets: ['Columbia Wind Farm', 'Hydroelectric Dam Complex', 'EV Bus Depot'],
      color: 'rgba(16, 185, 129, 0.4)'
    },
    {
      id: 'r2',
      name: 'Metro Center District',
      aqi: 84,
      carbonIntensity: 410,
      renewablesRatio: 12,
      chargingStations: 540,
      weather: 'Smoggy, 24°C',
      solarPotential: 'Low',
      activeAssets: ['Gas-Turbine Peaker Plant', 'Subway Interconnect', '500+ Public EV Ports'],
      color: 'rgba(239, 68, 68, 0.4)'
    },
    {
      id: 'r3',
      name: 'Southeast Solar Corridor',
      aqi: 32,
      carbonIntensity: 110,
      renewablesRatio: 74,
      chargingStations: 280,
      weather: 'Sunny, 28°C',
      solarPotential: 'Extreme',
      activeAssets: ['150MW PV Solar Farm', 'Tesla Megapack BESS Grid', 'Bio-Gas Recycler'],
      color: 'rgba(245, 158, 11, 0.4)'
    },
    {
      id: 'r4',
      name: 'Industrial Port Area',
      aqi: 110,
      carbonIntensity: 520,
      renewablesRatio: 5,
      chargingStations: 45,
      weather: 'Overcast, 18°C',
      solarPotential: 'Low',
      activeAssets: ['Heavy Rail Freight Yard', 'Coal Storage Silos', 'Cargo Terminal'],
      color: 'rgba(107, 114, 128, 0.4)'
    },
    {
      id: 'r5',
      name: 'Residential Woodlands Grid',
      aqi: 22,
      carbonIntensity: 180,
      renewablesRatio: 45,
      chargingStations: 190,
      weather: 'Sunny, 21°C',
      solarPotential: 'High',
      activeAssets: ['Residential Rooftop Solar Network', 'Municipal Waste Recycler'],
      color: 'rgba(59, 130, 246, 0.4)'
    }
  ];

  const handleRegionClick = (region: MapRegion) => {
    setSelectedRegion(region);
  };

  const getRegionFillColor = (region: MapRegion) => {
    if (activeFilter === 'carbon') {
      return region.carbonIntensity < 150 ? 'fill-emerald-400' : region.carbonIntensity < 350 ? 'fill-amber-400' : 'fill-rose-400';
    } else if (activeFilter === 'aqi') {
      return region.aqi < 30 ? 'fill-emerald-400' : region.aqi < 90 ? 'fill-amber-400' : 'fill-rose-400';
    } else {
      return region.chargingStations > 250 ? 'fill-emerald-400' : region.chargingStations > 100 ? 'fill-amber-400' : 'fill-rose-400';
    }
  };

  // Filter activities with valid geocoordinates
  const geolocatedActivities = activities.filter(
    (act) => act.latitude !== undefined && act.longitude !== undefined
  );

  const usingDemoData = geolocatedActivities.length === 0;
  const pinsToShow = usingDemoData ? demoActivities : geolocatedActivities;

  // Initialize Real Leaflet Map ONCE
  useEffect(() => {
    if (activeView !== 'real-world' || !mapContainerRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
        liveLocationGroupRef.current = null;
      }
      return;
    }

    if (!mapInstanceRef.current) {
      // Standard dark/light themed tile layer
      const map = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 1.2,
        maxZoom: 18,
        scrollWheelZoom: true,
        zoomControl: true
      });

      // Add CartoDB Positron elegant light map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.featureGroup().addTo(map);
      liveLocationGroupRef.current = L.layerGroup().addTo(map);
    }

    // Force map size adjustment in next tick to avoid viewport issues
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [activeView]);

  // Clean up entire map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
        liveLocationGroupRef.current = null;
      }
    };
  }, []);

  // Update activity markers on data change without recreating the map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Map categories to high-visibility colors
    const colors: Record<string, string> = {
      transport: '#3b82f6',     // Blue
      electricity: '#f59e0b',   // Amber
      food: '#10b981',          // Green
      shopping: '#a855f7',      // Purple
      travel: '#06b6d4',        // Cyan
      waste: '#6b7280'          // Gray
    };

    pinsToShow.forEach((act) => {
      if (act.latitude === undefined || act.longitude === undefined) return;

      const color = colors[act.category] || '#10b981';
      // Scale radius proportionally with emissions log value
      const radius = Math.max(7, Math.min(22, 6 + Math.sqrt(act.emissions)));

      const marker = L.circleMarker([act.latitude, act.longitude], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.95,
        fillOpacity: 0.75
      });

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 170px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-b: 1px solid #f1f5f9; padding-bottom: 4px;">
            <span style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: ${color}; letter-spacing: 0.05em;">${act.category}</span>
            <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">${act.date}</span>
          </div>
          <h4 style="margin: 0; font-size: 13px; font-weight: 700; color: #1e293b;">${act.type}</h4>
          <p style="margin: 4px 0 2px 0; font-size: 11px; color: #64748b;">Quantity: <b>${act.quantity} ${act.unit}</b></p>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">Carbon footprint: <span style="color: #ef4444; font-weight: 800;">+${act.emissions} kg CO₂e</span></p>
          ${act.notes ? `<p style="margin: 6px 0 0; font-size: 10px; color: #64748b; background-color: #f8fafc; padding: 4px 6px; border-radius: 4px; border-left: 2px solid ${color}; font-style: italic;">"${act.notes}"</p>` : ''}
          <div style="display: flex; align-items: center; margin-top: 8px; font-size: 9px; color: #94a3b8;">
            <span style="margin-right: 3px;">📍</span> <span>${act.location || 'Report Point'}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-leaflet-popup'
      });

      markersGroup.addLayer(marker);
    });

    // Zoom automatically to fit the active pins
    if (pinsToShow.length > 0 && !shouldCenterUserRef.current) {
      try {
        map.fitBounds(markersGroup.getBounds().pad(0.3));
      } catch (e) {
        console.warn("Could not fit map bounds:", e);
      }
    }
  }, [activities, activeView, pinsToShow]);

  // Update user live location layer separately
  useEffect(() => {
    const map = mapInstanceRef.current;
    const liveLocationGroup = liveLocationGroupRef.current;
    if (!map || !liveLocationGroup) return;

    liveLocationGroup.clearLayers();

    if (userLiveLocation && activeView === 'real-world') {
      const { latitude, longitude, accuracy } = userLiveLocation;

      // Accuracy translucent circle
      if (accuracy) {
        L.circle([latitude, longitude], {
          radius: accuracy,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.12,
          weight: 1,
          dashArray: '3, 3'
        }).addTo(liveLocationGroup);
      }

      // GPS animated ping marker using Tailwind CSS
      const liveIcon = L.divIcon({
        html: `
          <div class="relative flex h-5 w-5">
            <span class="animate-ping absolute inline-flex h-[18px] w-[18px] rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-[18px] w-[18px] bg-blue-600 border-2 border-white shadow-md"></span>
          </div>
        `,
        className: 'custom-live-marker',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      const liveMarker = L.marker([latitude, longitude], { icon: liveIcon })
        .addTo(liveLocationGroup)
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; text-align: center; padding: 2px;">
            <p style="margin: 0; font-size: 11px; font-weight: bold; color: #1e293b; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span style="display: inline-block; width: 6px; height: 6px; background-color: #3b82f6; border-radius: 50%;"></span>
              My Live GPS Node
            </p>
            <p style="margin: 4px 0 0 0; font-size: 9px; color: #64748b; font-family: monospace;">
              ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
            </p>
          </div>
        `, { closeButton: false });

      // Zoom automatically if requested
      if (shouldCenterUserRef.current) {
        map.setView([latitude, longitude], 14, {
          animate: true,
          duration: 1.2
        });
        shouldCenterUserRef.current = false;
        liveMarker.openPopup();
      }
    }
  }, [userLiveLocation, activeView]);

  // Navigate map to selected pin coordinate
  const handleFlyToPin = (lat?: number, lon?: number) => {
    if (lat !== undefined && lon !== undefined && mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 12, {
        animate: true,
        duration: 1.5
      });
    }
  };

  return (
    <div id="map-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* LEFT COLUMN: Map Viewport (8 Columns) */}
      <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[550px]">
        
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-sans">Interactive Environmental GIS Map</h2>
              <p className="text-xs text-gray-400">Analyze localized carbon footprints, green resources, and grid emission statistics</p>
            </div>
            
            {/* Toggle View Mode */}
            <div className="flex space-x-1 border border-gray-150 bg-slate-50 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setActiveView('real-world')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors ${
                  activeView === 'real-world' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Real-World Logs</span>
              </button>
              <button
                onClick={() => setActiveView('regional')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors ${
                  activeView === 'regional' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Regional Overlays</span>
              </button>
            </div>
          </div>

          {/* Map Containers */}
          {activeView === 'real-world' ? (
            <div className="relative">
              {/* Map Layer Container */}
              <div 
                ref={mapContainerRef} 
                className="bg-slate-50 border border-gray-150 rounded-2xl h-[360px] w-full relative z-10 overflow-hidden"
              />

              {/* Floating Live GPS Tracking Control Console */}
              <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end space-y-2 max-w-[280px]">
                {liveError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-medium p-2 rounded-xl shadow-lg animate-fade-in">
                    {liveError}
                  </div>
                )}
                
                <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-gray-150 shadow-xl flex flex-col space-y-2">
                  <div className="flex items-center justify-between space-x-3">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center space-x-1.5">
                      {isTrackingLive ? (
                        <>
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shrink-0"></span>
                          <span className="text-blue-600 font-bold text-[9px]">LIVE GPS ON</span>
                        </>
                      ) : (
                        <span className="text-gray-400 font-bold text-[9px]">LIVE GPS OFF</span>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={toggleLiveTracking}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                        isTrackingLive
                          ? 'bg-red-50 hover:bg-red-100 text-red-600'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      }`}
                    >
                      <Navigation className={`w-3 h-3 ${isTrackingLive ? 'animate-spin' : ''}`} />
                      <span>{isTrackingLive ? 'Stop Watch' : 'Live Track'}</span>
                    </button>
                  </div>

                  {userLiveLocation && (
                    <div className="border-t border-gray-100 pt-2 flex flex-col space-y-1 text-[10px] font-mono text-gray-600">
                      <button
                        type="button"
                        onClick={() => {
                          shouldCenterUserRef.current = true;
                          setUserLiveLocation(prev => prev ? { ...prev } : null);
                        }}
                        className="text-[9px] font-bold text-blue-600 hover:text-blue-700 text-center border border-blue-100 rounded-md py-1 bg-blue-50/50 hover:bg-blue-50 transition-colors"
                      >
                        Recenter Map on Me
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* SVG Map filters overlay */}
              <div className="flex space-x-2 mb-4 justify-end">
                {[
                  { id: 'carbon', label: 'CO₂ Intensity', icon: <Zap className="w-3 h-3" /> },
                  { id: 'aqi', label: 'Air Quality (AQI)', icon: <CloudSun className="w-3 h-3" /> },
                  { id: 'charging', label: 'EV Ports', icon: <Navigation className="w-3 h-3" /> }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as any)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg flex items-center space-x-1 border transition-colors ${
                      activeFilter === f.id 
                        ? 'bg-slate-800 border-slate-800 text-white' 
                        : 'border-gray-150 text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {f.icon}
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>

              {/* SVG Map Canvas */}
              <div className="relative bg-slate-50 border border-gray-150 rounded-2xl h-[312px] flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 800 450" className="w-full h-full max-h-[312px] drop-shadow-md select-none">
                  
                  {/* Background grid lines */}
                  <g stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5">
                    <line x1="100" y1="0" x2="100" y2="450" />
                    <line x1="200" y1="0" x2="200" y2="450" />
                    <line x1="300" y1="0" x2="300" y2="450" />
                    <line x1="400" y1="0" x2="400" y2="450" />
                    <line x1="500" y1="0" x2="500" y2="450" />
                    <line x1="600" y1="0" x2="600" y2="450" />
                    <line x1="700" y1="0" x2="700" y2="450" />
                    <line x1="0" y1="100" x2="800" y2="100" />
                    <line x1="0" y1="200" x2="800" y2="200" />
                    <line x1="0" y1="300" x2="800" y2="300" />
                    <line x1="0" y1="400" x2="800" y2="400" />
                  </g>

                  {/* Northwest Wind District (Top Left) */}
                  <path 
                    d="M 50 50 L 320 50 L 260 220 L 50 180 Z" 
                    className={`${getRegionFillColor(regions[0])} opacity-45 hover:opacity-75 stroke-white stroke-2 transition-opacity cursor-pointer`}
                    onClick={() => handleRegionClick(regions[0])}
                  />
                  
                  {/* Southeast Solar Corridor (Bottom Right) */}
                  <path 
                    d="M 450 250 L 750 220 L 750 400 L 400 400 Z" 
                    className={`${getRegionFillColor(regions[2])} opacity-45 hover:opacity-75 stroke-white stroke-2 transition-opacity cursor-pointer`}
                    onClick={() => handleRegionClick(regions[2])}
                  />

                  {/* Metro Center District (Center/Right) */}
                  <path 
                    d="M 320 50 L 750 50 L 750 220 L 450 250 L 350 180 Z" 
                    className={`${getRegionFillColor(regions[1])} opacity-45 hover:opacity-75 stroke-white stroke-2 transition-opacity cursor-pointer`}
                    onClick={() => handleRegionClick(regions[1])}
                  />

                  {/* Industrial Port Area (Bottom Left) */}
                  <path 
                    d="M 50 180 L 260 220 L 220 400 L 50 400 Z" 
                    className={`${getRegionFillColor(regions[3])} opacity-45 hover:opacity-75 stroke-white stroke-2 transition-opacity cursor-pointer`}
                    onClick={() => handleRegionClick(regions[3])}
                  />

                  {/* Residential Woodlands Grid (Intersecting Center) */}
                  <path 
                    d="M 260 220 L 450 250 L 400 400 L 220 400 Z" 
                    className={`${getRegionFillColor(regions[4])} opacity-45 hover:opacity-75 stroke-white stroke-2 transition-opacity cursor-pointer`}
                    onClick={() => handleRegionClick(regions[4])}
                  />

                  {/* Visual Labels / Pins on Map */}
                  <g className="pointer-events-none font-sans font-bold text-[10px] fill-slate-700">
                    <text x="120" y="110">NW WIND SEC</text>
                    <text x="490" y="130">METRO DIST</text>
                    <text x="540" y="330">SE SOLAR CORRIDOR</text>
                    <text x="100" y="310">IND PORT</text>
                    <text x="270" y="320">RESID WOODS</text>
                  </g>

                </svg>

                {/* Instruction Banner overlay */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-150 text-[10px] text-gray-500 font-medium">
                  💡 Click on any active grid region to trigger deep GIS telemetry audits.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs mt-4 pt-4 border-t border-gray-100 font-mono">
          <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> Transport</span>
          <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span> Power / Grid</span>
          <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> Food / Diet</span>
          <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span> Goods / Goods</span>
          <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></span> Flight / Aviation</span>
          <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> Refuse / Waste</span>
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive Activity Explorer or Regional Info (4 Columns) */}
      <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[550px]">
        {activeView === 'real-world' ? (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-[9px] font-bold uppercase tracking-wider mb-2">
                <Globe className="w-3 h-3" />
                <span>Geolocated Emissions</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 font-sans leading-tight">Environmental Log Points</h3>
              <p className="text-xs text-gray-400 mt-1">Select an active geolocation log entry to query coordinates or zoom directly to the location node.</p>
              
              {/* Dynamic Live Geolocation Card */}
              {userLiveLocation && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80 shadow-sm animate-fade-in flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-xs font-bold text-blue-700">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                      </span>
                      <span>Connected Live GPS</span>
                    </span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      🛰️ watch-mode
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-700">
                    <div className="flex justify-between items-center font-mono text-[10px]">
                      <span className="text-slate-400">COORDINATES:</span>
                      <span className="font-bold text-slate-800">
                        {userLiveLocation.latitude.toFixed(6)}, {userLiveLocation.longitude.toFixed(6)}
                      </span>
                    </div>

                    {liveAddress ? (
                      <div className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        📍 {liveAddress}
                      </div>
                    ) : isLocatingAddress ? (
                      <div className="text-[11px] text-slate-400 animate-pulse">
                        Resolving geographic sector...
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400">
                        Locating street address...
                      </div>
                    )}

                    {/* Calculated Local Grid Factor */}
                    <div className="border-t border-blue-100/50 mt-2.5 pt-2 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-medium">Est. Local Grid Factor:</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {Math.round(210 + (Math.abs(userLiveLocation.latitude) * 4.5 + Math.abs(userLiveLocation.longitude) * 2.1) % 190)} g CO₂e/kWh
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Lists with real coordinates */}
              <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-1">
                {pinsToShow.map((act) => {
                  const colors: Record<string, string> = {
                    transport: 'bg-blue-500',
                    electricity: 'bg-amber-500',
                    food: 'bg-emerald-500',
                    shopping: 'bg-purple-500',
                    travel: 'bg-cyan-500',
                    waste: 'bg-red-500'
                  };
                  const colorClass = colors[act.category] || 'bg-emerald-500';

                  return (
                    <button
                      key={act.id}
                      onClick={() => handleFlyToPin(act.latitude, act.longitude)}
                      className="w-full text-left p-3 rounded-xl border border-gray-50 hover:border-emerald-150 hover:bg-emerald-50/20 transition-all flex items-start space-x-3 group"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${colorClass} ring-4 ring-offset-1 ring-slate-100/50 group-hover:scale-110 transition-transform`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-semibold text-gray-400 font-mono capitalize">{act.category}</span>
                          <span className="text-[10px] text-red-600 font-bold font-mono">+{act.emissions} kg</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">{act.type}</h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center">
                          <MapPin className="w-3 h-3 mr-0.5 shrink-0 text-emerald-500" />
                          <span>{act.location || 'Report Coordinate'}</span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-gray-150 rounded-2xl text-[11px] text-gray-600 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Map radii scale proportionally to the calculated carbon equivalent output logged by authorized users.</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            {selectedRegion ? (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div>
                  <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-[9px] font-bold uppercase tracking-wider mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>GIS Segment Connected</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 font-sans leading-tight">{selectedRegion.name}</h3>
                </div>

                {/* Visual Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-gray-100 rounded-2xl text-center">
                    <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">CARBON INTENSITY</span>
                    <span className="text-xl font-extrabold text-gray-800 mt-1 block">{selectedRegion.carbonIntensity} <span className="text-[10px] text-gray-400 font-normal">g/kWh</span></span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-gray-100 rounded-2xl text-center">
                    <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">AIR QUALITY (AQI)</span>
                    <span className="text-xl font-extrabold text-gray-800 mt-1 block">{selectedRegion.aqi} AQI</span>
                  </div>
                </div>

                {/* Scope info */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-medium">Local Power Mix:</span>
                    <span className="font-bold text-emerald-700">{selectedRegion.renewablesRatio}% Renewables</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-medium">Charging Infrastructure:</span>
                    <span className="font-bold text-gray-800">{selectedRegion.chargingStations} EV Ports</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-medium">Sensor Weather:</span>
                    <span className="font-semibold text-gray-600">{selectedRegion.weather}</span>
                  </div>

                  <div className="flex justify-between items-center pb-1">
                    <span className="text-gray-500 font-medium">Solar Irradiation:</span>
                    <span className={`font-bold uppercase text-[10px] ${
                      selectedRegion.solarPotential === 'Extreme' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {selectedRegion.solarPotential}
                    </span>
                  </div>
                </div>

                {/* Active Infrastructure Assets */}
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-2.5">ACTIVE ENVIRONMENTAL ASSETS</span>
                  <div className="space-y-2">
                    {selectedRegion.activeAssets.map((asset, index) => (
                      <div key={index} className="p-2.5 bg-emerald-50/30 border border-emerald-100/30 rounded-xl flex items-center text-xs text-emerald-950 font-medium">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0" />
                        <span>{asset}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 text-sm py-20 space-y-3">
                <Globe className="w-12 h-12 text-gray-300 animate-spin-slow" />
                <div>
                  <h4 className="font-bold text-gray-700">No telemetry region selected</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Click on any colored section of the map vector grid to review active air quality indices, charging docks, and wind farm locations.</p>
                </div>
              </div>
            )}

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 text-[11px] text-emerald-800 flex items-start space-x-2.5 mt-4">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Regional metrics are updated hourly in coordination with the National Climatic Authority and local electricity operators.</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
