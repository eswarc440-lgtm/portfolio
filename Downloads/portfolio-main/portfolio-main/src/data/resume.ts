export interface ResumeData {
  name: string;
  headline: string;
  location: string;
  phone: string;
  email: string;
  github: string;
  githubUrl: string;
  linkedin: string;
  linkedinUrl: string;
  professionalSummary: string;
  careerObjective: string;
  strengths: string[];
  education: {
    degree: string;
    institution: string;
    expectedGraduation: string;
    cgpa: string;
  };
  skills: {
    category: string;
    items: string;
  }[];
  projects: {
    title: string;
    tags: string;
    points: string[];
    githubUrl?: string;
  }[];
  certifications: {
    title: string;
    points: string[];
  }[];
  areasOfInterest: string[];
  targetOpportunities: {
    status: string;
    types: string[];
    researchFocus: string[];
    note: string;
  };
}

export const fullResumeData: ResumeData = {
  name: 'ESWAR',
  headline: 'Aspiring DevOps & Cloud Engineer | B.Tech CSE | AWS | Docker | CI/CD | Linux',
  location: 'Andhra Pradesh, India',
  phone: '+91 7396117646',
  email: 'eswarc440@gmail.com',
  github: 'github.com/eswarc440-lgtm',
  githubUrl: 'https://github.com/eswarc440-lgtm',
  linkedin: 'linkedin.com/in/eswar-ch-82a613357',
  linkedinUrl: 'https://www.linkedin.com/in/eswar-ch-82a613357?utm_source=share_via&utm_content=profile&utm_medium=member_android',
  professionalSummary:
    'Motivated B.Tech Computer Science Engineering student with hands-on experience in DevOps, Cloud Computing, AWS, Docker, CI/CD pipelines, Linux, Git/GitHub, FastAPI, React, PostgreSQL/PostGIS, and Machine Learning integration. Experienced in developing end-to-end research-grade projects involving cloud deployment, infrastructure monitoring, digital twins, geospatial systems, and AI-based risk prediction. Actively seeking research-oriented work, internships, and paid internship opportunities in Cloud Engineering, DevOps, Applied AI, and Software Engineering to contribute to real-world systems and high-impact teams.',
  careerObjective:
    'To contribute to innovative engineering teams and research labs through internships and paid internship opportunities. Keen to apply and expand expertise across AWS, Linux, Docker, CI/CD automation, geospatial AI, and digital twins, while advancing towards Kubernetes, Infrastructure as Code, Site Reliability Engineering, and applied research in intelligent cloud systems.',
  education: {
    degree: 'B.Tech — Computer Science and Engineering',
    institution: 'NRI Institute of Technology',
    expectedGraduation: '2028',
    cgpa: '8.97 / 10',
  },
  skills: [
    {
      category: 'Cloud',
      items: 'AWS, EC2, S3, CodePipeline, CodeBuild, CodeDeploy',
    },
    {
      category: 'DevOps',
      items: 'Docker, Docker Compose, CI/CD, Git, GitHub, Nginx',
    },
    {
      category: 'Operating Systems',
      items: 'Linux, Ubuntu, Windows, PowerShell',
    },
    {
      category: 'Programming',
      items: 'Python, Java, SQL, JavaScript/TypeScript',
    },
    {
      category: 'Backend',
      items: 'FastAPI, REST APIs',
    },
    {
      category: 'Frontend',
      items: 'React, Vite, Tailwind CSS',
    },
    {
      category: 'Databases',
      items: 'PostgreSQL, PostGIS',
    },
    {
      category: 'GIS & Digital Twin',
      items: 'QGIS, Leaflet, CesiumJS, Three.js, OpenStreetMap',
    },
    {
      category: 'Machine Learning',
      items: 'Scikit-learn, ML pipelines, classification, regression, model evaluation',
    },
    {
      category: 'Data & ETL',
      items: 'Pandas, NumPy, CSV/JSON, osm2pgsql, geospatial ETL',
    },
    {
      category: 'Tools',
      items: 'VS Code, GitHub, Docker Desktop, Postman',
    },
  ],
  projects: [
    {
      title: 'SIMRAS — Smart Infrastructure Monitoring and Risk Assistance System',
      tags: 'AI | Digital Twin | GIS | FastAPI | React | PostGIS | Machine Learning',
      githubUrl: 'https://github.com/eswarc440-lgtm/SIMRAS.git',
      points: [
        'Developing an end-to-end infrastructure intelligence platform for monitoring major infrastructure assets across Andhra Pradesh.',
        'Supports infrastructure categories including dams, barrages, bridges, airports, temples, and roads.',
        'Built a GIS-based infrastructure registry using PostGIS, OpenStreetMap, government datasets, and geospatial ETL pipelines.',
        'Processed and analyzed more than 23,000 bridge records from geospatial datasets.',
        'Developed ML pipelines to estimate infrastructure health, risk, confidence, and remaining useful life (RUL) when sufficient evidence is available.',
        'Achieved a held-out risk ROC-AUC of approximately 0.83 in bridge deterioration modeling while implementing evidence-based prediction gates.',
        'Designed interactive 3D Digital Twin functionality using technologies including Three.js/Cesium-based visualization.',
        'Integrated infrastructure engineering information such as dimensions, construction year, capacity, structural attributes, and operational information.',
        'Developed selected-asset reporting workflows supporting structured infrastructure assessments.',
        'Implemented a full-stack architecture using React + FastAPI + PostgreSQL/PostGIS + Docker.',
        'Applied a strict evidence policy to distinguish official/government information from AI-derived predictions.',
      ],
    },
    {
      title: 'AWS Automated CI/CD Web Application Deployment',
      tags: 'AWS | CodePipeline | CodeBuild | CodeDeploy | EC2 | S3 | Nginx | GitHub',
      githubUrl: 'https://github.com/eswarc440-lgtm/myaws',
      points: [
        'Designed and implemented an automated CI/CD pipeline for deploying a web application on AWS.',
        'Integrated GitHub → AWS CodePipeline → CodeBuild → CodeDeploy → EC2.',
        'Configured an EC2 Ubuntu server and Nginx for application hosting and reverse proxy configuration.',
        'Used Amazon S3 for storage and static hosting workflows.',
        'Automated source retrieval, application build, deployment, and release processes.',
        'Troubleshot deployment, server configuration, CodeDeploy agent, Nginx, and application connectivity issues.',
        'Gained practical experience with cloud deployment automation and production troubleshooting.',
      ],
    },
    {
      title: 'Smart Disaster Resource Allocation System',
      tags: 'Decision Support | Algorithms | Python | PostgreSQL',
      points: [
        'Developed a technology-based solution for improving disaster resource allocation and emergency response planning.',
        'Explored intelligent prioritization of resources based on affected locations and disaster requirements.',
        'Applied software engineering and data-driven problem-solving concepts to disaster management.',
      ],
    },
  ],
  certifications: [
    {
      title: 'NPTEL — Cloud Computing',
      points: [
        'Studied cloud architecture, virtualization, distributed computing, cloud service models, and cloud infrastructure concepts.',
      ],
    },
    {
      title: 'NPTEL — Internet of Things (IoT)',
      points: [
        'Studied IoT architecture, sensors, connectivity, data processing, and intelligent connected systems.',
      ],
    },
  ],
  areasOfInterest: [
    'Research & Development (R&D)',
    'Paid Internships & Industry Opportunities',
    'Digital Twin Modeling & 3D Geospatial Systems',
    'Applied Machine Learning & Predictive Analytics',
    'DevOps Engineering & SRE',
    'Cloud Engineering & AWS Architecture',
    'CI/CD Pipeline Automation',
    'Infrastructure as Code & Docker/Kubernetes',
    'Cloud Security & Linux Systems',
  ],
  targetOpportunities: {
    status: 'Actively Seeking Research Roles, Internships & Paid Opportunities',
    types: [
      'Paid Engineering Internships (DevOps / Cloud / Full Stack)',
      'Research-Oriented Projects & Academic/Industry R&D',
      'AI/ML & Digital Twin Research Internships',
      'Cloud Infrastructure & CI/CD Automation Roles',
    ],
    researchFocus: [
      'Digital Twin Modeling (3D infrastructure simulations & geospatial telemetry)',
      'Predictive Asset Deterioration & Risk Scoring (0.83 ROC-AUC machine learning models)',
      'Geospatial Big Data Analytics (PostGIS, OpenStreetMap, 23,000+ asset datasets)',
      'Cloud Reliability & Automated Infrastructure Pipelines (AWS CodePipeline/EC2/Docker)',
    ],
    note: 'Available for immediate remote, hybrid, or on-site opportunities in research labs, startups, and enterprise engineering teams.',
  },
  strengths: [
    'Strong problem-solving and debugging ability',
    'Practical understanding of end-to-end software deployment',
    'Quick learner of cloud and DevOps technologies',
    'Experience working with large real-world datasets',
    'Ability to integrate frontend, backend, database, ML, and infrastructure components',
    'Strong interest in automation and cloud-native engineering',
  ],
};
