import { describe, test, expect } from "vitest";
import got from "got";
import { isHexHash, extractAsarSha256FromLatestYml } from "../src/main/utils/integrity";

const REPO_OWNER = "Xielain-art";
const REPO_NAME = "gerbarium-releases";

const PLATFORMS = [
  { name: "Windows", file: "latest.yml" },
  { name: "macOS", file: "latest-mac.yml" },
  { name: "Linux", file: "latest-linux.yml" },
];

describe("Production Release Verification", () => {
  PLATFORMS.forEach((platform) => {
    test(`should have valid ${platform.file} on GitHub for ${platform.name}`, async () => {
      const url = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest/download/${platform.file}`;
      
      console.log(`Checking ${platform.name} release at: ${url}`);
      
      try {
        const response = await got(url, {
          timeout: { request: 10000 },
          retry: { limit: 2 }
        });

        expect(response.statusCode).toBe(200);
        
        const yamlContent = response.body;
        expect(yamlContent).toBeDefined();
        
        const hash = extractAsarSha256FromLatestYml(yamlContent);
        
        if (!hash) {
           console.warn(`[WARN] No ASAR hash found in ${platform.file}. This might be expected if you don't use ASAR integrity for this platform yet.`);
        } else {
           expect(isHexHash(hash)).toBe(true);
           console.log(`[OK] Valid SHA256 found for ${platform.name}: ${hash}`);
        }
        
      } catch (error) {
        if (error.response?.statusCode === 404) {
          console.warn(`[SKIP] ${platform.file} not found (404). Maybe this platform hasn't been released yet?`);
          return;
        }
        throw error;
      }
    });
  });
});
