export type VelocityOnlineResponse = {
  count: number;
};

export type VelocityServersResponse = Record<string, number>;

function normalizeBaseUrl(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) {
    throw new Error("Velocity API address is not configured.");
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `http://${trimmed}`;
}

export async function fetchVelocityOnlineCount(
  address: string,
  password?: string,
): Promise<number> {
  const baseUrl = normalizeBaseUrl(address);
  const endpoint = new URL("/count", baseUrl).toString();
  const trimmedPassword = password?.trim();
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      ...(trimmedPassword
        ? {
            Authorization: `Bearer ${trimmedPassword}`,
            "X-Server-Password": trimmedPassword,
          }
        : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Velocity API error ${response.status}`);
  }

  const payload = (await response.json()) as VelocityOnlineResponse;
  if (!payload || typeof payload.count !== "number") {
    throw new Error("Velocity API returned invalid /count payload.");
  }

  return payload.count;
}

export async function fetchVelocityServers(
  address: string,
  password?: string,
): Promise<VelocityServersResponse> {
  const baseUrl = normalizeBaseUrl(address);
  const endpoint = new URL("/servers", baseUrl).toString();
  const trimmedPassword = password?.trim();
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      ...(trimmedPassword
        ? {
            Authorization: `Bearer ${trimmedPassword}`,
            "X-Server-Password": trimmedPassword,
          }
        : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Velocity API error ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Velocity API returned invalid /servers payload.");
  }

  const normalized: VelocityServersResponse = {};
  for (const [name, value] of Object.entries(payload)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      normalized[name] = value;
    }
  }

  return normalized;
}
