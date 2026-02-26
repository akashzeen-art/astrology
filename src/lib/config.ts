// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: "PalmAstro",
  VERSION: "1.0.0",
  ENVIRONMENT: import.meta.env.MODE,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const;

// Feature Flags
export const FEATURES = {
  // Use real backend by default. Only enable mock API when explicitly set to "true".
  MOCK_API: import.meta.env.VITE_USE_MOCK_API === "true",
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  PAYMENTS: import.meta.env.VITE_ENABLE_PAYMENTS === "true",
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "palmastro_token",
  REFRESH_TOKEN: "palmastro_refresh_token",
  USER_DATA: "palmastro_user",
  SETTINGS: "palmastro_settings",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: "/auth/signup/",
    LOGIN: "/auth/login/",
    LOGOUT: "/auth/logout/",
    REFRESH: "/auth/refresh/",
    ME: "/auth/me/", // User profile endpoint
    CHANGE_PASSWORD: "/auth/password/change/",
    RESET_PASSWORD: "/auth/password/reset/",
    DASHBOARD: "/auth/dashboard/",
  },

  // Readings
  READINGS: {
    LIST: "/readings/list/", // GET - List all readings
    CREATE: "/readings/", // POST - Create new reading
    DETAIL: (id: string) => `/readings/${id}/`,
    PALM_UPLOAD: "/readings/palm/upload/",
    PALM_ANALYZE: "/readings/palm/analyze/",
    PALM_ANALYZE_NEW: "/palm-reading/analyze/", // New endpoint matching specification
    ASTROLOGY_CREATE: "/readings/astrology/",
    SAVE_UNIFIED: "/readings/save/", // Unified endpoint to save all reading types
  },
  
  // Predictions
  PREDICTIONS: {
    GET: "/predictions/get/", // GET - Get all predictions from readings
  },
  
  // Dashboard
  DASHBOARD: {
    REALTIME: "/auth/dashboard/realtime/", // GET - Real-time dashboard updates
  },
  
  // Plans
  PLANS: {
    UPGRADE: "/auth/upgrade-plan/", // POST - Upgrade membership plan
  },

  // Astrology
  ASTROLOGY: {
    BIRTH_CHART: "/astrology/birth-chart/",
    COMPATIBILITY: "/astrology/compatibility/",
    DAILY_HOROSCOPE: "/astrology/daily-horoscope/",
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    PLANS: "/subscriptions/plans/",
    SUBSCRIBE: "/subscriptions/subscribe/",
    CANCEL: "/subscriptions/cancel/",
    PAYMENT_METHODS: "/subscriptions/payment-methods/",
  },

  // Analytics
  ANALYTICS: {
    USER_STATS: "/analytics/user-stats/",
    READINGS_HISTORY: "/analytics/readings-history/",
  },
} as const;

export default API_CONFIG;
