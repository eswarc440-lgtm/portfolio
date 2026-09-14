import React from 'react';
import { Project } from '../types';
import {
  X,
  Github,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Server,
} from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div
      id="project-case-study-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-3">
            {project.category} • Case Study &amp; Architecture
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white">
            {project.title}
          </h3>
          {project.subtitle && (
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
              {project.subtitle}
            </p>
          )}
        </div>

        {/* Key Metrics / Scope strip */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800">
            {project.metrics.map((m) => (
              <div key={m.label}>
                <span className="block text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase">
                  {m.label}
                </span>
                <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Evidence Separation Notice if SIMRAS */}
        {project.evidencePolicyNote && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Evidence Verification Policy: </span>
              {project.evidencePolicyNote}
            </div>
          </div>
        )}

        {/* Architecture Pipeline if AWS */}
        {project.architectureSteps && (
          <div className="mb-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              Automated Pipeline Architecture
            </h4>
            <div className="space-y-3">
              {project.architectureSteps.map((step, idx) => (
                <div
                  key={step.stage}
                  className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 flex items-start gap-3 text-xs sm:text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-950 dark:text-white">
                        {step.stage}: {step.tool}
                      </span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Scope & Highlights */}
        <div className="mb-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
            Key Architectural Achievements
          </h4>
          <ul className="space-y-2.5">
            {project.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Infrastructure Supported (if SIMRAS) */}
        {project.infrastructureScope && (
          <div className="mb-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Infrastructure Categories Monitored
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.infrastructureScope.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Technologies used */}
        <div className="mb-8">
          <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
            Technology Stack
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-md text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Explore Repository on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-60" />
            </a>
          ) : (
            <span className="text-xs text-neutral-400">Source code internal</span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
