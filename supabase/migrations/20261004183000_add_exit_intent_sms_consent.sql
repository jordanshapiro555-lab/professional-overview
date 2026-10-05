do $$
begin
  if to_regclass('public.exit_intent_submissions') is not null then
    alter table public.exit_intent_submissions
      add column if not exists consent_sms boolean not null default false;
  end if;
end $$;
