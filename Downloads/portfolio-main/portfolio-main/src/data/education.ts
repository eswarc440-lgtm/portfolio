import { EducationItem } from '../types';

export const educationData: EducationItem = {
  degree: 'B.Tech — Computer Science and Engineering',
  institution: 'NRI Institute of Technology',
  period: '2024 – 2028',
  cgpa: '8.97 / 10',
  status: 'In Progress (Expected Graduation: 2028)',
  coursework: [
    'Data Structures & Algorithms',
    'Database Management Systems (RDBMS & SQL)',
    'Computer Networks & Protocols',
    'Operating Systems & Linux Kernel Primitives',
    'Software Engineering & Clean Architecture',
  ],
  highlights: [
    'Academic Excellence with a consistent CGPA of 8.97 out of 10.0',
    'Completed specialized certification coursework in NPTEL Cloud Computing',
    'Completed specialized certification coursework in NPTEL Internet of Things (IoT)',
    'Active participant in technical symposiums, hackathons, and campus volunteer coordination',
  ],
};

export const interestsList: {
  title: string;
  tagline: string;
  category: string;
}[] = [
  {
    title: 'Kubernetes',
    tagline: 'Container orchestration, Pod lifecycle, Helm charts, and cluster networking.',
    category: 'Orchestration',
  },
  {
    title: 'Terraform',
    tagline: 'Declarative cloud provisioning and multi-provider module architecture.',
    category: 'IaC',
  },
  {
    title: 'Infrastructure as Code',
    tagline: 'Version-controlled infrastructure state, reproducible staging, and drift detection.',
    category: 'DevOps',
  },
  {
    title: 'Site Reliability Engineering',
    tagline: 'SLOs, SLIs, error budgets, automated observability, and incident post-mortems.',
    category: 'Reliability',
  },
  {
    title: 'Cloud Security',
    tagline: 'Principle of least privilege, IAM policies, secret management, and compliance.',
    category: 'Security',
  },
  {
    title: 'AI Engineering',
    tagline: 'LLM pipelines, retrieval-augmented systems, and automated ML inference serving.',
    category: 'AI & Data',
  },
  {
    title: 'Digital Twin Systems',
    tagline: '3D spatial geometry, sensor telemetry fusion, and real-time physical asset replicas.',
    category: 'Digital Twin',
  },
];
