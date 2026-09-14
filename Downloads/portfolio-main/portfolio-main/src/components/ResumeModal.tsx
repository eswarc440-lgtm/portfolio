import React, { useState } from 'react';
import { fullResumeData } from '../data/resume';
import {
  X,
  FileDown,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
} from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyRawText = () => {
    const raw = `ESWAR
Aspiring DevOps & Cloud Engineer | B.Tech CSE | AWS | Docker | CI/CD | Linux
📍 ${fullResumeData.location}
📞 ${fullResumeData.phone} | ✉️ ${fullResumeData.email}
🔗 GitHub: ${fullResumeData.githubUrl}
🔗 LinkedIn: ${fullResumeData.linkedinUrl}

PROFESSIONAL SUMMARY
${fullResumeData.professionalSummary}

EDUCATION
${fullResumeData.education.degree}
${fullResumeData.education.institution}
Expected Graduation: ${fullResumeData.education.expectedGraduation}
CGPA: ${fullResumeData.education.cgpa}

TECHNICAL SKILLS
${fullResumeData.skills.map((s) => `${s.category}: ${s.items}`).join('\n')}

PROJECTS
${fullResumeData.projects
  .map(
    (p) =>
      `${p.title}\n${p.tags}\n${p.points.map((pt) => `• ${pt}`).join('\n')}${
        p.githubUrl ? `\nGitHub: ${p.githubUrl}` : ''
      }`
  )
  .join('\n\n')}

CERTIFICATIONS & COURSES
${fullResumeData.certifications
  .map((c) => `${c.title}\n${c.points.map((pt) => `• ${pt}`).join('\n')}`)
  .join('\n\n')}

AREAS OF INTEREST
${fullResumeData.areasOfInterest.join(' • ')}

TARGET OPPORTUNITIES & AVAILABILITY
• Status: ${fullResumeData.targetOpportunities.status}
• Target Roles: ${fullResumeData.targetOpportunities.types.join(', ')}
• Research Focus: ${fullResumeData.targetOpportunities.researchFocus.join('; ')}
• Availability: ${fullResumeData.targetOpportunities.note}

STRENGTHS
${fullResumeData.strengths.map((st) => `• ${st}`).join('\n')}

CAREER OBJECTIVE
${fullResumeData.careerObjective}`;

    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="resume-viewer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-neutral-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-base font-bold text-neutral-950 dark:text-white">
              Official Resume Preview — ESWAR
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRawText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Copy formatted text to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Print or Save as PDF via Browser"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-500" />
              <span>Print</span>
            </button>

            <a
              href="/Eswar_Resume.pdf"
              download="Eswar_Resume.pdf"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 ml-1 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Resume Sheet */}
        <div className="overflow-y-auto p-6 sm:p-10 bg-neutral-100 dark:bg-neutral-950 font-sans">
          <div
            id="printable-resume-sheet"
            className="max-w-3xl mx-auto bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-8 sm:p-12 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 leading-relaxed text-sm"
          >
            {/* Header */}
            <div className="text-center pb-6 border-b border-neutral-200 dark:border-neutral-800">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 dark:text-white mb-2">
                {fullResumeData.name}
              </h1>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">
                {fullResumeData.headline}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-y-1.5 gap-x-4 text-xs text-neutral-600 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  {fullResumeData.location}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  {fullResumeData.phone}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <a href={`mailto:${fullResumeData.email}`} className="hover:underline">
                    {fullResumeData.email}
                  </a>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                <a
                  href={fullResumeData.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Github className="w-3 h-3" />
                  <span>{fullResumeData.github}</span>
                </a>
                <span>•</span>
                <a
                  href={fullResumeData.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Linkedin className="w-3 h-3" />
                  <span>{fullResumeData.linkedin}</span>
                </a>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="py-5 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                Professional Summary
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed text-justify">
                {fullResumeData.professionalSummary}
              </p>
            </div>

            {/* Education */}
            <div className="py-5 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                Education
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h3 className="font-bold text-sm text-neutral-950 dark:text-white">
                    {fullResumeData.education.degree}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {fullResumeData.education.institution}
                  </p>
                </div>
                <div className="text-right sm:text-right">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    CGPA: {fullResumeData.education.cgpa}
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    Expected: {fullResumeData.education.expectedGraduation}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Skills */}
            <div className="py-5 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                Technical Skills
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
                {fullResumeData.skills.map((s) => (
                  <div key={s.category} className="flex flex-col">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                      {s.category}:
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {s.items}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="py-5 border-b border-neutral-200 dark:border-neutral-800 space-y-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Projects
              </h2>

              {fullResumeData.projects.map((proj) => (
                <div key={proj.title} className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="font-bold text-sm text-neutral-950 dark:text-white">
                      {proj.title}
                    </h3>
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        GitHub <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 font-semibold">
                    {proj.tags}
                  </p>
                  <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300 pl-4 list-disc">
                    {proj.points.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Certifications & Courses */}
            <div className="py-5 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Certifications &amp; Courses
              </h2>
              {fullResumeData.certifications.map((c) => (
                <div key={c.title} className="text-xs">
                  <p className="font-bold text-neutral-950 dark:text-white">{c.title}</p>
                  <ul className="pl-4 list-disc text-neutral-600 dark:text-neutral-300 mt-1">
                    {c.points.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Strengths */}
            <div className="py-5 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                Key Strengths
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 pl-4 list-disc">
                {fullResumeData.strengths.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ul>
            </div>

            {/* Target Opportunities & Availability */}
            <div className="py-5 border-b border-neutral-200 dark:border-neutral-800 bg-emerald-50/50 dark:bg-emerald-950/20 -mx-8 sm:-mx-12 px-8 sm:px-12">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Target Opportunities &amp; Availability
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                  Open for Hiring
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {fullResumeData.targetOpportunities.status}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-700 dark:text-neutral-300">
                <div>
                  <p className="font-bold text-[11px] text-neutral-900 dark:text-neutral-100 mb-1">Target Roles:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {fullResumeData.targetOpportunities.types.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-[11px] text-neutral-900 dark:text-neutral-100 mb-1">Research Focus:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {fullResumeData.targetOpportunities.researchFocus.map((rf, idx) => (
                      <li key={idx}>{rf}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 italic">
                {fullResumeData.targetOpportunities.note}
              </p>
            </div>

            {/* Areas of Interest */}
            <div className="py-5 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                Areas of Interest
              </h2>
              <p className="text-xs text-neutral-700 dark:text-neutral-300">
                {fullResumeData.areasOfInterest.join(' • ')}
              </p>
            </div>

            {/* Career Objective */}
            <div className="pt-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                Career Objective
              </h2>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed text-justify">
                {fullResumeData.careerObjective}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
