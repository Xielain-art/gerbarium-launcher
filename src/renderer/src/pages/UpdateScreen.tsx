import { WindowControls } from "../components/layout/WindowControls";
import { useUpdateScreen } from "../hooks/useUpdateScreen";
import { UpdateStatusCard } from "../components/update/UpdateStatusCard";

export function UpdateScreen(): React.JSX.Element {
  const vm = useUpdateScreen();

  return (
    <div className="fantasy-ui fantasy-shell relative flex h-screen w-full flex-col overflow-hidden bg-[var(--theme-surface)]">
      <div className="fantasy-orb fantasy-orb--violet left-[-7rem] top-[-5rem] h-[20rem] w-[20rem]" />
      <div className="fantasy-orb fantasy-orb--emerald right-[-6rem] bottom-[-7rem] h-[22rem] w-[22rem]" />
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


