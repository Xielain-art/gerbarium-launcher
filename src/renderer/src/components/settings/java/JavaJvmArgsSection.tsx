import type { TranslationType } from "../../../../../shared/constants/translations";

interface Props {
  t: TranslationType;
  jvmArgs: string;
  onUpdateJvmArgs: (v: string) => void;
}

export function JavaJvmArgsSection({
  t,
  jvmArgs,
  onUpdateJvmArgs,
}: Props): React.JSX.Element {
  return (
    <div className="space-y-2">
      <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-theme">
        {t.SETTINGS.JAVA.JVM_ARGS_LABEL}
      </label>
      <textarea
        value={jvmArgs || ""}
        onChange={(e) => onUpdateJvmArgs(e.target.value)}
        placeholder={t.SETTINGS.JAVA.JVM_ARGS_PLACEHOLDER}
        rows={4}
        className="mc-input w-full resize-none text-sm"
      />
      <p className="font-minecraft text-xs text-theme-muted">
        {t.SETTINGS.JAVA.JVM_ARGS_HELP}
      </p>
    </div>
  );
}

