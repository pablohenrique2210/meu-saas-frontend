const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

if (process.env.NODE_ENV === "production" && !configuredApiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL precisa apontar para o backend publicado antes do deploy.",
  );
}

export const API_BASE_URL = (
  configuredApiUrl ?? "http://localhost:4000"
).replace(/\/$/, "");

export const apiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const apiAssetUrl = (value: string | null | undefined) => {
  const url = value?.trim();
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
};
