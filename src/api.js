import { supabase } from "./lib/supabase";

const BUCKET_NAME = "van-images";
import { getDemoHostId } from "./utils";

const responseCache = new Map();

function createApiError(status, statusText, message) {
  return {
    status,
    statusText,
    message: message || "Something went wrong while loading data.",
  };
}

function getCachedResponse(cacheKey) {
  const cachedResponse = responseCache.get(cacheKey);

  if (!cachedResponse) {
    return null;
  }

  return structuredClone(cachedResponse);
}

function setCachedResponse(cacheKey, data) {
  responseCache.set(cacheKey, structuredClone(data));
}

function handleSupabaseError(error, fallbackMessage) {
  if (error) {
    throw createApiError(
      error.code || 500,
      error.message || "Database Error",
      error.message || fallbackMessage,
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

  // Invalidate cache for this van
  responseCache.delete(`van:${vanId}`);
  responseCache.delete("vans:all");

  return data;
}

export async function createVan(vanData) {
  const { data, error } = await supabase
    .from("vans")
    .insert(vanData)
    .select()
    .single();

  handleSupabaseError(error, "Failed to create van.");

  // Invalidate cache to refresh van list
  responseCache.delete("vans:all");

  return data;
}
