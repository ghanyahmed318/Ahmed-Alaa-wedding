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
   4) GUESTBOOK
   ----------------------------------------------------------
   حاليًا الرسائل تُحفظ في الذاكرة فقط أثناء الزيارة (تختفي عند
   إعادة تحميل الصفحة). لجعلها دائمة ومرئية لكل الزوار اربطها
   بخدمة خارجية مجانية، مثلا:

   - Google Form  → أرسل بيانات الفورم عبر action الخاص به
   - Formspree    → https://formspree.io  (فورم جاهز بدون سيرفر)
   - Firebase / Supabase → لتخزين وعرض الرسائل لحظيًا للجميع

   مثال بسيط لإرسال البيانات إلى Formspree بدلاً من الحفظ المحلي:

   fetch('https://formspree.io/f/xxxxxxx', {
     method: 'POST',
     headers: { 'Accept': 'application/json' },
     body: formData
   });
   ========================================================== */
(function initGuestbook(){
  const form = document.getElementById('guestForm');
  const list = document.getElementById('guestList');
  if (!form) return;

  const messages = [];

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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('guestName').value.trim();
    const msg = document.getElementById('guestMsg').value.trim();
    if (!name || !msg) return;

    messages.unshift({ name, msg });
    render();
    form.reset();
  });
})();
