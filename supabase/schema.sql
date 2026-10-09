-- Newsletter signups from the footer form (POST /api/subscribe).
-- Run once in Supabase -> SQL Editor. Project created with "automatically expose
-- new tables" off and automatic RLS on.

create table public.newsletter_signups (
  id bigint generated always as identity primary key,
  email text not null unique,
  consent boolean not null default true,
  source text not null default 'newsletter_footer',
  user_agent text,
  created_at timestamptz not null default now()
);

-- RLS on with no policies: the public (anon / publishable) key can't read or write.
alter table public.newsletter_signups enable row level security;

-- Only the server, using the secret (service_role) key, may insert and read.
grant select, insert on public.newsletter_signups to service_role;
