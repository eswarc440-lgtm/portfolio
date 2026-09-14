import React, { useState } from 'react';
import { projectsData } from '../data/projects';
import { Project } from '../types';
import { ProjectModal } from './ProjectModal';
import {
  Github,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Server,
  Cloud,
  CheckCircle2,
  Maximize2,
  Workflow,
  Sparkles,
} from 'lucide-react';

export const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeSimrasScreenshot, setActiveSimrasScreenshot] = useState<string>('dashboard');

  const simrasProject = projectsData.find((p) => p.id === 'simras');
  const cicdProject = projectsData.find((p) => p.id === 'aws-cicd');
  const disasterProject = projectsData.find((p) => p.id === 'smart-disaster');

  const currentScreenshot = simrasProject?.screenshots?.find(
    (s) => s.id === activeSimrasScreenshot
  ) || simrasProject?.screenshots?.[0];

  return (
    <section
      id="projects"
      className="py-20 lg:py-28 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Featured Work
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Architected &amp; Built Projects
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Real-world systems spanning automated CI/CD pipelines on AWS, AI-based infrastructure risk prediction, and geospatial digital twins.
          </p>
        </div>

        {/* ======================================================== */}
        {/* PROJECT 1 — SIMRAS (Flagship Hero Card) */}
        {/* ======================================================== */}
        {simrasProject && (
          <div
            id="project-card-simras"
            className="mb-16 rounded-2xl bg-neutral-50/70 dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 overflow-hidden shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
          >
            {/* Top Bar Header */}
            <div className="p-6 sm:p-8 lg:p-10 border-b border-neutral-200/80 dark:border-neutral-800">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600 text-white shadow-2xs">
                    Flagship Research &amp; Engineering
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    🔬 R&amp;D Project
                  </span>
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    AI • Digital Twin • GIS • FastAPI • 23K+ Assets
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    id="simras-github-link"
                    href={simrasProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors shadow-2xs"
                    title="View SIMRAS GitHub repository (opens new tab)"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View GitHub</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>

                  <button
                    id="simras-casestudy-btn"
                    onClick={() => setSelectedProject(simrasProject)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors cursor-pointer"
                  >
                    <span>Case Study Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white mb-2">
                {simrasProject.title}
              </h3>
              <p className="text-base sm:text-lg font-medium text-blue-600 dark:text-blue-400 mb-4">
                {simrasProject.subtitle}
              </p>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-3xl leading-relaxed mb-6">
                {simrasProject.description}
              </p>

              {/* Real Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {simrasProject.metrics?.map((metric) => (
                  <div
                    key={metric.label}
                    className="p-3.5 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60"
                  >
                    <span className="block text-[11px] font-mono uppercase text-neutral-400 dark:text-neutral-500">
                      {metric.label}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle: Interactive Screenshot Showcase */}
            <div className="p-6 sm:p-8 lg:p-10 bg-neutral-100/60 dark:bg-neutral-950/60 border-b border-neutral-200/80 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Platform Views &amp; Dashboards
                </span>

                {/* Screenshot Tabs */}
                <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  {simrasProject.screenshots?.map((shot) => (
                    <button
                      key={shot.id}
                      id={`simras-tab-${shot.id}`}
                      onClick={() => setActiveSimrasScreenshot(shot.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        activeSimrasScreenshot === shot.id
                          ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                      }`}
                    >
                      {shot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Large Screenshot Frame */}
              <div className="relative rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-900 shadow-md">
                {currentScreenshot && (
                  <div className="relative">
                    <img
                      src={currentScreenshot.src}
                      alt={`SIMRAS - ${currentScreenshot.label}`}
                      className="w-full h-auto max-h-[500px] object-cover object-top"
                      loading="lazy"
                    />

                    {/* Screenshot Caption Bar */}
                    <div className="p-3.5 bg-neutral-950/90 backdrop-blur-md text-white border-t border-neutral-800 flex items-center justify-between gap-4">
                      <div className="text-xs sm:text-sm text-neutral-300">
                        <span className="font-semibold text-blue-400 mr-2">
                          {currentScreenshot.label}:
                        </span>
                        {currentScreenshot.caption}
                      </div>

                      <button
                        onClick={() => setSelectedProject(simrasProject)}
                        className="hidden sm:inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white shrink-0 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Full Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Supported Assets & Highlights */}
            <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Highlights */}
              <div className="lg:col-span-7">
                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Engineering Highlights
                </h4>
                <ul className="space-y-2.5">
                  {simrasProject.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scope & Tech Stack */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3">
                    Infrastructure Assets Supported
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {simrasProject.infrastructureScope?.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3">
                    Technology Stack
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {simrasProject.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 rounded-md text-[11px] font-mono bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PROJECT 2 — AWS AUTOMATED CI/CD (Architecture Focus) */}
        {/* ======================================================== */}
        {cicdProject && (
          <div
            id="project-card-aws-cicd"
            className="mb-16 rounded-2xl bg-neutral-50/70 dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 lg:p-10 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60">
                  AWS Cloud Architecture
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white mt-2">
                  {cicdProject.title}
                </h3>
              </div>

              <a
                id="aws-cicd-github-link"
                href={cicdProject.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors shadow-2xs"
                title="View AWS CI/CD GitHub repository (opens new tab)"
              >
                <Github className="w-3.5 h-3.5" />
                <span>View Repository</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-3xl leading-relaxed mb-8">
              {cicdProject.description}
            </p>

            {/* PROMINENT ARCHITECTURE FLOW DIAGRAM (Prompt Mandate) */}
            <div className="mb-8 p-6 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Automated Deployment Flowchart
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  Zero Manual Intervention
                </span>
              </div>

              {/* Horizontal Responsive Flow */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {cicdProject.architectureSteps?.map((step, idx) => (
                  <div
                    key={step.stage}
                    className="relative p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between group hover:border-blue-500/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 font-bold">
                          Step 0{idx + 1}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <p className="text-xs font-bold text-neutral-950 dark:text-white">
                        {step.tool}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                        {step.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-[10px] font-mono text-neutral-400">
                      {step.stage}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights & Tech Tags */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3">
                  Pipeline Engineering Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cicdProject.highlights.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white dark:bg-neutral-850 border border-neutral-200/70 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3">
                  Infrastructure Stack
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {cicdProject.technologies.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-white dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PROJECT 3 — SMART DISASTER RESOURCE ALLOCATION (Compact) */}
        {/* ======================================================== */}
        {disasterProject && (
          <div
            id="project-card-disaster"
            className="rounded-2xl bg-neutral-50/70 dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all max-w-4xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
                Algorithms &amp; Systems
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Optimization &amp; Spatial Modeling
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mb-2">
              {disasterProject.title}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-5">
              {disasterProject.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {disasterProject.highlights.map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 mt-1.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              {disasterProject.technologies.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Case Study Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};
