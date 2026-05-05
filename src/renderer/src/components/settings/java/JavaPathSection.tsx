import { DOWNLOAD_STATUS } from "../../../../../shared/constants/system";
import type { TranslationType } from "../../../../../shared/constants/translations";
import { cn } from "@/lib/utils";
import { Card, Input, Button } from "../../ui";
import { FolderOpen, Search, Download, Terminal, AlertCircle } from "lucide-react";

interface Props {
  t: TranslationType;
  javaPath: string;
  onUpdateJavaPath: (path: string) => void;
  onSelectJava: () => void;
  onFindJava: () => void;
  javaLoading: boolean;
  javaError: string | null;
  javaVersion: string | null;
  isDownloadingJava: boolean;
  javaProgress: number;
  javaStatus: string | null;
  javaVersions: number[];
  downloadJavaVersion: 8 | 17 | 21;
  onSetDownloadJavaVersion: (v: 8 | 17 | 21) => void;
  onDownloadJava: () => void;
  isInstalled: (version: number) => boolean;
}

export function JavaPathSection(p: Props): React.JSX.Element {
  const showStatus =
    p.javaLoading || p.javaError || p.javaVersion || p.isDownloadingJava;

  function getStatusText(): string {
    if (p.isDownloadingJava) {
      if (p.javaStatus === DOWNLOAD_STATUS.EXTRACTING) {
        return p.t.JAVA_STATUS.EXTRACTING;
      }
      return `${p.t.JAVA_STATUS.DOWNLOADING}${p.javaProgress}%`;
    }

    if (p.javaLoading) {
      return p.t.JAVA_STATUS.SEARCHING;
    }

    if (p.javaError) {
      return p.javaError;
    }

    return `${p.t.JAVA_STATUS.VERSION_FOUND}${p.javaVersion}`;
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <Terminal size={16} className="text-[#4d4d4d]" />
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[1.2px] text-[#4d4d4d]">
          {p.t.SETTINGS.JAVA.PATH_LABEL}
        </h3>
      </div>
      
      <div className="space-y-6">
        <div className="flex gap-2">
          <Input
            type="text"
            value={p.javaPath}
            onChange={(e) => p.onUpdateJavaPath(e.target.value)}
            placeholder={p.t.SETTINGS.JAVA.PATH_PLACEHOLDER}
            className="flex-1 font-mono text-[13px]"
          />
          <Button
            variant="secondary"
            onClick={() => void p.onSelectJava()}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <FolderOpen size={16} className="text-[#898989]" />
            {p.t.SETTINGS.JAVA.BROWSE_BUTTON}
          </Button>
          <Button
            variant="secondary"
            onClick={() => void p.onFindJava()}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Search size={16} className="text-[#898989]" />
            Auto
          </Button>
        </div>

        {showStatus && (
          <div className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-[12px] font-medium transition-all",
            p.javaError ? "bg-[#451212]/50 text-[#ff8080]" : "bg-[#111111] text-[#898989]"
          )}>
            {p.javaError ? <AlertCircle size={14} /> : <Terminal size={14} className="text-[#3ecf8e]" />}
            <span className={cn(!p.javaError && "font-mono")}>{getStatusText()}</span>
          </div>
        )}

        {p.isDownloadingJava && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#111111] border border-[#2e2e2e]">
            <div
              className="h-full bg-[#3ecf8e] shadow-[0_0_8px_rgba(62,207,142,0.4)] transition-all duration-300"
              style={{ width: `${p.javaProgress}%` }}
            />
          </div>
        )}

        {!p.javaLoading && !p.isDownloadingJava && (
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#1a1a1a]">
            <div className="relative">
              <select
                value={p.downloadJavaVersion}
                onChange={(e) =>
                  p.onSetDownloadJavaVersion(
                    Number(e.target.value) as 8 | 17 | 21,
                  )
                }
                className="flex h-10 w-32 appearance-none rounded-md border border-[#2e2e2e] bg-[#0f0f0f] px-3 py-2 font-mono text-sm text-[#fafafa] transition-all focus:border-[#3ecf8e] focus:outline-none focus:ring-1 focus:ring-[#3ecf8e]"
              >
                {p.javaVersions.map((v) => (
                  <option key={v} value={v}>
                    Java {v}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4d4d4d]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
            <Button
              variant={p.isInstalled(p.downloadJavaVersion) ? "secondary" : "primary"}
              onClick={() => void p.onDownloadJava()}
              disabled={p.isInstalled(p.downloadJavaVersion)}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              {p.isInstalled(p.downloadJavaVersion)
                ? p.t.SETTINGS.JAVA.ALREADY_INSTALLED(p.downloadJavaVersion)
                : p.t.SETTINGS.JAVA.DOWNLOAD_BUTTON(p.downloadJavaVersion)}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

