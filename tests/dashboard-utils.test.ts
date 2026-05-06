import { describe, expect, test } from "vitest";
import {
  getRequiredJavaMajor,
  selectBestJavaPath,
} from "../src/renderer/src/hooks/dashboard/utils";

describe("dashboard launch Java selection", () => {
  test("requires Java 21 for Minecraft 1.21.x", () => {
    expect(getRequiredJavaMajor("1.21")).toBe(21);
    expect(getRequiredJavaMajor("1.21.4")).toBe(21);
  });

  test("requires Java 17 for Minecraft 1.20.4 and Java 21 for 1.20.5", () => {
    expect(getRequiredJavaMajor("1.20.4")).toBe(17);
    expect(getRequiredJavaMajor("1.20.5")).toBe(21);
  });

  test("selects Java 21 for Minecraft 1.21 when Java 17 is listed first", () => {
    const javaPath = selectBestJavaPath(
      [
        { version: 17, path: "java-17", detectedVersion: "17.0.10" },
        { version: 21, path: "java-21", detectedVersion: "21.0.10" },
      ],
      "1.21.4",
    );

    expect(javaPath).toBe("java-21");
  });

  test("uses preferred settings Java path before auto-selection", () => {
    const javaPath = selectBestJavaPath(
      [
        { version: 17, path: "java-17", detectedVersion: "17.0.10" },
        { version: 21, path: "java-21", detectedVersion: "21.0.10" },
      ],
      "1.21.4",
      "settings-java",
    );

    expect(javaPath).toBe("settings-java");
  });

  test("selects Java 17 for Minecraft 1.20.1 when both 17 and 21 exist", () => {
    const javaPath = selectBestJavaPath(
      [
        { version: 17, path: "java-17", detectedVersion: "17.0.10" },
        { version: 21, path: "java-21", detectedVersion: "21.0.10" },
      ],
      "1.20.1",
    );

    expect(javaPath).toBe("java-17");
  });
});
