import { ExperienceItem } from '../types';

export const experienceData: ExperienceItem[] = [
  {
    title: 'AWS Cloud Computing & DevOps Engineering',
    type: 'Hands-on Engineering & Applied Learning',
    period: '2024 – Present',
    description:
      'Extensive hands-on implementation and project experience involving AWS cloud infrastructure, CI/CD pipelines, Linux servers, deployment automation, and production troubleshooting workflows.',
    technologies: [
      'AWS (EC2, S3, IAM)',
      'AWS CodePipeline',
      'AWS CodeBuild',
      'AWS CodeDeploy',
      'Docker & Docker Compose',
      'Linux (Ubuntu)',
      'Nginx',
      'Git / GitHub',
      'CI/CD Pipelines',
    ],
    highlights: [
      'Built end-to-end continuous deployment pipelines linking GitHub commits to live EC2 instances',
      'Configured Ubuntu Linux compute nodes, user groups, systemd daemon management, and Nginx reverse proxies',
      'Managed Docker containerization workflows for multi-tier microservices (FastAPI + React + PostgreSQL)',
      'Implemented automated build packaging with artifact validation in AWS S3 and automated rollback strategies',
      'Troubleshot real-world CodeDeploy agent issues, permission policies, port conflicts, and environment configs',
    ],
    note: 'Focused on applied cloud infrastructure and software delivery workflows; dedicated to transition into professional DevOps & Cloud engineering roles.',
  },
];
