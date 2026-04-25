import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
  createHashHistory,
} from "@tanstack/react-router";
import { LoginScreen, DashboardScreen, SettingsScreen, UpdateScreen } from "./pages";
import { useAuthStore } from "./stores/useAuthStore";
import { ROUTES } from "../../shared/constants/system";

// Helper function to check authentication using Zustand store state
const checkAuth = () => {
  return useAuthStore.getState().isAuthenticated;
};

const isDevMode = import.meta.env.DEV;

// Root route with Outlet for nested routes
const rootRoute = createRootRoute({
  component: () => (
    <div className="w-full h-screen bg-[#1a1a1a]">
      <Outlet />
    </div>
  ),
});

// Update route (default - shown first on app launch)
const updateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.HOME,
  component: isDevMode ? LoginScreen : UpdateScreen,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.LOGIN,
  component: LoginScreen,
  beforeLoad: async () => {
    if (checkAuth()) {
      throw redirect({ to: ROUTES.DASHBOARD });
    }
  },
});

// Dashboard route (protected)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.DASHBOARD,
  component: DashboardScreen,
  beforeLoad: async () => {
    if (!checkAuth()) {
      throw redirect({ to: ROUTES.LOGIN });
    }
  },
});

// Settings route (protected)
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.SETTINGS,
  component: SettingsScreen,
  beforeLoad: async () => {
    if (!checkAuth()) {
      throw redirect({ to: ROUTES.LOGIN });
    }
  },
});

// Build the route tree
const routeTree = rootRoute.addChildren([
  updateRoute,
  loginRoute,
  dashboardRoute,
  settingsRoute,
]);

// Create the router instance
const hashHistory = createHashHistory();
export const router = createRouter({ routeTree, history: hashHistory });

// Type declarations for type-safe routing
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
