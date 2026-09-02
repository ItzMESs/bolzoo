import { Resend } from "resend";

const weekdayNames = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];

export async function sendNotificationEmail(invite) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY тохируулаагүй тул имэйл илгээгдсэнгүй.");
    return;
  }
  if (!invite.senderEmail) {
    console.warn(`Invite ${invite.id} - senderEmail байхгүй тул имэйл илгээгдсэнгүй.`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const r = invite.response;

  let dayText = "Ярилцаад тохирно";
  if (r?.day?.date) {
    const d = new Date(r.day.date + "T00:00:00");
    dayText = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} (${weekdayNames[d.getDay()]}) — ${r.day.label}`;
  } else if (r?.day?.label) {
    dayText = r.day.label;
  }

  const text = [
    `${invite.receiverName} таны урилгыг хүлээж авлаа! 💕`,
    ``,
    `Өдөр: ${dayText}`,
    `Авчрах зүйл: ${r?.bring || "-"}`,
    `Дараа нь: ${r?.after || "-"}`,
    ``,
    `— Болзооны Урилга`,
  ].join("\n");

  await resend.emails.send({
    from: process.env.RESEND_FROM || "Bolzoo Urilga <onboarding@resend.dev>",
    to: invite.senderEmail,
    subject: `${invite.receiverName} зөвшөөрлөө! 💕`,
    text,
  });
}
