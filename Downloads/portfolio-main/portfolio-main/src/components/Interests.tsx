import React from 'react';
import { interestsList } from '../data/education';
import { Compass, Sparkles, ArrowUpRight } from 'lucide-react';

export const Interests: React.FC = () => {
  return (
    <section
      id="interests"
      className="py-16 lg:py-20 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Active Horizons
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Currently Exploring
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Advanced infrastructure patterns, cloud automation frameworks, and distributed system architectures actively being researched and prototyped.
          </p>
        </div>

        {/* Responsive Grid of Emerging Interests */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {interestsList.map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
                    {item.category}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {item.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
