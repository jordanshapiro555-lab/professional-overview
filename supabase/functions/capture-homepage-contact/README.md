# Homepage contact Edge Function

This public Edge Function validates homepage contact submissions, applies abuse
controls, stores a private audit/retry record, and syncs the lead to Klaviyo
list `Sn4fLM`.

Required production secrets:

- `KLAVIYO_PRIVATE_API_KEY`: Klaviyo private key with profile, list, and
  subscription write scopes.
- `PII_HASH_PEPPER`: Long random secret used before hashing IP and email
  rate-limit keys.
- `ALLOWED_ORIGINS`: Comma-separated exact preview origins. Production GitHub
  Pages and canonical Vercel origins are built in.

Never commit real values. Application logs intentionally contain only request
IDs, status codes, durations, and sanitized error categories.

