import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleAuth } from 'npm:google-auth-library@9';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const retryDelays = [0, 2_000, 4_000, 8_000, 0];
const pause = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

async function sendEmail(recipient: string, body: string) {
  const send = async (apiKey: string | undefined, from: string | undefined) => { const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [recipient], subject: 'Notification service test', text: body }) }); return { response, result: await response.json() }; };
  let { response, result } = await send(Deno.env.get('RESEND_API_KEY'), Deno.env.get('RESEND_FROM_EMAIL')); let provider = 'resend';
  if (!response.ok && Deno.env.get('RESEND_BACKUP_API_KEY')) { ({ response, result } = await send(Deno.env.get('RESEND_BACKUP_API_KEY'), Deno.env.get('RESEND_BACKUP_FROM_EMAIL') ?? Deno.env.get('RESEND_FROM_EMAIL'))); provider = 'resend-backup'; }
  if (!response.ok) throw new Error(result.message ?? 'Email provider rejected the request'); return { provider, providerMessageId: result.id as string };
}
async function sendSms(recipient: string, body: string) {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID')!; const token = Deno.env.get('TWILIO_AUTH_TOKEN')!; const form = new URLSearchParams({ To: recipient, From: Deno.env.get('TWILIO_FROM_NUMBER')!, Body: body });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, { method: 'POST', headers: { Authorization: `Basic ${btoa(`${sid}:${token}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: form }); const result = await response.json(); if (!response.ok) throw new Error(result.message ?? 'SMS provider rejected the request'); return { provider: 'twilio', providerMessageId: result.sid as string };
}
async function sendPush(recipient: string, body: string) {
  const projectId = Deno.env.get('FCM_PROJECT_ID'); const serviceAccount = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON'); if (!serviceAccount || !projectId) throw new Error('Firebase service account is not configured.');
  const auth = new GoogleAuth({ credentials: JSON.parse(serviceAccount), scopes: ['https://www.googleapis.com/auth/firebase.messaging'] }); const accessToken = await auth.getAccessToken(); if (!accessToken) throw new Error('Unable to obtain an FCM access token.');
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: { token: recipient, notification: { title: 'Notification service test', body } } }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error?.message ?? 'Push provider rejected the request'); return { provider: 'fcm', providerMessageId: result.name as string };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors }); if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const authHeader = req.headers.get('Authorization'); if (!authHeader) return reply({ error: 'Unauthorized' }, 401);
  const url = Deno.env.get('SUPABASE_URL')!; const anon = Deno.env.get('SUPABASE_ANON_KEY')!; const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; const client = createClient(url, anon, { global: { headers: { Authorization: authHeader } } }); const { data: { user } } = await client.auth.getUser(); if (!user) return reply({ error: 'Sign in is required to send notifications.' }, 401);
  const { channel, recipient, body, idempotencyKey, trafficClass = 'transactional' } = await req.json(); if (!['email', 'sms', 'push'].includes(channel) || !recipient || !body || !idempotencyKey) return reply({ error: 'Invalid notification payload.' }, 400);
  const db = createClient(url, service); const { data: duplicate } = await db.from('notifications').select('id,status').eq('idempotency_key', idempotencyKey).maybeSingle(); if (duplicate) return reply({ notification: duplicate, duplicate: true });
  const priority = trafficClass === 'bulk' ? 'bulk' : 'transactional'; const { data: notification, error: insertError } = await db.from('notifications').insert({ idempotency_key: idempotencyKey, user_id: user.id, recipient, channel, body, priority, status: 'queued' }).select().single();
  if (insertError) { const { data: existing } = await db.from('notifications').select('id,status').eq('idempotency_key', idempotencyKey).maybeSingle(); return existing ? reply({ notification: existing, duplicate: true }) : reply({ error: insertError.message }, 500); }
  for (let attempt = 1; attempt <= 5; attempt++) {
    if (retryDelays[attempt - 1]) await pause(retryDelays[attempt - 1]);
    try {
      const sent = channel === 'email' ? await sendEmail(recipient, body) : channel === 'sms' ? await sendSms(recipient, body) : await sendPush(recipient, body);
      await db.from('delivery_attempts').insert({ notification_id: notification.id, provider: sent.provider, provider_message_id: sent.providerMessageId, attempt_number: attempt, status: 'sent' }); const { data } = await db.from('notifications').update({ status: 'sent', provider: sent.provider, retry_count: attempt - 1, next_retry_at: null, last_error: null, updated_at: new Date().toISOString() }).eq('id', notification.id).select().single(); return reply({ notification: data, attempts: attempt });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Provider delivery failed'; await db.from('delivery_attempts').insert({ notification_id: notification.id, provider: channel, attempt_number: attempt, status: 'failed', error_code: message }); const finalAttempt = attempt === 5;
      await db.from('notifications').update({ status: finalAttempt ? 'failed' : 'queued', retry_count: attempt, last_error: message, next_retry_at: finalAttempt ? null : new Date(Date.now() + retryDelays[attempt]).toISOString(), updated_at: new Date().toISOString() }).eq('id', notification.id);
      if (finalAttempt) return reply({ error: message, notificationId: notification.id, attempts: attempt }, 502);
    }
  }
  return reply({ error: 'Notification processing stopped unexpectedly.' }, 500);
});
