import { describe, test, expect, afterAll } from "vitest";
import {
  loginRequest,
  testRegisterRequest,
  verifyEmailRequest,
  profileRequest,
} from "../src/lib/api/auth";
import { deleteTestUserRequest } from "../src/lib/api/admin";

describe("Authentication Flow", () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    username: `tester_${Date.now()}`,
    password: "TestPassword123!",
  };

  let accessToken: string;
  let userId: string;
  let verificationCode: string;

  test("should register a test user successfully", async () => {
    const result = await testRegisterRequest(testUser);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(result.data.accessToken).toBeDefined();
      expect(result.data.user.username).toBe(testUser.username);
      expect(result.data.emailVerificationCode).toBeDefined();

      accessToken = result.data.accessToken;
      userId = result.data.user.id;
      verificationCode = result.data.emailVerificationCode;
    }
  });

  test("should verify email with provided test code", async () => {
    expect(accessToken).toBeDefined();
    expect(verificationCode).toBeDefined();

    const verifyResult = await verifyEmailRequest(accessToken, {
      code: verificationCode,
    });

    expect(verifyResult.success).toBe(true);
  });

  test("should login with registered credentials", async () => {
    const result = await loginRequest({
      identifier: testUser.username,
      password: testUser.password,
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
      expect(result.data.id).toBe(userId);
    }
  });

  test("should fail login with wrong password", async () => {
    const result = await loginRequest({
      identifier: testUser.username,
      password: "WrongPassword",
    });

    expect(result.success).toBe(false);
  });

  afterAll(async () => {
    if (accessToken && userId) {
      // Deleting test user at the end
      await deleteTestUserRequest(accessToken, userId);
    }
  });
});
