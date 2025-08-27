// API configuration and environment settings

// API Base URL Configuration
export const API_CONFIG = {
  // Base URL for the Express backend
  baseUrl: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5173",

  // Request timeout in milliseconds
  timeout: 10000,

  // Retry configuration
  retries: {
    maxAttempts: 3,
    delay: 1000, // Initial delay in ms
    backoffMultiplier: 2, // Exponential backoff multiplier
  },

  // Health check interval
  healthCheckInterval: 30000, // 30 seconds
} as const;

// Supabase Configuration (if needed for direct access)
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Members
  members: "/api/members",
  membersByRole: "/api/members/by-role",

  // Events and Dates
  events: "/api/events",
  dates: "/api/dates",
  addDate: "/api/dates",
  addDateRange: "/api/dates/range",

  // Availability
  availability: "/api/availability",
  availabilityByRole: "/api/availability/by-role",
  setAvailability: "/api/availability",

  // Admin
  adminVerify: "/api/admin/verify",
  adminEvents: "/api/admin/events",
  reset: "/api/reset",

  // Export
  exportCsv: "/api/export/csv",
  exportSummary: "/api/export/summary",
} as const;

// Request Headers
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  network:
    "Unable to connect to the server. Please check your internet connection.",
  timeout: "Request timed out. Please try again.",
  server: "Server error occurred. Please try again later.",
  unauthorized: "Invalid credentials provided.",
  forbidden: "You do not have permission to perform this action.",
  notFound: "The requested resource was not found.",
  validation: "Invalid data provided. Please check your input.",
  unknown: "An unknown error occurred. Please try again.",
} as const;

// HTTP Status Code Mappings
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Utility function to build API URLs
export function buildApiUrl(endpoint: string, baseUrl?: string): string {
  const base = baseUrl || API_CONFIG.baseUrl;
  return `${base}${endpoint}`;
}

// Utility function to get error message by status code
export function getErrorMessageByStatus(status: number): string {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return ERROR_MESSAGES.validation;
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.unauthorized;
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_MESSAGES.forbidden;
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.notFound;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return ERROR_MESSAGES.server;
    default:
      return ERROR_MESSAGES.unknown;
  }
}

// Development/Production environment helpers
export const ENV = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isClient: typeof window !== "undefined",
  isServer: typeof window === "undefined",
} as const;

// Logging configuration
export const LOGGING = {
  enableApiLogs: ENV.isDevelopment,
  enableErrorLogs: true,
  enableDebugLogs: ENV.isDevelopment,
} as const;

// Feature flags
export const FEATURES = {
  enableApiRetries: true,
  enableOfflineMode: false, // For future implementation
  enableCaching: false, // For future implementation
  enableRealTimeUpdates: false, // For future WebSocket implementation
} as const;
