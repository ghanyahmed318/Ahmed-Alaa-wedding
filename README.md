# دعوة زفاف — سارة و يوسف (قالب)

قالب دعوة زفاف عربي (RTL) بتصميم رومانسي وردي، جاهز للنشر مجانًا على GitHub Pages.

## المميزات
- شاشة افتتاحية بختم زهري متحرك (اضغط لفتح الدعوة)
- بتلات وردية متساقطة في الخلفية
- قسم "حكايتنا" (تايم لاين)
- عدّادان تنازليان (ليلة الحنة + يوم الزفاف)
- بطاقات تفاصيل لكل مناسبة (تاريخ، وقت، مكان، رابط خريطة)
- معرض صور (Placeholders جاهزة لاستبدالها بصورك)
- دفتر ضيوف لترك رسائل (يعمل محليًا أثناء الزيارة فقط، راجع القسم أدناه لجعله دائمًا)
- زر تأكيد حضور (RSVP) قابل لربطه بأي فورم
- زر موسيقى خلفية اختياري
- متجاوب بالكامل مع الجوال

## التخصيص السريع

| العنصر | مكانه |
|---|---|
| أسماء العروسين | `index.html` — ابحث عن `سارة` و `يوسف` واستبدلهما |
| تواريخ العدّادين | `index.html` — خاصية `data-target` داخل `.countdown` (مثال: `2026-08-20T20:00:00`) |
| تفاصيل المكان والوقت | `index.html` — داخل `.detail-card` |
| روابط الخرائط | `index.html` — استبدل `href="#"` في `.map-link` برابط Google Maps |
| رابط تأكيد الحضور | `index.html` — استبدل `href="#"` في `.rsvp-btn` برابط Google Form |
| الألوان | `style.css` — أعلى الملف داخل `:root` |
| الصور | ضع الصور في `assets/images/` واستبدل `.gallery-item.ph` في `index.html` بعناصر `<img>` |
| الموسيقى | ضع ملف mp3 في `assets/audio/music.mp3` (نفس الاسم الموجود في `index.html`) |

## ربط دفتر الضيوف بـ Firebase (رسائل مباشرة يراها كل الزوار)
دفتر الضيوف مبني على Firebase Firestore، بحيث تظهر كل رسالة فورًا لأي شخص يزور الموقع — وتبقى محفوظة دائمًا. الخطوات (مجانية، حوالي ٥ دقائق):

1. افتحوا **console.firebase.google.com** → **Add project** → اختاروا أي اسم (مثلاً `sara-youssef-wedding`) → إنشاء.
2. داخل المشروع اضغطوا أيقونة **"</>"** (Web) لتسجيل تطبيق ويب. أعطوه اسمًا، لا حاجة لتفعيل Hosting.
3. سيظهر لكم كائن `firebaseConfig` يحتوي على `apiKey` و`authDomain` و`projectId` وغيرها — انسخوا هذه القيم إلى `FIREBASE_CONFIG` في أعلى قسم GUESTBOOK داخل `script.js`.
4. من القائمة الجانبية: **Build → Firestore Database → Create database** → اختاروا **production mode** → اختاروا أقرب منطقة جغرافية لضيوفكم.
5. من تبويب **Rules** داخل Firestore، الصقوا القواعد التالية ثم اضغطوا **Publish**:

   ```
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
   ```

   هذه القواعد تسمح للجميع بقراءة الرسائل وإضافة رسالة جديدة فقط (بحد أقصى للطول)، ولا تسمح بتعديل أو حذف رسائل الآخرين.

6. ارفعوا `script.js` المُحدَّث إلى GitHub — بمجرد نشر الموقع، ستظهر كل رسالة جديدة فورًا لجميع الزوار، ويمكنكم مراجعة كل الرسائل في أي وقت من **Firestore Database** داخل console Firebase.

**ملاحظة أمان:** لأن القواعد تسمح بالكتابة للجميع بدون تسجيل دخول (لتبسيط الأمر على الضيوف)، قد يتمكن أي شخص يعرف رابط الموقع من إرسال رسائل غير مرغوبة. القيود أعلاه (طول الاسم والرسالة) تقلل من إساءة الاستخدام البسيطة، لكن للمزيد من الحماية يمكن لاحقًا إضافة Firebase App Check أو حد لعدد الطلبات.

**تنبيه:** يجب زيارة الموقع عبر رابط GitHub Pages (https)، وليس بفتح `index.html` مباشرة من جهازكم — وحدات ES Modules (وبالتالي Firebase) لا تعمل عند الفتح المباشر للملف.

## النشر على GitHub Pages
1. أنشئ مستودع (Repository) جديد على GitHub.
2. ارفع كل الملفات (`index.html`, `style.css`, `script.js`, ومجلد `assets`).
3. اذهب إلى **Settings → Pages**.
4. اختر الفرع `main` والمجلد `/root`.
5. بعد دقيقة تقريبًا سيكون موقعك متاحًا على:
   `https://username.github.io/repository-name/`

لا حاجة لأي استضافة إضافية — الموقع بالكامل ثابت (Static) ويعمل مجانًا.
