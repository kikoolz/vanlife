// Centralized configuration management
// Access environment variables through this utility

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
  },
  api: {
    url: import.meta.env.VITE_API_URL || "http://localhost:3001",
  },
  app: {
    url: import.meta.env.VITE_APP_URL || "http://localhost:5173",
    environment: import.meta.env.VITE_ENV || "development",
  },
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
    errorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === "true",
  },
};

// Validation function to ensure required environment variables are set
export function validateConfig() {
  const errors = [];

  if (!config.supabase.url) {
    errors.push("VITE_SUPABASE_URL is required");
  }
  if (!config.supabase.anonKey) {
    errors.push("VITE_SUPABASE_ANON_KEY is required");
  }
  if (!config.stripe.publishableKey) {
    errors.push("VITE_STRIPE_PUBLISHABLE_KEY is required");
  }

  if (errors.length > 0) {
    console.error("Missing required environment variables:");
    errors.forEach((error) => console.error(`  - ${error}`));
    return false;
  }

  return true;
}

// Get environment info
export function getEnvironment() {
  return {
    name: config.app.environment,
    isDevelopment: config.app.environment === "development",
    isProduction: config.app.environment === "production",
    isStaging: config.app.environment === "staging",
  };
}
