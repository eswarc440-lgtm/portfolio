# Eswar — Personal Portfolio

A modern, responsive, and high-performance personal portfolio website for **ESWAR**, Aspiring DevOps & Cloud Engineer.

Built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## 👤 Personal Information

- **Name**: ESWAR
- **Headline**: Aspiring DevOps & Cloud Engineer | B.Tech CSE | AWS | Docker | CI/CD | AI/ML
- **Email**: [eswarc440@gmail.com](mailto:eswarc440@gmail.com)
- **Location**: Andhra Pradesh, India
- **GitHub**: [https://github.com/eswarc440-lgtm](https://github.com/eswarc440-lgtm)
- **LinkedIn**: [https://www.linkedin.com/in/eswar-ch-82a613357](https://www.linkedin.com/in/eswar-ch-82a613357)
- **SIMRAS Repository**: [https://github.com/eswarc440-lgtm/SIMRAS](https://github.com/eswarc440-lgtm/SIMRAS)
- **AWS CI/CD Repository**: [https://github.com/eswarc440-lgtm/myaws](https://github.com/eswarc440-lgtm/myaws)

---

## 🚀 Key Features

- **Clean Aesthetic**: Inspired by Vercel, Linear, and GitHub design systems. Light theme by default with seamless dark mode toggle.
- **Flagship Project (SIMRAS)**: Showcase with interactive screenshot gallery (Dashboard, GIS Map, 3D Digital Twin, Audit Dossier), key metrics (23,000+ records, ROC-AUC ~0.83), and technical case study modal.
- **AWS CI/CD Pipeline Visualizer**: Interactive architectural diagram demonstrating `GitHub` ➔ `AWS CodePipeline` ➔ `AWS CodeBuild` ➔ `AWS CodeDeploy` ➔ `EC2` ➔ `Nginx`.
- **Organized Technical Taxonomy**: Categorized skill cards (Cloud & DevOps, Development, Database, GIS/Digital Twin, ML, Tools) without arbitrary percentage bars.
- **Verified Credentials & Activities**: Tabbed view for Certifications (AWS, NPTEL Cloud, NPTEL IoT, HackerRank), Technical Competitions (SUNRISE, LAKSHYA, SPICES), and Campus Volunteering.
- **Academic Profile**: Highlighting B.Tech CSE at NRI Institute of Technology with CGPA 8.97.
- **Direct Contact & Inquiry**: Copy email button, direct mailto launcher, and message composer.
- **Accessible & Responsive**: Fully responsive across mobile, tablet, laptop, and desktop viewports.

---

## 📁 Project Structure

```
.
├── index.html              # HTML entry point with SEO metadata
├── metadata.json           # Application configuration
├── package.json            # Node.js dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── public/
│   ├── Eswar_Resume.pdf    # Resume download file
│   ├── images/
│   │   ├── eswar-profile.jpg # Profile photo
│   │   └── simras/         # SIMRAS screenshots (dashboard, gis-map, digital-twin, reports)
│   └── certificates/       # PDF/image certificate storage
└── src/
    ├── main.tsx            # React application root
    ├── App.tsx             # Master page layout & dark mode state
    ├── index.css           # Tailwind CSS directives
    ├── types.ts            # TypeScript interfaces & types
    ├── data/
    │   ├── skills.ts       # Categorized skills data
    │   ├── projects.ts     # SIMRAS, AWS CI/CD, and disaster systems data
    │   ├── experience.ts   # Applied engineering milestones
    │   ├── achievements.ts # Verified certifications & participation
    │   └── education.ts    # B.Tech CSE details & current horizons
    └── components/
        ├── Navbar.tsx      # Sticky header with theme toggle and mobile drawer
        ├── Hero.tsx        # Headline, CTA buttons, and profile photo card
        ├── About.tsx       # Bio, 4 highlight cards, and engineering principles
        ├── Skills.tsx      # Grouped skill cards with instant search filter
        ├── Projects.tsx    # SIMRAS flagship gallery & AWS CI/CD flowchart
        ├── ProjectModal.tsx# Deep-dive case study modal
        ├── Experience.tsx  # Timeline of applied DevOps & Cloud work
        ├── Achievements.tsx# Tabbed certificates & activity cards
        ├── Education.tsx   # Degree, CGPA 8.97, and coursework
        ├── Interests.tsx   # Currently exploring list (K8s, Terraform, etc.)
        ├── Contact.tsx     # Email copy, message composer, and socials
        └── Footer.tsx      # Simple footer with back to top
```

---

## 🛠️ Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/eswarc440-lgtm/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🚢 Deployment Guide

### Option 1: Deploy to Vercel (Recommended)

1. Push your code to a GitHub repository:
   ```bash
   git add .
   git commit -m "Deploy portfolio"
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**. Vercel will build and assign an SSL domain (e.g., `eswar-portfolio.vercel.app`).

### Option 2: Deploy to GitHub Pages

1. In `vite.config.ts`, if deploying to a subpath (e.g. `https://eswarc440-lgtm.github.io/portfolio/`), set:
   ```ts
   export default defineConfig({
     base: '/portfolio/',
     // ...
   });
   ```
2. Install `gh-pages` if desired:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Add deployment scripts to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
4. Run `npm run deploy`.

---

## 📝 Customizing Your Content

- **Updating Your Photo**: Replace `public/images/eswar-profile.jpg` with your updated professional portrait.
- **Updating Your Resume**: Replace `public/Eswar_Resume.pdf` with your latest PDF resume.
- **Adding Projects**: Open `src/data/projects.ts` and append a new `Project` object.
- **Adding Certifications**: Open `src/data/achievements.ts` and add verified credentials.
