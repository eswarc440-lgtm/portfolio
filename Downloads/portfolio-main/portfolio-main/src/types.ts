export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  highlights: string[];
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
  size?: 'large' | 'medium' | 'compact';
  architectureSteps?: {
    stage: string;
    tool: string;
    description: string;
  }[];
  screenshots?: {
    id: string;
    label: string;
    src: string;
    caption: string;
  }[];
  metrics?: {
    label: string;
    value: string;
  }[];
  infrastructureScope?: string[];
  evidencePolicyNote?: string;
}

export interface SkillCategory {
  title: string;
  description: string;
  iconName: string;
  skills: string[];
}

export interface ExperienceItem {
  title: string;
  type: string;
  period: string;
  description: string;
  technologies: string[];
  highlights: string[];
  note?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  category: 'certifications' | 'hackathons' | 'campus';
  categoryLabel: string;
  year: string;
  issuer?: string;
  organizer?: string;
  role?: string;
  description: string;
  skills?: string[];
  certificateUrl?: string;
  verified: boolean;
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  cgpa: string;
  status: string;
  coursework: string[];
  highlights: string[];
}
