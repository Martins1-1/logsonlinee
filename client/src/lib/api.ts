export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4001";

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, opts);
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (!isJson) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Expected JSON response from API. Check VITE_API_URL.");
  }
  return res.json();
}
