import { mainEnv } from "../../main/config/env";
import { isSmokeTestEnabled } from "../../shared/env";

export function createSmokeApi() {
  return {
    getSmokeTestConfig: () => {
      if (isSmokeTestEnabled(mainEnv)) {
        return {
          isSmokeTest: true,
          testUsername: mainEnv.TEST_USERNAME,
          testEmail: mainEnv.TEST_EMAIL,
          testPassword: mainEnv.TEST_PASSWORD,
        };
      }
      return null;
    },
  };
}
