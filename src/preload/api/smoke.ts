export function createSmokeApi() {
  return {
    getSmokeTestConfig: () => {
      if (process.env.SMOKE_TEST === "true") {
        return {
          isSmokeTest: true,
          testUsername: process.env.TEST_USERNAME,
          testEmail: process.env.TEST_EMAIL,
          testPassword: process.env.TEST_PASSWORD,
        };
      }
      return null;
    },
  };
}
