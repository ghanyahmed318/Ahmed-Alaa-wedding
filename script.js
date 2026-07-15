/* ==========================================================
   CONFIG — عدّل هذا القسم بالتفاصيل الحقيقية
   ========================================================== */
const CONFIG = {
  // لتغيير الأسماء عدّل النص مباشرة في index.html (cover-names و hero-names)
  // لتغيير التواريخ عدّل data-target في عنصري .countdown داخل index.html
  // مثال: data-target="2026-08-20T20:00:00"
};

/* ==========================================================
   1) PETALS BACKGROUND
   ========================================================== */
(function initPetals(){
  const layer = document.getElementById('petals');
  const COUNT = 10;
  for (let i = 0; i < COUNT; i++){
    const p = document.createElement('span');
    p.className = 'petal';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (8 + Math.random() * 10) + 's';
    p.style.animationDelay = (Math.random() * 12) + 's';
    p.style.opacity = (0.3 + Math.random() * 0.4).toFixed(2);
    const size = 8 + Math.random() * 10;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    layer.appendChild(p);
  }
})();

/* ==========================================================
   2) COVER / SEAL OPEN SEQUENCE
   ========================================================== */
(function initCover(){
  const cover = document.getElementById('cover');
  const seal = document.getElementById('seal');
  const openBtn = document.getElementById('openBtn');
  const invite = document.getElementById('invite');
  const musicToggle = document.getElementById('musicToggle');
  const bgm = document.getElementById('bgm');

  function openInvitation(){
    if (cover.classList.contains('opening')) return;
    cover.classList.add('opening');

    // try to play background music (only works if a real file exists)
    if (bgm && bgm.src){
      bgm.play().then(() => {
        musicToggle.hidden = false;
        musicToggle.textContent = '♪';
      }).catch(() => {
        // autoplay blocked or no file — that's fine, just show a manual toggle
        musicToggle.hidden = false;
        musicToggle.textContent = '♪';
      });
    }

    setTimeout(() => {
      cover.classList.add('is-hidden');
      invite.hidden = false;
      document.body.style.overflow = '';
    }, 750);
  }

  seal.addEventListener('click', openInvitation);
  openBtn.addEventListener('click', openInvitation);

  musicToggle.addEventListener('click', () => {
    if (!bgm) return;
    if (bgm.paused){
      bgm.play().catch(() => {});
      musicToggle.textContent = '♪';
    } else {
      bgm.pause();
      musicToggle.textContent = '⏸';
    }
  });

  document.body.style.overflow = 'hidden';
})();

/* ==========================================================
   3) COUNTDOWNS (works for any element with .countdown[data-target])
   ========================================================== */
(function initCountdowns(){
  const blocks = document.querySelectorAll('.countdown[data-target]');
  if (!blocks.length) return;

  function tick(){
    blocks.forEach(block => {
      const target = new Date(block.dataset.target).getTime();
      const now = Date.now();
      let diff = target - now;

      if (isNaN(target)) return;

      if (diff < 0) diff = 0;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const set = (unit, value) => {
        const el = block.querySelector(`[data-unit="${unit}"]`);
        if (el) el.textContent = String(value).padStart(2, '0');
      };
      set('days', days);
      set('hours', hours);
      set('minutes', minutes);
      set('seconds', seconds);
    });
  }

  tick();
  setInterval(tick, 1000);
})();

/* ==========================================================
   4) GUESTBOOK — submits to a Google Form so messages persist
   ----------------------------------------------------------
   HOW TO CONNECT YOUR OWN GOOGLE FORM (do this once):

   1. Go to forms.google.com → create a new form with two
      short-answer questions, e.g. "الاسم" and "رسالتك".
   2. Click the three-dot menu → "Get pre-filled link".
   3. Fill in dummy answers (e.g. "test" / "test") and click
      "Get link". Copy the long URL you're given.
   4. That URL looks like:
      https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.111111=test&entry.222222=test
      - FORM_ID is the long string after /d/e/
      - entry.111111 is the field ID for your first question
      - entry.222222 is the field ID for your second question
   5. Paste those three values into GOOGLE_FORM below.
   6. Open your Google Form → Responses tab → click the green
      Sheets icon to see every submission in a spreadsheet,
      viewable any time, from any device.

   Until you fill this in, submissions are only shown on the
   page for the current visitor (nothing is lost, but nothing
   is saved anywhere else either).
   ========================================================== */
const GOOGLE_FORM = {
  formId: 'PASTE_YOUR_FORM_ID_HERE',       // from step 4 above
  nameEntry: 'entry.111111',               // field ID for the name question
  messageEntry: 'entry.222222'             // field ID for the message question
};

(function initGuestbook(){
  const form = document.getElementById('guestForm');
  const list = document.getElementById('guestList');
  const statusEl = document.getElementById('guestStatus');
  if (!form) return;

  const messages = [];
  const isConfigured = GOOGLE_FORM.formId && GOOGLE_FORM.formId !== 'PASTE_YOUR_FORM_ID_HERE';

  function render(){
    list.innerHTML = messages
      .map(m => `<li><b>${escapeHtml(m.name)}</b><br>${escapeHtml(m.msg)}</li>`)
      .join('');
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showStatus(text, isError){
    statusEl.hidden = false;
    statusEl.textContent = text;
    statusEl.classList.toggle('is-error', !!isError);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('guestName').value.trim();
    const msg = document.getElementById('guestMsg').value.trim();
    if (!name || !msg) return;

    const submitBtn = form.querySelector('button');
    submitBtn.disabled = true;

    if (!isConfigured){
      showStatus('لم يتم ربط النموذج بعد بـ Google Form — راجع التعليمات في script.js لتفعيل الحفظ الدائم.', true);
      messages.unshift({ name, msg });
      render();
      form.reset();
      submitBtn.disabled = false;
      return;
    }

    const body = new URLSearchParams();
    body.append(GOOGLE_FORM.nameEntry, name);
    body.append(GOOGLE_FORM.messageEntry, msg);

    const submitUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM.formId}/formResponse`;

    // Google Forms doesn't allow reading the response (CORS), so we submit
    // with no-cors and trust it went through — this is the standard pattern
    // for posting to Google Forms from a static site.
    fetch(submitUrl, { method: 'POST', mode: 'no-cors', body })
      .then(() => {
        showStatus('تم إرسال رسالتك، شكرًا لكم 💚');
        messages.unshift({ name, msg });
        render();
        form.reset();
      })
      .catch(() => {
        showStatus('حدث خطأ أثناء الإرسال، حاول مرة أخرى.', true);
      })
      .finally(() => {
        submitBtn.disabled = false;
      });
  });
})();
