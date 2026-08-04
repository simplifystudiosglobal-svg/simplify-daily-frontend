// Base URL for the backend API. Empty string in dev (Vite's proxy in vite.config.ts
// forwards /api and /rss.xml to the locally-running backend repo). In production, set
// VITE_API_BASE_URL to the deployed backend's URL, e.g. https://simplify-daily-api.onrender.com
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
