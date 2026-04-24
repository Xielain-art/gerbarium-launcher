export interface JavaReleaseConfig {
  baseUrl: string;
  version: string;
  builds: Record<string, string>;
}

export const JAVA_RELEASE_CONFIG: JavaReleaseConfig = {
  baseUrl: "https://github.com/adoptium/temurin17-binaries/releases/download",
  version: "jdk-17.0.10%2B7",
  builds: {
    win32_x64: "OpenJDK17U-jre_x64_windows_hotspot_17.0.10_7.zip",
    darwin_arm64: "OpenJDK17U-jre_aarch64_mac_hotspot_17.0.10_7.tar.gz",
    darwin_x64: "OpenJDK17U-jre_x64_mac_hotspot_17.0.10_7.tar.gz",
    linux_arm64: "OpenJDK17U-jre_aarch64_linux_hotspot_17.0.10_7.tar.gz",
    linux_x64: "OpenJDK17U-jre_x64_linux_hotspot_17.0.10_7.tar.gz",
  },
};
