# نشر TaskFlow — Render + Vercel

## نظرة عامة

| المنصة | المكوّن |
|--------|---------|
| **Render** (مشروع Blueprint واحد) | PostgreSQL، Redis، API (Web)، Worker (إشعارات BullMQ) |
| **Vercel** | واجهة Next.js |

ملف `render.yaml` في الجذر ينشئ كل خدمات الباك‌اند دفعة واحدة عند تطبيق الـ Blueprint.

---

## 1) Render — أمر واحد (Blueprint)

### المتطلبات

- حساب [Render](https://render.com)
- المستودع على GitHub/GitLab

### الخطوات

1. ارفع المشروع إلى Git.
2. في Render: **New → Blueprint**.
3. اربط المستودع واختر الفرع.
4. Render يقرأ `render.yaml` وينشئ:
   - `taskflow-db` — PostgreSQL
   - `taskflow-redis` — Redis (مهم: `noeviction` لـ BullMQ)
   - `taskflow-api` — Web Service
   - `taskflow-worker` — Background Worker
5. عند أول نشر، عيّن متغير **`CORS_ORIGIN`** لخدمة `taskflow-api`:
   - مثال: `https://your-app.vercel.app`
   - عدة نطاقات مفصولة بفاصلة: `https://app.vercel.app,http://localhost:3000`
6. عند كل نشر يُنشَأ تلقائياً:
   - **أدمن:** `admin@todo.app` / `Password123!`
   - **مستخدم تجريبي:** `demo@todo.app` / `Password123!` + مهام وإشعار ترحيب (مرة واحدة فقط)

   لتغيير كلمة مرور الأدمن في الإنتاج، عيّن `SEED_ADMIN_PASSWORD` في Render قبل إعادة النشر.

7. تحقق من الصحة: `https://taskflow-api.onrender.com/health`

> **ملاحظة:** خطة Worker على Render غالباً تحتاج **Starter** (غير مجانية). الـ API وقاعدة البيانات يمكن أن تبقى على الخطة المجانية.

### أوامر البناء المحلية (نفس ما يشغّله Render)

```bash
cd backend
npm ci
npm run render:build   # prisma migrate deploy + build
npm run render:start   # API
npm run worker:prod    # Worker في طرفية ثانية
```

---

## 2) Vercel — الواجهة

1. [vercel.com](https://vercel.com) → **Add New Project** → اربط نفس المستودع.
2. **Root Directory:** `frontend`
3. متغيرات البيئة:

| المتغير | القيمة |
|---------|--------|
| `NEXT_PUBLIC_API_URL` | `https://taskflow-api.onrender.com/api/v1` |

(استبدل `taskflow-api` باسم خدمتك الفعلي على Render.)

4. **Deploy**.

5. انسخ رابط Vercel النهائي وأضفه في Render → `taskflow-api` → **Environment** → `CORS_ORIGIN` → **Manual Deploy** لإعادة تشغيل الـ API.

---

## 3) متغيرات البيئة

### Backend (Render — تُضبط تلقائياً من Blueprint)

| المتغير | المصدر |
|---------|--------|
| `DATABASE_URL` | قاعدة PostgreSQL |
| `REDIS_URL` | Redis |
| `JWT_ACCESS_SECRET` | يُولَّد تلقائياً |
| `JWT_REFRESH_SECRET` | يُولَّد تلقائياً |
| `CORS_ORIGIN` | **يدوياً** — رابط Vercel |
| `SEED_ADMIN_EMAIL` | `admin@todo.app` (افتراضي من Blueprint) |
| `SEED_DEMO_EMAIL` | `demo@todo.app` |
| `SEED_ADMIN_PASSWORD` | اختياري — إن وُجد يُحدَّث كلمة مرور الأدمن عند النشر |

### Frontend (Vercel)

| المتغير | مثال |
|---------|------|
| `NEXT_PUBLIC_API_URL` | `https://xxx.onrender.com/api/v1` |

---

## 4) استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| CORS من المتصفح | تأكد أن `CORS_ORIGIN` يطابق رابط Vercel بالضبط (مع `https://`) |
| الإشعارات لا تُجدول | تأكد أن `taskflow-worker` يعمل وليس متوقفاً |
| فشل migrate | راجع سجلات البناء؛ تأكد من وجود `prisma/migrations` في Git |
| Redis/BullMQ | لا تغيّر `maxmemoryPolicy` عن `noeviction` |

---

## 5) بديل: API + Worker في خدمة واحدة

إذا لم ترد خطة Worker منفصلة، يمكن تشغيل الاثنين معاً (غير موصى به للإنتاج):

في `render.yaml` احذف خدمة `worker` وغيّر `startCommand` للـ API إلى:

```yaml
startCommand: npm run start:all
```

وفي `backend/package.json` يوجد السكربت `start:all` (يتطلب `concurrently`).
