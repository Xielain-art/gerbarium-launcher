export function parseOrNull<T>(
  schema: {
    safeParse: (value: unknown) => { success: true; data: T } | { success: false };
  },
  value: unknown,
): T | null {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
