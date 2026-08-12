/* ==========================================================
   CONFIG — عدّل هذا القسم بالتفاصيل الحقيقية
   ========================================================== */
const CONFIG = {
  // لتغيير الأسماء عدّل النص مباشرة في index.html
  // لتغيير التواريخ عدّل data-target في عنصري .countdown داخل index.html
};

/* ==========================================================
   1) PETALS BACKGROUND
   ========================================================== */
(function initPetals(){
  const layer = document.getElementById('petals');
  if (!layer) return;
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
   2) CLEAN COVER TRANSITION & AUDIO CONTROL
   ========================================================== */
(function initScene(){
  const cover       = document.getElementById('cover');
  const enterBtn    = document.getElementById('enterBtn');
  const invite      = document.getElementById('invite');
  const musicToggle = document.getElementById('musicToggle');
  const bgm         = document.getElementById('bgm');

  function tryMusic(){
    if (!bgm) return;
    bgm.play().then(() => {
      if (musicToggle) {
        musicToggle.hidden = false;
        musicToggle.textContent = '♪';
      }
    }).catch(() => {
      if (musicToggle) {
        musicToggle.hidden = false;
        musicToggle.textContent = '♪';
      }
    });
  }

  function enterInvitation(){
    tryMusic();
    if (cover) cover.classList.add('is-gone');
    if (invite) invite.hidden = false;
    document.body.style.overflow = '';
  }

  if (cover) {
    cover.addEventListener('click', enterInvitation);
  }

  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      enterInvitation();
    });
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      if (!bgm) return;
      if (bgm.paused){ 
        bgm.play().catch(()=>{}); 
        musicToggle.textContent = '♪'; 
      } else { 
        bgm.pause(); 
        musicToggle.textContent = '⏸'; 
      }
    });
  }
})();

/* ==========================================================
   3) COUNTDOWNS
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
      const minutes = Math.floor((diff / (1000 * 60 * 60)) % 60);
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
   4) GUESTBOOK (Firebase)
   ========================================================== */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAmgl3z_S2mq8uMgJw2q9dAri3c5YZ06gs',
  authDomain: 'ahmed-alaa-wedding.firebaseapp.com',
  projectId: 'ahmed-alaa-wedding',
  storageBucket: 'ahmed-alaa-wedding.firebasestorage.app',
  messagingSenderId: '959955759010',
  appId: '1:959955759010:web:3947660796bcc1365fccfb'
};

async function initGuestbook(){
  const form = document.getElementById('guestForm');
  const list = document.getElementById('guestList');
  const statusEl = document.getElementById('guestStatus');
  if (!form) return;

  const isConfigured = FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== 'PASTE_API_KEY';

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

  if (!isConfigured){
    const localMessages = [];
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('guestName').value.trim();
      const msg = document.getElementById('guestMsg').value.trim();
      if (!name || !msg) return;
      showStatus('لم يتم ربط الموقع بـ Firebase بعد — راجع التعليمات في script.js لتفعيل الحفظ المشترك.', true);
      localMessages.unshift({ name, msg });
      list.innerHTML = localMessages.map(m => `<li><b>${escapeHtml(m.name)}</b><br>${escapeHtml(m.msg)}</li>`).join('');
      form.reset();
    });
    return;
  }

  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
  const {
    getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp
  } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

  const app = initializeApp(FIREBASE_CONFIG);
  const db = getFirestore(app);
  const guestCol = collection(db, 'guestMessages');
  const guestQuery = query(guestCol, orderBy('createdAt', 'desc'), limit(100));

  onSnapshot(guestQuery, (snapshot) => {
    list.innerHTML = snapshot.docs
      .map(doc => {
        const m = doc.data();
        return `<li><b>${escapeHtml(m.name || '')}</b><br>${escapeHtml(m.message || '')}</li>`;
      })
      .join('');
  }, () => {
    showStatus('تعذّر تحميل الرسائل، تأكد من صحة إعدادات Firebase وقواعد الأمان.', true);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('guestName').value.trim();
    const msg = document.getElementById('guestMsg').value.trim();
    if (!name || !msg) return;

    const submitBtn = form.querySelector('button');
    submitBtn.disabled = true;

    try {
      await addDoc(guestCol, { name, message: msg, createdAt: serverTimestamp() });
      showStatus('تم إرسال رسالتك، شكرًا لكم 💚');
      form.reset();
    } catch (err) {
      showStatus('حدث خطأ أثناء الإرسال، حاول مرة أخرى.', true);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

initGuestbook();
