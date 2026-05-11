import { mainEnv } from "../../config/env";
import { isSmokeTestEnabled } from "../../../shared/env";
export function mergeSmokeCode<T extends { developmentCode?: string }>(
  status: T,
): T {
  if (!isSmokeTestEnabled(mainEnv)) {
    return status;
  }

  const smokeCode =
    (global as Record<string, unknown>).lastDevelopmentCode as
      | string
      | undefined;
  if (!smokeCode || status.developmentCode) {
    return status;
  }

  return { ...status, developmentCode: smokeCode };
}
