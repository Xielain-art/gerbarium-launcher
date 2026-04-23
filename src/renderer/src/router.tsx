import { createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { LoginScreen, DashboardScreen, SettingsScreen } from './pages';

// Helper function to check authentication
const checkAuth = () => {
  // Check if user is authenticated from persisted state
  try {
    const stored = localStorage.getItem('gerbarium-auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.isAuthenticated || false;
    }
  } catch (e) {
    console.error('Failed to parse auth state:', e);
  }
  return false;
};

// Root route with Outlet for nested routes
const rootRoute = createRootRoute({
  component: () => (
    <div className="w-full h-screen bg-[#1a1a1a]">
      <Outlet />
    </div>
  ),
});

// Login route (default)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginScreen,
  beforeLoad: async () => {
    if (checkAuth()) {
      throw redirect({ to: '/dashboard' });
    }
  },
});

// Dashboard route (protected)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardScreen,
  beforeLoad: async () => {
    if (!checkAuth()) {
      throw redirect({ to: '/' });
    }
  },
});

// Settings route (protected)
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsScreen,
  beforeLoad: async () => {
    console.log('Settings beforeLoad - auth check:', checkAuth());
    if (!checkAuth()) {
      throw redirect({ to: '/' });
    }
  },
});

// Build the route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  settingsRoute,
]);

// Create the router instance
export const router = createRouter({ routeTree });

// Type declarations for type-safe routing
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
