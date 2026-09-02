import { nanoid } from "nanoid";
import { setInvite } from "../../../../lib/kv";
import { createInvoice } from "../../../../lib/byl";

const PRICE_MNT = 3000;
const paymentConfigured = () => !!(process.env.BYL_API_TOKEN && process.env.BYL_PROJECT_ID);

// Called the moment the person taps the very first "start" button — before
// they've typed anything. We create a lightweight "draft" record plus a
// byl.mn invoice for it right away, so payment happens up front instead of
// at the end of the wizard. Once byl.mn's webhook marks this draft paid,
// POST /api/invites (called at the end of the wizard with this same id as
// `draftId`) fills in the real content on it — no second payment needed.
export async function POST() {
  if (!paymentConfigured()) {
    // BYL_API_TOKEN / BYL_PROJECT_ID not set yet — stay free, same as
    // before: the wizard just skips straight past the payment step.
    return Response.json({ id: null });
  }

  const id = nanoid(8);
  const draft = {
    id,
    draft: true,
    paid: false,
    invoiceId: null,
    createdAt: Date.now(),
  };

  try {
    const invoice = await createInvoice({
      amount: PRICE_MNT,
      description: "Болзоо Урилга",
      clientReferenceId: id,
    });
    draft.invoiceId = invoice.id;
    await setInvite(id, draft);
    return Response.json({ id, paymentUrl: invoice.url, price: PRICE_MNT });
  } catch (e) {
    console.error("byl.mn invoice creation failed:", e);
    return Response.json({ error: "payment_setup_failed" }, { status: 502 });
  }
}
