/**
 * CORS / Origin configuration for the frontend.
 * The backend must allow these origins in CORS_ALLOWED_ORIGINS.
 */

/** Production app URL - must be allowed by backend CORS */
export const APP_ORIGIN =
  typeof window !== "undefined"
    ? window.location.origin
    : import.meta.env.VITE_APP_ORIGIN || "https://www.theastroverse.live";

/** Allowed origins for API requests (must match backend CORS) */
export const ALLOWED_ORIGINS = [
  "https://www.theastroverse.live",
  "https://theastroverse.live",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
] as const;

/** Check if current origin is allowed (for debugging) */
export function isAllowedOrigin(): boolean {
  if (typeof window === "undefined") return true;
  return ALLOWED_ORIGINS.some((o) => o === window.location.origin);
}
