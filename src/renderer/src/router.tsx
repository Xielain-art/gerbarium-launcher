import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { LoginScreen, DashboardScreen, SettingsScreen } from './pages';

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
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardScreen,
});

// Settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsScreen,
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
