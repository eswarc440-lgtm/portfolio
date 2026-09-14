import React from 'react';
import { experienceData } from '../data/experience';
import {
  Calendar,
  Cloud,
  Terminal,
  CheckCircle2,
  GitBranch,
  Server,
  Layers,
} from 'lucide-react';

export const Experience: React.FC = () => {
  return (
    <section
      id="experience"
      className="py-20 lg:py-24 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Practical Learning &amp; Applied Work
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Applied Engineering Experience
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Hands-on technical milestones, cloud infrastructure setups, and automated deployment architectures built and verified in live server environments.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-neutral-200 dark:border-neutral-800 space-y-12 max-w-4xl">
          {experienceData.map((item, index) => (
            <div key={index} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-neutral-950 shadow-xs group-hover:scale-125 transition-transform" />

              {/* Experience Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white">
                    {item.title}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{item.period}</span>
                  </div>
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
                  {item.type}
                </p>

                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Bullets */}
                <div className="space-y-2.5 mb-6">
                  {item.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Tech Pills */}
                <div className="pt-5 border-t border-neutral-100 dark:border-neutral-800/80">
                  <span className="block text-[11px] font-mono uppercase text-neutral-400 dark:text-neutral-500 mb-2">
                    Technologies &amp; Protocols Applied
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Transparency Note */}
                {item.note && (
                  <div className="mt-4 text-[11px] text-neutral-400 dark:text-neutral-500 italic">
                    * {item.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
