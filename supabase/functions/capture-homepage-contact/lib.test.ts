import {
  buildKlaviyoProfilePayload,
  buildKlaviyoSubscriptionPayload,
  hashValue,
  isAllowedOrigin,
  normalizePhone,
  sanitizeAttribution,
  sanitizeUrl,
  validatePayload,
} from "./lib.ts";

function assert(
  condition: unknown,
  message = "Assertion failed",
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEquals(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${JSON.stringify(expected)}, received ${
        JSON.stringify(actual)
      }`,
    );
  }
}

function assertMatch(actual: string, pattern: RegExp): void {
  assert(
    pattern.test(actual),
    `Expected ${JSON.stringify(actual)} to match ${pattern}`,
  );
}

Deno.test("requires a valid email address", () => {
  const missing = validatePayload({ pain_points: "" });
  assertEquals(missing.ok, false);

  const invalid = validatePayload({ email: "not-an-email" });
  assertEquals(invalid.ok, false);
});

Deno.test("requires a valid phone number for SMS consent", () => {
  const missingPhone = validatePayload({
    email: "Lead@Example.com",
    phone: "",
  });
  assertEquals(missingPhone.ok, false);

  const result = validatePayload({
    email: "Lead@Example.com",
    first_name: "",
    last_name: "",
    phone: "(212) 555-0100",
    pain_points: "",
  });

  assert(result.ok);
  assertEquals(result.lead.email, "lead@example.com");
  assertEquals(result.lead.phoneE164, "+12125550100");
  assertEquals(result.lead.painPoints, null);
});

Deno.test("normalizes US and international phone numbers to E.164", () => {
  assertEquals(normalizePhone("(212) 555-0100"), "+12125550100");
  assertEquals(normalizePhone("1-212-555-0100"), "+12125550100");
  assertEquals(normalizePhone("+44 20 7946 0958"), "+442079460958");
  assertEquals(normalizePhone("1234"), undefined);
  assertEquals(normalizePhone(""), null);
});

Deno.test("strips query strings and fragments from stored URLs", () => {
  assertEquals(
    sanitizeUrl("https://example.com/landing?email=private@example.com#form"),
    "https://example.com/landing",
  );
  assertEquals(sanitizeUrl("javascript:alert(1)"), null);
});

Deno.test("keeps only non-sensitive attribution values", () => {
  assertEquals(
    sanitizeAttribution({
      utm_source: "paid-search",
      utm_campaign: "summer_launch",
      utm_content: "person@example.com",
      unexpected: "drop-me",
    }),
    {
      utm_source: "paid-search",
      utm_campaign: "summer_launch",
    },
  );
});

Deno.test("profile payload maps pain points to organization and custom property", () => {
  const result = validatePayload({
    email: "lead@example.com",
    first_name: "Test",
    last_name: "Lead",
    phone: "",
    pain_points: "Improving checkout conversion",
  });

  assert(result.ok);
  const payload = buildKlaviyoProfilePayload(result.lead);
  const attributes = payload.data.attributes as Record<string, unknown>;
  const properties = attributes.properties as Record<string, unknown>;

  assertEquals(attributes.organization, "Improving checkout conversion");
  assertEquals(properties.pain_points, "Improving checkout conversion");
});

Deno.test("subscription payload includes email and SMS consent timestamps", () => {
  const consentedAt = "2026-10-04T12:00:00.000Z";
  const withPhone = validatePayload({
    email: "lead@example.com",
    phone: "(212) 555-0100",
  });
  const invalidPhone = validatePayload({
    email: "lead@example.com",
    phone: "1234",
  });

  assert(withPhone.ok);
  assertEquals(invalidPhone.ok, false);

  const phoneProfile = buildKlaviyoSubscriptionPayload(
    withPhone.lead,
    undefined,
    consentedAt,
  )
    .data.attributes.profiles.data[0] as Record<string, unknown>;
  const phoneAttributes = phoneProfile.attributes as Record<string, unknown>;
  const phoneSubscriptions = phoneAttributes.subscriptions as Record<
    string,
    unknown
  >;

  assertEquals("id" in phoneProfile, false);
  assertEquals(phoneAttributes.email, "lead@example.com");
  assertEquals(phoneAttributes.phone_number, "+12125550100");
  assertEquals(phoneSubscriptions.email, {
    marketing: { consent: "SUBSCRIBED", consented_at: consentedAt },
  });
  assertEquals(phoneSubscriptions.sms, {
    marketing: { consent: "SUBSCRIBED", consented_at: consentedAt },
    transactional: { consent: "SUBSCRIBED", consented_at: consentedAt },
  });
});

Deno.test("allows production, configured preview, and local development origins", () => {
  assert(isAllowedOrigin("https://jordanshapiro555-lab.github.io"));
  assert(isAllowedOrigin("http://localhost:8080"));
  assert(isAllowedOrigin(
    "https://preview.example.vercel.app",
    ["https://preview.example.vercel.app"],
  ));
  assertEquals(isAllowedOrigin("https://untrusted.example"), false);
});

Deno.test("secret-peppered hashes are deterministic and do not expose source values", async () => {
  const hash = await hashValue("ip:203.0.113.10", "test-pepper");
  assertMatch(hash, /^[a-f0-9]{64}$/);
  assertEquals(hash, await hashValue("ip:203.0.113.10", "test-pepper"));
  assertEquals(hash.includes("203.0.113.10"), false);
});

