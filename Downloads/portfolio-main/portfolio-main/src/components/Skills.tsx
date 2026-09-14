import React, { useState } from 'react';
import { skillCategories } from '../data/skills';
import {
  Cloud,
  Code2,
  Database,
  Globe,
  Cpu,
  Terminal,
  Check,
  Search,
  Layers,
} from 'lucide-react';

export const Skills: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cloud':
        return <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Code2':
        return <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'Database':
        return <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Terminal':
      default:
        return <Terminal className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
    }
  };

  const filteredCategories = skillCategories.map((cat) => {
    if (!searchQuery.trim()) return cat;
    const q = searchQuery.toLowerCase();
    const matchesCategory = cat.title.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q);
    const matchingSkills = cat.skills.filter((skill) =>
      skill.toLowerCase().includes(q)
    );
    if (matchesCategory) return cat;
    return {
      ...cat,
      skills: matchingSkills,
    };
  }).filter((cat) => cat.skills.length > 0);

  return (
    <section
      id="skills"
      className="py-20 lg:py-24 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Technical Stack
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 dark:text-white">
              Skills &amp; Capabilities
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl">
              Clean taxonomy of technologies, frameworks, and engineering tools applied across projects and infrastructure pipelines.
            </p>
          </div>

          {/* Quick Filter Search */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search skill (e.g., Docker, AWS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Categories Grid (NO progress bars - clean grouped cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.title}
              id={`skill-cat-${category.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:shadow-xs group"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getIcon(category.iconName)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
                      {category.title}
                    </h3>
                    <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                      {category.skills.length} competencies
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5 leading-relaxed">
                  {category.description}
                </p>

                {/* Skill Pills (Clean, no progress bars) */}
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700/60 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom indicator */}
              <div className="mt-6 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
                <span>Production &amp; Project Tested</span>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
            No technical skills found matching "{searchQuery}".
          </div>
        )}
      </div>
    </section>
  );
};
