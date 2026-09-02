import { nanoid } from "nanoid";
import { setInvite } from "../../../lib/kv";

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

  const id = nanoid(8);
  const invite = {
    id,
    senderName,
    receiverName,
    senderEmail,
    days,
    allowTalkLater,
    brings,
    afters,
    createdAt: Date.now(),
    response: null,
  };

  await setInvite(id, invite);
  return Response.json({ id });
}
