"use client";

import { useEffect, useState, useRef } from "react";

const bearSvg = (
  <svg className="bears" viewBox="0 0 150 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="55" cy="75" rx="34" ry="30" fill="#fff3ef" />
    <circle cx="30" cy="45" r="13" fill="#fff3ef" /><circle cx="80" cy="45" r="13" fill="#fff3ef" />
    <circle cx="30" cy="45" r="6" fill="#ffd7e2" /><circle cx="80" cy="45" r="6" fill="#ffd7e2" />
    <ellipse cx="55" cy="80" rx="14" ry="11" fill="#ffe9e2" />
    <path d="M46 68 q9 6 18 0" stroke="#3a2a26" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    <circle cx="42" cy="60" r="6" fill="#ffc9d6" opacity="0.7" /><circle cx="68" cy="60" r="6" fill="#ffc9d6" opacity="0.7" />
    <ellipse cx="102" cy="78" rx="32" ry="28" fill="#e8935a" />
    <circle cx="80" cy="50" r="12" fill="#e8935a" /><circle cx="124" cy="50" r="12" fill="#e8935a" />
    <circle cx="80" cy="50" r="5.5" fill="#fbd2a8" /><circle cx="124" cy="50" r="5.5" fill="#fbd2a8" />
    <ellipse cx="102" cy="82" rx="13" ry="10" fill="#fbd2a8" />
    <circle cx="94" cy="70" r="3.2" fill="#3a2a26" /><circle cx="110" cy="70" r="3.2" fill="#3a2a26" />
    <ellipse cx="102" cy="80" rx="3.5" ry="2.6" fill="#3a2a26" />
    <path d="M94 88 q8 6 16 0" stroke="#3a2a26" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <path d="M67 30 c3-7 12-7 13 0 c1-7 10-7 13 0 c1 8-13 16-13 16 s-14-8-13-16z" fill="#ff5d8f" />
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

    const state = { day: null, dayDate: null, bring: null, after: null };

    // ---- step 0: yes / no dodge ----
    const noBtn = document.getElementById("vNoBtn");
    const yesBtn = document.getElementById("vYesBtn");
    const ynRow = document.getElementById("vYnRow");
    const noPhrases = ["ҮГҮЙ", "Үнэхээр үү?", "Сайн оролдлого 😊", "Бодоод үз дээ", "Ганц л товч үлдлээ", "ТИЙМ гэж бас болно шүү"];
    let noTries = 0;
    function dodge() {
      noTries = Math.min(noTries + 1, noPhrases.length - 1);
      noBtn.textContent = noPhrases[noTries];
      const maxX = ynRow.clientWidth - noBtn.offsetWidth - 4;
      const maxY = 40;
      noBtn.style.position = "relative";
      noBtn.style.left = Math.random() * maxX * 0.6 + "px";
      noBtn.style.top = (Math.random() - 0.5) * maxY + "px";
    }
    noBtn.addEventListener("mouseenter", dodge);
    noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); dodge(); }, { passive: false });
    noBtn.addEventListener("click", (e) => e.preventDefault());
    yesBtn.addEventListener("click", () => next(1));

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
    });

    // ---- optional manual share (backup channel) ----
    document.getElementById("vShareBtn").addEventListener("click", async () => {
      const text = `✅ ${RECEIVER} зөвшөөрлөө! ${SENDER} × ${RECEIVER} болзоо товлогдлоо 💕\n${document.getElementById("vTDate").textContent}\nАвчрах зүйл: ${state.bring || "-"}\nДараа нь: ${state.after || "-"}`;
      if (navigator.share) { try { await navigator.share({ text }); return; } catch (e) {} }
      try { await navigator.clipboard.writeText(text); showToast("Хуулагдлаа ✓"); }
      catch (e) { showToast(text); }
    });
  }, [status, payload, id]);

  return (
    <>
      <div className="phone" id="viewerPhone" style={{ display: status === "ready" ? "flex" : "none" }}>
        <button className="back-btn" id="vBackBtn" style={{ display: "none" }}>← Буцах</button>
        <div className="progress" id="vProgress"></div>

        <div className="step active" data-vstep="0">
          {bearSvg}
          <div className="eyebrow" id="vPairLabel"></div>
          <div className="subtext">МАРТАГДАШГҮЙ ОРОЙ БАЙХ БОЛНО</div>
          <h1 className="script">Надтай болзоонд<br />явах уу?</h1>
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
            <svg className="mini-bears" viewBox="0 0 150 110" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="55" cy="75" rx="34" ry="30" fill="#f3e3ea" />
              <circle cx="30" cy="45" r="13" fill="#f3e3ea" /><circle cx="80" cy="45" r="13" fill="#f3e3ea" />
              <ellipse cx="102" cy="78" rx="32" ry="28" fill="#e8935a" />
              <circle cx="80" cy="50" r="12" fill="#e8935a" /><circle cx="124" cy="50" r="12" fill="#e8935a" />
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

          <div className="countdown" id="vCountdown">
            <div className="box"><div className="num" id="vCdD">0</div><div className="lab">өдөр</div></div>
            <div className="box"><div className="num" id="vCdH">0</div><div className="lab">цаг</div></div>
            <div className="box"><div className="num" id="vCdM">0</div><div className="lab">минут</div></div>
            <div className="box"><div className="num" id="vCdS">0</div><div className="lab">секунд</div></div>
          </div>

          <div className="hint" id="vReplyHint" style={{ textAlign: "left", marginBottom: 10 }}></div>
          <button className="btn-no" id="vSaveBtn" style={{ marginBottom: 6 }}>Дэлгэрэнгүй хуулах</button>
          <button className="btn-no" id="vShareBtn" style={{ marginBottom: 10 }}>эсвэл Messenger-ээр давхар мэдэгдэх</button>

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
