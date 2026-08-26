const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const defaultApiUrl =
  process.env.NODE_ENV === "production"
    ? "https://meu-saas-backend-production.up.railway.app"
    : "http://localhost:4000";
const rawApiUrl = configuredApiUrl || defaultApiUrl;
export const API_BASE_URL = (
  /^https?:\/\//i.test(rawApiUrl)
    ? rawApiUrl
    : `${/^(localhost|127\.0\.0\.1)(:|\/|$)/i.test(rawApiUrl) ? "http" : "https"}://${rawApiUrl}`
).replace(/\/$/, "");

export const apiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const apiAssetUrl = (value: string | null | undefined) => {
  const url = value?.trim();
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (/^(?:localhost(?::\d+)?|(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?)(?:\/|$)/i.test(url)) {
    return `${url.startsWith("localhost") ? "http" : "https"}://${url}`;
  }
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
};
