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

// --- Route Guards & Helpers ---

function checkAuth(): boolean {
  const authState = useAuthStore.getState();
  return authState.isAuthenticated && authState.user?.emailVerified !== false;
}

function checkIsAdmin(): boolean {
  const user = useAuthStore.getState().user;
  return user?.roles.some((role) => role.name === "admin") ?? false;
}

function checkUpdateGate(): boolean {
  return useStartupGateStore.getState().updateGatePassed;
}

function isDevOrSmokeTest(): boolean {
  const isDev = import.meta.env.DEV;
  const isSmoke =
    window.electronAPI?.getSmokeTestConfig?.()?.isSmokeTest ?? false;
  return isDev || isSmoke;
}

// --- Route Definitions ---

// Root route with Outlet for nested routes
const rootRoute = createRootRoute({
  component: function RootLayout(): React.JSX.Element {
    return (
      <div className="relative h-screen w-full bg-[var(--theme-bg)]">
        <CrashNoticeBanner />
        <Outlet />
      </div>
    );
  },
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
    if (!isDevOrSmokeTest() && !checkUpdateGate()) {
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
    if (!isDevOrSmokeTest() && !checkUpdateGate()) {
      throw redirect({ to: ROUTES.UPDATE });
    }
    if (!checkAuth()) {
      throw redirect({ to: ROUTES.LOGIN });
    }
    return {
      isAdmin: checkIsAdmin(),
    };
  },
});

// Settings route (protected)
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.SETTINGS,
  component: SettingsScreen,
  beforeLoad: async () => {
    if (!isDevOrSmokeTest() && !checkUpdateGate()) {
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
    if (!checkAuth()) {
      throw redirect({ to: ROUTES.LOGIN });
    }
    if (!checkIsAdmin()) {
      throw redirect({ to: ROUTES.DASHBOARD });
    }
  },
});

// --- Router Instance ---

const routeTree = rootRoute.addChildren([
  integrityRoute,
  updateRoute,
  loginRoute,
  dashboardRoute,
  settingsRoute,
  adminRoute,
]);

const hashHistory = createHashHistory();

export const router = createRouter({
  routeTree,
  history: hashHistory,
});

// --- Type Safety ---

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

