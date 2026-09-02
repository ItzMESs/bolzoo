import { getInvite, setInvite } from "../../../../../lib/kv";
import { sendNotificationEmail } from "../../../../../lib/email";

export async function POST(req, { params }) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }

  const invite = await getInvite(params.id);
  if (!invite) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  // Idempotent: once answered, keep the first response (don't overwrite on
  // back-navigation replays or double submits).
  if (!invite.response) {
    invite.response = {
      day: body.day || null,
      bring: (body.bring || "").slice(0, 80),
      after: (body.after || "").slice(0, 80),
      respondedAt: Date.now(),
    };
    await setInvite(params.id, invite);

    try {
      await sendNotificationEmail(invite);
    } catch (e) {
      console.error("Имэйл илгээхэд алдаа гарлаа:", e);
    }
  }

  return Response.json({ ok: true });
}
