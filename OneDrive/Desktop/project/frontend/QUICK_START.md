# Quick Start Guide

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Building

```bash
npm run build
```

Outputs to `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Type Checking

```bash
npm run type-check
```

## Linting

```bash
npm run lint
```

## Demo Credentials

Use these credentials to test the application:

**Email**: `admin@simras.local`
**Password**: `password123`

## Environment Setup

1. Create `.env.local` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

2. Make sure the backend API is running on `http://localhost:5000`

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts (Auth, Theme)
│   ├── hooks/             # Custom hooks
│   ├── layouts/           # Layout components
│   ├── pages/             # Page components
│   ├── routes/            # Route definitions
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
```

## Key Features

- ✅ React 19 + TypeScript
- ✅ Vite for fast development
- ✅ Tailwind CSS for styling
- ✅ Responsive design (mobile-first)
- ✅ Dark mode support
- ✅ Authentication with JWT
- ✅ React Hook Form + Zod validation
- ✅ Framer Motion animations
- ✅ Recharts for data visualization
- ✅ React Router for navigation
- ✅ Axios with interceptors
- ✅ Toast notifications

## Pages

| Path | Name | Description |
|------|------|-------------|
| `/` | Landing | Public homepage |
| `/login` | Login | Authentication page |
| `/dashboard` | Dashboard | Main dashboard (protected) |
| `/profile` | Profile | User profile (protected) |
| `/settings` | Settings | Settings page (protected) |
| `/404` | Not Found | 404 error page |

## Components

### Common Components
- `Button` - Reusable button with variants
- `Card` - Container component
- `Loading` - Loading spinner
- `Skeleton` - Loading placeholder

### Layout Components
- `DashboardLayout` - Main layout wrapper
- `Sidebar` - Navigation sidebar
- `Navbar` - Top navigation bar

### Chart Components
- `LineChart` - Line chart
- `BarChart` - Bar chart
- `PieChart` - Pie chart
- `AreaChart` - Area chart with gradient

## Custom Hooks

- `useAuth()` - Access authentication
- `useTheme()` - Access theme settings
- `useLocalStorage()` - Persist state

## Utility Functions

### API
- `apiGet(url)` - GET request
- `apiPost(url, data)` - POST request
- `apiPut(url, data)` - PUT request
- `apiDelete(url)` - DELETE request
- `apiPatch(url, data)` - PATCH request

### Helpers
- `formatDate(date)` - Format date string
- `formatCurrency(amount)` - Format as currency
- `debounce(func, delay)` - Debounce function
- `throttle(func, limit)` - Throttle function
- `getRoleBadgeColor(role)` - Get color for role
- `getStatusBadgeColor(status)` - Get color for status

## Theme

### Light Mode
- White background
- Dark text
- Blue primary color

### Dark Mode
- Dark slate background
- Light text
- Blue primary color (adjusted for dark)

### Toggle Theme

```tsx
const { toggleTheme, isDark } = useTheme()

<button onClick={toggleTheme}>
  {isDark ? '☀️' : '🌙'}
</button>
```

## Authentication

### Login Flow
1. User enters credentials
2. Credentials sent to backend
3. Backend returns access + refresh tokens
4. Tokens stored in localStorage
5. User redirected to dashboard

### Protected Routes
```tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### Using Auth Hook
```tsx
const { user, login, logout, isAuthenticated } = useAuth()

if (!isAuthenticated) {
  return <Redirect to="/login" />
}
```

## Styling

All styles use Tailwind CSS. Custom colors defined in `tailwind.config.ts`:

- `primary-*` - Primary color (blue)
- `secondary-*` - Secondary color
- `success-*` - Success (green)
- `warning-*` - Warning (yellow)
- `error-*` - Error (red)

### Dark Mode Class
```tsx
// Tailwind dark mode
<div className="bg-white dark:bg-slate-900">
  Light and dark background
</div>
```

## Form Validation

Using React Hook Form + Zod:

```tsx
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})
```

## Error Handling

### API Errors
```tsx
try {
  const data = await apiGet('/endpoint')
} catch (error) {
  console.error(error)
  toast.error('Error message')
}
```

### Form Errors
```tsx
{errors.email && (
  <span className="text-red-500">{errors.email.message}</span>
)}
```

## Performance Tips

1. Use `React.lazy()` for page components (already done)
2. Use `Suspense` for loading states (already done)
3. Memoize expensive components with `React.memo()`
4. Use `useCallback()` for event handlers
5. Avoid inline object/function creation in JSX

## Common Issues

### "Cannot find module '@/...'"
- Check path aliases in `tsconfig.json`
- Ensure `vite.config.ts` has matching aliases

### "Types not found for dependency"
- Install `@types/package-name` if needed
- Some packages include types by default

### Charts not rendering
- Check chart data format
- Ensure ResponsiveContainer has parent with defined height
- Verify colors are valid Tailwind colors

### Theme not persisting
- Clear localStorage and reload
- Check `useTheme()` hook implementation
- Verify ThemeProvider wraps app

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel
```

### Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

## Documentation

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
- [Recharts Documentation](https://recharts.org)
- [Framer Motion Documentation](https://www.framer.com/motion)

## Support

For issues or questions:
1. Check the error message carefully
2. Review the components guide
3. Check implementation summary
4. Review console for TypeScript errors

## Next Steps

1. Connect to backend API
2. Implement real authentication
3. Add more pages and features
4. Set up testing
5. Configure CI/CD pipeline
6. Deploy to production

---

**Status**: Ready for development
**Last Updated**: August 1, 2026
