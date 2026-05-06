export function mergeSmokeCode<T extends { developmentCode?: string }>(
  status: T,
): T {
  if (process.env.SMOKE_TEST !== "true") {
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
