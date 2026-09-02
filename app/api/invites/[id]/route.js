import { getInvite } from "../../../../lib/kv";

export async function GET(req, { params }) {
  const invite = await getInvite(params.id);
  // Treat a not-yet-paid invite the same as "not found" for the recipient —
  // the link only starts working once payment (QPay via byl.mn) clears.
  if (!invite || invite.paid === false) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  // Never expose the sender's email or internal payment fields to the recipient.
  const { senderEmail, invoiceId, paid, ...publicInvite } = invite;
  return Response.json(publicInvite);
}
