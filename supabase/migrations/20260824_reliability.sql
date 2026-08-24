-- Apply after schema.sql for existing projects. Safe to run once in Supabase SQL Editor.
create type public.notification_priority as enum ('transactional', 'bulk');

alter table public.notifications
  add column priority public.notification_priority not null default 'transactional',
  add column retry_count integer not null default 0 check (retry_count >= 0 and retry_count <= 5),
  add column next_retry_at timestamptz,
  add column last_error text,
  add column provider text;

create index notifications_priority_queue_idx
  on public.notifications (priority, status, next_retry_at, created_at);

drop policy if exists "demo authenticated notification access" on public.notifications;
drop policy if exists "demo authenticated attempt access" on public.delivery_attempts;

create policy "users manage their own notifications" on public.notifications
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users read their own delivery attempts" on public.delivery_attempts
  for select to authenticated using (
    exists (select 1 from public.notifications n where n.id = notification_id and n.user_id = auth.uid())
  );

