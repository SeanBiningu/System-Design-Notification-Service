-- Run in the Supabase SQL editor. The browser uses only the anon/publishable key.
create type public.notification_channel as enum ('email', 'sms', 'push');
create type public.notification_status as enum ('accepted', 'queued', 'sent', 'delivered', 'failed', 'suppressed');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  user_id uuid,
  recipient text not null,
  channel public.notification_channel not null,
  template_key text,
  body text,
  status public.notification_status not null default 'accepted',
  scheduled_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notifications_created_at_idx on public.notifications (created_at desc);
create index notifications_status_idx on public.notifications (status, created_at desc);

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

alter table public.notifications enable row level security;
alter table public.delivery_attempts enable row level security;

-- Demo policy. Replace with service-to-service JWT claims for production.
create policy "demo authenticated notification access" on public.notifications
  for all to authenticated using (true) with check (true);
create policy "demo authenticated attempt access" on public.delivery_attempts
  for all to authenticated using (true) with check (true);
