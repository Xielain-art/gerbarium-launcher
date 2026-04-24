export type JavaVersion = 8 | 17 | 21;

export const JAVA_VERSIONS: JavaVersion[] = [8, 17, 21];

export interface JavaReleaseConfig {
  baseUrl: string;
  version: string;
  builds: Record<string, string>;
}

export const JAVA_RELEASE_CONFIGS: Record<JavaVersion, JavaReleaseConfig> = {
  8: {
    baseUrl: "https://github.com/adoptium/temurin8-binaries/releases/download",
    version: "jdk8u482-b08",
    builds: {
      win32_x64: "OpenJDK8U-jre_x64_windows_hotspot_8u482b08.zip",
      darwin_x64: "OpenJDK8U-jre_x64_mac_hotspot_8u482b08.tar.gz",
      linux_arm64: "OpenJDK8U-jre_aarch64_linux_hotspot_8u482b08.tar.gz",
      linux_x64: "OpenJDK8U-jre_x64_linux_hotspot_8u482b08.tar.gz",
    },
  },
  17: {
    baseUrl: "https://github.com/adoptium/temurin17-binaries/releases/download",
    version: "jdk-17.0.10%2B7",
    builds: {
      win32_x64: "OpenJDK17U-jre_x64_windows_hotspot_17.0.10_7.zip",
      darwin_arm64: "OpenJDK17U-jre_aarch64_mac_hotspot_17.0.10_7.tar.gz",
      darwin_x64: "OpenJDK17U-jre_x64_mac_hotspot_17.0.10_7.tar.gz",
      linux_arm64: "OpenJDK17U-jre_aarch64_linux_hotspot_17.0.10_7.tar.gz",
      linux_x64: "OpenJDK17U-jre_x64_linux_hotspot_17.0.10_7.tar.gz",
    },
  },
  21: {
    baseUrl: "https://github.com/adoptium/temurin21-binaries/releases/download",
    version: "jdk-21.0.10%2B7",
    builds: {
      win32_x64: "OpenJDK21U-jre_x64_windows_hotspot_21.0.10_7.zip",
      darwin_arm64: "OpenJDK21U-jre_aarch64_mac_hotspot_21.0.10_7.tar.gz",
      darwin_x64: "OpenJDK21U-jre_x64_mac_hotspot_21.0.10_7.tar.gz",
      linux_arm64: "OpenJDK21U-jre_aarch64_linux_hotspot_21.0.10_7.tar.gz",
      linux_x64: "OpenJDK21U-jre_x64_linux_hotspot_21.0.10_7.tar.gz",
    },
  },
};

/**
 * Determine the required Java version based on Minecraft version.
 *
 * Rules:
 * - Minecraft 1.16.5 and below → Java 8
 * - Minecraft 1.17 – 1.20.4    → Java 17
 * - Minecraft 1.20.5 and above → Java 21
 */
export function getRequiredJavaVersion(minecraftVersion: string): JavaVersion {
  const match = minecraftVersion.match(/1\.(\d+)(?:\.(\d+))?/);
  if (!match) return 17;

  const minor = parseInt(match[1], 10);
  const patch = match[2] ? parseInt(match[2], 10) : 0;

  if (minor < 17) return 8;
  if (minor === 20 && patch >= 5) return 21;
  if (minor >= 21) return 21;
  return 17;
}

export function getJavaDownloadUrl(javaVersion: JavaVersion): string {
  const config = JAVA_RELEASE_CONFIGS[javaVersion];
  if (!config) {
    throw new Error(`Unsupported Java version: ${javaVersion}`);
  }

  const arch = process.arch;
  const platform = process.platform;
  let key = `${platform}_${arch}`;
  let build = config.builds[key];

  if (!build) {
    if (platform === "darwin" && arch === "arm64") {
      key = "darwin_x64";
      build = config.builds[key];
      if (build) {
        console.log(`[Java] Native ARM64 build not found for Java ${javaVersion}, falling back to x64 via Rosetta 2`);
      }
    } else if (platform === "linux" && arch === "arm64") {
      key = "linux_x64";
      build = config.builds[key];
      if (build) {
        console.log(`[Java] Native ARM64 build not found for Java ${javaVersion}, falling back to x64`);
      }
    }
  }

  if (!build) {
    throw new Error(
      `Unsupported platform/architecture for Java ${javaVersion}: ${platform} ${arch}`,
    );
  }

  return `${config.baseUrl}/${config.version}/${build}`;
}

export function getJavaVersionLabel(version: JavaVersion): string {
  return `Java ${version}`;
}
