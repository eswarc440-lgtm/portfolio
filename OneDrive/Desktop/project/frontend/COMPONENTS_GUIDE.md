# Components Guide

## Common Components

### Button
**Location**: `src/components/common/buttons/Button.tsx`

Reusable button component with multiple variants.

```tsx
<Button 
  variant="primary" // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size="md" // 'sm' | 'md' | 'lg'
  fullWidth={false}
  loading={false}
>
  Click me
</Button>
```

### Card
**Location**: `src/components/common/cards/Card.tsx`

Container component with consistent styling and hover effect.

```tsx
<Card hover className="custom-class">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### Loading
**Location**: `src/components/common/loading/Loading.tsx`

Loading spinner components.

```tsx
// Full page loader
<Loading />

// Page section loader
<PageLoading />

// Inline loader
<InlineLoading />
```

### Skeleton
**Location**: `src/components/common/skeletons/Skeleton.tsx`

Skeleton loaders for loading states.

```tsx
// Line skeleton
<SkeletonLine className="h-6 w-24" />

// Card skeleton
<SkeletonCard />

// Dashboard skeleton
<SkeletonDashboard />
```

## Layout Components

### DashboardLayout
**Location**: `src/layouts/DashboardLayout.tsx`

Main layout wrapper for authenticated pages.

```tsx
<DashboardLayout>
  <YourPageContent />
</DashboardLayout>
```

### Sidebar
**Location**: `src/components/layout/sidebar/Sidebar.tsx`

Navigation sidebar with responsive behavior.

Features:
- Desktop (always visible)
- Mobile (drawer overlay)
- Collapsible submenus
- Active link highlighting
- Role-based admin menu
- User profile card

### Navbar
**Location**: `src/components/layout/navbar/Navbar.tsx`

Top navigation bar with controls.

Features:
- Search bar with expand animation
- Notifications dropdown
- Theme toggle
- Profile menu
- Hamburger menu for mobile

## Chart Components

### LineChart
**Location**: `src/components/charts/LineChart.tsx`

```tsx
<LineChart 
  data={trendData}
  lines={[
    { dataKey: 'sales', stroke: '#3b82f6', name: 'Sales' },
  ]}
  height={300}
/>
```

### BarChart
**Location**: `src/components/charts/BarChart.tsx`

```tsx
<BarChart 
  data={chartData}
  bars={[
    { dataKey: 'revenue', fill: '#10b981', name: 'Revenue' },
  ]}
  height={300}
/>
```

### PieChart
**Location**: `src/components/charts/PieChart.tsx`

```tsx
<PieChart 
  data={statusData}
  colors={['#3b82f6', '#fbbf24', '#f97316']}
  height={300}
/>
```

### AreaChart
**Location**: `src/components/charts/AreaChart.tsx`

```tsx
<AreaChart 
  data={trendData}
  areas={[
    { dataKey: 'temp', stroke: '#ef4444', fill: '#ef4444', name: 'Temperature' },
  ]}
  height={300}
/>
```

## Context & Hooks

### useAuth
**Location**: `src/hooks/useAuth.ts`

Access authentication state and methods.

```tsx
const { user, loading, login, logout, register, isAuthenticated } = useAuth()
```

### useTheme
**Location**: `src/hooks/useTheme.ts`

Access and control theme.

```tsx
const { theme, isDark, setTheme, toggleTheme } = useTheme()
```

### useLocalStorage
**Location**: `src/hooks/useLocalStorage.ts`

Persist state in localStorage.

```tsx
const [value, setValue] = useLocalStorage('key', defaultValue)
```

## Utilities

### API Functions
**Location**: `src/utils/api.ts`

```tsx
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/utils/api'

// Usage
const data = await apiGet('/endpoint')
const result = await apiPost('/endpoint', { body })
```

### Helper Functions
**Location**: `src/utils/helpers.ts`

```tsx
formatDate(dateString)
formatDateTime(dateString)
formatNumber(num)
formatCurrency(amount)
formatPercentage(value)
truncateText(text, length)
debounce(func, delay)
throttle(func, limit)
getRoleBadgeColor(role)
getStatusBadgeColor(status)
```

## Pages

### Landing
**Location**: `src/pages/Landing/index.tsx`

Public homepage with hero section, features, and CTA.

### Login
**Location**: `src/pages/Login/index.tsx`

Authentication form with validation.

### Dashboard
**Location**: `src/pages/Dashboard/index.tsx`

Main dashboard with KPI cards and charts.

### Profile
**Location**: `src/pages/Profile/index.tsx`

User profile management page.

### Settings
**Location**: `src/pages/Settings/index.tsx`

Application settings and preferences.

### NotFound
**Location**: `src/pages/NotFound/index.tsx`

404 error page.

## Types

**Location**: `src/types/index.ts`

```tsx
// Enums
UserRole: 'ADMIN' | 'OFFICER' | 'ENGINEER' | 'CITIZEN'

// Interfaces
User
LoginRequest
LoginResponse
RegisterRequest
Infrastructure
KPI
Notification
ApiError
PaginatedResponse
```

## CSS Classes & Utilities

### Tailwind Classes

All components use Tailwind CSS with custom configurations:

- **Colors**: primary, secondary, success, warning, error
- **Spacing**: Standard Tailwind spacing (p-4, m-8, etc.)
- **Responsive**: sm:, md:, lg:, xl: prefixes
- **Dark Mode**: dark: prefix for dark theme styles
- **Transitions**: transition-all, transition-colors

### Custom CSS

**Location**: `src/index.css`

- Glass effect: `.glass`
- Animation: fade-enter, slide-enter
- Form validation styles
- Scrollbar customization
- Chart CSS variables

## Component Usage Patterns

### With Animations (Framer Motion)
```tsx
import { motion } from 'framer-motion'

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

<motion.div variants={variants} initial="hidden" animate="visible">
  Animated content
</motion.div>
```

### With Toast Notifications
```tsx
import toast from 'react-hot-toast'

toast.success('Success message')
toast.error('Error message')
toast.loading('Loading...')
```

### With Form Validation
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormData = z.infer<typeof schema>

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
})
```

## Best Practices

1. **Always use TypeScript** - Define types for props and state
2. **Component Composition** - Break down complex components into smaller ones
3. **Prop Drilling** - Use Context API for shared state instead of prop drilling
4. **Error Handling** - Always handle errors gracefully with try-catch
5. **Accessibility** - Use semantic HTML and ARIA labels
6. **Responsiveness** - Test on multiple screen sizes
7. **Performance** - Use React.memo for expensive components
8. **Dark Mode** - Always include dark: Tailwind classes

## Common Patterns

### Conditional Rendering
```tsx
{condition && <Component />}
{condition ? <ComponentA /> : <ComponentB />}
```

### Conditional Classes
```tsx
className={`base-class ${condition ? 'active-class' : ''}`}
className={cn('base-class', condition && 'active-class')}
```

### List Rendering
```tsx
{items.map((item, idx) => (
  <Component key={idx} {...item} />
))}
```

### Controlled Inputs
```tsx
<input 
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

---

For more information, see `IMPLEMENTATION_SUMMARY.md`
