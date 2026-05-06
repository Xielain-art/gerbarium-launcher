import { WindowControls } from "../components";
import { useUpdateScreen } from "../hooks/useUpdateScreen";
import { UpdateStatusCard } from "../components/update";

export function UpdateScreen(): React.JSX.Element {
  const vm = useUpdateScreen();

  return (
    <div className="relative flex h-screen w-full flex-col bg-[var(--theme-surface)] overflow-hidden">
      <div className="auth-grid-overlay opacity-[0.05]" />

      <div className="absolute right-4 top-4 z-50">
        <WindowControls />
      </div>

      <div className="flex flex-1 items-center justify-center px-8 relative z-10">
        <UpdateStatusCard
          appVersion={vm.appVersion}
          updateMessage={vm.updateMessage}
          updateProgress={vm.updateProgress}
        />
      </div>
    </div>
  );
}

