"use client";

import { useEffect } from "react";

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

export default function HomePage() {
  useEffect(() => {
    function showToast(msg) {
      const t = document.getElementById("toast");
      t.textContent = msg;
      t.classList.add("show");
      setTimeout(() => t.classList.remove("show"), 2200);
    }
    function isoDate(d) {
      const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    const weekdayNames = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];

    let audioCtx;
    function playPop() {
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {}
    }
    function vibrate(ms) {
      try { if (navigator.vibrate) navigator.vibrate(ms || 30); } catch (e) {}
    }

    const phone = document.getElementById("creatorPhone");
    const steps = [...phone.querySelectorAll(".step")];
    const progressEl = document.getElementById("cProgress");
    const backBtn = document.getElementById("cBackBtn");
    for (let i = 0; i < steps.length; i++) progressEl.appendChild(document.createElement("i"));
    function setProgress(step) { [...progressEl.children].forEach((b, i) => b.classList.toggle("done", i <= step)); }

    let history = [0];
    function goTo(step) {
      steps.forEach((s) => s.classList.toggle("active", +s.dataset.cstep === step));
      setProgress(step);
      backBtn.style.display = step > 0 ? "block" : "none";
    }
    function next(step) { history.push(step); goTo(step); }
    function onBack() { if (history.length > 1) { history.pop(); goTo(history[history.length - 1]); } }
    backBtn.addEventListener("click", onBack);

    const startBtn = document.getElementById("startBtn");
    const onStart = () => next(1);
    startBtn.addEventListener("click", onStart);

    // ---- step 1: names + email + photo ----
    const senderInput = document.getElementById("senderInput");
    const receiverInput = document.getElementById("receiverInput");
    const emailInput = document.getElementById("emailInput");
    const namesNext = document.getElementById("namesNext");
    function checkNames() {
      const emailOk = /\S+@\S+\.\S+/.test(emailInput.value.trim());
      namesNext.disabled = !(senderInput.value.trim() && receiverInput.value.trim() && emailOk);
    }
    senderInput.addEventListener("input", checkNames);
    receiverInput.addEventListener("input", checkNames);
    emailInput.addEventListener("input", checkNames);
    const onNamesNext = () => next(2);
    namesNext.addEventListener("click", onNamesNext);

    // ---- photo upload (optional square crop) ----
    let photoDataUrl = "";
    const photoInput = document.getElementById("photoInput");
    const photoPreviewWrap = document.getElementById("photoPreviewWrap");
    const photoPreviewImg = document.getElementById("photoPreviewImg");
    const photoRemoveBtn = document.getElementById("photoRemoveBtn");
    function onPhotoChange() {
      const file = photoInput.files && photoInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const size = 300;
          const canvas = document.createElement("canvas");
          canvas.width = size; canvas.height = size;
          const ctx = canvas.getContext("2d");
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2, sy = (img.height - side) / 2;
          ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
          photoDataUrl = canvas.toDataURL("image/jpeg", 0.75);
          photoPreviewImg.src = photoDataUrl;
          photoPreviewWrap.style.display = "block";
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
    photoInput.addEventListener("change", onPhotoChange);
    function onPhotoRemove() {
      photoDataUrl = "";
      photoInput.value = "";
      photoPreviewWrap.style.display = "none";
    }
    photoRemoveBtn.addEventListener("click", onPhotoRemove);

    // ---- step 2: days ----
    const dayListEl = document.getElementById("dayList");
    const addDayBtn = document.getElementById("addDayBtn");
    const talkLaterChk = document.getElementById("talkLaterChk");
    const daysNext = document.getElementById("daysNext");
    const MAX_DAYS = 6;
    const today = new Date();
    let days = [
      { label: "Өнөөдөр", date: isoDate(today) },
      { label: "Маргааш", date: isoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)) },
      { label: weekdayNames[new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).getDay()], date: isoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)) },
    ];
    function renderDays() {
      dayListEl.innerHTML = "";
      days.forEach((d, i) => {
        const row = document.createElement("div");
        row.className = "editor-row";
        row.innerHTML = `
          <div class="fields">
            <input type="text" class="dLabel" placeholder="Нэршил (жишээ: Баасан гараг)" value="${d.label.replace(/"/g, "&quot;")}" data-i="${i}">
            <input type="date" class="dDate" value="${d.date}" data-i="${i}">
          </div>
          <button class="rm" data-i="${i}" ${days.length <= 1 ? 'style="visibility:hidden"' : ""}>&times;</button>
        `;
        dayListEl.appendChild(row);
      });
      addDayBtn.disabled = days.length >= MAX_DAYS;
      checkDays();
    }
    function onDayListInput(e) {
      const i = +e.target.dataset.i;
      if (e.target.classList.contains("dLabel")) days[i].label = e.target.value;
      if (e.target.classList.contains("dDate")) days[i].date = e.target.value;
      checkDays();
    }
    function onDayListClick(e) {
      if (e.target.classList.contains("rm") && days.length > 1) {
        days.splice(+e.target.dataset.i, 1);
        renderDays();
      }
    }
    dayListEl.addEventListener("input", onDayListInput);
    dayListEl.addEventListener("click", onDayListClick);
    function onAddDay() {
      if (days.length >= MAX_DAYS) return;
      const base = new Date(); base.setDate(base.getDate() + days.length);
      days.push({ label: weekdayNames[base.getDay()], date: isoDate(base) });
      renderDays();
    }
    addDayBtn.addEventListener("click", onAddDay);
    talkLaterChk.addEventListener("change", checkDays);
    function checkDays() {
      const validDays = days.every((d) => d.label.trim() && d.date);
      daysNext.disabled = !((days.length > 0 && validDays) || talkLaterChk.checked);
    }
    renderDays();
    const onDaysNext = () => next(3);
    daysNext.addEventListener("click", onDaysNext);

    // ---- step 3 & 4: generic editors ----
    function makeListEditor(containerId, addBtnId, nextBtnId, defaults, titlePH, descPH, goStep) {
      const container = document.getElementById(containerId);
      const addBtn = document.getElementById(addBtnId);
      const nextBtn = document.getElementById(nextBtnId);
      const MAX = 6;
      let items = defaults.map((d) => ({ ...d }));
      function render() {
        container.innerHTML = "";
        items.forEach((it, i) => {
          const row = document.createElement("div");
          row.className = "editor-row";
          row.innerHTML = `
            <div class="fields">
              <input type="text" class="iTitle" placeholder="${titlePH}" value="${(it.title || "").replace(/"/g, "&quot;")}" data-i="${i}">
              <input type="text" class="iDesc" placeholder="${descPH}" value="${(it.desc || "").replace(/"/g, "&quot;")}" data-i="${i}">
            </div>
            <button class="rm" data-i="${i}" ${items.length <= 1 ? 'style="visibility:hidden"' : ""}>&times;</button>
          `;
          container.appendChild(row);
        });
        addBtn.disabled = items.length >= MAX;
        check();
      }
      function onInput(e) {
        const i = +e.target.dataset.i;
        if (e.target.classList.contains("iTitle")) items[i].title = e.target.value;
        if (e.target.classList.contains("iDesc")) items[i].desc = e.target.value;
        check();
      }
      function onClick(e) {
        if (e.target.classList.contains("rm") && items.length > 1) {
          items.splice(+e.target.dataset.i, 1);
          render();
        }
      }
      container.addEventListener("input", onInput);
      container.addEventListener("click", onClick);
      function onAdd() {
        if (items.length >= MAX) return;
        items.push({ title: "", desc: "" });
        render();
      }
      addBtn.addEventListener("click", onAdd);
      function check() { nextBtn.disabled = !items.every((it) => it.title && it.title.trim()); }
      render();
      function onNext() { if (!nextBtn.disabled) goStep(); }
      nextBtn.addEventListener("click", onNext);
      return {
        getItems: () => items,
        cleanup: () => {
          container.removeEventListener("input", onInput);
          container.removeEventListener("click", onClick);
          addBtn.removeEventListener("click", onAdd);
          nextBtn.removeEventListener("click", onNext);
        },
      };
    }

    const bringEditor = makeListEditor(
      "bringList", "addBringBtn", "bringsNext",
      [{ title: "Цэцэг", desc: "сонгодог сонголт" }, { title: "Амттан", desc: "дараа нь идэхэд" }, { title: "Бэлэг", desc: "жижигхэн сюрприз" }, { title: "Зүгээр л би", desc: "арай зоригтой ч зөв" }],
      "Гарчиг (жишээ: Цэцэг)", "Тайлбар (жишээ: сонгодог сонголт)",
      () => next(4)
    );
    const afterEditor = makeListEditor(
      "afterList", "addAfterBtn", "generateBtn",
      [{ title: "Алхах", desc: "тайван алхъя" }, { title: "Парк орох", desc: "цэвэр агаар" }, { title: "Кино үзэх", desc: "хамт кино үзье" }, { title: "Очоод ярилцъя", desc: "тухайн үедээ шийднэ" }],
      "Гарчиг (жишээ: Алхах)", "Тайлбар (жишээ: тайван алхъя)",
      () => generateLink()
    );

    // ---- generate ----
    let generatedLink = "";
    const generateBtn = document.getElementById("generateBtn");
    async function generateLink() {
      generateBtn.disabled = true;
      generateBtn.textContent = "Үүсгэж байна...";
      try {
        const payload = {
          senderName: senderInput.value.trim(),
          receiverName: receiverInput.value.trim(),
          senderEmail: emailInput.value.trim(),
          message: document.getElementById("msgInput").value.trim(),
          photo: photoDataUrl,
          days: days.filter((d) => d.label.trim() && d.date),
          allowTalkLater: !!talkLaterChk.checked,
          brings: bringEditor.getItems().filter((it) => it.title && it.title.trim()),
          afters: afterEditor.getItems().filter((it) => it.title && it.title.trim()),
        };
        const res = await fetch("/api/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("request_failed");
        const data = await res.json();
        generatedLink = `${location.origin}/i/${data.id}`;
        document.getElementById("linkBox").textContent = generatedLink;
        playPop(); vibrate(40);
        next(5);
      } catch (e) {
        showToast("Алдаа гарлаа, дахин оролдоно уу");
      } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "УРИЛГА ҮҮСГЭХ";
      }
    }

    const copyLinkBtn = document.getElementById("copyLinkBtn");
    const onCopyLink = async () => {
      try { await navigator.clipboard.writeText(generatedLink); showToast("Линк хуулагдлаа ✓"); }
      catch (e) { showToast(generatedLink); }
    };
    copyLinkBtn.addEventListener("click", onCopyLink);

    const shareLinkBtn = document.getElementById("shareLinkBtn");
    const onShareLink = async () => {
      const text = `${senderInput.value.trim()} чамайг болзоонд урьж байна 💌 ${generatedLink}`;
      if (navigator.share) { try { await navigator.share({ text }); } catch (e) {} }
      else { try { await navigator.clipboard.writeText(text); showToast("Хуулагдлаа ✓"); } catch (e) { showToast(text); } }
    };
    shareLinkBtn.addEventListener("click", onShareLink);

    const restartBtn = document.getElementById("restartBtn");
    const onRestart = () => location.reload();
    restartBtn.addEventListener("click", onRestart);

    return () => {
      backBtn.removeEventListener("click", onBack);
      startBtn.removeEventListener("click", onStart);
      senderInput.removeEventListener("input", checkNames);
      receiverInput.removeEventListener("input", checkNames);
      emailInput.removeEventListener("input", checkNames);
      namesNext.removeEventListener("click", onNamesNext);
      dayListEl.removeEventListener("input", onDayListInput);
      dayListEl.removeEventListener("click", onDayListClick);
      addDayBtn.removeEventListener("click", onAddDay);
      talkLaterChk.removeEventListener("change", checkDays);
      daysNext.removeEventListener("click", onDaysNext);
      bringEditor.cleanup();
      afterEditor.cleanup();
      copyLinkBtn.removeEventListener("click", onCopyLink);
      shareLinkBtn.removeEventListener("click", onShareLink);
      restartBtn.removeEventListener("click", onRestart);
    };
  }, []);

  return (
    <>
      <div className="phone" id="creatorPhone">
        <button className="back-btn" id="cBackBtn" style={{ display: "none" }}>← Буцах</button>
        <div className="progress" id="cProgress"></div>

        <div className="step active" data-cstep="0">
          {bearSvg}
          <div className="eyebrow">БОЛЗОО УРИЛГА</div>
          <h1 className="script">Хайртдаа тусгай<br />урилга илгээ</h1>
          <div className="hint">Нэр, өдөр, төлөвлөгөөгөө бөглөөд өвөрмөц линк аваарай</div>
          <div className="price-badge">3,000₮</div>
          <div className="pay-note">Төлбөр: QPay — тун удахгүй нэмэгдэнэ</div>
          <button className="cta" id="startBtn" style={{ marginTop: "auto" }}>ЭХЛЭХ →</button>
        </div>

        <div className="step" data-cstep="1">
          <h1 className="script" style={{ fontSize: 30 }}>Нэрсээ бичье</h1>
          <div style={{ width: "100%", marginTop: 14 }}>
            <div className="field">
              <label>ТАНЫ НЭР</label>
              <input type="text" id="senderInput" placeholder="Жишээ: Болд" maxLength={30} />
            </div>
            <div className="field">
              <label>ХЭНД ЗОРИУЛАВ?</label>
              <input type="text" id="receiverInput" placeholder="Жишээ: Сараа" maxLength={30} />
            </div>
            <div className="field">
              <label>ТАНЫ ИМЭЙЛ</label>
              <input type="email" id="emailInput" placeholder="you@example.com" maxLength={120} />
              <div className="subhint">Хайрт хүн чинь хариулмагц энд мэдэгдэл очно</div>
            </div>
            <div className="field">
              <label>ХУВИЙН ЗУРВАС (ЗААВАЛ БИШ)</label>
              <textarea id="msgInput" placeholder="Жишээ нь: Чамайг маш их хайрладаг ❤️" maxLength={200} rows={3}></textarea>
            </div>
            <div className="field">
              <label>ЗУРАГ НЭМЭХ (ЗААВАЛ БИШ)</label>
              <input type="file" id="photoInput" accept="image/*" />
              <div id="photoPreviewWrap" style={{ display: "none", marginTop: 10 }}>
                <div className="photo-frame">
                  <img id="photoPreviewImg" alt="" />
                </div>
                <button type="button" className="btn-no" id="photoRemoveBtn" style={{ marginTop: 8 }}>Зураг хасах</button>
              </div>
            </div>
          </div>
          <button className="cta" id="namesNext" disabled style={{ marginTop: "auto" }}>ҮРГЭЛЖЛҮҮЛЭХ</button>
        </div>

        <div className="step" data-cstep="2">
          <h1 className="script" style={{ fontSize: 26 }}>Ямар өдрүүд<br />санал болгох вэ?</h1>
          <div className="editor-list" id="dayList"></div>
          <button className="add-row-btn" id="addDayBtn">+ Өдөр нэмэх</button>
          <label className="checkbox-row"><input type="checkbox" id="talkLaterChk" defaultChecked /> &quot;Өдөр ярилцаад тохирьё&quot; сонголт нэмэх</label>
          <button className="cta" id="daysNext" style={{ marginTop: "auto" }}>ҮРГЭЛЖЛҮҮЛЭХ</button>
        </div>

        <div className="step" data-cstep="3">
          <h1 className="script" style={{ fontSize: 26 }}>Юу авчрах<br />сонголтууд?</h1>
          <div className="editor-list" id="bringList"></div>
          <button className="add-row-btn" id="addBringBtn">+ Сонголт нэмэх</button>
          <button className="cta" id="bringsNext" style={{ marginTop: "auto" }}>ҮРГЭЛЖЛҮҮЛЭХ</button>
        </div>

        <div className="step" data-cstep="4">
          <h1 className="script" style={{ fontSize: 26 }}>Дараа нь юу<br />хийх вэ?</h1>
          <div className="editor-list" id="afterList"></div>
          <button className="add-row-btn" id="addAfterBtn">+ Сонголт нэмэх</button>
          <button className="cta" id="generateBtn" style={{ marginTop: "auto" }}>УРИЛГА ҮҮСГЭХ</button>
        </div>

        <div className="step" data-cstep="5">
          <h1 className="script" style={{ fontSize: 28 }}>Бэлэн боллоо! 🎉</h1>
          <div className="subtext" style={{ marginTop: 6 }}>Энэ линкийг хайртдаа шууд илгээгээрэй</div>
          <div className="link-box" id="linkBox" style={{ marginTop: 14 }}></div>
          <div className="row-btns">
            <button className="btn-save" id="copyLinkBtn">Хуулах</button>
            <button className="btn-share" id="shareLinkBtn">Хуваалцах</button>
          </div>
          <div className="hint" style={{ marginTop: 4 }}>Хариулмагц таны имэйл рүү автоматаар мэдэгдэнэ 📩</div>
          <button className="btn-no" id="restartBtn" style={{ marginTop: 8 }}>Шинээр эхлэх</button>
        </div>
      </div>

      <div className="toast" id="toast"></div>
    </>
  );
}
