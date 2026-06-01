# نشر TaskFlow — Render (Docker) + Vercel

## النشر الموصى به (مجاني — بدون Blueprint)

صورة Docker واحدة (`Dockerfile.render`) تضم:

- PostgreSQL
- Redis
- API
- Worker (إشعارات BullMQ)

على Render تحتاج **متغيراً واحداً فقط**:

| المتغير | القيمة |
|---------|--------|
| `CORS_ORIGIN` | رابط Vercel، مثال: `https://your-app.vercel.app` |

`DATABASE_URL` و`REDIS_URL` و`JWT_*` تُضبط تلقائياً داخل الحاوية.

---

## 1) Render — Web Service (Docker)

### الخطوات

1. ارفع المشروع إلى GitHub/GitLab.
2. Render → **New → Web Service** (وليس Blueprint).
3. اربط المستودع.
4. **Environment:** `Docker`
5. **Root Directory:** اتركه **فارغاً** (مهم جداً)
6. **Dockerfile Path:** `Dockerfile.render` (في جذر المستودع، ليس داخل `backend`)
7. **Docker Context:** `.` (جذر المستودع)

> إذا وضعت Root Directory = `backend` سيُستخدم `backend/Dockerfile.render` بينما السياق يبقى جذر المستودع فيفشل البناء بـ `package.json not found`.
7. أضف متغير البيئة:
   - `CORS_ORIGIN` = `https://your-app.vercel.app`
8. **Create Web Service** → انتظر البناء.

أو عبر `render.yaml` (خدمة Docker واحدة — لا يتطلب Blueprint مدفوع):

```yaml
# موجود في render.yaml — New → Blueprint يعمل أيضاً لخدمة واحدة
```

9. بعد النشر: `https://<service-name>.onrender.com/health`

### بيانات الدخول (تُنشأ تلقائياً عند أول تشغيل)

| الحساب | البريد | كلمة المرور |
|--------|--------|-------------|
| أدمن | `admin@todo.app` | `Password123!` |
| تجريبي | `demo@todo.app` | `Password123!` |

### اختبار محلي للصورة

```bash
docker build -f Dockerfile.render -t taskflow-render .
docker run --rm -p 4000:4000 -e CORS_ORIGIN=http://localhost:3000 taskflow-render
```

### إذا فشل البناء: `backend/package.json not found`

غالباً مجلد `backend` غير مرفوع إلى GitHub (مستودع Git متداخل). من جذر المشروع:

```bash
# احذف .git الداخلي إن وُجد
rm -rf backend/.git frontend/.git
git add backend frontend
git commit -m "Include backend and frontend in monorepo"
git push
```

### تحذير مهم (الخطة المجانية)

على Render المجاني، **قرص الحاوية مؤقت**: عند إعادة النشر أو إيقاف الخدمة قد تُفقد بيانات PostgreSQL داخل Docker. للإنتاج الجاد استخدم:

- قرصاً دائماً (Paid Disk) على Render، أو
- `render.blueprint.yaml` مع PostgreSQL مُدار من Render

---

## 2) Vercel — الواجهة

1. [vercel.com](https://vercel.com) → **Add New Project**
2. **Root Directory:** `frontend`
3. متغير البيئة:

| المتغير | القيمة |
|---------|--------|
| `NEXT_PUBLIC_API_URL` | `https://<اسم-خدمة-render>.onrender.com/api/v1` |

4. انشر، ثم ضع رابط Vercel في Render → `CORS_ORIGIN` → **Manual Deploy**.

---

## 3) متغيرات اختيارية (Docker)

| المتغير | الوصف |
|---------|--------|
| `CORS_ORIGIN` | **مطلوب** — رابط الواجهة |
| `JWT_ACCESS_SECRET` | اختياري — يُولَّد تلقائياً إن تُرك فارغاً |
| `JWT_REFRESH_SECRET` | اختياري — يُولَّد تلقائياً |
| `SEED_ADMIN_PASSWORD` | اختياري — كلمة مرور أدمن مخصصة عند النشر |

> إذا لم تُثبَّت `JWT_*` يدوياً، تتغير عند كل إعادة تشغيل كاملة للحاوية (تسجيل الخروج للجميع).

---

## 4) بديل: Blueprint متعدد الخدمات

ملف `render.blueprint.yaml` (اختياري):

- PostgreSQL + Redis + API + Worker منفصل
- Worker يحتاج خطة **Starter** مدفوعة

---

## 5) استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| CORS | `CORS_ORIGIN` يطابق رابط Vercel بالضبط (`https://`) |
| الحاوية لا تبدأ | راجع Logs — غالباً `CORS_ORIGIN` غير معرّف |
| فقدان البيانات بعد النشر | طبيعي على القرص المؤقت؛ فعّل Disk أو استخدم DB مُدار |
| الإشعارات لا تعمل | تأكد أن الحاوية تعمل (Worker داخل نفس الصورة) |

---

## 6) التطوير المحلي (docker compose)

```bash
docker compose up -d postgres redis
cd backend && npm run dev
npm run worker   # طرفية ثانية
cd frontend && npm run dev
```
