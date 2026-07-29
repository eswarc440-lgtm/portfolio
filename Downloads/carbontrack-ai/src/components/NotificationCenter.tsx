import React from 'react';
import { Bell, Trash2, CheckCircle2, AlertCircle, Sparkles, Calendar } from 'lucide-react';

interface NotificationCenterProps {
  notifications: string[];
  onClearAll: () => void;
  onRemoveNotification: (index: number) => void;
  onAddMockNotification: (message: string) => void;
}

export default function NotificationCenter({
  notifications,
  onClearAll,
  onRemoveNotification,
  onAddMockNotification
}: NotificationCenterProps) {
  
  // Custom mock alerts
  const sampleNotifications = [
    "New ESG framework compliance checked successfully.",
    "Carbon offset coefficient updated by BMK Vamsi.",
    "Eco drill completed: Zero emission commute logged today!",
    "Streak status verified: jashwanth is on a 4-day streak!",
    "Monthly target CO₂ updated in settings."
  ];

  const getIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('completed') || t.includes('success') || t.includes('unlocked')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
    if (t.includes('milestone') || t.includes('streak') || t.includes('xp')) {
      return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
    if (t.includes('audit') || t.includes('comply') || t.includes('esg')) {
      return <Calendar className="w-4 h-4 text-blue-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div id="notifications-page" className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display flex items-center space-x-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            <span>Notification Center</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time alerts, system audits, and progress updates from the Sattva platform.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 self-start md:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Alerts</span>
          </button>
        )}
      </div>

      {/* Grid of Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Notifications list */}
        <div className="lg:col-span-2 space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white border border-emerald-100/60 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Your Inbox is Clean</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                No active notifications or alerts. When goals are updated or targets are reached, alerts will display here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((notif, index) => (
                <div 
                  key={index}
                  className="bg-white border border-emerald-100/50 hover:border-emerald-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-start justify-between gap-4 group"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl shrink-0 mt-0.5">
                      {getIcon(notif)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed">{notif}</p>
                      <span className="text-[9px] text-slate-400 font-mono mt-1 block">JUST NOW • SYSTEM ALERT</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveNotification(index)}
                    className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    title="Dismiss alert"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Mock Generator & Info Box */}
        <div className="space-y-6">
          
          {/* Quick Mock Alerts Generator */}
          <div className="bg-white border border-emerald-100/60 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">Sandbox Simulator</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Inject standard test events to verify the real-time Notification Center system.
            </p>
            
            <div className="mt-4 space-y-2">
              {sampleNotifications.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => onAddMockNotification(sample)}
                  className="w-full text-left p-2.5 bg-slate-50 hover:bg-emerald-50/50 text-[10px] font-medium text-slate-600 hover:text-emerald-800 border border-slate-100 hover:border-emerald-100 rounded-xl transition-all truncate block"
                  title={sample}
                >
                  + {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Compliance Card */}
          <div className="bg-[#11251e] text-[#bbf7d0] rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <Bell className="w-32 h-32 text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-emerald-400 uppercase">Alert Policies</h3>
            <p className="text-[11px] text-emerald-200/80 mt-2 leading-relaxed">
              Sattva employs dynamic notification queues synchronized directly with Firestore. Users are alerted for:
            </p>
            <ul className="text-[10px] space-y-1.5 mt-3 text-emerald-100/90 list-disc list-inside">
              <li>Goals crossing the 80% boundary</li>
              <li>Successful XP reward redemption</li>
              <li>Logistics factor adjustments</li>
              <li>Collaborative streak milestones</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
