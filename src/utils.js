import { redirect } from "react-router-dom";
import { supabase } from "./lib/supabase";

const DEFAULT_DEMO_HOST_ID = "123";
const DEMO_HOST_BY_EMAIL = {
  "host123@vanlife.demo": "123",
  "host456@vanlife.demo": "456",
  "host789@vanlife.demo": "789",
  "testuser@example.com": "123",
};

function getRequestFromArg(requestOrArgs) {
  if (!requestOrArgs) {
    return null;
  }

  if (requestOrArgs instanceof Request) {
    return requestOrArgs;
  }

  return requestOrArgs.request || null;
}

function buildLoginRedirect(request) {
  const loginParams = new URLSearchParams({
    message: "You must log in first.",
    redirectTo: "/host",
  });

  if (!request?.url) {
    return `/login?${loginParams.toString()}`;
  }

  const currentUrl = new URL(request.url);
  const redirectTo = `${currentUrl.pathname}${currentUrl.search}`;

  if (redirectTo && redirectTo !== "/login") {
    loginParams.set("redirectTo", redirectTo);
  }

  return `/login?${loginParams.toString()}`;
}

export async function getAuthSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return null;
  }

  return data.session;
}

export async function getCurrentUser() {
  const session = await getAuthSession();
  return session?.user || null;
}

export function subscribeToAuthChanges(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return subscription;
}

export async function requireAuth(requestOrArgs) {
  const session = await getAuthSession();

  if (session) {
    return session;
  }

  throw redirect(buildLoginRedirect(getRequestFromArg(requestOrArgs)));
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  return "/login?message=You have been logged out.";
}

export async function getDemoHostId() {
  const user = await getCurrentUser();

  if (!user) {
    return DEFAULT_DEMO_HOST_ID;
  }

  const metadataHostId =
    user.user_metadata?.hostId ||
    user.user_metadata?.demoHostId ||
    user.app_metadata?.hostId;

  if (metadataHostId) {
    return String(metadataHostId);
  }

  const normalizedEmail = user.email?.trim().toLowerCase();

  return DEMO_HOST_BY_EMAIL[normalizedEmail] || DEFAULT_DEMO_HOST_ID;
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .substring(0, 1000); // Limit length
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePrice(price) {
  const num = parseFloat(price);
  return !isNaN(num) && num >= 0;
}

export function validateDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
