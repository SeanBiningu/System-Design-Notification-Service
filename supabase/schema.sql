-- Run in the Supabase SQL editor. The browser uses only the anon/publishable key.
-- Provider credentials are intentionally stored only as Edge Function secrets.
create type public.notification_channel as enum ('email', 'sms', 'push');
create type public.notification_status as enum ('accepted', 'queued', 'sent', 'delivered', 'failed', 'suppressed');
create type public.notification_priority as enum ('transactional', 'bulk');

-- One row represents the durable, idempotent notification request.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  user_id uuid not null,
  recipient text not null,
  channel public.notification_channel not null,
  template_key text,
  body text,
  status public.notification_status not null default 'accepted',
  -- Workers should process transactional work ahead of lower-priority bulk work.
  priority public.notification_priority not null default 'transactional',
  retry_count integer not null default 0 check (retry_count >= 0 and retry_count <= 5),
  next_retry_at timestamptz,
  last_error text,
  provider text,
  scheduled_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notifications_created_at_idx on public.notifications (created_at desc);
create index notifications_status_idx on public.notifications (status, created_at desc);
create index notifications_priority_queue_idx on public.notifications (priority, status, next_retry_at, created_at);

-- Every provider call is retained for retry diagnostics and monitoring.
create table public.delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  provider text not null,
  provider_message_id text,
  attempt_number integer not null default 1,
  status public.notification_status not null,
  error_code text,
  created_at timestamptz not null default now(),
  unique(notification_id, attempt_number)
);

-- RLS prevents one signed-in user from reading another user's notification history.
alter table public.notifications enable row level security;
alter table public.delivery_attempts enable row level security;

create policy "users manage their own notifications" on public.notifications
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users read their own delivery attempts" on public.delivery_attempts
  for select to authenticated using (
    exists (select 1 from public.notifications n where n.id = notification_id and n.user_id = auth.uid())
  );
