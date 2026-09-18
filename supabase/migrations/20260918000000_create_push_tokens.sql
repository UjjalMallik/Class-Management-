create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  platform text not null default 'android',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;