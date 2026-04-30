import { describe, test, expect } from "vitest";
import { loginRequest, registerRequest, verifyEmailRequest, getEmailVerificationStatusRequest, profileRequest } from "../src/lib/api/auth";

describe("Authentication Flow", () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    username: `tester_${Date.now()}`,
    password: "TestPassword123!"
  };

  let accessToken: string;

  test("should register a new user successfully", async () => {
    const result = await registerRequest(testUser);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(result.data.accessToken).toBeDefined();
      expect(result.data.user.username).toBe(testUser.username);
      accessToken = result.data.accessToken;
    }
  });

  test("should verify email in development mode", async () => {
    expect(accessToken).toBeDefined();

    const statusResult = await getEmailVerificationStatusRequest(accessToken);
    
    expect(statusResult.success).toBe(true);
    
    if (statusResult.success && statusResult.data.developmentCode) {
      const code = statusResult.data.developmentCode;
      const verifyResult = await verifyEmailRequest(accessToken, { code });
      
      expect(verifyResult.success).toBe(true);
    }
  });

  test("should login with registered credentials", async () => {
    const result = await loginRequest({
      identifier: testUser.username,
      password: testUser.password
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accessToken).toBeDefined();
      accessToken = result.data.accessToken;
    }
  });

  test("should fetch user profile with valid token", async () => {
    expect(accessToken).toBeDefined();

    const result = await profileRequest(accessToken);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe(testUser.username);
      expect(result.data.id).toBeDefined();
    }
  });

  test("should fail login with wrong password", async () => {
    const result = await loginRequest({
      identifier: testUser.username,
      password: "WrongPassword"
    });

    expect(result.success).toBe(false);
  });
});
