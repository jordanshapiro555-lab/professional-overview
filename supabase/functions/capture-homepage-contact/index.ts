import { createClient } from "npm:@supabase/supabase-js@2.102.0";
import {
  buildKlaviyoProfilePayload,
  buildKlaviyoSubscriptionPayload,
  classifyUpstreamStatus,
  configuredAllowedOrigins,
  CONSENT_VERSION,
  corsHeadersFor,
  hashValue,
  isAllowedOrigin,
  KLAVIYO_REVISION,
  validatePayload,
} from "./lib.ts";

const MAX_BODY_BYTES = 16_384;
const IP_LIMIT = 10;
const IP_WINDOW_MS = 10 * 60 * 1000;
const EMAIL_LIMIT = 5;
const EMAIL_WINDOW_MS = 60 * 60 * 1000;

type Failure = { category: string; status: number };

const getServiceKey = (): string | null => {
  const legacyKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacyKey) return legacyKey;

  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    return keys.default || Object.values(keys)[0] || null;
  } catch {
    return null;
  }
};

const responseHeaders = (
  origin: string,
  allowed: boolean,
): Record<string, string> => ({
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  ...(allowed ? corsHeadersFor(origin) : {}),
});

const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
  origin: string,
  allowed: boolean,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(origin, allowed),
  });

Deno.serve(async (request) => {
  const startedAt = performance.now();
  const requestId = crypto.randomUUID();
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = configuredAllowedOrigins(
    Deno.env.get("ALLOWED_ORIGINS"),
  );
  const originAllowed = isAllowedOrigin(origin, allowedOrigins);

  const audit = (event: string, status: number, errorCategory?: string) => {
    console.info(JSON.stringify({
      event,
      request_id: requestId,
      status,
      duration_ms: Math.round(performance.now() - startedAt),
      ...(errorCategory ? { error_category: errorCategory } : {}),
    }));
  };

  if (!originAllowed) {
    audit("homepage_contact_rejected", 403, "origin");
    return jsonResponse(
      { ok: false, request_id: requestId },
      403,
      origin,
      false,
    );
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeadersFor(origin) });
  }

  if (request.method !== "POST") {
    audit("homepage_contact_rejected", 405, "method");
    return jsonResponse(
      { ok: false, request_id: requestId },
      405,
      origin,
      true,
    );
  }

  try {
    if (
      !request.headers.get("content-type")?.toLowerCase().includes(
        "application/json",
      )
    ) {
      audit("homepage_contact_rejected", 415, "content_type");
      return jsonResponse(
        { ok: false, request_id: requestId },
        415,
        origin,
        true,
      );
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      audit("homepage_contact_rejected", 413, "payload_size");
      return jsonResponse(
        { ok: false, request_id: requestId },
        413,
        origin,
        true,
      );
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      audit("homepage_contact_rejected", 400, "invalid_json");
      return jsonResponse(
        { ok: false, request_id: requestId },
        400,
        origin,
        true,
      );
    }

    const validation = validatePayload(parsedBody);
    if (!validation.ok) {
      audit("homepage_contact_rejected", 400, "validation");
      return jsonResponse(
        {
          ok: false,
          request_id: requestId,
          field: validation.field,
          message: validation.message,
        },
        400,
        origin,
        true,
      );
    }

    const lead = validation.lead;

    if (lead.honeypot) {
      audit("homepage_contact_accepted", 200, "spam_ignored");
      return jsonResponse(
        { ok: true, request_id: requestId },
        200,
        origin,
        true,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = getServiceKey();
    const klaviyoApiKey = Deno.env.get("KLAVIYO_PRIVATE_API_KEY") ||
      Deno.env.get("KLAVIYO_PRIVATE_KEY");
    const hashPepper = Deno.env.get("PII_HASH_PEPPER");

    if (!supabaseUrl || !serviceKey || !klaviyoApiKey || !hashPepper) {
      audit("homepage_contact_failed", 503, "configuration");
      return jsonResponse(
        { ok: false, request_id: requestId },
        503,
        origin,
        true,
      );
    }

    const rawIp = (
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("cf-connecting-ip") ||
      "unknown"
    ).trim();

    const [ipHash, emailHash] = await Promise.all([
      hashValue(`ip:${rawIp}`, hashPepper),
      hashValue(`email:${lead.email}`, hashPepper),
    ]);

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const ipWindowStart = new Date(Date.now() - IP_WINDOW_MS).toISOString();
    const emailWindowStart = new Date(Date.now() - EMAIL_WINDOW_MS)
      .toISOString();

    const [ipRateResult, emailRateResult] = await Promise.all([
      supabase
        .from("homepage_contact_submissions")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", ipWindowStart),
      supabase
        .from("homepage_contact_submissions")
        .select("id", { count: "exact", head: true })
        .eq("email_hash", emailHash)
        .gte("created_at", emailWindowStart),
    ]);

    if (ipRateResult.error || emailRateResult.error) {
      audit("homepage_contact_failed", 503, "rate_limit_check");
      return jsonResponse(
        { ok: false, request_id: requestId },
        503,
        origin,
        true,
      );
    }

    if (
      (ipRateResult.count || 0) >= IP_LIMIT ||
      (emailRateResult.count || 0) >= EMAIL_LIMIT
    ) {
      audit("homepage_contact_rejected", 429, "rate_limit");
      return jsonResponse(
        { ok: false, request_id: requestId },
        429,
        origin,
        true,
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("homepage_contact_submissions")
      .insert({
        request_id: requestId,
        first_name: lead.firstName,
        last_name: lead.lastName,
        email: lead.email,
        phone_e164: lead.phoneE164,
        pain_points: lead.painPoints,
        source_url: lead.pageUrl,
        referrer: lead.referrer,
        attribution: lead.attribution,
        consent_email: true,
        consent_sms: Boolean(lead.phoneE164),
        consent_version: CONSENT_VERSION,
        ip_hash: ipHash,
        email_hash: emailHash,
        sync_status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !inserted?.id) {
      audit("homepage_contact_failed", 503, "database_insert");
      return jsonResponse(
        { ok: false, request_id: requestId },
        503,
        origin,
        true,
      );
    }

    const klaviyoHeaders = {
      "Authorization": `Klaviyo-API-Key ${klaviyoApiKey}`,
      "Accept": "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "revision": KLAVIYO_REVISION,
    };

    let failure: Failure | null = null;
    let profileId: string | null = null;

    try {
      const profileResponse = await fetch(
        "https://a.klaviyo.com/api/profile-import",
        {
          method: "POST",
          headers: klaviyoHeaders,
          body: JSON.stringify(buildKlaviyoProfilePayload(lead)),
        },
      );

      if (!profileResponse.ok) {
        failure = {
          category: classifyUpstreamStatus(profileResponse.status),
          status: 502,
        };
      } else {
        const profileResult = await profileResponse.json();
        profileId = profileResult?.data?.id || null;
        if (!profileId) {
          failure = { category: "upstream_response", status: 502 };
        }
      }

      if (!failure && profileId) {
        const subscriptionResponse = await fetch(
          "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs",
          {
            method: "POST",
            headers: klaviyoHeaders,
            body: JSON.stringify(
              buildKlaviyoSubscriptionPayload(profileId, lead),
            ),
          },
        );

        if (!subscriptionResponse.ok) {
          failure = {
            category: classifyUpstreamStatus(subscriptionResponse.status),
            status: 502,
          };
        }
      }
    } catch {
      failure = { category: "upstream_network", status: 502 };
    }

    if (failure) {
      await supabase
        .from("homepage_contact_submissions")
        .update({
          sync_status: "failed",
          klaviyo_profile_id: profileId,
          klaviyo_error_category: failure.category,
          updated_at: new Date().toISOString(),
        })
        .eq("id", inserted.id);

      audit("homepage_contact_failed", failure.status, failure.category);
      return jsonResponse(
        { ok: false, request_id: requestId },
        failure.status,
        origin,
        true,
      );
    }

    const { error: updateError } = await supabase
      .from("homepage_contact_submissions")
      .update({
        sync_status: "synced",
        klaviyo_profile_id: profileId,
        klaviyo_error_category: null,
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", inserted.id);

    if (updateError) {
      audit("homepage_contact_accepted", 200, "database_status_update");
    } else {
      audit("homepage_contact_accepted", 200);
    }

    return jsonResponse({ ok: true, request_id: requestId }, 200, origin, true);
  } catch {
    audit("homepage_contact_failed", 500, "internal");
    return jsonResponse(
      { ok: false, request_id: requestId },
      500,
      origin,
      true,
    );
  }
});

