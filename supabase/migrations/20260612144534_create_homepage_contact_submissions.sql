create table public.homepage_contact_submissions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text,
  last_name text,
  email text not null,
  phone_e164 text,
  pain_points text,
  source_url text,
  referrer text,
  attribution jsonb not null default '{}'::jsonb,
  consent_email boolean not null default true,
  consent_sms boolean not null default false,
  consent_version text not null,
  ip_hash text not null,
  email_hash text not null,
  sync_status text not null default 'pending'
    check (sync_status in ('pending', 'synced', 'failed')),
  klaviyo_profile_id text,
  klaviyo_error_category text,
  synced_at timestamptz,
  constraint homepage_contact_first_name_length check (char_length(first_name) <= 80),
  constraint homepage_contact_last_name_length check (char_length(last_name) <= 80),
  constraint homepage_contact_email_length check (char_length(email) <= 254),
  constraint homepage_contact_phone_length check (char_length(phone_e164) <= 16),
  constraint homepage_contact_pain_points_length check (char_length(pain_points) <= 1000),
  constraint homepage_contact_source_url_length check (char_length(source_url) <= 2048),
  constraint homepage_contact_referrer_length check (char_length(referrer) <= 2048),
  constraint homepage_contact_attribution_object check (jsonb_typeof(attribution) = 'object'),
  constraint homepage_contact_ip_hash_length check (char_length(ip_hash) = 64),
  constraint homepage_contact_email_hash_length check (char_length(email_hash) = 64)
);

create index homepage_contact_submissions_created_at_idx
  on public.homepage_contact_submissions (created_at desc);

create index homepage_contact_submissions_ip_rate_limit_idx
  on public.homepage_contact_submissions (ip_hash, created_at desc);

create index homepage_contact_submissions_email_rate_limit_idx
  on public.homepage_contact_submissions (email_hash, created_at desc);

alter table public.homepage_contact_submissions enable row level security;

revoke all on table public.homepage_contact_submissions from public, anon, authenticated;
grant select, insert, update on table public.homepage_contact_submissions to service_role;

comment on table public.homepage_contact_submissions is
  'Private lead intake records. Browser roles have no grants or RLS policies; only the Edge Function service role may access rows.';

comment on column public.homepage_contact_submissions.ip_hash is
  'Secret-peppered SHA-256 hash used for abuse controls. Raw IP addresses are never stored.';

