// byl.mn payment integration (https://byl.mn) — a Mongolian payment
// aggregator that provisions QPay merchant rights for you and exposes a
// simple REST API + hosted checkout page, instead of integrating QPay's own
// merchant API directly.
//
// Required env vars (set in Vercel -> Settings -> Environment Variables):
//   BYL_API_TOKEN     - Settings -> API Token in the byl.mn dashboard
//   BYL_PROJECT_ID    - the project id shown in the byl.mn dashboard URL
//   BYL_WEBHOOK_SECRET - the signing secret for the webhook endpoint you
//                        register in byl.mn (Settings -> Webhooks)
//
// Docs: https://byl.mn/docs/api/invoices.html , https://byl.mn/docs/webhook.html

import crypto from "crypto";

const BYL_BASE_URL = "https://byl.mn/api/v1";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} тохируулаагүй байна (Vercel env vars-д нэмнэ үү).`);
  return v;
}

// Creates a byl.mn invoice for the given amount (MNT) and returns
// { id, url, status } - `url` is the hosted checkout/QR page to send the
// payer to. `clientReferenceId` should be our own invite id so the webhook
// can tell us which invite got paid.
export async function createInvoice({ amount, description, clientReferenceId }) {
  const token = requireEnv("BYL_API_TOKEN");
  const projectId = requireEnv("BYL_PROJECT_ID");

  const res = await fetch(`${BYL_BASE_URL}/projects/${projectId}/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      description,
      client_reference_id: clientReferenceId,
      auto_advance: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`byl.mn invoice creation failed (${res.status}): ${body}`);
  }
  return res.json();
}

export async function getInvoice(invoiceId) {
  const token = requireEnv("BYL_API_TOKEN");
  const projectId = requireEnv("BYL_PROJECT_ID");

  const res = await fetch(`${BYL_BASE_URL}/projects/${projectId}/invoices/${invoiceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

// Verifies the `Byl-Signature` header against the raw request body using
// HMAC-SHA256 + BYL_WEBHOOK_SECRET, per byl.mn's webhook docs. `rawBody`
// MUST be the exact bytes/string byl.mn sent (not a re-serialized JSON
// object) or the signature will never match.
export function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!signatureHeader) return false;
  const secret = process.env.BYL_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("BYL_WEBHOOK_SECRET тохируулаагүй тул webhook баталгаажуулалт алгассан.");
    return false;
  }
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch (e) {
    // length mismatch etc.
    return false;
  }
}
