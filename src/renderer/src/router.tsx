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

// Helper function to check authentication using Zustand store state
const checkAuth = () => {
  return useAuthStore.getState().isAuthenticated;
};

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
  path: "/",
  component: UpdateScreen,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginScreen,
  beforeLoad: async () => {
    if (checkAuth()) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

// Dashboard route (protected)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardScreen,
  beforeLoad: async () => {
    if (!checkAuth()) {
      throw redirect({ to: "/login" });
    }
  },
});

// Settings route (protected)
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsScreen,
  beforeLoad: async () => {
    console.log("Settings beforeLoad - auth check:", checkAuth());
    if (!checkAuth()) {
      throw redirect({ to: "/login" });
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
