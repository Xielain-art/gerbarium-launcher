import { app, nativeImage, type NativeImage } from "electron";
import path from "node:path";
import { MAIN_CONSTANTS } from "../main-constants";

function getPlatformIcon(appRoot: string, filename: string): string {
  const ext =
    process.platform === MAIN_CONSTANTS.PLATFORMS.WINDOWS ? "ico" : "png";
  return path.join(
    appRoot,
    "_legacy_app",
    "assets",
    "images",
    `${filename}.${ext}`,
  );
}

export function getAppIconPathWithRoot(
  appRoot: string,
  filename: string,
): string {
  if (
    filename === "SealCircle" &&
    process.platform === MAIN_CONSTANTS.PLATFORMS.WINDOWS
  ) {
    const root = app.isPackaged ? process.resourcesPath : appRoot;
    return path.join(root, "build", "app-icon.ico");
  }

  return getPlatformIcon(appRoot, filename);
}

export function getAppIcon(appRoot: string, filename: string): NativeImage {
  const iconPath = getAppIconPathWithRoot(appRoot, filename);
  const icon = nativeImage.createFromPath(iconPath);

  if (process.platform === "linux") {
    const size = icon.getSize();
    if (size.width > 512 || size.height > 512) {
      return icon.resize({ width: 256, height: 256 });
    }
  }

  return icon;
}
