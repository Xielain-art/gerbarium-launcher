import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const tabsVariants = cva("", {
  variants: {
    variant: {
      default: "",
      pill: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const tabsListVariants = cva(
  "inline-flex items-center justify-center text-theme-muted",
  {
    variants: {
      variant: {
        default: "mb-4 flex gap-2",
        pill: "rounded-full border border-theme bg-[var(--theme-surface)] p-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "rounded-[6px] border border-transparent text-theme-muted hover:bg-[var(--theme-surface-soft)] hover:text-theme data-[state=active]:border-theme data-[state=active]:bg-[var(--theme-surface)] data-[state=active]:text-theme",
        pill:
          "rounded-full text-[11px] uppercase tracking-[0.08em] text-theme-muted hover:text-theme data-[state=active]:bg-[var(--mc-accent)] data-[state=active]:text-[var(--theme-bg)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type TabsContextValue = VariantProps<typeof tabsVariants>;
const TabsContext = React.createContext<TabsContextValue>({ variant: "default" });

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & TabsContextValue
>(({ className, variant = "default", ...props }, ref) => (
  <TabsContext.Provider value={{ variant }}>
    <TabsPrimitive.Root
      ref={ref}
      className={cn(tabsVariants({ variant, className }))}
      {...props}
    />
  </TabsContext.Provider>
));
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(TabsContext);
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(TabsContext);
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-2 focus-visible:outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
