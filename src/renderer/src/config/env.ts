import { parseAppEnv } from "../../../shared/env";

type RendererEnvSource = Record<string, string | boolean | undefined>;

function toStringEnv(source: RendererEnvSource): Record<string, string | undefined> {
  const output: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string") {
      output[key] = value;
    }
  }
  return output;
}

export const rendererEnv = parseAppEnv(toStringEnv(import.meta.env as RendererEnvSource));
