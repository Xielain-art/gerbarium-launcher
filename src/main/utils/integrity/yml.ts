export function isSimpleYamlComment(value: string): boolean {
  return value.startsWith("#");
}

export function parseSimpleYamlKeyValue(
  line: string,
): { key: string; value: string } | null {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex <= 0) {
    return null;
  }

  const key = line.slice(0, separatorIndex).trim();
  if (!key) {
    return null;
  }

  let value = line.slice(separatorIndex + 1).trim();
  if (!value || isSimpleYamlComment(value)) {
    return null;
  }

  const hashCommentIndex = value.indexOf(" #");
  if (hashCommentIndex >= 0) {
    value = value.slice(0, hashCommentIndex).trim();
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  return { key, value };
}

export function extractAsarSha256FromLatestYml(content: string): string | null {
  const allowedKeys = new Set(["appAsarSha256", "asarSha256", "asar_sha256"]);

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || isSimpleYamlComment(line)) {
      continue;
    }

    const keyValue = parseSimpleYamlKeyValue(line);
    if (!keyValue || !allowedKeys.has(keyValue.key)) {
      continue;
    }

    if (/^[a-f0-9]{64}$/i.test(keyValue.value)) {
      return keyValue.value;
    }
  }

  return null;
}
