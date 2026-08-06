# SIMRAS Frontend - React + Vite + Tailwind CSS

Smart Infrastructure Monitoring & Risk Assessment System - Production-ready frontend dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components (buttons, cards, etc.)
│   │   └── layout/         # Layout components (navbar, sidebar)
│   ├── pages/              # Page components
│   ├── layouts/            # Layout wrappers
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── contexts/           # React contexts
│   ├── routes/             # Route configuration
│   ├── store/              # State management (Zustand)
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── assets/             # Static assets
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Entry point
│   └── index.css            # Global styles
├── public/                  # Static files
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

## 🎨 Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Framer Motion** - Animations
- **Recharts** - Charts library
- **Lucide React** - Icons
- **Zustand** - State management
- **React Hot Toast** - Notifications

## 🔧 Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
npm run type-check    # Check TypeScript types
```

## 🎯 Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/Light theme support
- ✅ Authentication with JWT
- ✅ Protected routes
- ✅ Dashboard with KPIs and charts
- ✅ Role-based access control (RBAC)
- ✅ Loading animations and skeletons
- ✅ Form validation (React Hook Form + Zod)
- ✅ Real-time notifications
- ✅ Lazy loading and code splitting
- ✅ TypeScript support

## 🔐 Authentication

The app integrates with the backend API for:
- User registration
- Email verification
- Login/Logout
- JWT token management
- Refresh token handling
- Protected routes

Tokens are stored securely in localStorage with automatic refresh.

## 📡 API Integration

Configure your backend URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## 🎨 Theming

The app supports light and dark themes:
- Automatic detection based on system preferences
- Manual toggle in navbar
- Persisted in localStorage

## 📱 Responsive Design

Breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🚀 Performance

- Lazy loading with React.lazy()
- Code splitting by route
- Tree shaking
- Minification
- Image optimization
- CSS purging

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Output is in the `dist` directory
# Deploy to any static hosting (Vercel, Netlify, GitHub Pages, etc.)
```

## 🐛 Debugging

- React DevTools browser extension recommended
- Vite provides detailed error messages
- TypeScript catches type errors during development

## 📝 Environment Variables

Required environment variables (see `.env.example`):

```env
VITE_API_BASE_URL       # Backend API base URL
VITE_APP_NAME          # Application name
VITE_APP_DESCRIPTION   # Application description
```

## 🤝 Contributing

1. Follow the project structure
2. Use TypeScript for type safety
3. Create reusable components
4. Write meaningful commit messages
5. Test before submitting

## 📄 License

Part of SIMRAS - Infrastructure Monitoring Platform

## 📞 Support

For issues or questions, refer to the main project documentation.

---

**Created**: August 6, 2026  
**Version**: 0.0.1  
**Status**: In Development (Sprint 3)
