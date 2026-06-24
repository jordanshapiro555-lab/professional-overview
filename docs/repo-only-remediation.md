# Repo-Only Audit Remediation

This branch contains only source-controlled repository changes. It intentionally does not modify live Supabase or Cloudflare state, and it does not edit Cloudflare Worker/config files or Supabase function/schema files.

Branch: `codex/repo-only-audit-remediation`

## Safety Rules

- Do not commit directly to `main`.
- Do not make direct Supabase changes from an agent session.
- Do not make direct Cloudflare changes from an agent session.
- Do not deploy, edit live functions, edit live database schema, change RLS policies, change grants, change secrets, change Cloudflare routes, or change Cloudflare settings without separate human approval and rollback planning.
- Keep live-service changes as reviewed manual release steps.

## Changes Included In This Branch

- Added `js/config.js` as a public, source-controlled place for non-secret frontend endpoints and request timeout settings.
- Updated `js/home-contact-form.js` to load `js/config.js` before submission when the page did not already include it, then read the homepage contact endpoint and timeout from `window.CRO_CONSULTING_CONFIG` with the existing endpoint preserved as a fallback.
- Updated `js/chatbot.js` to load `js/config.js` before chat requests when the page did not already include it, read the chat endpoint and timeout from `window.CRO_CONSULTING_CONFIG`, cap client-side chat history, sanitize history roles/content before sending, and abort slow requests.

## Remaining Manual Work

These items are intentionally not performed by this branch because they affect Cloudflare or Supabase code/state:

- Harden the Cloudflare Worker `/api/chat` endpoint in `src/index.js` with server-side CORS allowlisting, body limits, schema validation, rate limiting, sanitized errors, and security headers.
- Change Cloudflare static asset serving away from `assets.directory: "."` in `wrangler.jsonc`.
- Bring deployed Supabase functions into source control or retire unused functions after review.
- Add/baseline Supabase migrations for live tables, policies, grants, comments, and indexes.
- Review Supabase advisor findings and apply any live database changes only through an approved release process.

## Notes For Review

`js/config.js` can be loaded by HTML before frontend scripts, but the current consumers also load it themselves before endpoint requests if the page omitted the config tag. This keeps existing pages working while making the shared endpoint and timeout values available in production.