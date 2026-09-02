import { nanoid } from "nanoid";
import { setInvite, getInvite } from "../../../lib/kv";
import { createInvoice } from "../../../lib/byl";

const PRICE_MNT = 3000;
const paymentConfigured = () => !!(process.env.BYL_API_TOKEN && process.env.BYL_PROJECT_ID);

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }

  const senderName = (body.senderName || "").trim().slice(0, 60);
  const receiverName = (body.receiverName || "").trim().slice(0, 60);
  const senderEmail = (body.senderEmail || "").trim().slice(0, 120);
  const message = (body.message || "").trim().slice(0, 200);
  const photoRaw = typeof body.photo === "string" ? body.photo : "";
  const photo = photoRaw.startsWith("data:image/") && photoRaw.length < 350000 ? photoRaw : "";
  const days = Array.isArray(body.days) ? body.days.slice(0, 6) : [];
  const allowTalkLater = !!body.allowTalkLater;
  const brings = Array.isArray(body.brings) ? body.brings.slice(0, 6) : [];
  const afters = Array.isArray(body.afters) ? body.afters.slice(0, 6) : [];

  if (!senderName || !receiverName || !senderEmail) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }
  if (brings.length === 0 || afters.length === 0) {
    return Response.json({ error: "missing_choices" }, { status: 400 });
  }

  const draftId = typeof body.draftId === "string" ? body.draftId.trim().slice(0, 40) : "";

  if (draftId) {
    // The wizard already collected payment up front via
    // POST /api/invites/start-payment — this fills in the real content on
    // that same (already-paid) id instead of creating a brand new one.
    const draft = await getInvite(draftId);
    if (!draft || draft.paid !== true) {
      return Response.json({ error: "not_paid" }, { status: 402 });
    }
    const invite = {
      id: draftId,
      senderName,
      receiverName,
      senderEmail,
      message,
      photo,
      days,
      allowTalkLater,
      brings,
      afters,
      createdAt: draft.createdAt || Date.now(),
      response: null,
      paid: true,
      invoiceId: draft.invoiceId || null,
    };
    await setInvite(draftId, invite);
    return Response.json({ id: draftId });
  }

  const id = nanoid(8);
  const invite = {
    id,
    senderName,
    receiverName,
    senderEmail,
    message,
    photo,
    days,
    allowTalkLater,
    brings,
    afters,
    createdAt: Date.now(),
    response: null,
    // Free unless byl.mn (QPay) is wired up via env vars — see lib/byl.js.
    // The normal paid flow goes through start-payment + draftId above; this
    // branch only runs when payment isn't configured at all, or as a
    // fallback if a request arrives with no draftId.
    paid: !paymentConfigured(),
    invoiceId: null,
  };

  if (paymentConfigured()) {
    try {
      const invoice = await createInvoice({
        amount: PRICE_MNT,
        description: `Болзоо Урилга: ${senderName} → ${receiverName}`,
        clientReferenceId: id,
      });
      invite.invoiceId = invoice.id;
      await setInvite(id, invite);
      return Response.json({ id, paymentUrl: invoice.url, price: PRICE_MNT });
    } catch (e) {
      console.error("byl.mn invoice creation failed:", e);
      return Response.json({ error: "payment_setup_failed" }, { status: 502 });
    }
  }

  await setInvite(id, invite);
  return Response.json({ id });
}
