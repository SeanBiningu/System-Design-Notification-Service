import { createClient } from "@supabase/supabase-js";

// Only public Supabase values belong in the browser bundle. Provider and service-role
// credentials stay in Supabase Edge Function secrets.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// A missing configuration keeps the UI available as a demo instead of crashing.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/** Returns today's notification records for dashboard metrics. */
export async function getNotificationSummary() {
  if (!supabase) return { connected: false, data: null, error: null };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("notifications")
    .select("id, status, channel, created_at")
    .gte("created_at", startOfToday.toISOString());

  return { connected: true, data, error };
}

/**
 * Sends a request to the protected Edge Function. The function owns retries,
 * idempotency, provider failover, and delivery-attempt records.
 */
export async function createTestNotification(payload) {
  if (!supabase) return { error: new Error("Supabase is not configured.") };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: new Error("Please log in before sending a notification.") };
  }

  return supabase.functions.invoke("send-notification", {
    body: {
      ...payload,
      // A new key prevents a browser retry from creating a duplicate notification.
      idempotencyKey: crypto.randomUUID(),
    },
  });
}
