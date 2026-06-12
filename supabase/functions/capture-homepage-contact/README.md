# Homepage contact Edge Function

This public Edge Function validates homepage contact submissions, applies abuse
controls, stores a private audit/retry record, and syncs the lead to Klaviyo
list `Sn4fLM`.

Required production secrets:

- `KLAVIYO_PRIVATE_API_KEY`: Klaviyo private key with profile, list, and
  subscription write scopes. The existing `KLAVIYO_PRIVATE_KEY` secret name is
  also supported.
- `PII_HASH_PEPPER`: Long random secret used before hashing IP and email
  rate-limit keys. The existing `EXIT_INTENT_WEBHOOK_SECRET` is supported as a
  compatibility fallback and is domain-separated inside each hash input.
- `ALLOWED_ORIGINS`: Comma-separated additional exact preview origins. The
  production GitHub Pages origin and this branch's stable Vercel preview origin
  are built in.

Never commit real values. Application logs intentionally contain only request
IDs, status codes, durations, and sanitized error categories.

