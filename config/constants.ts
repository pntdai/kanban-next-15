/**
 * Application-wide constants
 */

export const APP_NAME = "My Next.js App";

// API endpoints
export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "/api",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      LOGOUT: "/auth/logout",
    },
    USERS: {
      BASE: "/users",
      PROFILE: "/users/profile",
    },
  },
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth-token",
  USER_PREFERENCES: "user-preferences",
  THEME: "theme",
};

// Theme options
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};
