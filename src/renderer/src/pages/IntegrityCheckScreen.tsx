import { ProgressBar } from "../components/ui/ProgressBar";
import { useIntegrityCheckScreen } from "../hooks/useIntegrityCheckScreen";

export function IntegrityCheckScreen(): React.JSX.Element {
  const vm = useIntegrityCheckScreen();

  return (
    <div className="bg-theme-main-gradient relative flex h-screen w-full items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--mc-progress-fill-a)_22%,transparent),transparent_55%)]" />
      <div className="relative w-full max-w-2xl rounded-xl border border-theme bg-[color-mix(in_srgb,var(--theme-bg)_74%,black_26%)] p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-4 font-minecraft text-xs uppercase tracking-wider text-[var(--mc-progress-fill-a)]">
          Security Preflight
        </div>
        <h1 className="mb-2 font-minecraft text-2xl text-theme">
          Checking Launcher Integrity
        </h1>
        <p className="mb-6 font-minecraft text-sm text-theme-muted">
          {vm.statusMessage}
        </p>
        <ProgressBar
          progress={vm.progress}
          status={vm.phaseText}
          className="mb-2"
        />
        <div className="font-minecraft text-xs text-theme-muted">
          {vm.progress}%
        </div>
      </div>
    </div>
  );
}

