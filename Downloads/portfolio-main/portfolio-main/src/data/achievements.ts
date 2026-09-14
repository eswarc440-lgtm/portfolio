import { AchievementItem } from '../types';

export const achievementsData: AchievementItem[] = [
  {
    id: 'aws-cloud-devops',
    title: 'AWS Cloud Computing / DevOps Learning',
    category: 'certifications',
    categoryLabel: 'Certification / Training',
    year: '2026',
    issuer: 'Cloud & DevOps Curriculum',
    description:
      'Rigorous practical coursework and lab implementations covering AWS services (EC2, S3, IAM, VPC), CI/CD pipelines (CodePipeline, CodeBuild, CodeDeploy), Docker containerization, and Linux deployment workflows.',
    skills: ['AWS', 'CI/CD', 'Docker', 'Linux', 'Cloud Architecture'],
    certificateUrl: '/certificates/aws-devops.pdf',
    verified: true,
  },
  {
    id: 'nptel-cloud',
    title: 'NPTEL Cloud Computing',
    category: 'certifications',
    categoryLabel: 'Certification / Course',
    year: 'Coursework',
    issuer: 'NPTEL (National Programme on Technology Enhanced Learning)',
    description:
      'In-depth study of cloud computing architecture, distributed systems, virtualization primitives, cloud storage paradigms, service models (IaaS, PaaS, SaaS), and multi-tenant resource management.',
    skills: ['Distributed Systems', 'Virtualization', 'Cloud Security', 'Storage Systems'],
    certificateUrl: '/certificates/nptel-cloud.pdf',
    verified: true,
  },
  {
    id: 'nptel-iot',
    title: 'NPTEL Internet of Things (IoT)',
    category: 'certifications',
    categoryLabel: 'Certification / Course',
    year: 'Coursework',
    issuer: 'NPTEL (National Programme on Technology Enhanced Learning)',
    description:
      'Comprehensive curriculum exploring IoT system architectures, smart sensor networks, communication protocols (MQTT, CoAP, HTTP), edge processing, and connected data pipeline integration.',
    skills: ['Sensors & Actuators', 'IoT Protocols', 'Embedded Telemetry', 'Edge Processing'],
    certificateUrl: '/certificates/nptel-iot.pdf',
    verified: true,
  },
  {
    id: 'hackerrank',
    title: 'HackerRank Certification',
    category: 'certifications',
    categoryLabel: 'Certification',
    year: 'Verified',
    issuer: 'HackerRank',
    description:
      'Skill assessment verifying foundational programming logic, algorithmic problem-solving ability, and data structure execution under standardized timed evaluations.',
    skills: ['Algorithms', 'Data Structures', 'Problem Solving'],
    certificateUrl: '/certificates/hackerrank.pdf',
    verified: true,
  },
  // Hackathons & Technical Competitions (Verified Participant schema)
  {
    id: 'sunrise-2k25',
    title: 'SUNRISE 2K25 Technical Event',
    category: 'hackathons',
    categoryLabel: 'Technical Event',
    year: '2025',
    organizer: 'Engineering Symposium',
    role: 'Participant',
    description:
      'Participated in engineering problem-solving and technical challenges, collaborating on technology solutions and presenting project ideas.',
    skills: ['Technical Problem Solving', 'Collaboration', 'Engineering Design'],
    verified: true,
  },
  {
    id: 'lakshya-2k25',
    title: 'LAKSHYA 2K25 Technical Competition',
    category: 'hackathons',
    categoryLabel: 'Technical Competition',
    year: '2025',
    organizer: 'Annual Technical Fest',
    role: 'Participant',
    description:
      'Engaged in technical evaluations and competitive software engineering challenges with peers from across engineering colleges.',
    skills: ['Competitive Coding', 'System Design Basics', 'Presentation'],
    verified: true,
  },
  {
    id: 'spices-event',
    title: 'SPICES Technical Fest',
    category: 'hackathons',
    categoryLabel: 'Technical Event',
    year: '2024–2025',
    organizer: 'NRIIT Campus Fest',
    role: 'Participant',
    description:
      'Participated in technical workshops and project demonstration tracks, engaging with industry mentors and peer developers.',
    skills: ['Project Showcase', 'Engineering Innovation'],
    verified: true,
  },
  // Campus Activities
  {
    id: 'campus-fest-volunteer',
    title: 'College Fest Volunteer',
    category: 'campus',
    categoryLabel: 'Campus Activity',
    year: 'Campus Event',
    organizer: 'NRI Institute of Technology',
    role: 'Volunteer',
    description:
      'Served as a volunteer during the college fest, helping with participant coordination, event activities, venue support, and effective communication with the organizing faculty and student teams.',
    skills: [
      'Teamwork',
      'Coordination',
      'Communication',
      'Responsibility',
      'Event Management',
    ],
    verified: true,
  },
];
