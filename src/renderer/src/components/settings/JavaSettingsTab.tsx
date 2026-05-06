import type { JavaSettingsTabProps } from "./types";
import { JavaInstalledList } from "./java/JavaInstalledList";
import { JavaJvmArgsSection } from "./java/JavaJvmArgsSection";
import { JavaPathSection } from "./java/JavaPathSection";
import { JavaRamSection } from "./java/JavaRamSection";

function isJavaInstalled(installedVersions: number[], version: number): boolean {
  return installedVersions.includes(version);
}

export function JavaSettingsTab(
  props: JavaSettingsTabProps,
): React.JSX.Element {
  const installedVersionNumbers = props.installedJava.map(
    (java) => java.version,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-theme">
          {props.t.SETTINGS.JAVA.TITLE}
        </h2>
        <p className="text-sm text-theme-muted">
          Configure Java runtime environment and memory allocation.
        </p>
      </div>

      <div className="grid gap-6">
        <JavaInstalledList
          t={props.t}
          installedJava={props.installedJava}
          selectedPath={props.general.javaPath}
          onSelectInstalledJava={props.onSelectInstalledJava}
          onRemoveJava={props.onRemoveJava}
        />

        <JavaPathSection
          t={props.t}
          javaPath={props.general.javaPath}
          onUpdateJavaPath={(path) => props.onUpdateGeneral({ javaPath: path })}
          onSelectJava={props.onSelectJava}
          onFindJava={props.onFindJava}
          javaLoading={props.javaLoading}
          javaError={props.javaError}
          javaVersion={props.javaVersion}
          isDownloadingJava={props.isDownloadingJava}
          javaProgress={props.javaProgress}
          javaStatus={props.javaStatus}
          javaVersions={props.javaVersions}
          downloadJavaVersion={props.downloadJavaVersion}
          onSetDownloadJavaVersion={props.onSetDownloadJavaVersion}
          onDownloadJava={props.onDownloadJava}
          isInstalled={(version) =>
            isJavaInstalled(installedVersionNumbers, version)
          }
        />

        <div className="grid gap-6 md:grid-cols-1">
          <JavaRamSection
            t={props.t}
            maxRamGb={props.maxRamGb}
            ramAllocation={props.general.ramAllocation}
            onUpdateRam={(ram) => props.onUpdateGeneral({ ramAllocation: ram })}
          />

          <JavaJvmArgsSection
            t={props.t}
            jvmArgs={props.general.jvmArgs || ""}
            onUpdateJvmArgs={(jvmArgs) => props.onUpdateGeneral({ jvmArgs })}
          />
        </div>
      </div>
    </div>
  );
}
