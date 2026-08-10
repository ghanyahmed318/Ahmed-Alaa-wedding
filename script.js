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
(function initScene(){
  const scene      = document.getElementById('scene');
  const doors      = document.getElementById('doors');
  const coupleWrap = document.getElementById('coupleWrap');
  const introNames = document.getElementById('introNames');
  const enterBtn   = document.getElementById('enterBtn');
  const invite     = document.getElementById('invite');
  const musicToggle= document.getElementById('musicToggle');
  const bgm        = document.getElementById('bgm');

  document.body.style.overflow = 'hidden';

  function tryMusic(){
    if (!bgm) return;
    bgm.play().then(() => {
      musicToggle.hidden = false;
      musicToggle.textContent = '♪';
    }).catch(() => {
      musicToggle.hidden = false;
      musicToggle.textContent = '♪';
    });
  }

  function enterInvitation(){
    tryMusic();
    scene.classList.add('is-gone');
    invite.hidden = false;
    document.body.style.overflow = '';
  }

  // tap anywhere on scene to skip to invitation immediately
  scene.addEventListener('click', () => {
    if (!introNames.classList.contains('show')) {
      // still in the cinematic — skip to the names step
      clearAllTimers();
      doors.classList.add('open');
      coupleWrap.classList.add('walk-in');
      setTimeout(() => introNames.classList.add('show'), 500);
    }
  });

  enterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    enterInvitation();
  });

  musicToggle.addEventListener('click', () => {
    if (!bgm) return;
    if (bgm.paused){ bgm.play().catch(()=>{}); musicToggle.textContent = '♪'; }
    else { bgm.pause(); musicToggle.textContent = '⏸'; }
  });

  // ---- cinematic timeline ----
  const timers = [];
  function later(fn, ms){ const t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearAllTimers(){ timers.forEach(clearTimeout); }

  // t=0: scene loads, light beam glows
  // t=1.4s: doors start swinging open
  later(() => doors.classList.add('open'), 1400);
  // t=2.8s: couple walks in through the open doors
  later(() => coupleWrap.classList.add('walk-in'), 2800);
  // t=4.8s: couple swaying, names fade in
  later(() => introNames.classList.add('show'), 4800);

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
   4) GUESTBOOK — real-time, shared by every visitor (Firebase)
   ----------------------------------------------------------
   HOW TO CONNECT YOUR OWN FIREBASE PROJECT (free, ~5 minutes):

   1. Go to https://console.firebase.google.com → "Add project"
      → name it anything (e.g. "sara-youssef-wedding") → create.
   2. Inside the project: click the "</>" (Web) icon to register
      a web app. Give it a nickname, no need for hosting.
   3. Firebase shows you a firebaseConfig object with apiKey,
      authDomain, projectId, etc. Copy those values into
      FIREBASE_CONFIG below.
   4. In the left sidebar go to Build → Firestore Database →
      "Create database" → start in production mode → pick any
      region close to your guests.
   5. Go to the "Rules" tab of Firestore and paste the rules
      below (also included in README.md), then click Publish:

      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /guestMessages/{message} {
            allow read: if true;
            allow create: if request.resource.data.name is string
                          && request.resource.data.name.size() < 60
                          && request.resource.data.message is string
                          && request.resource.data.message.size() < 500;
            allow update, delete: if false;
          }
        }
      }

   That's it — every message submitted on the live site will now
   appear instantly for every visitor, and be stored permanently
   in Firestore (viewable anytime in the Firebase console).

   Note: this only works when the page is served over https, like
   on GitHub Pages — opening index.html directly from your
   computer (file://) will not load Firebase.
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

  // Not configured yet: keep the form usable, but explain nothing is shared.
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

  // live-updates the list for every visitor as new messages arrive
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
