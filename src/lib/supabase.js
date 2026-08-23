import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// The app remains usable in demo mode until the two environment variables are set.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export async function getNotificationSummary() {
  if (!supabase) return { connected: false, data: null, error: null };

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('notifications')
    .select('id, status, channel, created_at')
    .gte('created_at', start.toISOString());

  return { connected: true, data, error };
}

export async function createTestNotification(payload) {
  if (!supabase) return { error: new Error('Supabase is not configured.') };
  return supabase.from('notifications').insert({
    ...payload,
    status: 'accepted',
    idempotency_key: crypto.randomUUID(),
  }).select().single();
}
