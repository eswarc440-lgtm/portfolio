import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowDown,
  FileDown,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Phone,
  Camera,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface HeroProps {
  onOpenResume?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenResume }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [customPhoto, setCustomPhoto] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('eswar-custom-photo');
    }
    return null;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCustomPhoto(result);
          localStorage.setItem('eswar-custom-photo', result);
          setImageError(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPhoto(null);
    localStorage.removeItem('eswar-custom-photo');
  };

  const activePhotoSrc = customPhoto || '/images/eswar-profile.jpg';

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex items-center pt-28 pb-16 lg:py-28 overflow-hidden"
    >
      {/* Subtle ambient lighting - strictly controlled, no loud neon */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Headline & Intro */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Availability Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-medium text-emerald-900 dark:text-emerald-200 mb-6 flex-wrap shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-emerald-700 dark:text-emerald-400">Available:</span>
              <span>Research-Oriented Work • Internships • Paid Internships</span>
            </div>

            {/* Small label */}
            <p className="text-sm font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase mb-2">
              Hello, I'm
            </p>

            {/* Large Heading */}
            <h1
              id="hero-name-heading"
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white mb-4"
            >
              ESWAR
            </h1>

            {/* Main Headline */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight leading-snug mb-5">
              I build cloud systems, automated pipelines and intelligent applications.
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mb-6">
              I'm a Computer Science Engineering student focused on DevOps, Cloud Engineering, Digital Twins, and Applied AI. Experienced with AWS, Docker, automated CI/CD pipelines, and geospatial machine learning. Actively seeking <span className="font-semibold text-neutral-900 dark:text-neutral-100">research-oriented projects</span>, <span className="font-semibold text-neutral-900 dark:text-neutral-100">internships</span>, and <span className="font-semibold text-neutral-900 dark:text-neutral-100">paid internship opportunities</span> to build scalable, reliable software.
            </p>

            {/* Target Opportunity Chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                🔬 Research-Oriented Work
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60">
                💼 Paid Internships
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60">
                ☁️ Cloud &amp; DevOps
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60">
                🌐 Digital Twins &amp; AI
              </span>
            </div>

            {/* Location & Academic & Phone Meta */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-8">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Andhra Pradesh, India
              </span>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href="tel:7396117646"
                className="inline-flex items-center gap-1.5 font-mono text-neutral-800 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                +91 7396117646
              </a>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">B.Tech CSE</span> (NRIIT)
              </span>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CGPA 8.97
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 mb-9 w-full sm:w-auto">
              <a
                id="hero-view-work-btn"
                href="#projects"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <span>View Projects</span>
                <ArrowDown className="w-4 h-4" />
              </a>

              <button
                id="hero-view-resume-btn"
                type="button"
                onClick={onOpenResume}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 transition-all shadow-xs cursor-pointer"
              >
                <FileText className="w-4 h-4 text-blue-400 dark:text-blue-600" />
                <span>View Full Resume</span>
              </button>

              <a
                id="hero-download-resume-btn"
                href="/Eswar_Resume.pdf"
                download="Eswar_Resume.pdf"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-all shadow-xs cursor-pointer"
                title="Download verified PDF resume"
              >
                <FileDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Download PDF</span>
              </a>
            </div>

            {/* Social Icons & Email */}
            <div className="flex items-center gap-3 sm:gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800/80 w-full flex-wrap">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Connect:
              </span>

              <a
                id="hero-github-social"
                href="https://github.com/eswarc440-lgtm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                title="GitHub"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>

              <a
                id="hero-linkedin-social"
                href="https://www.linkedin.com/in/eswar-ch-82a613357?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>LinkedIn</span>
              </a>

              <a
                id="hero-email-social"
                href="mailto:eswarc440@gmail.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                title="Send Email"
              >
                <Mail className="w-3.5 h-3.5 text-rose-500" />
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Right Column: Professional Profile Photo Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[360px] sm:max-w-[400px]">
              {/* Subtle background glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600/15 via-transparent to-indigo-600/15 rounded-3xl blur-md -z-10" />

              {/* Hidden photo file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />

              {/* Main Card Container */}
              <div
                id="profile-image-card"
                className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-2.5 sm:p-3 shadow-xl overflow-hidden group"
              >
                {/* Image Wrapper */}
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center">
                  {!imageError ? (
                    <img
                      src={activePhotoSrc}
                      alt="Eswar - Aspiring DevOps & Cloud Engineer"
                      className={`w-full h-full object-cover object-top transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-90'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                      loading="eager"
                    />
                  ) : (
                    /* Fallback avatar card if file missing */
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-neutral-900 to-neutral-950 text-white">
                      <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-extrabold mb-4 shadow-lg">
                        EC
                      </div>
                      <h3 className="text-xl font-bold">ESWAR</h3>
                      <p className="text-xs text-blue-400 font-mono mt-1">DevOps &amp; Cloud Engineer</p>
                      <p className="text-xs text-neutral-400 mt-3">AWS • Docker • CI/CD • Linux</p>
                    </div>
                  )}

                  {/* Top Status Tag */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-neutral-900/80 backdrop-blur-md text-white text-[11px] font-medium border border-neutral-700/60 shadow-xs">
                    DevOps &amp; Cloud
                  </div>

                  {/* Top Right Photo Action Control */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {customPhoto && (
                      <button
                        type="button"
                        onClick={handleResetPhoto}
                        className="p-1.5 rounded-md bg-neutral-900/80 hover:bg-neutral-900 backdrop-blur-md text-white border border-neutral-700/60 text-xs shadow-xs cursor-pointer"
                        title="Reset to default photo"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-900/80 hover:bg-neutral-900 backdrop-blur-md text-white border border-neutral-700/60 text-[11px] font-medium shadow-xs cursor-pointer"
                      title="Upload or change photo from your device"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-400" />
                      <span>{customPhoto ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>
                  </div>

                  {/* Bottom Gradient Overlay for text readability */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-neutral-950/85 via-neutral-950/45 to-transparent flex flex-col justify-end p-4 text-white">
                    <p className="text-xs font-semibold tracking-wide uppercase text-blue-400">
                      B.Tech Computer Science
                    </p>
                    <p className="text-sm font-bold">NRI Institute of Technology</p>
                  </div>
                </div>

                {/* Tech Pills Footer */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="py-1.5 px-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-800">
                    <span className="block text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-mono">
                      Cloud
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      AWS
                    </span>
                  </div>

                  <div className="py-1.5 px-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-800">
                    <span className="block text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-mono">
                      Containers
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Docker
                    </span>
                  </div>

                  <div className="py-1.5 px-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-800">
                    <span className="block text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-mono">
                      Pipeline
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      CI/CD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
