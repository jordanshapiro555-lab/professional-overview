export const KLAVIYO_LIST_ID = "Sn4fLM";
export const KLAVIYO_REVISION = "2026-04-15";
export const CONSENT_VERSION = "homepage-contact-2026-06-12";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://jordanshapiro555-lab.github.io",
  "https://cro-consulting-git-codex-9cda74-jordanshapiro555-labs-projects.vercel.app",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];
const ATTRIBUTION_VALUE_PATTERN = /^[A-Za-z0-9 _./:+%\-]+$/;

export type ContactLead = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneE164: string | null;
  painPoints: string | null;
  pageUrl: string | null;
  referrer: string | null;
  attribution: Record<string, string>;
  honeypot: string;
};

export type ValidationResult =
  | { ok: true; lead: ContactLead }
  | { ok: false; field: string; message: string };

const optionalText = (value: unknown, maxLength: number): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.length <= maxLength ? normalized : null;
};

export const normalizePhone = (value: unknown): string | null | undefined => {
  if (typeof value !== "string" || !value.trim()) return null;

  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : undefined;
  }

  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return undefined;
};

export const sanitizeUrl = (value: unknown): string | null => {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return `${url.origin}${url.pathname}`.slice(0, 2048);
  } catch {
    return null;
  }
};

export const sanitizeAttribution = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const input = value as Record<string, unknown>;
  return ATTRIBUTION_KEYS.reduce<Record<string, string>>((result, key) => {
    const candidate = input[key];
    if (typeof candidate !== "string") return result;

    const normalized = candidate.trim().slice(0, 200);
    if (
      !normalized || normalized.includes("@") ||
      !ATTRIBUTION_VALUE_PATTERN.test(normalized)
    ) {
      return result;
    }

    result[key] = normalized;
    return result;
  }, {});
};

export const validatePayload = (value: unknown): ValidationResult => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, field: "form", message: "Invalid form submission." };
  }

  const input = value as Record<string, unknown>;
  const email = typeof input.email === "string"
    ? input.email.trim().toLowerCase()
    : "";

  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return {
      ok: false,
      field: "email",
      message: "Please enter a valid email address.",
    };
  }

  const phoneE164 = normalizePhone(input.phone);
  if (phoneE164 === undefined) {
    return {
      ok: false,
      field: "phone",
      message: "Please enter a valid phone number.",
    };
  }

  const rawFirstName = typeof input.first_name === "string"
    ? input.first_name.trim()
    : "";
  const rawLastName = typeof input.last_name === "string"
    ? input.last_name.trim()
    : "";
  const rawPainPoints = typeof input.pain_points === "string"
    ? input.pain_points.trim()
    : "";

  if (rawFirstName.length > 80) {
    return {
      ok: false,
      field: "first_name",
      message: "First name is too long.",
    };
  }
  if (rawLastName.length > 80) {
    return { ok: false, field: "last_name", message: "Last name is too long." };
  }
  if (rawPainPoints.length > 1000) {
    return {
      ok: false,
      field: "pain_points",
      message: "Pain points are too long.",
    };
  }

  return {
    ok: true,
    lead: {
      firstName: optionalText(input.first_name, 80),
      lastName: optionalText(input.last_name, 80),
      email,
      phoneE164,
      painPoints: optionalText(input.pain_points, 1000),
      pageUrl: sanitizeUrl(input.page_url),
      referrer: sanitizeUrl(input.referrer),
      attribution: sanitizeAttribution(input.attribution),
      honeypot: typeof input.company_website === "string"
        ? input.company_website.trim()
        : "",
    },
  };
};

export const configuredAllowedOrigins = (
  value: string | undefined,
): string[] => {
  const configured = (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured])];
};

export const isAllowedOrigin = (
  origin: string,
  configured: string[] = [],
): boolean => {
  if (configuredAllowedOrigins(configured.join(",")).includes(origin)) {
    return true;
  }
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d{2,5})?$/.test(origin);
};

export const corsHeadersFor = (origin: string): Record<string, string> => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
});

export const hashValue = async (
  value: string,
  pepper: string,
): Promise<string> => {
  const bytes = new TextEncoder().encode(`${pepper}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const buildKlaviyoProfilePayload = (lead: ContactLead) => {
  const attributes: Record<string, unknown> = { email: lead.email };

  if (lead.firstName) attributes.first_name = lead.firstName;
  if (lead.lastName) attributes.last_name = lead.lastName;
  if (lead.phoneE164) attributes.phone_number = lead.phoneE164;
  if (lead.painPoints) attributes.organization = lead.painPoints;

  attributes.properties = {
    source_form: "homepage_contact",
    ...(lead.painPoints ? { pain_points: lead.painPoints } : {}),
    ...(lead.pageUrl ? { source_url: lead.pageUrl } : {}),
    ...lead.attribution,
  };

  return {
    data: {
      type: "profile",
      attributes,
    },
  };
};

export const buildKlaviyoSubscriptionPayload = (
  profileId: string,
  lead: ContactLead,
) => {
  const subscriptions: Record<string, unknown> = {
    email: { marketing: { consent: "SUBSCRIBED" } },
  };

  if (lead.phoneE164) {
    subscriptions.sms = { marketing: { consent: "SUBSCRIBED" } };
  }

  return {
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        custom_source: "Homepage contact form",
        profiles: {
          data: [
            {
              type: "profile",
              id: profileId,
              attributes: {
                email: lead.email,
                ...(lead.phoneE164 ? { phone_number: lead.phoneE164 } : {}),
                subscriptions,
              },
            },
          ],
        },
      },
      relationships: {
        list: {
          data: {
            type: "list",
            id: KLAVIYO_LIST_ID,
          },
        },
      },
    },
  };
};

export const classifyUpstreamStatus = (status: number): string => {
  if (status === 401 || status === 403) return "upstream_auth";
  if (status === 429) return "upstream_rate_limit";
  if (status >= 500) return "upstream_server";
  return "upstream_request";
};

