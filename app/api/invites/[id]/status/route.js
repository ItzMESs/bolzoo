import { getInvite } from "../../../../../lib/kv";

// Lightweight endpoint the creator's browser polls right after being sent
// to pay (see app/page.js) to find out once byl.mn's webhook has marked the
// invite paid. Returns only the one boolean the UI needs — never the full
// invite (that has the sender's email etc.).
export async function GET(req, { params }) {
  const invite = await getInvite(params.id);
  if (!invite) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  return Response.json({ paid: invite.paid === true });
}
