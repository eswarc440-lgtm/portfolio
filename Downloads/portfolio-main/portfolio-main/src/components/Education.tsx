import React from 'react';
import { educationData } from '../data/education';
import {
  GraduationCap,
  Award,
  Calendar,
  BookOpen,
  CheckCircle2,
  Building,
} from 'lucide-react';

export const Education: React.FC = () => {
  return (
    <section
      id="education"
      className="py-20 lg:py-24 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Academic Background
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Education
          </h2>
        </div>

        {/* Education Highlight Card */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 lg:p-10 shadow-xs max-w-4xl">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Undergraduate Degree
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                {educationData.degree}
              </h3>

              <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-neutral-400" />
                  {educationData.institution}
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  {educationData.period}
                </span>
              </div>
            </div>

            {/* CGPA Badge */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-center shrink-0">
              <span className="block text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                Cumulative CGPA
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
                {educationData.cgpa}
              </span>
              <span className="block text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono mt-0.5">
                Scale of 10.0
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Core Coursework */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Core Computer Science Coursework
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                {educationData.coursework.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Academic Highlights & NPTEL */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Academic Milestones &amp; NPTEL
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                {educationData.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
