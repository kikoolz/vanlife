import { supabase } from "./lib/supabase";

const BUCKET_NAME = "van-images";
import { getDemoHostId } from "./utils";
import { Monitoring } from "./utils/monitoring";

// Improved caching with TTL and size limits
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

class Cache {
  constructor(maxSize = MAX_CACHE_SIZE, defaultTTL = DEFAULT_CACHE_TTL) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key, data, ttl = this.defaultTTL) {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data: structuredClone(data),
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return structuredClone(entry.data);
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  invalidatePattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

const responseCache = new Cache();

// Local storage cache for persistent data
const localStorageCache = {
  set(key, data, ttl = DEFAULT_CACHE_TTL) {
    try {
      const entry = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn("Failed to set localStorage cache:", error);
    }
  },

  get(key) {
    try {
      const entry = localStorage.getItem(key);
      if (!entry) return null;

      const parsed = JSON.parse(entry);
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn("Failed to get localStorage cache:", error);
      return null;
    }
  },

  delete(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to delete localStorage cache:", error);
    }
  },

  clear() {
    try {
      // Only clear app-specific keys
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("vanlife_")) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn("Failed to clear localStorage cache:", error);
    }
  },
};

function createApiError(status, statusText, message) {
  return {
    status,
    statusText,
    message: message || "Something went wrong while loading data.",
  };
}

function getCachedResponse(cacheKey, useLocalStorage = false) {
  if (useLocalStorage) {
    return localStorageCache.get(`vanlife_${cacheKey}`);
  }
  return responseCache.get(cacheKey);
}

function setCachedResponse(cacheKey, data, ttl = DEFAULT_CACHE_TTL, useLocalStorage = false) {
  if (useLocalStorage) {
    localStorageCache.set(`vanlife_${cacheKey}`, data, ttl);
  } else {
    responseCache.set(cacheKey, data, ttl);
  }
}

function invalidateCache(pattern) {
  responseCache.invalidatePattern(pattern);
  // Also invalidate localStorage cache
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("vanlife_") && key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn("Failed to invalidate localStorage cache:", error);
  }
}

function handleSupabaseError(error, fallbackMessage) {
  if (error) {
    // Log error for monitoring
    Monitoring.logError(error, {
      code: error.code,
      message: error.message,
      fallbackMessage,
    });

    // Map common Supabase error codes to user-friendly messages
    const errorMessages = {
      "23505": "This record already exists.",
      "23503": "Referenced record does not exist.",
      "23502": "Required field is missing.",
      "PGRST116": "No data found.",
      "PGRST204": "Column not found in database.",
      "JWT0000": "Authentication failed. Please log in again.",
    };

    const userMessage = errorMessages[error.code] || fallbackMessage || "Something went wrong. Please try again.";

    throw createApiError(
      error.code || 500,
      error.message || "Database Error",
      userMessage,
    );
  }
}

function assertVanPayload(payload, fallbackMessage) {
  if (!payload || (payload.id && !payload.name && !payload.price)) {
    throw createApiError(500, "Invalid Response", fallbackMessage);
  }

  return payload;
}

async function getHostId() {
  return await getDemoHostId();
}

export async function getVans(id) {
  const cacheKey = id ? `van:${id}` : "vans:all";
  const cachedResponse = getCachedResponse(cacheKey);

  if (cachedResponse) {
    return cachedResponse;
  }

  let query = supabase.from("vans").select("*");

  if (id) {
    query = query.eq("id", id).maybeSingle();
  }

  const { data, error } = await query;
  handleSupabaseError(error, "Failed to fetch vans.");

  const vans = id ? data : data;

  if (!id && !Array.isArray(vans)) {
    throw createApiError(500, "Invalid Response", "Invalid vans response.");
  }

  if (id) {
    if (!vans) {
      throw createApiError(404, "Not Found", "Van not found.");
    }
    assertVanPayload(vans, "Van not found.");
  }

  setCachedResponse(cacheKey, vans);
  return vans;
}

export async function getHostVans(id) {
  const hostId = await getHostId();
  let query = supabase.from("vans").select("*").eq("host_id", hostId);

  if (id) {
    query = query.eq("id", id).maybeSingle();
  }

  const { data, error } = await query;
  handleSupabaseError(error, "Failed to fetch host vans.");

  const vans = id ? data : data;

  if (!id && !Array.isArray(vans)) {
    throw createApiError(
      500,
      "Invalid Response",
      "Invalid host vans response.",
    );
  }

  if (id) {
    if (!vans) {
      throw createApiError(404, "Not Found", "Host van not found.");
    }
    assertVanPayload(vans, "Host van not found.");
  }

  return vans;
}

export async function loginUser(creds) {
  if (!creds?.email || !creds?.password) {
    throw createApiError(400, "Bad Request", "Email and password are required.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: creds.email,
    password: creds.password,
  });

  if (error) {
    throw createApiError(401, "Unauthorized", error.message);
  }

  if (!data?.user || !data?.session) {
    throw createApiError(
      500,
      "Invalid Response",
      "Login completed without a valid session.",
    );
  }

  return data;
}

export async function signupUser(creds) {
  if (!creds?.email || !creds?.password) {
    throw createApiError(400, "Bad Request", "Email and password are required.");
  }

  const { data, error } = await supabase.auth.signUp({
    email: creds.email,
    password: creds.password,
    options: {
      data: {
        full_name: creds.name || "",
      },
    },
  });

  if (error) {
    throw createApiError(400, "Bad Request", error.message);
  }

  if (!data?.user) {
    throw createApiError(
      500,
      "Invalid Response",
      "Sign up completed without a valid user.",
    );
  }

  return data;
}

export async function getHostIncome() {
  const hostId = await getHostId();
  const { data, error } = await supabase
    .from("host_income")
    .select("income")
    .eq("host_id", hostId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  handleSupabaseError(error, "Failed to fetch income.");

  if (!data || typeof data?.income !== "number") {
    throw createApiError(500, "Invalid Response", "Invalid income response.");
  }

  return data.income;
}

export async function getHostReviews() {
  const hostId = await getHostId();
  const { data, error } = await supabase
    .from("host_reviews")
    .select("*")
    .eq("host_id", hostId)
    .maybeSingle();

  handleSupabaseError(error, "Failed to fetch reviews.");

  if (!data || typeof data?.score !== "number" || typeof data?.total_reviews !== "number") {
    throw createApiError(500, "Invalid Response", "Invalid reviews response.");
  }

  return {
    score: data.score,
    total: data.total_reviews,
  };
}

export async function getHostIncomeData() {
  const hostId = await getHostId();

  // Fetch income data for chart
  const { data: incomeData, error: incomeError } = await supabase
    .from("host_income")
    .select("month, income")
    .eq("host_id", hostId)
    .order("created_at", { ascending: true });

  handleSupabaseError(incomeError, "Failed to fetch income data.");

  // Fetch transactions
  const { data: transactionsData, error: transactionsError } = await supabase
    .from("transactions")
    .select("*")
    .eq("host_id", hostId)
    .order("transaction_date", { ascending: false })
    .limit(3);

  handleSupabaseError(transactionsError, "Failed to fetch transactions.");

  if (!Array.isArray(incomeData)) {
    throw createApiError(
      500,
      "Invalid Response",
      "Invalid income data response.",
    );
  }

  const chartData = incomeData.map((item) => ({
    month: item.month,
    income: item.income,
  }));

  const transactions = (transactionsData || []).map((item) => ({
    id: item.id,
    amount: item.amount,
    date: new Date(item.transaction_date).toLocaleDateString("en-US"),
  }));

  return {
    chartData,
    transactions,
  };
}

// ============================================
// BOOKING API FUNCTIONS
// ============================================

export async function createBooking(bookingData) {
  const { data, error } = await supabase
    .from("bookings")
    .insert([
      {
        van_id: bookingData.vanId,
        user_id: bookingData.userId,
        host_id: bookingData.hostId,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        total_price: bookingData.totalPrice,
        payment_intent_id: bookingData.paymentIntentId,
        cancellation_deadline: new Date(
          new Date(bookingData.startDate).getTime() - 30 * 24 * 60 * 60 * 1000
        ).toISOString().split("T")[0],
      },
    ])
    .select()
    .single();

  handleSupabaseError(error, "Failed to create booking.");

  return data;
}

export async function getUserBookings(userId) {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      vans (
        id,
        name,
        imageUrl,
        type,
        price
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  handleSupabaseError(error, "Failed to fetch user bookings.");

  return data;
}

export async function getHostBookings(hostId) {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      vans (
        id,
        name,
        imageUrl,
        type
      )
    `)
    .eq("host_id", hostId)
    .order("created_at", { ascending: false });

  handleSupabaseError(error, "Failed to fetch host bookings.");

  return data;
}

export async function getBookingById(bookingId) {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      vans (
        id,
        name,
        imageUrl,
        type,
        price,
        description
      )
    `)
    .eq("id", bookingId)
    .single();

  handleSupabaseError(error, "Failed to fetch booking.");

  return data;
}

export async function updateBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .select()
    .single();

  handleSupabaseError(error, "Failed to update booking status.");

  return data;
}

export async function checkAvailability(vanId, startDate, endDate) {
  // Check for overlapping bookings using range overlap logic
  // Overlap occurs when: (existing_start <= new_end) AND (existing_end >= new_start)
  const { data, error } = await supabase
    .from("bookings")
    .select("id, start_date, end_date")
    .eq("van_id", vanId)
    .in("status", ["pending", "confirmed"])
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

  handleSupabaseError(error, "Failed to check availability.");

  return {
    available: data.length === 0,
    conflictingBookings: data,
  };
}

export async function cancelBooking(bookingId) {
  // First, get the booking to calculate cancellation fee
  const booking = await getBookingById(bookingId);

  // Calculate cancellation fee in JavaScript
  const now = new Date();
  const startDate = new Date(booking.start_date);
  const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
  
  let cancellationFee = 0;
  
  if (daysUntilStart < 7) {
    cancellationFee = booking.total_price; // No refund
  } else if (daysUntilStart < 14) {
    cancellationFee = booking.total_price * 0.5; // 50% fee
  } else if (daysUntilStart < 30) {
    cancellationFee = booking.total_price * 0.25; // 25% fee
  } else {
    cancellationFee = booking.total_price * 0.1; // 10% fee
  }

  // Update booking with cancellation details
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancellation_fee: Math.round(cancellationFee * 100) / 100, // Round to 2 decimal places
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  handleSupabaseError(error, "Failed to cancel booking.");

  return data;
}

export async function createPaymentIntent(amount, currency = "usd") {
  const response = await fetch("http://localhost:3001/api/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw createApiError(
      response.status,
      errorData.error || "Payment Error",
      "Failed to create payment intent."
    );
  }

  return response.json();
}

// Image upload functions
export async function uploadVanImage(file, userId) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  handleSupabaseError(error, "Failed to upload image.");

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: publicUrlData.publicUrl,
  };
}

export async function deleteVanImage(filePath) {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  handleSupabaseError(error, "Failed to delete image.");
}

export async function updateVan(vanId, updates) {
  const { data, error } = await supabase
    .from("vans")
    .update(updates)
    .eq("id", vanId)
    .select()
    .maybeSingle();

  handleSupabaseError(error, "Failed to update van.");

  // Invalidate cache
  invalidateCache(`van:${vanId}`);
  invalidateCache("vans:all");

  return data;
}

export async function createVan(vanData) {
  const { data, error } = await supabase
    .from("vans")
    .insert(vanData)
    .select()
    .single();

  handleSupabaseError(error, "Failed to create van.");

  // Invalidate cache
  invalidateCache("vans:all");

  return data;
}

export async function deleteVan(vanId) {
  const { error } = await supabase
    .from("vans")
    .delete()
    .eq("id", vanId);

  handleSupabaseError(error, "Failed to delete van.");

  // Invalidate cache
  invalidateCache(`van:${vanId}`);
  invalidateCache("vans:all");
}

export async function updateBookingDates(bookingId, startDate, endDate) {
  const { data, error } = await supabase
    .from("bookings")
    .update({
      start_date: startDate,
      end_date: endDate,
    })
    .eq("id", bookingId)
    .select()
    .single();

  handleSupabaseError(error, "Failed to update booking dates.");

  // Invalidate cache
  invalidateCache(`booking:${bookingId}`);
  
  return data;
}

// ============================================
// REVIEW API FUNCTIONS
// ============================================

export async function createReview(reviewData) {
  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        van_id: reviewData.vanId,
        user_id: reviewData.userId,
        booking_id: reviewData.bookingId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      },
    ])
    .select()
    .single();

  handleSupabaseError(error, "Failed to create review.");

  return data;
}

export async function getVanReviews(vanId) {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      user:user_id (
        email
      )
    `)
    .eq("van_id", vanId)
    .order("created_at", { ascending: false });

  handleSupabaseError(error, "Failed to fetch van reviews.");

  return data;
}

export async function getUserReviewForBooking(bookingId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  handleSupabaseError(error, "Failed to fetch review.");

  return data;
}
