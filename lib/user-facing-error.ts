const TECHNICAL_ERROR =
  /failed to fetch|networkerror|load failed|err_|http\s*\d{3}|backend|servidor|fetch|cors|timeout/i;

export function userFacingError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  const message = error.message.trim();
  return message && !TECHNICAL_ERROR.test(message) ? message : fallback;
}
