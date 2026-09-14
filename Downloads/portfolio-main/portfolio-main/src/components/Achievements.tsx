import React, { useState } from 'react';
import { achievementsData } from '../data/achievements';
import { AchievementItem } from '../types';
import {
  Award,
  Calendar,
  ExternalLink,
  CheckCircle2,
  FileCheck,
  Building,
  UserCheck,
  ShieldCheck,
  X,
  FileText,
  Users,
} from 'lucide-react';

export const Achievements: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'certifications' | 'hackathons' | 'campus'>('all');
  const [selectedCert, setSelectedCert] = useState<AchievementItem | null>(null);

  const tabs: { id: 'all' | 'certifications' | 'hackathons' | 'campus'; label: string }[] = [
    { id: 'all', label: 'All Items' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'hackathons', label: 'Hackathons & Competitions' },
    { id: 'campus', label: 'Campus Activities' },
  ];

  const filteredItems = achievementsData.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  return (
    <section
      id="achievements"
      className="py-20 lg:py-24 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Credentials &amp; Participation
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Achievements &amp; Certifications
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Verified academic certifications, technical competition participation records, and student activities.
          </p>
        </div>

        {/* Verification Ethics Note */}
        <div className="mb-8 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2.5 max-w-2xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Authenticity Guarantee:</strong> All items represent verified courses, official technical events, or confirmed participant roles without unsubstantiated claims.
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              id={`card-${item.id}`}
              className="rounded-xl bg-neutral-50/70 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:shadow-xs"
            >
              <div>
                {/* Card Top Pill & Year */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 border border-neutral-200 dark:border-neutral-700">
                    {item.categoryLabel}
                  </span>
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    {item.year}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-neutral-950 dark:text-white mb-1.5">
                  {item.title}
                </h3>

                {/* Issuer / Organizer */}
                {item.issuer && (
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{item.issuer}</span>
                  </p>
                )}

                {item.role && (
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Role: {item.role}</span>
                  </p>
                )}

                {/* Description */}
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Skills tags */}
                {item.skills && item.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>

                <button
                  onClick={() => setSelectedCert(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate / Verification Detail Modal */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                {selectedCert.categoryLabel}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {selectedCert.year}
              </span>
            </div>

            <h3 className="text-xl font-bold text-neutral-950 dark:text-white mb-2">
              {selectedCert.title}
            </h3>

            {selectedCert.issuer && (
              <p className="text-xs text-neutral-500 mb-4">
                Issued / Organized by: <span className="text-neutral-800 dark:text-neutral-200 font-medium">{selectedCert.issuer}</span>
              </p>
            )}

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 mb-5 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {selectedCert.description}
            </div>

            <div className="mb-6">
              <span className="block text-[11px] uppercase font-mono text-neutral-400 mb-2">
                Core Competencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCert.skills?.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 mb-6">
              Official certificate copy stored under <code className="font-mono font-bold">public/certificates/</code>. Replace with your official scanned PDF or image anytime.
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
