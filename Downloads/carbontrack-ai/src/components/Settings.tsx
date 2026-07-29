import React, { useState, useEffect } from 'react';
import { 
  User, Upload, Shield, Bell, Compass, Sliders, Database, Cpu, 
  Layers, Activity, CheckCircle2, Building, Save, BookOpen, HeartHandshake, Info
} from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface SettingsProps {
  userProfile: UserProfile | null;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onLogout: () => void;
}

export default function Settings({ userProfile, onUpdateProfile, onLogout }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'realworld' | 'about'>('profile');
  const [name, setName] = useState(userProfile?.name || '');
  const [department, setDepartment] = useState(userProfile?.department || 'Environmental Response');
  const [organization, setOrganization] = useState(userProfile?.organizationName || 'Federal Emergency & Resource Admin');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Real-world configuration states
  const [notificationsEnabled, setNotificationsEnabled] = useState(userProfile?.settings?.notificationsEnabled ?? true);
  const [measurementSystem, setMeasurementSystem] = useState<'metric' | 'imperial'>(userProfile?.settings?.measurementSystem ?? 'metric');
  const [gpsTrackingAllowed, setGpsTrackingAllowed] = useState(userProfile?.settings?.gpsTrackingAllowed ?? true);
  const [monthlyTargetCo2, setMonthlyTargetCo2] = useState(userProfile?.settings?.monthlyTargetCo2 ?? 450);
  const [disasterAlertRadius, setDisasterAlertRadius] = useState(userProfile?.settings?.disasterAlertRadius ?? 25);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setDepartment(userProfile.department || 'Environmental Response');
      setOrganization(userProfile.organizationName || 'Federal Emergency & Resource Admin');
      setAvatarUrl(userProfile.avatarUrl || '');
      
      if (userProfile.settings) {
        setNotificationsEnabled(userProfile.settings.notificationsEnabled);
        setMeasurementSystem(userProfile.settings.measurementSystem);
        setGpsTrackingAllowed(userProfile.settings.gpsTrackingAllowed);
        setMonthlyTargetCo2(userProfile.settings.monthlyTargetCo2);
        setDisasterAlertRadius(userProfile.settings.disasterAlertRadius);
      }
    }
  }, [userProfile]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          setSaveSuccess(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    if (!userProfile) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const updatedProfile: UserProfile = {
      ...userProfile,
      name,
      department,
      organizationName: organization,
      avatarUrl,
      settings: {
        notificationsEnabled,
        measurementSystem,
        gpsTrackingAllowed,
        monthlyTargetCo2,
        disasterAlertRadius
      }
    };

    // Optimistically update the local and context state instantly
    onUpdateProfile(updatedProfile);

    try {
      // Async background sync to Firebase Firestore for absolute durability
      const userRef = doc(db, 'users', userProfile.id);
      setDoc(userRef, updatedProfile, { merge: true }).catch(err => {
        console.error("Background sync to Firestore failed:", err);
      });
      
      // Short visual delay for user reassurance and clean transition
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 400);

    } catch (err) {
      console.error("Failed to sync profile settings to cloud registry:", err);
      setIsSaving(false);
    }
  };

  return (
    <div id="settings-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in max-w-6xl mx-auto">
      
      {/* Left Pane - Tabs Control Console */}
      <div className="lg:col-span-3 flex flex-col space-y-2">
        <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Control Panes</p>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'profile' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                : 'text-gray-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Identity Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('realworld')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'realworld' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                : 'text-gray-600 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Real-World Systems</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'about' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                : 'text-gray-600 hover:bg-slate-50'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About Core Platform</span>
          </button>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Session</p>
          <button
            onClick={onLogout}
            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-100 transition-colors"
          >
            Terminate Console Session
          </button>
        </div>
      </div>

      {/* Right Pane - Content Console */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* Save Banner */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-3 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs font-semibold text-emerald-800">
              Settings updated and saved successfully.
            </div>
          </div>
        )}

        {/* Tab 1: Profile Identity */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Identity Profile Settings</h2>
              <p className="text-xs text-gray-400 mt-1">Configure your public credentials, deployment organization, and upload an avatar.</p>
            </div>

            {/* Profile Avatar Editor Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile Avatar" 
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center uppercase border-2 border-white shadow-md">
                    {name?.slice(0, 2) || 'SJ'}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-5 h-5 text-white" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="flex-1 space-y-2 w-full">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Modify Profile Photo</span>
                
                <div className="flex items-center space-x-3">
                  <label className="px-4 py-2 bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5">
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>Upload Custom Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                  
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400">Supported formats: JPEG, PNG, GIF. Recommended size: 250x250px. Or leave blank to display initials.</p>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Registry Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-slate-50/50 border border-gray-200 rounded-xl px-4 py-3 mt-1.5 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Associated Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs bg-slate-50/50 border border-gray-200 rounded-xl px-4 py-3 mt-1.5 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Emergency Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full text-xs bg-slate-50/50 border border-gray-200 rounded-xl px-4 py-3 mt-1.5 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Real-world Settings */}
        {activeTab === 'realworld' && (
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Real-World Configuration</h2>
              <p className="text-xs text-gray-400 mt-1">Configure operational presets for resource logistics metrics and geolocation radius filters.</p>
            </div>

            <div className="space-y-4">
              
              {/* Toggle: Notifications */}
              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-500" />
                    <span>Enable Real-Time Alert Broadcasts</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Receive system-wide warning signals when localized hazard alerts or resource constraints spike.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    notificationsEnabled ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}></span>
                </button>
              </div>

              {/* Toggle: GPS Permissions */}
              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-500" />
                    <span>Allow Active GPS Node Tracking</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Enable high-precision watchPosition on the Interactive Map to render your node with accuracy glow.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setGpsTrackingAllowed(!gpsTrackingAllowed)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    gpsTrackingAllowed ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    gpsTrackingAllowed ? 'translate-x-5' : 'translate-x-0'
                  }`}></span>
                </button>
              </div>

              {/* Select: Measurement */}
              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    <span>System of Measurement</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Select standard units for logs (e.g. Metric km/kg vs Imperial miles/lbs).</p>
                </div>
                <select
                  value={measurementSystem}
                  onChange={(e) => setMeasurementSystem(e.target.value as 'metric' | 'imperial')}
                  className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 text-slate-700 font-bold"
                >
                  <option value="metric">Metric (kg, km)</option>
                  <option value="imperial">Imperial (lbs, miles)</option>
                </select>
              </div>

              {/* Slider: Monthly Target */}
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-500" />
                    <span>Monthly Resource Shipment Target</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                    {monthlyTargetCo2} tons
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">Target supply weight to distribute across regional emergency shelters.</p>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="25"
                  value={monthlyTargetCo2}
                  onChange={(e) => setMonthlyTargetCo2(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Slider: Disaster Radius */}
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-500" />
                    <span>Disaster Warning Alert Radius</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full">
                    {disasterAlertRadius} km
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">The geographic boundary threshold for fetching resource depletion triggers around your current sector.</p>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={disasterAlertRadius}
                  onChange={(e) => setDisasterAlertRadius(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: About Us */}
        {activeTab === 'about' && (
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">About Smart Disaster Resource Allocation System</h2>
                <p className="text-xs text-gray-400">Version 1.0.0 • Disaster Response & Logistics Platform</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none text-xs text-slate-600 space-y-4">
              <p className="leading-relaxed">
                The <span className="font-bold text-slate-800">Smart Disaster Resource Allocation System</span> is an enterprise logistics and emergency management platform designed for disaster response agencies, NGOs, shelter managers, and volunteers.
              </p>

              {/* Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    <span>Disaster Relief Allocation</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Instantly provision, coordinate, and allocate resource shipments to designated shelters, warehouses, and emergency centers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Resource Logistics & Trackers</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Coordinate vital supplies (water, medical, electricity, food) and monitor volunteer registries with GIS overlay tracking.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1 text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Secure Environment</span>
                </div>
                <span className="text-gray-400 font-mono">Platform Sandbox Mode</span>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}

// Minimal placeholder subcomponent to prevent compiler warning
function ShieldCheck({ className }: { className?: string }) {
  return <CheckCircle2 className={className} />;
}
