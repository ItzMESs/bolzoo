import { getInvite } from "../../../../lib/kv";

export async function GET(req, { params }) {
  const invite = await getInvite(params.id);
  if (!invite) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  // Never expose the sender's email to the recipient.
  const { senderEmail, ...publicInvite } = invite;
  return Response.json(publicInvite);
}
