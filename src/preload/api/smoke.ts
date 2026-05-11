export function createSmokeApi() {
  const env =
    typeof process !== "undefined" && process.env
      ? process.env
      : ({} as Record<string, string | undefined>);

  return {
    getSmokeTestConfig: () => {
      if (env.SMOKE_TEST === "true" || env.E2E_FORCE_SMOKE === "true") {
        return {
          isSmokeTest: true,
          testUsername: env.TEST_USERNAME,
          testEmail: env.TEST_EMAIL,
          testPassword: env.TEST_PASSWORD,
        };
      }
      return null;
    },
  };
}
