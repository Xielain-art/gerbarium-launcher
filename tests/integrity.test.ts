import { describe, test, expect } from "vitest";
import { 
  normalizeHexHash, 
  isHexHash, 
  parseSimpleYamlKeyValue, 
  extractAsarSha256FromLatestYml 
} from "../src/main/utils/integrity";

describe("Integrity Utilities", () => {
  describe("normalizeHexHash", () => {
    test("should lowercase and trim hash", () => {
      expect(normalizeHexHash("  ABC123def  ")).toBe("abc123def");
    });
  });

  describe("isHexHash", () => {
    test("should validate correct sha256 hash", () => {
      const validHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      expect(isHexHash(validHash)).toBe(true);
    });

    test("should invalidate incorrect length", () => {
      expect(isHexHash("abc123")).toBe(false);
    });

    test("should invalidate non-hex characters", () => {
      const invalidHash = "g3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      expect(isHexHash(invalidHash)).toBe(false);
    });
  });

  describe("parseSimpleYamlKeyValue", () => {
    test("should parse simple key-value", () => {
      expect(parseSimpleYamlKeyValue("version: 1.2.3")).toEqual({ key: "version", value: "1.2.3" });
    });

    test("should handle quoted values", () => {
      expect(parseSimpleYamlKeyValue('hash: "abc123"')).toEqual({ key: "hash", value: "abc123" });
      expect(parseSimpleYamlKeyValue("hash: 'abc123'")).toEqual({ key: "hash", value: "abc123" });
    });

    test("should strip comments", () => {
      expect(parseSimpleYamlKeyValue("hash: abc123 # some comment")).toEqual({ key: "hash", value: "abc123" });
    });

    test("should return null for comments-only lines", () => {
      expect(parseSimpleYamlKeyValue("# this is a comment")).toBe(null);
    });
  });

  describe("extractAsarSha256FromLatestYml", () => {
    const validHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    test("should extract hash from appAsarSha256", () => {
      const yaml = `
version: 1.2.3
appAsarSha256: ${validHash}
      `;
      expect(extractAsarSha256FromLatestYml(yaml)).toBe(validHash);
    });

    test("should extract hash from asarSha256", () => {
      const yaml = `asarSha256: ${validHash}`;
      expect(extractAsarSha256FromLatestYml(yaml)).toBe(validHash);
    });

    test("should handle yaml with comments and empty lines", () => {
      const yaml = `
# Release Info
version: 1.2.3

asar_sha256: ${validHash} # critical
      `;
      expect(extractAsarSha256FromLatestYml(yaml)).toBe(validHash);
    });

    test("should return null if no allowed key is found", () => {
      const yaml = "otherKey: 123";
      expect(extractAsarSha256FromLatestYml(yaml)).toBe(null);
    });

    test("should return null if hash is invalid", () => {
      const yaml = "asarSha256: invalid-hash";
      expect(extractAsarSha256FromLatestYml(yaml)).toBe(null);
    });
  });
});
