create table if not exists public.user_reminder_state (
  user_id uuid primary key,
  last_known_activity_at timestamptz not null,
  last_reminder_sent_at timestamptz,
  reminder_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_reminder_state_last_activity
  on public.user_reminder_state (last_known_activity_at);

create or replace function public.update_user_reminder_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_reminder_state_updated_at on public.user_reminder_state;

create trigger trg_user_reminder_state_updated_at
before update on public.user_reminder_state
for each row
execute function public.update_user_reminder_state_updated_at();

