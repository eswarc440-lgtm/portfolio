import React from 'react';
import { Github, Linkedin, Mail, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand & Built credit */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-bold text-neutral-950 dark:text-white text-base">
              Built by Eswar
            </span>
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Aspiring DevOps &amp; Cloud Engineer • +91 7396117646 • Andhra Pradesh, India
            </span>
          </div>

          {/* Social Links & Back to Top */}
          <div className="flex items-center gap-6 text-sm">
            <a
              href="https://github.com/eswarc440-lgtm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
              title="GitHub"
            >
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/eswar-ch-82a613357?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
              title="LinkedIn"
            >
              LinkedIn
            </a>

            <a
              href="mailto:eswarc440@gmail.com"
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
              title="Email"
            >
              Email
            </a>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
              title="Back to Top"
              aria-label="Scroll back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-900 text-center text-xs text-neutral-400 dark:text-neutral-500">
          &copy; 2026 Eswar. All rights reserved. Designed with clean engineering principles.
        </div>
      </div>
    </footer>
  );
};
