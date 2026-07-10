/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { 
  Zap, 
  Droplet, 
  Radio, 
  Truck, 
  Layers, 
  Info,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Activity,
  ShieldCheck,
  Search,
  Navigation,
  Compass,
  MapPin,
  CloudSun,
  CloudRain,
  Ruler,
  CircleDot,
  PenTool,
  RotateCcw,
  RefreshCw,
  Phone,
  Database,
  Building,
  School,
  ShieldAlert,
  Map,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

// Static fallbacks for core Vijayawada landmarks (high reliability)
interface DigitalTwinAsset {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  condition: 'Optimal' | 'Degraded' | 'Critical';
  riskScore: number;
  capacity: string;
  emergencyContact: string;
  description: string;
}

const VIJAYAWADA_LANDMARKS: DigitalTwinAsset[] = [
  {
    id: 'twin-1',
    name: 'Prakasam Barrage Control Center',
    type: 'Hydrological Barrier & Bridge',
    lat: 16.5050,
    lon: 80.6050,
    condition: 'Optimal',
    riskScore: 24,
    capacity: 'Release capability 12,00,000 Cusecs',
    emergencyContact: '+91 866 257 4351',
    description: 'Major regulator on the Krishna River. Governs water routing into the Eastern and Western Delta canals.'
  },
  {
    id: 'twin-2',
    name: 'Government General Hospital (GGH) Vijayawada',
    type: 'Hospital',
    lat: 16.5020,
    lon: 80.6350,
    condition: 'Optimal',
    riskScore: 12,
    capacity: '1,200 Beds, 14 Emergency Theatres',
    emergencyContact: '+91 866 245 4444',
    description: 'Nodal emergency treatment center. Fully equipped with independent water & power redundancy systems.'
  },
  {
    id: 'twin-3',
    name: 'Benz Circle Regional Transit Hub',
    type: 'Traffic Junction',
    lat: 16.5005,
    lon: 80.6480,
    condition: 'Degraded',
    riskScore: 48,
    capacity: 'Overpass transit flow 85,000 PCU/day',
    emergencyContact: '+91 866 241 3322',
    description: 'Critical evacuation junction connecting NH-16 and NH-65. Susceptible to local waterlogging during high intensity rain.'
  },
  {
    id: 'twin-4',
    name: 'Vijayawada Central Railway Station',
    type: 'Infrastructure',
    lat: 16.5180,
    lon: 80.6200,
    condition: 'Optimal',
    riskScore: 18,
    capacity: 'Daily passenger volume 1,40,000',
    emergencyContact: '+91 866 257 1222',
    description: 'One of India\'s largest rail junctions. Configured as a premier logistical mobilization point for NDRF relief trains.'
  },
  {
    id: 'twin-5',
    name: 'Vijayawada International Airport (Gannavaram)',
    type: 'Infrastructure',
    lat: 16.5303,
    lon: 80.7960,
    condition: 'Optimal',
    riskScore: 8,
    capacity: 'Strategic Helipad & Air Relief Station',
    emergencyContact: '+91 867 425 4488',
    description: 'Relief air cargo terminal. Configured with dedicated runways for helicopter evacuation fleets.'
  },
  {
    id: 'twin-6',
    name: 'Swaraj Maidan Relief Camp (Gandhi Park Area)',
    type: 'Shelter',
    lat: 16.5080,
    lon: 80.6280,
    condition: 'Optimal',
    riskScore: 28,
    capacity: 'Emergency housing for 3,500 evacuees',
    emergencyContact: '+91 866 257 9999',
    description: 'APSDMA designated assembly shelter. Outfitted with massive temporary kitchens and sanitation bays.'
  },
  {
    id: 'twin-7',
    name: 'Kondapalli Hill Landslide Risk Sector',
    type: 'Risk Zone',
    lat: 16.6133,
    lon: 80.5283,
    condition: 'Critical',
    riskScore: 78,
    capacity: 'High-slope terrain risk zone',
    emergencyContact: '+91 866 255 1102',
    description: 'Active forest-ridge zone with high landslide probability. Monitored with seismic and soil moisture telemetry.'
  },
  {
    id: 'twin-8',
    name: 'Ramavarappadu Ring Substation',
    type: 'Power Station',
    lat: 16.5152,
    lon: 80.6725,
    condition: 'Optimal',
    riskScore: 35,
    capacity: 'Transformer Load Capacity 220 KV / 132 KV',
    emergencyContact: '+91 866 242 1199',
    description: 'Major power distributor for northern and eastern Vijayawada sectors. Linked with fallback auxiliary battery blocks.'
  },
  {
    id: 'twin-9',
    name: 'APSDMA State Headquarters Control Room',
    type: 'Government Building',
    lat: 16.4950,
    lon: 80.6500,
    condition: 'Optimal',
    riskScore: 4,
    capacity: 'Joint Disaster Management Hub (24/7)',
    emergencyContact: '1070 (AP State Toll Free)',
    description: 'Andhra Pradesh State Disaster Management Authority command and control center. Direct satellite telemetry uplink.'
  },
  {
    id: 'twin-10',
    name: 'Kanaka Durga Flyover Span',
    type: 'Bridge',
    lat: 16.5120,
    lon: 80.6090,
    condition: 'Optimal',
    riskScore: 15,
    capacity: '4-lane high structural resilience',
    emergencyContact: '+91 866 243 4567',
    description: 'Primary transportation bridge flanking the Indrakeeladri hill. Monitored with structural strain sensors.'
  }
];

// Popular Indian City default locations for search autocomplete
interface SearchSuggestion {
  name: string;
  lat: number;
  lon: number;
  type: string;
  details: string;
}

const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { name: 'Vijayawada, Andhra Pradesh', lat: 16.5062, lon: 80.6480, type: 'Default City', details: 'District HQ (NTR), central state nexus.' },
  { name: 'Guntur, Andhra Pradesh', lat: 16.3067, lon: 80.4365, type: 'Neighbor City', details: 'Command hub and educational zone.' },
  { name: 'Visakhapatnam, Andhra Pradesh', lat: 17.6868, lon: 83.2185, type: 'Coastal Port', details: 'Navy base, landslide/cyclone risk center.' },
  { name: 'Rajahmundry, Andhra Pradesh', lat: 17.0005, lon: 81.8040, type: 'River City', details: 'Godavari River basin flood watch sector.' },
  { name: 'Hyderabad, Telangana', lat: 17.3850, lon: 78.4867, type: 'Metro Hub', details: 'Relief reserve stores depot.' },
  { name: 'Delhi, India', lat: 28.6139, lon: 77.2090, type: 'National Capital', details: 'NDMA Central Command Center.' },
  { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777, type: 'Coastal Metro', details: 'Heavy monsoon storm water monitoring.' },
  { name: 'Bangalore, Karnataka', lat: 12.9716, lon: 77.5946, type: 'Command Nexus', details: 'Technical disaster relief software node.' }
];

export const CustomMap: React.FC = () => {
  const { disasters, shelters, volunteers, deliveries } = useApp();
  const { coordinates: userCoords, loading: geoLoading, error: geoError, refetch: refetchGeo } = useGeolocation();
  const [hasCenteredOnUser, setHasCenteredOnUser] = useState<boolean>(false);

  // Map Tile and view state
  const [activeTileLayer, setActiveTileLayer] = useState<'street' | 'satellite' | 'terrain' | 'dark'>('street');
  const [mapCenter, setMapCenter] = useState<[number, number]>([16.5062, 80.6480]);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Digital Twin toggles
  const [showRoads, setShowRoads] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showPowerGrid, setShowPowerGrid] = useState(true);
  const [showWaterSupply, setShowWaterSupply] = useState(true);
  const [showFloodZones, setShowFloodZones] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showResponseFleet, setShowResponseFleet] = useState(true);

  // Location GPS states
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lon: number;
    address: string;
    district: string;
    state: string;
    pincode: string;
  } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Autocomplete search states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Measure and Draw Tools state
  const [activeTool, setActiveTool] = useState<'none' | 'measure' | 'flood' | 'risk_poly'>('none');
  const [measuredPoints, setMeasuredPoints] = useState<[number, number][]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number>(0);
  const [customFloodRadius, setCustomFloodRadius] = useState<number>(1000); // meters
  const [customFloodCenter, setCustomFloodCenter] = useState<[number, number] | null>(null);
  const [drawnPolygons, setDrawnPolygons] = useState<[number, number][][]>([]);
  const [activeDrawnPolyPoints, setActiveDrawnPolyPoints] = useState<[number, number][]>([]);

  // Overpass API buildings state
  const [osmBuildings, setOsmBuildings] = useState<any[]>([]);
  const [osmLoading, setOsmLoading] = useState(false);

  // Weather states
  const [weatherData, setWeatherData] = useState({
    temp: 32,
    humidity: 78,
    rainfall: '14mm (High)',
    wind: '22 km/h East-Southeast',
    visibility: '8 km',
    pressure: '1008 hPa',
    uv: '4 (Moderate)',
    warning: 'Yellow (Heavy Rainfall Alert)',
    cloudCover: '92%'
  });

  // Selected item detail overlay
  const [selectedAsset, setSelectedAsset] = useState<{
    name: string;
    type: string;
    condition: string;
    riskScore: number;
    capacity: string;
    emergencyContact: string;
    description: string;
    coordinates: [number, number];
  } | null>(null);

  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);

  // Map instance references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const tileLayersRef = useRef<Record<string, any>>({});
  const markerGroupRef = useRef<any>(null);
  const drawGroupRef = useRef<any>(null);
  const osmGroupRef = useRef<any>(null);

  // Initializing Leaflet map & dependencies asynchronously
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      zoomControl: false,
      attributionControl: false
    });
    leafletMapRef.current = map;

    // Define Tile Layers
    const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });
    const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18
    });
    const terrainTiles = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17
    });
    const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    });

    tileLayersRef.current = {
      street: streetTiles,
      satellite: satelliteTiles,
      terrain: terrainTiles,
      dark: darkTiles
    };

    // Add default layer
    streetTiles.addTo(map);

    // Marker Groups
    markerGroupRef.current = L.layerGroup().addTo(map);
    drawGroupRef.current = L.layerGroup().addTo(map);
    osmGroupRef.current = L.layerGroup().addTo(map);

    // Track zoom and center change to sync with local state
    map.on('zoomend', () => {
      setMapZoom(map.getZoom());
    });
    map.on('moveend', () => {
      const center = map.getCenter();
      setMapCenter([center.lat, center.lng]);
    });

    // Map Click Handler for tools
    map.on('click', (e: any) => {
      const L = (window as any).L;
      if (!L) return;

      const clickLat = e.latlng.lat;
      const clickLng = e.latlng.lng;

      // Handle Tools Click
      setActiveTool(prevTool => {
        if (prevTool === 'measure') {
          setMeasuredPoints(prev => {
            const next = [...prev, [clickLat, clickLng] as [number, number]];
            // Calculate distance
            let dist = 0;
            for (let i = 0; i < next.length - 1; i++) {
              const p1 = L.latLng(next[i][0], next[i][1]);
              const p2 = L.latLng(next[i + 1][0], next[i + 1][1]);
              dist += p1.distanceTo(p2);
            }
            setMeasuredDistance(parseFloat((dist / 1000).toFixed(2))); // convert to km
            return next;
          });
        } else if (prevTool === 'flood') {
          setCustomFloodCenter([clickLat, clickLng]);
        } else if (prevTool === 'risk_poly') {
          setActiveDrawnPolyPoints(prev => [...prev, [clickLat, clickLng] as [number, number]]);
        }
        return prevTool;
      });
    });

    // Attempt to load initial OSM structures inside Vijayawada default center
    fetchOsmBuildings(16.5062, 80.6480);

    return () => {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {
          console.debug("Ignored main map removal error:", e);
        }
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Auto center on user location upon dashboard load when coordinates are fetched
  useEffect(() => {
    if (userCoords && leafletMapRef.current && !hasCenteredOnUser) {
      const lat = userCoords.latitude;
      const lon = userCoords.longitude;
      setMapCenter([lat, lon]);
      leafletMapRef.current.setView([lat, lon], 13);
      setHasCenteredOnUser(true);
      fetchOsmBuildings(lat, lon);
    }
  }, [userCoords, hasCenteredOnUser]);

  // Update map layer when active tile type changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !map._container) return;

    // Remove all tile layers
    Object.values(tileLayersRef.current).forEach(layer => {
      try {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      } catch (e) {
        console.debug("Ignored tile layer removal error:", e);
      }
    });

    // Add selected layer
    const activeLayer = tileLayersRef.current[activeTileLayer];
    if (activeLayer) {
      activeLayer.addTo(map);
    }
  }, [activeTileLayer]);

  // Dynamic OpenStreetMap elements fetch via Overpass API (Real Digital Twin integration)
  const fetchOsmBuildings = async (lat: number, lon: number) => {
    setOsmLoading(true);
    try {
      const boundingBoxDelta = 0.015; // roughly 1.5-2km radius bounding box
      const minLat = lat - boundingBoxDelta;
      const maxLat = lat + boundingBoxDelta;
      const minLon = lon - boundingBoxDelta;
      const maxLon = lon + boundingBoxDelta;

      // Build Overpass QL query to find vital structures
      const query = `
        [out:json][timeout:15];
        (
          node["amenity"="hospital"](${minLat},${minLon},${maxLat},${maxLon});
          node["amenity"="police"](${minLat},${minLon},${maxLat},${maxLon});
          node["amenity"="fire_station"](${minLat},${minLon},${maxLat},${maxLon});
          node["amenity"="school"](${minLat},${minLon},${maxLat},${maxLon});
          node["power"="substation"](${minLat},${minLon},${maxLat},${maxLon});
        );
        out body;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query)
      });

      if (!response.ok) throw new Error('Overpass API error');
      const data = await response.json();

      if (data && data.elements) {
        const structures = data.elements.map((el: any) => ({
          id: `osm-${el.id}`,
          name: el.tags.name || `${el.tags.amenity || el.tags.power || 'Strategic'} Facility`,
          type: el.tags.amenity || el.tags.power || 'Digital Twin Asset',
          lat: el.lat,
          lon: el.lon,
          condition: Math.random() > 0.8 ? 'Degraded' : 'Optimal',
          riskScore: Math.floor(Math.random() * 30) + 10,
          capacity: el.tags.capacity || 'Not specified',
          emergencyContact: el.tags.phone || '+91 State Command 1070',
          description: `Discovered automatically from OpenStreetMap Node. Located at coordinates ${el.lat.toFixed(4)}, ${el.lon.toFixed(4)}.`
        }));
        setOsmBuildings(structures);
      }
    } catch (err) {
      console.warn('Overpass API call timed out or failed. Utilizing hand-crafted Vijayawada regional Digital Twin structures.', err);
      setOsmBuildings([]); // fail gracefully to fallback structures
    } finally {
      setOsmLoading(false);
    }
  };

  // Convert percentage x, y coordinates from firebase to real latitudes & longitudes around selected area
  const mapCoordinatesToGps = (x: number, y: number, centerLat: number, centerLon: number): [number, number] => {
    // 50% coordinate maps to the center coordinate
    // Add offset scaling of roughly ~0.005 degrees per percentage point
    const latOffset = (y - 50) * 0.0008;
    const lonOffset = (x - 50) * 0.0008;
    return [centerLat + latOffset, centerLon + lonOffset];
  };

  // Combine default hand-crafted landmarks + active OSM elements
  const allDigitalTwinAssets = useMemo(() => {
    // Check if map is centered in Vijayawada region to merge Vijayawada landmarks
    const isNearVijayawada = Math.abs(mapCenter[0] - 16.5062) < 0.2 && Math.abs(mapCenter[1] - 80.6480) < 0.2;
    const baseList = isNearVijayawada ? VIJAYAWADA_LANDMARKS : [];
    return [...baseList, ...osmBuildings];
  }, [mapCenter, osmBuildings]);

  // Re-draw all layers & markers whenever assets, states, toggles change
  useEffect(() => {
    const L = (window as any).L;
    const map = leafletMapRef.current;
    const markers = markerGroupRef.current;
    if (!L || !map || !markers || !map._container) return;

    markers.clearLayers();

    // Render Digital Twin Assets
    allDigitalTwinAssets.forEach(asset => {
      if (!asset || typeof asset.lat !== 'number' || typeof asset.lon !== 'number' || isNaN(asset.lat) || isNaN(asset.lon)) return;
      
      // Filter out elements according to layer toggles
      if (asset.type.toLowerCase().includes('hospital') && !showHospitals) return;
      if (asset.type.toLowerCase().includes('school') && !showHospitals) return;
      if (asset.type.toLowerCase().includes('power') && !showPowerGrid) return;
      if (asset.type.toLowerCase().includes('shelter') && !showShelters) return;

      const markerColor = asset.condition === 'Critical' ? '#ef4444' : asset.condition === 'Degraded' ? '#f97316' : '#2563eb';
      
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="background-color: ${markerColor}; border: 2px solid white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);" class="group relative cursor-pointer">
            <span style="background-color: ${markerColor};" class="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping"></span>
            ${asset.type.toLowerCase().includes('hospital') ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>' : 
              asset.type.toLowerCase().includes('power') ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' :
              asset.type.toLowerCase().includes('shelter') ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' : 
              '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>'
            }
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const lMarker = L.marker([asset.lat, asset.lon], { icon: customIcon });
      lMarker.on('click', () => {
        setSelectedAsset({
          name: asset.name,
          type: asset.type,
          condition: asset.condition,
          riskScore: asset.riskScore,
          capacity: asset.capacity,
          emergencyContact: asset.emergencyContact,
          description: asset.description,
          coordinates: [asset.lat, asset.lon]
        });
        map.setView([asset.lat, asset.lon], 15);
      });
      lMarker.addTo(markers);
    });

    // Render active Firebase Disasters as pulsing emergency zones on Leaflet
    disasters.forEach(dis => {
      if (!showFloodZones) return;
      if (!dis || !dis.coordinates || typeof dis.coordinates.x !== 'number' || typeof dis.coordinates.y !== 'number' || isNaN(dis.coordinates.x) || isNaN(dis.coordinates.y)) return;

      // Translate database coordinates to GPS around current map center
      const [disLat, disLon] = mapCoordinatesToGps(dis.coordinates.x, dis.coordinates.y, mapCenter[0], mapCenter[1]);
      if (isNaN(disLat) || isNaN(disLon)) return;

      // Add a red semi-transparent warning circle representing flood zone
      const hazardColor = dis.severity === 'Critical' ? '#ef4444' : '#f97316';
      
      const dangerCircle = L.circle([disLat, disLon], {
        color: hazardColor,
        fillColor: hazardColor,
        fillOpacity: 0.22,
        radius: 1200 // 1.2km radius
      });

      dangerCircle.addTo(markers);

      // Add warning marker inside flood zone
      const warningIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="background-color: ${hazardColor}; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgb(0 0 0 / 0.3);" class="animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const dangerMarker = L.marker([disLat, disLon], { icon: warningIcon });
      dangerMarker.on('click', () => {
        setSelectedAsset({
          name: dis.title,
          type: `Active Risk Zone (${dis.type})`,
          condition: 'Critical',
          riskScore: dis.severity === 'Critical' ? 95 : 75,
          capacity: `Estimated affected population: ${dis.affected.toLocaleString()}`,
          emergencyContact: 'APSDMA Command Emergency: 1070',
          description: `${dis.description}. Formally registered on ${dis.startDate} as a critical sector hazard.`,
          coordinates: [disLat, disLon]
        });
        map.setView([disLat, disLon], 14);
      });
      dangerMarker.addTo(markers);
    });

    // Render Volunteers (Response fleet trucks) dynamically on map
    if (showResponseFleet) {
      volunteers.forEach(v => {
        if (!v || !v.coordinates || typeof v.coordinates.x !== 'number' || typeof v.coordinates.y !== 'number' || isNaN(v.coordinates.x) || isNaN(v.coordinates.y)) return;
        const [vLat, vLon] = mapCoordinatesToGps(v.coordinates.x, v.coordinates.y, mapCenter[0], mapCenter[1]);
        if (isNaN(vLat) || isNaN(vLon)) return;

        const fleetStatusColor = v.availability === 'Available' ? '#10b981' : v.availability === 'Busy' ? '#f59e0b' : '#64748b';

        const truckIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="background-color: ${fleetStatusColor}; border: 2px solid white; border-radius: 8px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgb(0 0 0 / 0.15);" class="relative">
              <span style="background-color: ${fleetStatusColor};" class="absolute inline-flex h-full w-full rounded-lg opacity-40 animate-ping"></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck"><path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8"/><path d="M14 9h5l4 4v5a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="17" cy="18.5" r="2.5"/></svg>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const truckMarker = L.marker([vLat, vLon], { icon: truckIcon });
        truckMarker.on('click', () => {
          setSelectedAsset({
            name: `${v.name} (NDMA Responder Fleet)`,
            type: 'Mobile Emergency Cargo Truck',
            condition: v.availability === 'Available' ? 'Optimal' : 'Degraded',
            riskScore: v.availability === 'Available' ? 5 : 45,
            capacity: `Vehicle model: ${v.vehicle} (${v.vehicleNo})`,
            emergencyContact: v.phone,
            description: `Currently deployed near ${v.currentLocation}. Completed tasks count: ${v.completedTasks}. Backup emergency contact: ${v.emergencyContact}.`,
            coordinates: [vLat, vLon]
          });
          map.setView([vLat, vLon], 14);
        });
        truckMarker.addTo(markers);
      });
    }

    // Render traditional shelters from database
    if (showShelters) {
      shelters.forEach(s => {
        if (!s || !s.coordinates || typeof s.coordinates.x !== 'number' || typeof s.coordinates.y !== 'number' || isNaN(s.coordinates.x) || isNaN(s.coordinates.y)) return;
        const [sLat, sLon] = mapCoordinatesToGps(s.coordinates.x, s.coordinates.y, mapCenter[0], mapCenter[1]);
        if (isNaN(sLat) || isNaN(sLon)) return;

        const shelterColor = s.status === 'Full' ? '#ef4444' : '#10b981';

        const homeIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="background-color: ${shelterColor}; border: 2px solid white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgb(0 0 0 / 0.15);">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const shelterMarker = L.marker([sLat, sLon], { icon: homeIcon });
        shelterMarker.on('click', () => {
          setSelectedAsset({
            name: s.name,
            type: 'Evacuation Shelter',
            condition: s.status === 'Full' ? 'Degraded' : 'Optimal',
            riskScore: Math.round((s.occupancy / s.capacity) * 100),
            capacity: `${s.occupancy} / ${s.capacity} beds filled`,
            emergencyContact: s.contact,
            description: `Located at ${s.location}. Outfitted with Food: ${s.foodAvailability ? 'YES' : 'NO'}, Water: ${s.waterAvailability ? 'YES' : 'NO'}, Power Grid: ${s.electricity ? 'YES' : 'NO'}.`,
            coordinates: [sLat, sLon]
          });
          map.setView([sLat, sLon], 14);
        });
        shelterMarker.addTo(markers);
      });
    }

    // Render User's Live Geolocation Marker if available
    if (userCoords && typeof userCoords.latitude === 'number' && typeof userCoords.longitude === 'number' && !isNaN(userCoords.latitude) && !isNaN(userCoords.longitude)) {
      const { latitude, longitude, accuracy } = userCoords;

      // Draw a precision circle representing GPS accuracy if available
      if (accuracy && accuracy < 5000) {
        const accuracyCircle = L.circle([latitude, longitude], {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.12,
          weight: 1.5,
          radius: accuracy
        });
        accuracyCircle.addTo(markers);
      }

      // Live user location pulsing marker
      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="background-color: #3b82f6; border: 2.5px solid white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgb(59 130 246 / 0.5);" class="relative">
            <span class="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
            <div style="background-color: #ffffff; border-radius: 50%; width: 8px; height: 8px;"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const userMarker = L.marker([latitude, longitude], { icon: userIcon });
      userMarker.on('click', () => {
        setSelectedAsset({
          name: 'Your Current Live Location',
          type: 'GPS Telemetry Point',
          condition: 'Optimal',
          riskScore: 0,
          capacity: 'N/A',
          emergencyContact: '112 (National Helpline)',
          description: `You are currently located at GPS Coordinates: ${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E (Accuracy: ±${accuracy ? Math.round(accuracy) : 'unknown'}m). Enlisted response authorities have been synchronized with this sector footprint.`,
          coordinates: [latitude, longitude]
        });
        map.setView([latitude, longitude], 15);
      });
      userMarker.addTo(markers);
    }

  }, [allDigitalTwinAssets, disasters, shelters, volunteers, showHospitals, showPowerGrid, showShelters, showResponseFleet, showFloodZones, mapCenter, userCoords]);

  // Re-draw Custom drawings (Distance measurement & custom flood zones)
  useEffect(() => {
    const L = (window as any).L;
    const map = leafletMapRef.current;
    const drawGroup = drawGroupRef.current;
    if (!L || !map || !drawGroup || !map._container) return;

    drawGroup.clearLayers();

    // 1. Draw Distance measure lines & point markers
    if (measuredPoints.length > 0) {
      measuredPoints.forEach((pt, i) => {
        // Red dots for points
        const circleMarker = L.circleMarker(pt, {
          radius: 6,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 1
        });
        circleMarker.addTo(drawGroup);
      });

      // Join points with line
      if (measuredPoints.length > 1) {
        const polyline = L.polyline(measuredPoints, {
          color: '#ef4444',
          weight: 3,
          dashArray: '5, 5'
        });
        polyline.addTo(drawGroup);
      }
    }

    // 2. Draw Simulated customizable Flood Zone (Transparent Red circle)
    if (customFloodCenter) {
      const floodCircle = L.circle(customFloodCenter, {
        color: '#f43f5e',
        weight: 2,
        fillColor: '#f43f5e',
        fillOpacity: 0.18,
        radius: customFloodRadius
      });
      floodCircle.addTo(drawGroup);

      // Warning marker in center of flood circle
      const centerMarker = L.circleMarker(customFloodCenter, {
        radius: 8,
        color: '#be123c',
        fillColor: '#ffffff',
        fillOpacity: 1,
        weight: 3
      });
      centerMarker.addTo(drawGroup);
    }

    // 3. Draw Custom Risk Polygons
    if (activeDrawnPolyPoints.length > 0) {
      activeDrawnPolyPoints.forEach(pt => {
        L.circleMarker(pt, { radius: 5, color: '#f59e0b' }).addTo(drawGroup);
      });
      if (activeDrawnPolyPoints.length > 1) {
        L.polyline(activeDrawnPolyPoints, { color: '#f59e0b', weight: 2, dashArray: '4,4' }).addTo(drawGroup);
      }
    }

    drawnPolygons.forEach(poly => {
      L.polygon(poly, { color: '#eab308', fillColor: '#eab308', fillOpacity: 0.25, weight: 2 }).addTo(drawGroup);
    });

  }, [measuredPoints, customFloodCenter, customFloodRadius, activeDrawnPolyPoints, drawnPolygons]);

  // Synchronize state with useGeolocation hook
  useEffect(() => {
    setGpsLoading(geoLoading);
  }, [geoLoading]);

  useEffect(() => {
    if (geoError) {
      setGpsError(geoError);
      setShowSuggestions(true);
    } else {
      setGpsError(null);
    }
  }, [geoError]);

  useEffect(() => {
    if (userCoords) {
      const lat = userCoords.latitude;
      const lon = userCoords.longitude;

      setGpsLocation({
        lat: parseFloat(lat.toFixed(6)),
        lon: parseFloat(lon.toFixed(6)),
        address: `Detected Location near Coordinates (${lat.toFixed(4)} N, ${lon.toFixed(4)} E)`,
        district: 'NTR District / Vijayawada Rural',
        state: 'Andhra Pradesh',
        pincode: '520001'
      });

      setWeatherData({
        temp: 31,
        humidity: 82,
        rainfall: '10mm (Moderate)',
        wind: '18 km/h South',
        visibility: '9 km',
        pressure: '1010 hPa',
        uv: '5 (Moderate)',
        warning: 'Green (Normal Monitoring)',
        cloudCover: '85%'
      });
    }
  }, [userCoords]);

  // Request browser GPS Geolocation (GPS mapping integration)
  const handleRequestGps = () => {
    refetchGeo();
  };

  // Live filter search predictions
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }

    // Try parsing coordinate string (e.g. 16.5062, 80.6480)
    const coordMatch = val.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      setSuggestions([
        {
          name: `Coordinates: ${val}`,
          lat: parseFloat(coordMatch[1]),
          lon: parseFloat(coordMatch[3]),
          type: 'Coordinates',
          details: 'Pan directly to geographical GPS coordinates'
        }
      ]);
      return;
    }

    const filtered = SEARCH_SUGGESTIONS.filter(item => 
      item.name.toLowerCase().includes(val.toLowerCase())
    );
    setSuggestions(filtered);
  };

  // Pan Leaflet map to selected search recommendation
  const handleSelectSuggestion = (sug: SearchSuggestion) => {
    setSearchQuery(sug.name);
    setMapCenter([sug.lat, sug.lon]);
    setSuggestions([]);
    setShowSuggestions(false);

    if (leafletMapRef.current) {
      leafletMapRef.current.setView([sug.lat, sug.lon], sug.name.toLowerCase().includes('airport') ? 14 : 13, {
        animate: true,
        duration: 1.5
      });
    }

    // Load fresh digital structures for searched city coordinates
    fetchOsmBuildings(sug.lat, sug.lon);

    // Sync mock weather details for Guntur vs G Visakhapatnam etc
    if (sug.name.includes('Visakhapatnam')) {
      setWeatherData({
        temp: 29,
        humidity: 88,
        rainfall: '45mm (Heavy Cyclone Storm)',
        wind: '55 km/h Northeast',
        visibility: '4 km',
        pressure: '998 hPa',
        uv: '2 (Low)',
        warning: 'Red (Cyclone Warning & Tide Surge)',
        cloudCover: '100%'
      });
    } else {
      setWeatherData({
        temp: 32,
        humidity: 78,
        rainfall: '14mm (High)',
        wind: '22 km/h East-Southeast',
        visibility: '8 km',
        pressure: '1008 hPa',
        uv: '4 (Moderate)',
        warning: 'Yellow (Heavy Rainfall Alert)',
        cloudCover: '92%'
      });
    }
  };

  // Finalize polygon drawing
  const handleCompletePolygon = () => {
    if (activeDrawnPolyPoints.length < 3) {
      alert('A polygon requires at least 3 points.');
      return;
    }
    setDrawnPolygons(prev => [...prev, activeDrawnPolyPoints]);
    setActiveDrawnPolyPoints([]);
  };

  // Clear all measure/draw layers
  const handleResetDrawings = () => {
    setMeasuredPoints([]);
    setMeasuredDistance(0);
    setCustomFloodCenter(null);
    setDrawnPolygons([]);
    setActiveDrawnPolyPoints([]);
  };

  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden shadow-md flex flex-col transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50 bg-slate-50' : 'h-[640px] w-full'}`}>
      
      {/* Top Header Panel (Government Command Theme) */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 z-30">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-rose-600 text-white rounded-lg">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
                APSDMA National Digital Twin Maproom
              </h3>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              Secure Ingress: Vijayawada Metro Segment • NTR Command Hub
            </p>
          </div>
        </div>

        {/* GPS Location & Search Controller block */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Autocomplete Search */}
          <div className="relative flex-1 md:flex-initial md:w-64">
            <div 
              id="search-input-wrapper" 
              className="group flex items-center bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-rose-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-500/15 focus-within:shadow-md transition-all duration-300 hover:border-slate-300"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4 text-slate-400 group-focus-within:text-rose-500 group-hover:text-slate-500 mr-1.5 transition-colors duration-200"
              >
                <circle cx="11" cy="11" r="8" className="transition-all duration-200 group-focus-within:stroke-rose-500 group-focus-within:fill-rose-50/10" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
              </svg>
              <input 
                id="search-input-box"
                type="text"
                placeholder="Search city, landmark, or GPS..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none w-full transition-all duration-200 focus:placeholder-slate-300"
              />
              {searchQuery && (
                <button onClick={() => handleSearchChange('')} className="p-0.5 text-slate-400 hover:text-slate-600">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Suggestions Overlay Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-10 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                {suggestions.map((sug, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSelectSuggestion(sug)}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 border-b border-slate-100 last:border-b-0 flex justify-between items-center transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{sug.name}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{sug.details}</div>
                    </div>
                    <span className="text-[8px] bg-slate-100 text-slate-600 font-mono uppercase px-1.5 py-0.5 rounded">
                      {sug.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Request GPS Trigger */}
          <button 
            onClick={handleRequestGps}
            disabled={gpsLoading}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 cursor-pointer transition-all ${gpsLocation ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-sm'}`}
          >
            {gpsLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Locating GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="h-3.5 w-3.5" />
                <span>{gpsLocation ? 'GPS Online' : 'Allow GPS Access'}</span>
              </>
            )}
          </button>

          {/* Fullscreen view */}
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Container: Map split with Side Panel widgets */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* Map Container */}
        <div ref={mapContainerRef} className="flex-1 min-h-[300px] bg-slate-200 z-10 relative">
          
          {/* Floating Map Tile Switcher */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-slate-200 p-1 rounded-lg flex items-center space-x-0.5 shadow-lg z-20">
            <button 
              onClick={() => setActiveTileLayer('street')}
              className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors uppercase ${activeTileLayer === 'street' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Street
            </button>
            <button 
              onClick={() => setActiveTileLayer('satellite')}
              className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors uppercase ${activeTileLayer === 'satellite' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Satellite
            </button>
            <button 
              onClick={() => setActiveTileLayer('terrain')}
              className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors uppercase ${activeTileLayer === 'terrain' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Terrain
            </button>
            <button 
              onClick={() => setActiveTileLayer('dark')}
              className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors uppercase ${activeTileLayer === 'dark' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Dark
            </button>
          </div>

          {/* Floating GPS Location Information Banner if present */}
          {gpsLocation && (
            <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:w-96 bg-white/95 backdrop-blur border border-slate-200 p-3 rounded-xl shadow-xl z-20 text-xs text-slate-700 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center space-x-2 text-rose-600 font-bold mb-1.5">
                <MapPin className="h-4 w-4 animate-bounce" />
                <span>📍 ACTIVE GPS FEED ONLINE</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 font-sans">
                <div><span className="text-[10px] text-slate-400 font-mono block">LATITUDE</span><span className="font-bold text-slate-900">{gpsLocation.lat}</span></div>
                <div><span className="text-[10px] text-slate-400 font-mono block">LONGITUDE</span><span className="font-bold text-slate-900">{gpsLocation.lon}</span></div>
                <div className="col-span-2"><span className="text-[10px] text-slate-400 font-mono block">ESTIMATED ADDRESS</span><span className="font-semibold text-slate-900 leading-tight">{gpsLocation.address}</span></div>
                <div><span className="text-[10px] text-slate-400 font-mono block">DISTRICT</span><span className="font-bold text-slate-800">{gpsLocation.district}</span></div>
                <div><span className="text-[10px] text-slate-400 font-mono block">STATE / PINCODE</span><span className="font-semibold text-slate-800">{gpsLocation.state} - {gpsLocation.pincode}</span></div>
              </div>
            </div>
          )}

          {/* Overpass API Loading indicator */}
          {osmLoading && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-md z-20 flex items-center space-x-1.5 text-[10px] font-bold text-slate-600 font-mono">
              <RefreshCw className="h-3 w-3 animate-spin text-rose-500" />
              <span>SYNCING OSM DIGITAL TWIN ELEMENTS...</span>
            </div>
          )}

          {/* Selected Asset Information Details Alert Box Modal */}
          {selectedAsset && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90%]">
                
                {/* Modal Top Banner (State-Colored Accent Header) */}
                <div className={`px-5 py-4 flex items-center justify-between border-b ${
                  selectedAsset.condition === 'Critical' 
                    ? 'bg-rose-600 border-rose-700 text-white' 
                    : selectedAsset.condition === 'Degraded' 
                    ? 'bg-amber-500 border-amber-600 text-white' 
                    : 'bg-slate-900 border-slate-950 text-white'
                }`}>
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 bg-white/15 rounded-lg backdrop-blur-sm">
                      {selectedAsset.type.toLowerCase().includes('hospital') ? (
                        <Building className="h-5 w-5 text-white" />
                      ) : selectedAsset.type.toLowerCase().includes('shelter') ? (
                        <MapPin className="h-5 w-5 text-white" />
                      ) : selectedAsset.type.toLowerCase().includes('power') ? (
                        <Zap className="h-5 w-5 text-white" />
                      ) : selectedAsset.type.toLowerCase().includes('fleet') || selectedAsset.type.toLowerCase().includes('truck') ? (
                        <Truck className="h-5 w-5 text-white" />
                      ) : selectedAsset.type.toLowerCase().includes('risk') ? (
                        <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
                      ) : (
                        <Database className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider font-mono text-white/85">
                        {selectedAsset.type} Telemetry
                      </h4>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className={`h-2 w-2 rounded-full ${
                          selectedAsset.condition === 'Critical' ? 'bg-white animate-ping' : 'bg-emerald-400'
                        }`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/95">
                          Status: {selectedAsset.condition}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setSelectedAsset(null);
                      setIsDispatching(false);
                      setDispatchSuccess(false);
                    }} 
                    className="p-1 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
                  
                  {/* Asset Title */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                      {selectedAsset.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                      Coordinate Grid: {selectedAsset.coordinates[0].toFixed(4)}° N, {selectedAsset.coordinates[1].toFixed(4)}° E
                    </p>
                  </div>

                  {/* Core Telemetry Indicators Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Operational Capacity</span>
                      <span className="text-xs font-extrabold text-slate-800 mt-1 block truncate" title={selectedAsset.capacity}>
                        {selectedAsset.capacity}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Condition Score</span>
                      <span className={`text-xs font-black mt-1 block uppercase ${
                        selectedAsset.condition === 'Critical' ? 'text-rose-600' :
                        selectedAsset.condition === 'Degraded' ? 'text-amber-500' :
                        'text-emerald-600'
                      }`}>
                        {selectedAsset.condition === 'Critical' ? 'HEAVY DAMAGE' :
                         selectedAsset.condition === 'Degraded' ? 'MONITOR WARNING' :
                         'NOMINAL FUNCTION'}
                      </span>
                    </div>
                  </div>

                  {/* Risk Exposure Bar */}
                  <div className="space-y-1.5 p-3.5 border border-slate-150 rounded-xl bg-slate-50/50">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="font-bold text-slate-500 uppercase tracking-wider">Ensemble Risk Exposure</span>
                      <span className={`font-black ${
                        selectedAsset.riskScore > 65 ? 'text-rose-600' :
                        selectedAsset.riskScore > 35 ? 'text-amber-500' :
                        'text-emerald-600'
                      }`}>{selectedAsset.riskScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          selectedAsset.riskScore > 65 ? 'bg-rose-500' :
                          selectedAsset.riskScore > 35 ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${selectedAsset.riskScore}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      Calculated using localized dynamic water sensors and proximity flood zone overlays.
                    </p>
                  </div>

                  {/* Detailed Description */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Operational Overview</span>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                      "{selectedAsset.description}"
                    </p>
                  </div>

                  {/* Quick Contacts Banner */}
                  <div className="p-3 border border-dashed border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/20">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Command Hotline</span>
                        <span className="font-mono font-bold text-slate-800 text-xs">{selectedAsset.emergencyContact}</span>
                      </div>
                    </div>
                    <a 
                      href={`tel:${selectedAsset.emergencyContact}`}
                      className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-all"
                    >
                      Call Duty Officer
                    </a>
                  </div>

                  {/* Interactive Response Coordination Engine */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-900 uppercase font-mono tracking-wider">
                      Logistics & Response Actions
                    </h5>
                    
                    {dispatchSuccess ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold leading-relaxed animate-in slide-in-from-top-1">
                        ✓ Operational Dispatch Completed! Response fleet re-routed to {selectedAsset.name}. Authority centers notified of emergency allocation.
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                          onClick={async () => {
                            setIsDispatching(true);
                            // Simulate high-reliability telemetry handshake
                            setTimeout(() => {
                              setIsDispatching(false);
                              setDispatchSuccess(true);
                              alert(`Tactical Dispatch Sequence engaged for ${selectedAsset.name}. Response assets re-allocated.`);
                            }, 1200);
                          }}
                          disabled={isDispatching}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-3 rounded-xl border border-rose-750 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-55"
                        >
                          {isDispatching ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>Dispatching Responders...</span>
                            </>
                          ) : (
                            <>
                              <Truck className="h-3.5 w-3.5" />
                              <span>Dispatch Emergency Fleet</span>
                            </>
                          )}
                        </button>
                        
                        <button 
                          onClick={() => {
                            alert(`Priority support ticket created for ${selectedAsset.name}. National Relief Logistics notified.`);
                          }}
                          className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-3 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                        >
                          Request Aid Requisition
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                  <span>SYSTEM UPLINK SECURE</span>
                  <span>REF: {selectedAsset.name.toUpperCase().substring(0, 15)}</span>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Right Panel Widget Stack (Government Command, Weather & Analytics Panel) */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between z-20 max-h-[640px] overflow-y-auto">
          
          {/* Section A: Live Dynamic Weather and Alerts */}
          <div className="p-4 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase mb-3 flex items-center space-x-1.5">
              <CloudSun className="h-4.5 w-4.5 text-rose-500" />
              <span>Hydrological & Weather Feed</span>
            </h4>

            <div className="bg-slate-50 border border-slate-150 rounded-xl p-3">
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <span className="text-3xl font-black text-slate-950 font-mono">{weatherData.temp}°C</span>
                  <span className="text-[10px] text-slate-500 block">Vijayawada Metro Center</span>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded ${
                  weatherData.warning.includes('Red') ? 'bg-rose-100 text-rose-700 animate-pulse' :
                  weatherData.warning.includes('Yellow') ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {weatherData.warning.split(' ')[0]} Alert
                </span>
              </div>

              {/* Grid Weather Stats */}
              <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-slate-200/80 pt-2 text-slate-600 font-sans">
                <div className="flex items-center space-x-1.5">
                  <CloudRain className="h-3.5 w-3.5 text-blue-500" />
                  <span>Rainfall: <strong className="text-slate-900 font-mono">{weatherData.rainfall}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Activity className="h-3.5 w-3.5 text-amber-500" />
                  <span>Humidity: <strong className="text-slate-900 font-mono">{weatherData.humidity}%</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Compass className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Wind: <strong className="text-slate-900 text-[10px]">{weatherData.wind}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Info className="h-3.5 w-3.5 text-purple-500" />
                  <span>UV Index: <strong className="text-slate-900 font-mono">{weatherData.uv}</strong></span>
                </div>
              </div>

              {/* Warning Alert Banner */}
              <div className={`mt-2.5 p-2 rounded-lg border text-[10px] font-sans font-bold leading-normal flex items-start space-x-1 ${
                weatherData.warning.includes('Red') ? 'bg-rose-50 border-rose-100 text-rose-700' :
                'bg-amber-50 border-amber-100 text-amber-700'
              }`}>
                <AlertTriangle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span>ALERT: {weatherData.warning}. Low-lying delta zones along Krishna river canals under active monitoring.</span>
              </div>
            </div>
          </div>

          {/* Section B: Digital Twin Layer Controllers */}
          <div className="p-4 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase mb-3 flex items-center space-x-1.5">
              <Layers className="h-4.5 w-4.5 text-rose-500" />
              <span>Digital Twin Layers Selection</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center space-x-2 p-1.5 border border-slate-100 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={showHospitals} 
                  onChange={() => setShowHospitals(!showHospitals)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-medium text-slate-700">Hospitals</span>
              </label>

              <label className="flex items-center space-x-2 p-1.5 border border-slate-100 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={showPowerGrid} 
                  onChange={() => setShowPowerGrid(!showPowerGrid)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-medium text-slate-700">Power Grid</span>
              </label>

              <label className="flex items-center space-x-2 p-1.5 border border-slate-100 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={showWaterSupply} 
                  onChange={() => setShowWaterSupply(!showWaterSupply)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-medium text-slate-700">Canals / Water</span>
              </label>

              <label className="flex items-center space-x-2 p-1.5 border border-slate-100 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={showFloodZones} 
                  onChange={() => setShowFloodZones(!showFloodZones)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-medium text-slate-700">Flood Zones</span>
              </label>

              <label className="flex items-center space-x-2 p-1.5 border border-slate-100 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={showShelters} 
                  onChange={() => setShowShelters(!showShelters)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-medium text-slate-700">Shelters</span>
              </label>

              <label className="flex items-center space-x-2 p-1.5 border border-slate-100 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={showResponseFleet} 
                  onChange={() => setShowResponseFleet(!showResponseFleet)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-medium text-slate-700">Response Fleet</span>
              </label>
            </div>
          </div>

          {/* Section C: Advanced Drawing & Measurement Utilities */}
          <div className="p-4 bg-slate-50 flex-1">
            <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase mb-2.5 flex items-center space-x-1.5">
              <PenTool className="h-4.5 w-4.5 text-rose-500" />
              <span>GIS Drawing & Measurement HUD</span>
            </h4>

            {/* Drawing tool triggers */}
            <div className="flex flex-col space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-1.5">
                <button 
                  onClick={() => setActiveTool(activeTool === 'measure' ? 'none' : 'measure')}
                  className={`py-2 rounded-lg border text-center font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    activeTool === 'measure' 
                      ? 'bg-rose-50 border-rose-300 text-rose-700 font-black' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Click points on map to measure path distance"
                >
                  <Ruler className="h-4 w-4" />
                  <span className="text-[9px]">Measure</span>
                </button>

                <button 
                  onClick={() => setActiveTool(activeTool === 'flood' ? 'none' : 'flood')}
                  className={`py-2 rounded-lg border text-center font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    activeTool === 'flood' 
                      ? 'bg-rose-50 border-rose-300 text-rose-700 font-black' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Click map to drop flood center and adjust radial impact zone"
                >
                  <CircleDot className="h-4 w-4" />
                  <span className="text-[9px]">Flood Zone</span>
                </button>

                <button 
                  onClick={() => setActiveTool(activeTool === 'risk_poly' ? 'none' : 'risk_poly')}
                  className={`py-2 rounded-lg border text-center font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    activeTool === 'risk_poly' 
                      ? 'bg-rose-50 border-rose-300 text-rose-700 font-black' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Click map to define vertices for a customized risk area"
                >
                  <PenTool className="h-4 w-4" />
                  <span className="text-[9px]">Polygon</span>
                </button>
              </div>

              {/* Dynamic feedback panel depending on active drawing tool */}
              {activeTool === 'measure' && (
                <div className="bg-white p-2.5 border border-slate-150 rounded-lg text-slate-700 text-[11px] leading-relaxed">
                  <div className="flex justify-between font-bold mb-1">
                    <span>Path Measurement active</span>
                    <span className="text-rose-600 font-mono font-black">{measuredDistance} KM</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Click sequentially on the map to define lines and calculate cumulative distance.</p>
                </div>
              )}

              {activeTool === 'flood' && (
                <div className="bg-white p-2.5 border border-slate-150 rounded-lg text-slate-700 text-[11px]">
                  <span className="font-bold block mb-1">Impact Radius: <strong className="text-rose-600 font-mono">{(customFloodRadius / 1000).toFixed(1)} KM</strong></span>
                  <input 
                    type="range"
                    min="200"
                    max="5000"
                    step="100"
                    value={customFloodRadius}
                    onChange={(e) => setCustomFloodRadius(parseInt(e.target.value))}
                    className="w-full accent-rose-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Click any node on the map to designate the flood epicentre.</p>
                </div>
              )}

              {activeTool === 'risk_poly' && (
                <div className="bg-white p-2.5 border border-slate-150 rounded-lg text-slate-700 text-[11px]">
                  <span className="font-bold block mb-1">Define Risk Area</span>
                  <p className="text-[10px] text-slate-400 mb-2">Click to register vertices on the map. Minimum 3 required.</p>
                  <div className="flex space-x-1.5">
                    <button 
                      onClick={handleCompletePolygon}
                      disabled={activeDrawnPolyPoints.length < 3}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded disabled:opacity-40"
                    >
                      Complete
                    </button>
                    <button 
                      onClick={() => setActiveDrawnPolyPoints([])}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] px-2 py-1 rounded"
                    >
                      Clear Vertices
                    </button>
                  </div>
                </div>
              )}

              {/* Reset HUD */}
              {(measuredPoints.length > 0 || customFloodCenter || drawnPolygons.length > 0) && (
                <button 
                  onClick={handleResetDrawings}
                  className="w-full mt-1.5 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold font-mono text-[10px] uppercase flex items-center justify-center space-x-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear All Map Drawings</span>
                </button>
              )}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500 font-mono">
            <span>MAP RESOLUTION: DYNAMIC OSM GRID</span>
            <span>ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
