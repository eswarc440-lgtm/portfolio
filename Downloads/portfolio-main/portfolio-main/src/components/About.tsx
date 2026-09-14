import React from 'react';
import {
  GraduationCap,
  Award,
  Cloud,
  Cpu,
  Terminal,
  CheckCircle2,
  Target,
  FileText,
  Sparkles,
} from 'lucide-react';
import { fullResumeData } from '../data/resume';

interface AboutProps {
  onOpenResume?: () => void;
}

export const About: React.FC<AboutProps> = ({ onOpenResume }) => {
  const highlights = [
    {
      id: 'highlight-degree',
      title: 'B.Tech CSE',
      subtitle: 'NRI Institute of Technology',
      description: 'Computer Science & Engineering student with solid fundamentals in distributed systems, networks, and algorithms.',
      icon: GraduationCap,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-100 dark:border-blue-900/40',
    },
    {
      id: 'highlight-cgpa',
      title: 'CGPA 8.97',
      subtitle: 'Academic Excellence (out of 10.0)',
      description: 'Maintained top-tier academic performance while independently implementing cloud and software deployment projects.',
      icon: Award,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/40',
    },
    {
      id: 'highlight-devops',
      title: 'DevOps & Cloud',
      subtitle: 'AWS, Docker & CI/CD Pipelines',
      description: 'Hands-on experience automating deployments from GitHub commits to live EC2 Linux instances through CodePipeline and Nginx.',
      icon: Cloud,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-100 dark:border-indigo-900/40',
    },
    {
      id: 'highlight-ai-twin',
      title: 'AI + Digital Twin',
      subtitle: 'Geospatial ML & 3D Asset Twins',
      description: 'Engineered SIMRAS, combining 23,000+ geospatial records, deterioration predictive pipelines (~0.83 ROC-AUC), and 3D visualization.',
      icon: Cpu,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/40',
    },
  ];

  return (
    <section
      id="about"
      className="py-20 lg:py-24 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Background &amp; Profile
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white">
              Professional Summary
            </h2>
          </div>

          <button
            type="button"
            onClick={onOpenResume}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Open Interactive Resume</span>
          </button>
        </div>

        {/* Professional Summary Quote Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mb-12 shadow-xs">
          <p className="text-base sm:text-lg text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal">
            "{fullResumeData.professionalSummary}"
          </p>

          <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-950 dark:text-white">Eswar</span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-600 dark:text-neutral-400 font-mono">B.Tech CSE (2024–2028)</span>
              <span className="text-neutral-400">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">NRI Institute of Technology</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-neutral-500">
              <span>Andhra Pradesh, India</span>
              <span>•</span>
              <a href="tel:7396117646" className="text-blue-600 hover:underline">
                +91 7396117646
              </a>
            </div>
          </div>
        </div>

        {/* Highlights & Strengths Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Four Academic/Technical Focus Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  id={item.id}
                  className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bg} ${item.border} border`}>
                        <IconComponent className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Focus
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                      {item.subtitle}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Strengths Checklist */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                Core Engineering Strengths
              </h3>
            </div>

            <ul className="space-y-3">
              {fullResumeData.strengths.map((str, index) => (
                <li key={index} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>

            {/* Career Objective Banner */}
            <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                <Target className="w-3.5 h-3.5" />
                <span>Career Objective</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {fullResumeData.careerObjective}
              </p>
            </div>
          </div>
        </div>

        {/* Dedicated Research & Paid Internship Callout Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-emerald-50/70 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-emerald-950/20 border border-blue-200/80 dark:border-blue-900/60 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-600 text-white text-[11px] font-semibold uppercase tracking-wider">
                Opportunity Target
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white">
                Research-Oriented Work &amp; Paid Internships
              </h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {fullResumeData.targetOpportunities.note}
              </p>

              {/* Research and Internship Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider font-mono">
                    Target Roles:
                  </span>
                  <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                    {fullResumeData.targetOpportunities.types.map((type, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                        <span>{type}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">
                    Research Focus Areas:
                  </span>
                  <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                    {fullResumeData.targetOpportunities.researchFocus.map((focus, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                        <span>{focus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 self-start lg:self-center">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
              >
                <span>Discuss Internship Opportunity</span>
              </a>
              <button
                type="button"
                onClick={onOpenResume}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 transition-colors shadow-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>View Full Credentials</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
