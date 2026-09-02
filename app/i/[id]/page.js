"use client";

import { useEffect, useState, useRef } from "react";

const bearSvg = (
  <svg className="bears" viewBox="0 0 150 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M118 6 c2-5 9-5 9.5 0 c0.5-5 7.5-5 9.5 0 c1 6-9.5 12-9.5 12 s-10.5-6-9.5-12z" fill="#ff5d8f" stroke="#c23663" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M135 22 c1.3-3.3 6-3.3 6.3 0 c0.3-3.3 5-3.3 6.3 0 c0.7 4-6.3 8-6.3 8 s-7-4-6.3-8z" fill="#ff8bad" stroke="#c23663" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M51 83 c0-24 21-43 46-43 c25 0 46 19 46 43 c0 15-13 24-46 24 c-33 0-46-9-46-24z" fill="#e8935a" stroke="#8a4a1f" strokeWidth="2.6" strokeLinejoin="round" />
    <circle cx="80" cy="32" r="12" fill="#e8935a" stroke="#8a4a1f" strokeWidth="2.4" /><circle cx="120" cy="32" r="12" fill="#e8935a" stroke="#8a4a1f" strokeWidth="2.4" />
    <circle cx="80" cy="32" r="5.5" fill="#fbd2a8" /><circle cx="120" cy="32" r="5.5" fill="#fbd2a8" />
    <ellipse cx="100" cy="62" rx="12" ry="9" fill="#fbd2a8" stroke="#8a4a1f" strokeWidth="2" />
    <path d="M89 52 q4 -6 8 0" stroke="#3a2a26" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    <path d="M105 52 q4 -6 8 0" stroke="#3a2a26" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    <ellipse cx="100" cy="62" rx="2.6" ry="2" fill="#3a2a26" />
    <path d="M94 68 q6 5 12 0" stroke="#3a2a26" strokeWidth="2" strokeLinecap="round" fill="none" />
    <circle cx="86" cy="58" r="5" fill="#ffc9d6" opacity="0.6" /><circle cx="114" cy="58" r="5" fill="#ffc9d6" opacity="0.6" />
    <path d="M9 78 c0-27 15-49 37-49 c22 0 37 22 37 49 c0 15-12 22-37 22 c-25 0-37-7-37-22z" fill="#fff3ef" stroke="#caa79e" strokeWidth="2.6" strokeLinejoin="round" />
    <circle cx="25" cy="20" r="13" fill="#fff3ef" stroke="#caa79e" strokeWidth="2.4" /><circle cx="67" cy="20" r="13" fill="#fff3ef" stroke="#caa79e" strokeWidth="2.4" />
    <circle cx="25" cy="20" r="6" fill="#ffd7e2" /><circle cx="67" cy="20" r="6" fill="#ffd7e2" />
    <circle cx="38" cy="44" r="3" fill="#3a2a26" /><circle cx="56" cy="44" r="3" fill="#3a2a26" />
    <ellipse cx="47" cy="52" rx="3.6" ry="5" fill="#ffb3c4" />
    <circle cx="30" cy="54" r="6" fill="#ffc9d6" opacity="0.7" /><circle cx="62" cy="54" r="6" fill="#ffc9d6" opacity="0.7" />
    <path d="M56 74 Q76 58 98 66" stroke="#caa79e" strokeWidth="20" strokeLinecap="round" fill="none" />
    <path d="M56 74 Q76 58 98 66" stroke="#fff3ef" strokeWidth="16" strokeLinecap="round" fill="none" />
    <circle cx="99" cy="67" r="9" fill="#fff3ef" stroke="#caa79e" strokeWidth="2.2" />
  </svg>
);

const weekdayNames = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
function monthShort(m) { return (m + 1) + "-р сарын"; }

export default function ViewerPage({ params }) {
  const { id } = params;
  const [status, setStatus] = useState("loading"); // loading | notfound | ready
  const [payload, setPayload] = useState(null);
  const wired = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/invites/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not_found");
        return res.json();
      })
      .then((data) => { if (!cancelled) { setPayload(data); setStatus("ready"); } })
      .catch(() => { if (!cancelled) setStatus("notfound"); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (status !== "ready" || !payload || wired.current) return;
    wired.current = true;

    function showToast(msg) {
      const t = document.getElementById("toast");
      t.textContent = msg;
      t.classList.add("show");
      setTimeout(() => t.classList.remove("show"), 2200);
    }

    const phone = document.getElementById("viewerPhone");
    const steps = [...phone.querySelectorAll(".step")];
    const progressEl = document.getElementById("vProgress");
    const backBtn = document.getElementById("vBackBtn");
    const realSteps = steps.filter((s) => s.dataset.vstep !== "nf");
    for (let i = 0; i < realSteps.length; i++) progressEl.appendChild(document.createElement("i"));
    function setProgress(step) { [...progressEl.children].forEach((b, i) => b.classList.toggle("done", i <= step)); }

    let history = [0];
    function goTo(step) {
      steps.forEach((s) => s.classList.toggle("active", s.dataset.vstep == step));
      setProgress(typeof step === "number" ? step : 0);
      backBtn.style.display = typeof step === "number" && step > 0 ? "block" : "none";
    }
    function next(step) { history.push(step); goTo(step); }
    backBtn.addEventListener("click", () => { if (history.length > 1) { history.pop(); goTo(history[history.length - 1]); } });

    const SENDER = payload.senderName, RECEIVER = payload.receiverName;
    document.getElementById("vPairLabel").textContent = `${SENDER.toUpperCase()} · ${RECEIVER.toUpperCase()}`;
    if (payload.message) {
      const msgEl = document.getElementById("vInviteMsg");
      msgEl.textContent = `"${payload.message}"`;
      msgEl.style.display = "block";
    }

    function burstConfetti() {
      const colors = ["#ff5d8f", "#ff8bad", "#ffd166", "#37c98a", "#fff8f3"];
      for (let i = 0; i < 26; i++) {
        const el = document.createElement("div");
        el.className = "confetti-piece";
        el.style.left = Math.random() * 100 + "vw";
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.animation = `confetti-fall ${1.1 + Math.random() * 0.9}s ease-in forwards`;
        el.style.animationDelay = Math.random() * 0.3 + "s";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2600);
      }
    }

    const state = { day: null, dayDate: null, bring: null, after: null };

    // ---- step 0: yes / no dodge ----
    const noBtn = document.getElementById("vNoBtn");
    const yesBtn = document.getElementById("vYesBtn");
    const ynRow = document.getElementById("vYnRow");
    const noPhrases = [
      "ҮГҮЙ",
      "Үнэхээр үү?",
      "Сайн оролдлого 😊",
      "Бодоод үз дээ",
      "Дахиад оролдоорой",
      "Намайг бүү гомдоо 🥺",
      "Ганц л товч үлдлээ",
      "Чи намайг олохгүй ш дээ 😏",
      "Хөөрхөн атлаа хатуу юм чи",
      "Сүүлчийн санал шүү",
      "За за, ойрхон байна",
      "Битгий ингээрэй ааа",
      "Зүгээр ТИЙМ гэчихмээр байна биз?",
      "ТИЙМ гэж бас болно шүү",
    ];
    let noTries = 0;
    function dodge() {
      noTries = Math.min(noTries + 1, noPhrases.length - 1);
      noBtn.textContent = noPhrases[noTries];
      // "Yes" lives in a fixed lane on the left (see .btn-yes CSS); "No" is
      // only ever allowed to land in the lane to the right of it, so the two
      // can never visually overlap no matter how long the phrase gets.
      const rowRect = ynRow.getBoundingClientRect();
      const yesRect = yesBtn.getBoundingClientRect();
      const laneLeft = Math.min(rowRect.width, yesRect.right - rowRect.left + 10);
      const maxX = Math.max(0, rowRect.width - noBtn.offsetWidth - laneLeft);
      const maxY = Math.max(0, rowRect.height - noBtn.offsetHeight);
      noBtn.style.right = "auto";
      noBtn.style.transform = "none";
      noBtn.style.left = (laneLeft + Math.random() * maxX) + "px";
      noBtn.style.top = Math.random() * maxY + "px";
    }
    noBtn.addEventListener("mouseenter", dodge);
    noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); dodge(); }, { passive: false });
    noBtn.addEventListener("click", (e) => e.preventDefault());
    yesBtn.addEventListener("click", () => { burstConfetti(); next(1); });

    // ---- step 1: day choices ----
    const dayChoicesEl = document.getElementById("vDayChoices");
    const dayNext = document.getElementById("vDayNext");
    (payload.days || []).forEach((d) => {
      const dateObj = new Date(d.date + "T00:00:00");
      const div = document.createElement("div");
      div.className = "choice";
      div.innerHTML = `<span class="t">${d.label}</span><span class="d">${monthShort(dateObj.getMonth())} ${dateObj.getDate()}</span>`;
      div.addEventListener("click", () => selectDay(div, d.label, dateObj));
      dayChoicesEl.appendChild(div);
    });
    if (payload.allowTalkLater) {
      const talkDiv = document.createElement("div");
      talkDiv.className = "choice wide";
      talkDiv.innerHTML = `<span class="t">Өдөр ярилцаад тохирьё</span>`;
      talkDiv.addEventListener("click", () => selectDay(talkDiv, "Ярилцаад тохирно", null));
      dayChoicesEl.appendChild(talkDiv);
    }
    function selectDay(el, label, dateObj) {
      [...dayChoicesEl.children].forEach((c) => c.classList.remove("selected"));
      el.classList.add("selected");
      state.day = label; state.dayDate = dateObj;
      dayNext.disabled = false;
    }
    dayNext.addEventListener("click", () => next(2));

    // ---- step 2 & 3 ----
    function renderChoices(containerId, nextBtnId, arr, key, goStep) {
      const container = document.getElementById(containerId);
      const btn = document.getElementById(nextBtnId);
      (arr || []).forEach((it) => {
        const div = document.createElement("div");
        div.className = "choice";
        div.innerHTML = `<span class="t">${it.title}</span>${it.desc ? `<span class="d">${it.desc}</span>` : ""}`;
        div.addEventListener("click", () => {
          [...container.children].forEach((c) => c.classList.remove("selected"));
          div.classList.add("selected");
          state[key] = it.title;
          btn.disabled = false;
        });
        container.appendChild(div);
      });
      btn.addEventListener("click", () => goStep());
    }
    renderChoices("vBringChoices", "vBringNext", payload.brings, "bring", () => next(3));
    renderChoices("vAfterChoices", "vAfterNext", payload.afters, "after", () => {
      next(4);
      setTimeout(() => next(5), 1400);
      renderCalendar();
      renderTicket();
      submitResponse();
    });

    // ---- step 4: calendar ----
    function renderCalendar() {
      const base = state.dayDate || new Date();
      const y = base.getFullYear(), m = base.getMonth();
      const monthNamesFull = ["1-р", "2-р", "3-р", "4-р", "5-р", "6-р", "7-р", "8-р", "9-р", "10-р", "11-р", "12-р"];
      document.getElementById("vCalMonth").textContent = `${y} оны ${monthNamesFull[m]} сар`;
      const grid = document.getElementById("vCalGrid");
      grid.innerHTML = "";
      ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"].forEach((d) => {
        const el = document.createElement("div"); el.className = "dow"; el.textContent = d; grid.appendChild(el);
      });
      const firstDay = new Date(y, m, 1);
      const startOffset = (firstDay.getDay() + 6) % 7;
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      for (let i = 0; i < startOffset; i++) grid.appendChild(document.createElement("div"));
      const highlightDay = state.dayDate ? base.getDate() : null;
      for (let d = 1; d <= daysInMonth; d++) {
        const el = document.createElement("div");
        el.className = "day" + (d === highlightDay ? " hi" : "");
        el.textContent = d;
        grid.appendChild(el);
      }
    }

    // ---- step 5: ticket + countdown ----
    function renderTicket() {
      const base = state.dayDate;
      document.getElementById("vTDate").textContent = base
        ? `${base.getFullYear()} оны ${base.getMonth() + 1}-р сарын ${base.getDate()}, ${weekdayNames[base.getDay()]}`
        : "Ярилцаад тохирно";
      document.getElementById("vTBring").textContent = state.bring || "—";
      document.getElementById("vTAfter").textContent = state.after || "—";
      if (base) startCountdown(base);
      else document.getElementById("vCountdown").style.display = "none";
    }
    let cdInterval;
    function startCountdown(target) {
      const fixedTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 18, 0, 0);
      function tick() {
        const now = new Date();
        const diff = Math.max(0, fixedTarget - now);
        document.getElementById("vCdD").textContent = Math.floor(diff / 86400000);
        document.getElementById("vCdH").textContent = Math.floor((diff % 86400000) / 3600000);
        document.getElementById("vCdM").textContent = Math.floor((diff % 3600000) / 60000);
        document.getElementById("vCdS").textContent = Math.floor((diff % 60000) / 1000);
      }
      tick();
      clearInterval(cdInterval);
      cdInterval = setInterval(tick, 1000);
    }

    // ---- send response to backend (triggers email to sender) ----
    async function submitResponse() {
      const replyHint = document.getElementById("vReplyHint");
      replyHint.textContent = "⏳ Мэдэгдэл илгээж байна...";
      try {
        const res = await fetch(`/api/invites/${id}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            day: state.dayDate ? { label: state.day, date: state.dayDate.toISOString().slice(0, 10) } : { label: state.day, date: null },
            bring: state.bring,
            after: state.after,
          }),
        });
        if (!res.ok) throw new Error("failed");
        replyHint.textContent = `✅ ${SENDER}-д имэйлээр мэдэгдэл автоматаар илгээгдлээ`;
      } catch (e) {
        replyHint.textContent = `⚠️ Мэдэгдэл илгээхэд алдаа гарлаа — доорх товчоор гараар илгээгээрэй`;
      }
    }

    // ---- copy plan details ----
    document.getElementById("vSaveBtn").addEventListener("click", async () => {
      const base = state.dayDate;
      const dateStr = base ? `${base.getFullYear()}.${base.getMonth() + 1}.${base.getDate()} (${weekdayNames[base.getDay()]}) 18:00` : "Ярилцаад тохирно";
      const text = `📅 Болзоо: ${SENDER} × ${RECEIVER}\nОгноо: ${dateStr}\nАвчрах зүйл: ${state.bring || "-"}\nДараа нь: ${state.after || "-"}`;
      try { await navigator.clipboard.writeText(text); showToast("Дэлгэрэнгүй хуулагдлаа ✓"); }
      catch (e) { showToast(text); }
      document.getElementById("vStamp").classList.add("show");
    });

    // ---- optional manual share (backup channel) ----
    document.getElementById("vShareBtn").addEventListener("click", async () => {
      const text = `✅ ${RECEIVER} зөвшөөрлөө! ${SENDER} × ${RECEIVER} болзоо товлогдлоо 💕\n${document.getElementById("vTDate").textContent}\nАвчрах зүйл: ${state.bring || "-"}\nДараа нь: ${state.after || "-"}`;
      if (navigator.share) { try { await navigator.share({ text }); return; } catch (e) {} }
      try { await navigator.clipboard.writeText(text); showToast("Хуулагдлаа ✓"); }
      catch (e) { showToast(text); }
    });

    // ---- shareable image card ----
    function roundRectPath(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    // Same bear + bunny illustration used elsewhere on the site, loaded as
    // an image so the shared Story card matches the app's own art style
    // instead of relying on a plain emoji.
    const COUPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 110">
      <path d="M118 6 c2-5 9-5 9.5 0 c0.5-5 7.5-5 9.5 0 c1 6-9.5 12-9.5 12 s-10.5-6-9.5-12z" fill="#ff5d8f" stroke="#c23663" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M135 22 c1.3-3.3 6-3.3 6.3 0 c0.3-3.3 5-3.3 6.3 0 c0.7 4-6.3 8-6.3 8 s-7-4-6.3-8z" fill="#ff8bad" stroke="#c23663" stroke-width="1.4" stroke-linejoin="round" />
      <path d="M51 83 c0-24 21-43 46-43 c25 0 46 19 46 43 c0 15-13 24-46 24 c-33 0-46-9-46-24z" fill="#e8935a" stroke="#8a4a1f" stroke-width="2.6" stroke-linejoin="round" />
      <circle cx="80" cy="32" r="12" fill="#e8935a" stroke="#8a4a1f" stroke-width="2.4" /><circle cx="120" cy="32" r="12" fill="#e8935a" stroke="#8a4a1f" stroke-width="2.4" />
      <circle cx="80" cy="32" r="5.5" fill="#fbd2a8" /><circle cx="120" cy="32" r="5.5" fill="#fbd2a8" />
      <ellipse cx="100" cy="62" rx="12" ry="9" fill="#fbd2a8" stroke="#8a4a1f" stroke-width="2" />
      <path d="M89 52 q4 -6 8 0" stroke="#3a2a26" stroke-width="2.4" stroke-linecap="round" fill="none" />
      <path d="M105 52 q4 -6 8 0" stroke="#3a2a26" stroke-width="2.4" stroke-linecap="round" fill="none" />
      <ellipse cx="100" cy="62" rx="2.6" ry="2" fill="#3a2a26" />
      <path d="M94 68 q6 5 12 0" stroke="#3a2a26" stroke-width="2" stroke-linecap="round" fill="none" />
      <circle cx="86" cy="58" r="5" fill="#ffc9d6" opacity="0.6" /><circle cx="114" cy="58" r="5" fill="#ffc9d6" opacity="0.6" />
      <path d="M9 78 c0-27 15-49 37-49 c22 0 37 22 37 49 c0 15-12 22-37 22 c-25 0-37-7-37-22z" fill="#fff3ef" stroke="#caa79e" stroke-width="2.6" stroke-linejoin="round" />
      <circle cx="25" cy="20" r="13" fill="#fff3ef" stroke="#caa79e" stroke-width="2.4" /><circle cx="67" cy="20" r="13" fill="#fff3ef" stroke="#caa79e" stroke-width="2.4" />
      <circle cx="25" cy="20" r="6" fill="#ffd7e2" /><circle cx="67" cy="20" r="6" fill="#ffd7e2" />
      <circle cx="38" cy="44" r="3" fill="#3a2a26" /><circle cx="56" cy="44" r="3" fill="#3a2a26" />
      <ellipse cx="47" cy="52" rx="3.6" ry="5" fill="#ffb3c4" />
      <circle cx="30" cy="54" r="6" fill="#ffc9d6" opacity="0.7" /><circle cx="62" cy="54" r="6" fill="#ffc9d6" opacity="0.7" />
      <path d="M56 74 Q76 58 98 66" stroke="#caa79e" stroke-width="20" stroke-linecap="round" fill="none" />
      <path d="M56 74 Q76 58 98 66" stroke="#fff3ef" stroke-width="16" stroke-linecap="round" fill="none" />
      <circle cx="99" cy="67" r="9" fill="#fff3ef" stroke="#caa79e" stroke-width="2.2" />
    </svg>`;
    function loadCoupleImage() {
      return new Promise((resolve) => {
        try {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = "data:image/svg+xml;base64," + btoa(COUPLE_SVG);
        } catch (e) { resolve(null); }
      });
    }
    function drawHeart(ctx, x, y, size, color, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      const top = y - size * 0.3;
      ctx.beginPath();
      ctx.moveTo(x, top + size * 0.3);
      ctx.bezierCurveTo(x, top, x - size / 2, top, x - size / 2, top + size * 0.3);
      ctx.bezierCurveTo(x - size / 2, top + size * 0.65, x, top + size * 0.85, x, top + size);
      ctx.bezierCurveTo(x, top + size * 0.85, x + size / 2, top + size * 0.65, x + size / 2, top + size * 0.3);
      ctx.bezierCurveTo(x + size / 2, top, x, top, x, top + size * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    async function buildShareCanvas(dateVal, bringVal, afterVal) {
      try { await document.fonts.load('700 60px "Caveat"'); } catch (e) {}
      const coupleImg = await loadCoupleImage();
      // Sized to Instagram Story's exact 9:16 frame so the image drops in
      // without cropping when shared as a Story background.
      const canvas = document.createElement("canvas");
      canvas.width = 1080; canvas.height = 1920;
      const ctx = canvas.getContext("2d");

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#4a1230"); grad.addColorStop(1, "#2c0a1c");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(255,255,255,0.05)";
      for (let y = 20; y < canvas.height; y += 34) {
        for (let x = 20; x < canvas.width; x += 34) {
          ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Decorative hearts scattered in the open margins above the title and
      // below the names, so the frame doesn't feel bare on a tall Story.
      const hearts = [
        [150, 110, 40, "#ff8bad", 0.55], [930, 90, 52, "#ff5d8f", 0.8], [850, 220, 28, "#ffb8cf", 0.45],
        [190, 1430, 34, "#ff8bad", 0.5], [900, 1400, 46, "#ff5d8f", 0.65],
        [230, 1720, 26, "#ffb8cf", 0.4], [860, 1740, 38, "#ff8bad", 0.5],
        [400, 1830, 22, "#ff8bad", 0.35], [680, 1850, 30, "#ffb8cf", 0.4],
      ];
      hearts.forEach(([hx, hy, hs, hc, ha]) => drawHeart(ctx, hx, hy, hs, hc, ha));

      ctx.textAlign = "center";
      ctx.fillStyle = "#fff8f3";
      ctx.font = '700 101px "Caveat", cursive';
      ctx.fillText("Болзоо товлогдлоо!", canvas.width / 2, 324);

      if (coupleImg) {
        const iw = 320, ih = iw * (110 / 150);
        ctx.drawImage(coupleImg, canvas.width / 2 - iw / 2, 380, iw, ih);
      }

      const cardX = 108, cardY = 624, cardW = canvas.width - 216, cardH = 576;
      ctx.fillStyle = "#fff8f3";
      roundRectPath(ctx, cardX, cardY, cardW, cardH, 36);
      ctx.fill();

      ctx.textAlign = "left";
      ctx.fillStyle = "#a5486b";
      ctx.font = "700 29px sans-serif";
      ctx.fillText("БОЛЗООНЫ КАРТ", cardX + 53, cardY + 79);

      function row(label, val, y) {
        ctx.fillStyle = "#a5486b"; ctx.font = "700 23px sans-serif";
        ctx.fillText(label, cardX + 53, y);
        ctx.fillStyle = "#2c0a1c"; ctx.font = "700 36px sans-serif";
        ctx.fillText(val, cardX + 53, y + 48);
      }
      row("ХЭЗЭЭ", dateVal, cardY + 180);
      row("ЮУ АВЧРАХ", bringVal, cardY + 300);
      row("ДАРАА НЬ", afterVal, cardY + 420);

      ctx.textAlign = "center";
      ctx.fillStyle = "#ffb8cf";
      ctx.font = '700 48px "Caveat", cursive';
      ctx.fillText(`${SENDER}  ×  ${RECEIVER}`, canvas.width / 2, cardY + cardH + 108);

      // Call to action + the site's own link, so anyone who sees the Story
      // can tap through and make their own invite.
      ctx.fillStyle = "#ffd7e6";
      ctx.font = "700 30px sans-serif";
      ctx.fillText("Чи ч бас өөрийн урилгаа үүсгээрэй", canvas.width / 2, cardY + cardH + 190);

      const linkText = (typeof location !== "undefined" ? location.origin.replace(/^https?:\/\//, "") : "");
      if (linkText) {
        ctx.font = "700 34px sans-serif";
        const padX = 44, padY = 24, textW = ctx.measureText(linkText).width;
        const pillW = textW + padX * 2, pillH = 34 + padY * 2;
        const pillX = canvas.width / 2 - pillW / 2, pillY = cardY + cardH + 230;
        ctx.fillStyle = "rgba(255,255,255,0.14)";
        roundRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2;
        roundRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
        ctx.stroke();
        ctx.fillStyle = "#fff8f3";
        ctx.fillText(linkText, canvas.width / 2, pillY + pillH / 2 + 12);
      }

      return canvas;
    }

    function isIOSSafari() {
      const ua = navigator.userAgent;
      const iOS = /iP(hone|od|ad)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      return iOS;
    }

    async function fallbackShare(blob) {
      const file = new File([blob], "bolzoo-urilga.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "Болзоо товлогдлоо", text: `${SENDER} × ${RECEIVER}` }); return; }
        catch (err) { /* user cancelled or unsupported — fall through to download */ }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "bolzoo-urilga.png"; a.click();
      showToast("Зураг татагдлаа ✓ Instagram-даа зураг хэсгээс сонгоод Story-даа нэмээрэй");
    }

    document.getElementById("vImageBtn").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      const originalText = btn.textContent;
      btn.textContent = "Бэлдэж байна...";
      btn.disabled = true;
      try {
        const canvas = await buildShareCanvas(
          document.getElementById("vTDate").textContent,
          document.getElementById("vTBring").textContent,
          document.getElementById("vTAfter").textContent
        );
        await new Promise((resolve) => {
          canvas.toBlob(async (blob) => {
            if (!blob) { showToast("Зураг үүсгэхэд алдаа гарлаа"); resolve(); return; }

            // Best-effort: on iOS, put the image on the clipboard and jump straight
            // into Instagram's Story composer with it pre-loaded. This is an
            // unofficial trick (Instagram/Apple give no public API for it) so it
            // can silently fail on some app/OS versions — if Instagram doesn't
            // visibly open within ~1.2s we fall back to the normal share sheet.
            if (isIOSSafari() && window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
              try {
                await navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]);
                let handled = false;
                const onHide = () => { handled = true; };
                document.addEventListener("visibilitychange", onHide, { once: true });
                window.location.href = "instagram-stories://share?source_application=bolzoo_urilga";
                setTimeout(() => {
                  document.removeEventListener("visibilitychange", onHide);
                  if (!handled) fallbackShare(blob).finally(resolve);
                  else resolve();
                }, 1200);
                return;
              } catch (err) { /* clipboard write failed — fall through */ }
            }
            fallbackShare(blob).finally(resolve);
          }, "image/png");
        });
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }, [status, payload, id]);

  return (
    <>
      <div className="phone" id="viewerPhone" style={{ display: status === "ready" ? "flex" : "none" }}>
        <button className="back-btn" id="vBackBtn" style={{ display: "none" }}>← Буцах</button>
        <div className="progress" id="vProgress"></div>

        <div className="step active" data-vstep="0">
          {payload && payload.photo ? (
            <div className="photo-frame invite-photo-frame">
              <img src={payload.photo} alt="" />
            </div>
          ) : (
            bearSvg
          )}
          <div className="eyebrow" id="vPairLabel"></div>
          <div className="subtext">МАРТАГДАШГҮЙ ОРОЙ БАЙХ БОЛНО</div>
          <h1 className="script">Надтай болзоонд<br />явах уу?</h1>
          <div className="invite-message" id="vInviteMsg" style={{ display: "none" }}></div>
          <div className="hint">Зөвхөн нэг л зөв хариулт бий 🙂</div>
          <div className="yn-row" id="vYnRow">
            <button className="btn btn-yes" id="vYesBtn">ТИЙМ ♥</button>
            <button className="btn btn-no" id="vNoBtn">ҮГҮЙ</button>
          </div>
        </div>

        <div className="step" data-vstep="1">
          <h1 className="script" style={{ fontSize: 30, marginTop: 6 }}>Еээ! Хэзээ завтай вэ?</h1>
          <div className="choices" id="vDayChoices" style={{ marginTop: 14 }}></div>
          <button className="cta" id="vDayNext" disabled>ҮРГЭЛЖЛҮҮЛЭХ</button>
        </div>

        <div className="step" data-vstep="2">
          <h1 className="script" style={{ fontSize: 30 }}>Тэгээд би юу<br />авч очих вэ?</h1>
          <div className="choices" id="vBringChoices" style={{ marginTop: 14 }}></div>
          <button className="cta" id="vBringNext" disabled>ҮРГЭЛЖЛҮҮЛЭХ</button>
        </div>

        <div className="step" data-vstep="3">
          <h1 className="script" style={{ fontSize: 30 }}>Тэгээд дараа нь?</h1>
          <div className="choices" id="vAfterChoices" style={{ marginTop: 14 }}></div>
          <button className="cta" id="vAfterNext" disabled>ТОВЛОХ</button>
        </div>

        <div className="step" data-vstep="4">
          <div className="cal-label">КАЛЕНДАРТ НЭМЖ БАЙНА...</div>
          <div className="cal-wrap">
            <div className="cal-card">
              <div className="cal-month" id="vCalMonth"></div>
              <div className="cal-grid" id="vCalGrid"></div>
            </div>
          </div>
        </div>

        <div className="step" data-vstep="5">
          <h1 className="script" style={{ fontSize: 30 }}>Болзоо<br />товлогдлоо!</h1>
          <div className="ticket" style={{ marginTop: 14 }}>
            <div className="ticket-stamp" id="vStamp">ХАДГАЛСАН</div>
            <svg className="mini-bears" viewBox="0 0 150 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M118 6 c2-5 9-5 9.5 0 c0.5-5 7.5-5 9.5 0 c1 6-9.5 12-9.5 12 s-10.5-6-9.5-12z" fill="#ff5d8f" stroke="#c23663" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M135 22 c1.3-3.3 6-3.3 6.3 0 c0.3-3.3 5-3.3 6.3 0 c0.7 4-6.3 8-6.3 8 s-7-4-6.3-8z" fill="#ff8bad" stroke="#c23663" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M51 83 c0-24 21-43 46-43 c25 0 46 19 46 43 c0 15-13 24-46 24 c-33 0-46-9-46-24z" fill="#e8935a" stroke="#8a4a1f" strokeWidth="2.6" strokeLinejoin="round" />
              <circle cx="80" cy="32" r="12" fill="#e8935a" stroke="#8a4a1f" strokeWidth="2.4" /><circle cx="120" cy="32" r="12" fill="#e8935a" stroke="#8a4a1f" strokeWidth="2.4" />
              <circle cx="80" cy="32" r="5.5" fill="#fbd2a8" /><circle cx="120" cy="32" r="5.5" fill="#fbd2a8" />
              <ellipse cx="100" cy="62" rx="12" ry="9" fill="#fbd2a8" stroke="#8a4a1f" strokeWidth="2" />
              <path d="M89 52 q4 -6 8 0" stroke="#3a2a26" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M105 52 q4 -6 8 0" stroke="#3a2a26" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <ellipse cx="100" cy="62" rx="2.6" ry="2" fill="#3a2a26" />
              <path d="M94 68 q6 5 12 0" stroke="#3a2a26" strokeWidth="2" strokeLinecap="round" fill="none" />
              <circle cx="86" cy="58" r="5" fill="#ffc9d6" opacity="0.5" /><circle cx="114" cy="58" r="5" fill="#ffc9d6" opacity="0.5" />
              <path d="M9 78 c0-27 15-49 37-49 c22 0 37 22 37 49 c0 15-12 22-37 22 c-25 0-37-7-37-22z" fill="#f3e3ea" stroke="#c9aab5" strokeWidth="2.6" strokeLinejoin="round" />
              <circle cx="25" cy="20" r="13" fill="#f3e3ea" stroke="#c9aab5" strokeWidth="2.4" /><circle cx="67" cy="20" r="13" fill="#f3e3ea" stroke="#c9aab5" strokeWidth="2.4" />
              <circle cx="25" cy="20" r="6" fill="#e6c7d3" /><circle cx="67" cy="20" r="6" fill="#e6c7d3" />
              <circle cx="38" cy="44" r="3" fill="#3a2a26" /><circle cx="56" cy="44" r="3" fill="#3a2a26" />
              <ellipse cx="47" cy="52" rx="3.6" ry="5" fill="#e0a9bb" />
              <circle cx="30" cy="54" r="6" fill="#e0a9bb" opacity="0.6" /><circle cx="62" cy="54" r="6" fill="#e0a9bb" opacity="0.6" />
              <path d="M56 74 Q76 58 98 66" stroke="#c9aab5" strokeWidth="20" strokeLinecap="round" fill="none" />
              <path d="M56 74 Q76 58 98 66" stroke="#f3e3ea" strokeWidth="16" strokeLinecap="round" fill="none" />
              <circle cx="99" cy="67" r="9" fill="#f3e3ea" stroke="#c9aab5" strokeWidth="2.2" />
            </svg>
            <div className="ticket-body">
              <div className="ticket-title">БОЛЗООНЫ КАРТ</div>
              <div className="ticket-grid">
                <div><div className="lab">ХЭЗЭЭ</div><div className="val" id="vTDate">—</div></div>
                <div><div className="lab">ХААНА</div><div className="val">Шийднэ</div></div>
                <div><div className="lab">ЮУ АВЧРАХ</div><div className="val" id="vTBring">—</div></div>
                <div><div className="lab">ДАРАА НЬ</div><div className="val" id="vTAfter">—</div></div>
              </div>
            </div>
          </div>

          <div className="cal-label" style={{ marginBottom: 8 }}>ЭХЛЭХЭД</div>
          <div className="countdown" id="vCountdown">
            <div className="box"><div className="num" id="vCdD">0</div><div className="lab">өдөр</div></div>
            <div className="box"><div className="num" id="vCdH">0</div><div className="lab">цаг</div></div>
            <div className="box"><div className="num" id="vCdM">0</div><div className="lab">минут</div></div>
            <div className="box"><div className="num" id="vCdS">0</div><div className="lab">секунд</div></div>
          </div>

          <button className="cta" id="vImageBtn" style={{ marginTop: 0, marginBottom: 10 }}>📸 Instagram Story-д нэмэх</button>
          <div className="hint" style={{ marginTop: -4, marginBottom: 10 }}>Зураг бэлэн болмогц Instagram-аа сонгоод "Нийтлэх" гэхэд л Story-нд орно</div>

          <div className="row-btns">
            <button className="btn-save" id="vSaveBtn">Дэлгэрэнгүй хуулах</button>
            <button className="btn-share" id="vShareBtn">Хуваалцах</button>
          </div>

          <div className="hint" id="vReplyHint" style={{ textAlign: "left", marginBottom: 10 }}></div>

          <div className="final-note">Товлогдлоо — тэгээд уулзъя ♥</div>
        </div>
      </div>

      {status === "loading" && (
        <div className="phone">
          <div className="step active" style={{ justifyContent: "center" }}>
            <div className="loading-icon">💌</div>
            <div className="hint">Ачааллаж байна...</div>
          </div>
        </div>
      )}

      {status === "notfound" && (
        <div className="phone">
          <div className="step active">
            <div className="notfound-icon">💔</div>
            <h1 className="script" style={{ fontSize: 28 }}>Линк олдсонгүй</h1>
            <div className="hint">Энэ холбоос буруу эсвэл эвдэрсэн байна</div>
            <a className="cta" href="/" style={{ marginTop: "auto", textDecoration: "none", textAlign: "center", display: "block" }}>Өөрөө урилга үүсгэх</a>
          </div>
        </div>
      )}

      <div className="toast" id="toast"></div>
    </>
  );
}
