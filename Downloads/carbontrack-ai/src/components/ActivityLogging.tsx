import React, { useState, useMemo } from 'react';
import { 
  Car, Zap, Utensils, ShoppingBag, Plane, Trash, 
  Plus, Calendar, MapPin, FileText, Search, Filter, Trash2, ArrowUpDown, Navigation
} from 'lucide-react';
import { Activity, ActivityCategory, EmissionFactor } from '../types';
import { DEFAULT_EMISSION_FACTORS, calculateEmissions } from '../utils/emissions';

interface ActivityLoggingProps {
  activities: Activity[];
  onAddActivity: (activity: Omit<Activity, 'id' | 'userId' | 'userName' | 'userEmail'>) => void;
  onDeleteActivity: (id: string) => void;
  emissionFactors?: EmissionFactor[];
}

export default function ActivityLogging({ activities, onAddActivity, onDeleteActivity, emissionFactors = DEFAULT_EMISSION_FACTORS }: ActivityLoggingProps) {
  const [activeCategory, setActiveCategory] = useState<ActivityCategory>('transport');
  
  // Form state
  const [type, setType] = useState('Petrol Car');
  const [quantity, setQuantity] = useState<number>(10);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Ledger state: search, filter, pagination, sorting
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'emissions' | 'quantity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Filter types based on category
  const selectTypes = useMemo(() => {
    return emissionFactors.filter(f => f.category === activeCategory);
  }, [activeCategory, emissionFactors]);

  // Set default type when category changes
  const handleCategoryChange = (cat: ActivityCategory) => {
    setActiveCategory(cat);
    const defaults = emissionFactors.filter(f => f.category === cat);
    if (defaults.length > 0) {
      setType(defaults[0].type);
      setQuantity(cat === 'electricity' ? 50 : cat === 'food' ? 1 : cat === 'waste' ? 5 : 10);
    }
  };

  const getUnit = useMemo(() => {
    const factor = emissionFactors.find(f => f.category === activeCategory && f.type === type);
    return factor ? factor.unit : 'units';
  }, [activeCategory, type, emissionFactors]);

  const liveEmissions = useMemo(() => {
    return calculateEmissions(activeCategory, type, Number(quantity) || 0, emissionFactors);
  }, [activeCategory, type, quantity, emissionFactors]);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        try {
          // Use Nominatim reverse geocoding API to find human-readable address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'CarbonTrackAI/1.0'
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            const addressStr = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            const parts = addressStr.split(', ');
            // Get city/region/country parts
            const cleanAddress = parts.slice(0, 3).join(', ');
            setLocation(cleanAddress);
          } else {
            setLocation(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setLocation(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let msg = "Failed to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Permission to access location was denied. Please check your browser or frame settings.";
        }
        setLocationError(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(quantity) <= 0) return;

    onAddActivity({
      category: activeCategory,
      type,
      quantity,
      unit: getUnit,
      date,
      emissions: liveEmissions,
      notes: notes || undefined,
      location: location || undefined,
      latitude,
      longitude
    });

    // Reset inputs
    setNotes('');
    setLocation('');
    setLatitude(undefined);
    setLongitude(undefined);
    setLocationError(null);
  };

  // Sort and filter ledger activities
  const processedActivities = useMemo(() => {
    let result = [...activities];

    // Search query
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(act => 
        act.type.toLowerCase().includes(q) || 
        (act.notes && act.notes.toLowerCase().includes(q)) ||
        (act.location && act.location.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(act => act.category === filterCategory);
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [activities, search, filterCategory, sortField, sortOrder]);

  // Paginated activities
  const paginatedActivities = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return processedActivities.slice(start, start + itemsPerPage);
  }, [processedActivities, page]);

  const totalPages = Math.ceil(processedActivities.length / itemsPerPage) || 1;

  const toggleSort = (field: 'date' | 'emissions' | 'quantity') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div id="logging-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* LEFT COLUMN: Carbon logging form */}
      <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-fit">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Record Environmental Activity</h2>
        <p className="text-xs text-gray-400 mb-6">Compile Scope 1, 2, and 3 activities with auto emissions calculations</p>

        {/* Category icons Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {[
            { id: 'transport', label: 'Travel', icon: <Car className="w-4 h-4" /> },
            { id: 'electricity', label: 'Power', icon: <Zap className="w-4 h-4" /> },
            { id: 'food', label: 'Diet', icon: <Utensils className="w-4 h-4" /> },
            { id: 'shopping', label: 'Goods', icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'travel', label: 'Flights', icon: <Plane className="w-4 h-4" /> },
            { id: 'waste', label: 'Refuse', icon: <Trash className="w-4 h-4" /> }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as ActivityCategory)}
              type="button"
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                activeCategory === cat.id 
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' 
                  : 'border-gray-100 bg-white hover:bg-gray-50 text-gray-500'
              }`}
            >
              {cat.icon}
              <span className="text-[10px] font-semibold">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Selected parameters input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Activity Setup Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {selectTypes.map((factor) => (
                <option key={factor.type} value={factor.type}>
                  {factor.type} ({factor.factor} kg CO₂e/{factor.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Quantity ({getUnit})</label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Location / Zone (Optional)</label>
              <button
                type="button"
                onClick={handleGeolocate}
                disabled={isLocating}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:text-gray-400 flex items-center space-x-1 transition-colors"
              >
                <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'Get Real Location'}</span>
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (latitude !== undefined) {
                    setLatitude(undefined);
                    setLongitude(undefined);
                  }
                }}
                placeholder="e.g. Headquarters, Home, SFO Flight"
                className="pl-9 pr-20 w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              {latitude !== undefined && longitude !== undefined && (
                <div className="absolute right-3 inset-y-0 flex items-center">
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md px-1.5 py-0.5 font-bold">
                    GPS Set
                  </span>
                </div>
              )}
            </div>

            {latitude !== undefined && longitude !== undefined && (
              <p className="text-[10px] font-mono text-emerald-600 mt-1 flex justify-between items-center bg-emerald-50/40 px-2 py-1 rounded border border-emerald-100/50">
                <span>📍 Coords: {latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                <button
                  type="button"
                  onClick={() => {
                    setLatitude(undefined);
                    setLongitude(undefined);
                    setLocation('');
                  }}
                  className="hover:text-red-600 font-bold"
                >
                  Clear GPS
                </button>
              </p>
            )}

            {locationError && (
              <p className="text-[10px] text-red-500 mt-1 font-medium bg-red-50 p-2 rounded border border-red-100">{locationError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notes / Context</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide specific notes regarding transit cargo or food footprint details..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none resize-none"
            />
          </div>

          {/* Dynamic Carbon preview widget */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest">Calculated Carbon footprint</span>
              <div className="text-xl font-black text-emerald-950 mt-1">{liveEmissions} kg CO₂e</div>
            </div>
            <span className="text-2xl animate-pulse">🌱</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Commit Record to Firestore</span>
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: Ledger history */}
      <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">GHG Ledger Records</h2>
              <p className="text-xs text-gray-400">Review, query, and filter structured emission audits</p>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {/* Search input */}
              <div className="relative flex-1 sm:flex-initial">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Query ledger..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-8 py-1.5 border border-gray-200 rounded-lg text-xs outline-none w-full"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className="py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-600 outline-none"
              >
                <option value="all">All Sectors</option>
                <option value="transport">Travel</option>
                <option value="electricity">Power</option>
                <option value="food">Diet</option>
                <option value="shopping">Goods</option>
                <option value="travel">Flights</option>
                <option value="waste">Refuse</option>
              </select>
            </div>
          </div>

          {/* Table ledger */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-mono uppercase tracking-wider">
                  <th className="pb-3 cursor-pointer hover:text-gray-900" onClick={() => toggleSort('date')}>
                    Date <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                  </th>
                  <th className="pb-3">Sector</th>
                  <th className="pb-3">Details</th>
                  <th className="pb-3 cursor-pointer hover:text-gray-900" onClick={() => toggleSort('quantity')}>
                    Amount <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                  </th>
                  <th className="pb-3 cursor-pointer hover:text-gray-900" onClick={() => toggleSort('emissions')}>
                    Emissions <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                  </th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {paginatedActivities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      No matching environmental logs resolved
                    </td>
                  </tr>
                ) : (
                  paginatedActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-mono text-gray-500">{act.date}</td>
                      <td className="py-3 capitalize font-semibold text-gray-700">{act.category}</td>
                      <td className="py-3">
                        <div className="font-medium text-gray-900">{act.type}</div>
                        {act.notes && <div className="text-[10px] text-gray-400 line-clamp-1">{act.notes}</div>}
                      </td>
                      <td className="py-3 font-mono text-gray-600">{act.quantity} {act.unit}</td>
                      <td className="py-3">
                        <span className="font-bold text-red-600">+{act.emissions}</span>
                        <span className="text-[9px] text-gray-400 font-mono ml-0.5">kg CO₂e</span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onDeleteActivity(act.id)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4 text-xs">
            <span className="text-gray-400 font-mono">Page {page} of {totalPages}</span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-gray-600 font-semibold"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-gray-600 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
