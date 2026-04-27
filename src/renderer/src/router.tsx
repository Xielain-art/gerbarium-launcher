import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
  createHashHistory,
} from "@tanstack/react-router";
import {
  LoginScreen,
  DashboardScreen,
  SettingsScreen,
  UpdateScreen,
  IntegrityCheckScreen,
  AdminScreen,
} from "./pages";
import { useAuthStore } from "./stores/useAuthStore";
import { useStartupGateStore } from "./stores/useStartupGateStore";
import { ROUTES } from "../../shared/constants/system";
import { CrashNoticeBanner } from "./components/layout/CrashNoticeBanner";

// Helper function to check authentication using Zustand store state
const checkAuth = () => {
  return useAuthStore.getState().isAuthenticated;
};

const checkIsAdmin = () => {
  return useAuthStore.getState().user?.roles.includes("admin");
};

const checkUpdateGate = () => {
  return useStartupGateStore.getState().updateGatePassed;
};

// Root route with Outlet for nested routes
const rootRoute = createRootRoute({
  component: () => (
    <div className="relative w-full h-screen bg-[var(--theme-bg)]">
      <CrashNoticeBanner />
      <Outlet />
    </div>
  ),
});

// Integrity route (always first)
const integrityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.HOME,
  component: IntegrityCheckScreen,
});

const updateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.UPDATE,
  component: UpdateScreen,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.LOGIN,
  component: LoginScreen,
  beforeLoad: async () => {
    if (!import.meta.env.DEV && !checkUpdateGate()) {
      throw redirect({ to: ROUTES.UPDATE });
    }
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
    if (!import.meta.env.DEV && !checkUpdateGate()) {
      throw redirect({ to: ROUTES.UPDATE });
    }
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
    if (!import.meta.env.DEV && !checkUpdateGate()) {
      throw redirect({ to: ROUTES.UPDATE });
    }
    if (!checkAuth()) {
      throw redirect({ to: ROUTES.LOGIN });
    }
  },
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.ADMIN,
  component: AdminScreen,
  beforeLoad: async () => {
    if (!checkAuth() || !checkIsAdmin()) {
      throw redirect({ to: ROUTES.LOGIN });
    }
  },
});

// Build the route tree
const routeTree = rootRoute.addChildren([
  integrityRoute,
  updateRoute,
  loginRoute,
  dashboardRoute,
  settingsRoute,
  adminRoute,
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
