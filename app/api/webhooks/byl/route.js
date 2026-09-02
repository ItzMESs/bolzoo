import { getInvite, setInvite } from "../../../../lib/kv";
import { verifyWebhookSignature } from "../../../../lib/byl";

// byl.mn calls this once a QPay payment clears. Register this URL
// (https://<your-domain>/api/webhooks/byl) in the byl.mn dashboard under
// Settings -> Webhooks, and put the signing secret it shows you into
// BYL_WEBHOOK_SECRET (Vercel env vars). Docs: https://byl.mn/docs/webhook.html
export async function POST(req) {
  // Signature verification needs the exact raw bytes byl.mn sent, so this
  // must read req.text() first — parsing/re-serializing JSON before
  // checking the signature would make it never match.
  const rawBody = await req.text();
  const signature = req.headers.get("byl-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return Response.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }

  if (event.type === "invoice.paid") {
    const invoiceObj = event.data?.object || {};
    const inviteId = invoiceObj.client_reference_id;
    if (inviteId) {
      const invite = await getInvite(inviteId);
      if (invite && invite.paid !== true) {
        invite.paid = true;
        invite.paidAt = Date.now();
        await setInvite(inviteId, invite);
      }
    } else {
      console.warn("byl.mn webhook: invoice.paid without client_reference_id", invoiceObj.id);
    }
  }

  // byl.mn expects a fast 2xx or it will retry with backoff for days.
  return Response.json({ received: true });
}
