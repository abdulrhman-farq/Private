# 📱 دليل تحويل «أيام تبويض رويدا» إلى تطبيق آيفون خاص

هذا الدليل يحوّل موقعكم الحالي إلى تطبيق آيفون أصلي **للتوزيع الخاص** (TestFlight داخلي / Ad Hoc) — يُثبَّت على أجهزتكم فقط، بلا نشر عام ولا مراجعة من أبل.

> التغليف يتم عبر **Capacitor** (مُعدّ ومهيّأ في المشروع). كل الخطوات التالية تُنفَّذ على **جهاز Mac**.

---

## ١) المتطلبات (مرّة واحدة)
- جهاز **Mac** فيه **Xcode** (من App Store، مجاني).
- **CocoaPods**: `sudo gem install cocoapods`
- **حساب Apple Developer** — $99/سنة (ضروري لـ TestFlight/Ad Hoc).
- **Node.js** (نفس بيئة المشروع).

---

## ٢) التجهيز (على الـ Mac)
```bash
git clone <رابط المستودع>
cd Private
npm install
npm run ios:add        # يبني الويب ويولّد مشروع iOS الأصلي في مجلد ios/
```
> إذا موجود مجلد `ios/` مسبقًا، استخدم `npm run ios:sync` بدل `ios:add`.

---

## ٣) الفتح في Xcode والتوقيع
```bash
npm run ios:open       # يفتح المشروع في Xcode
```
داخل Xcode:
1. اختر **App** في الشريط الجانبي ← تبويب **Signing & Capabilities**.
2. **Team**: اختر حسابك (Apple Developer).
3. **Bundle Identifier**: `sa.farq.rweida` (مضبوط مسبقًا — غيّره إن أردت).
4. **اسم العرض العربي على الشاشة الرئيسية**: افتح `App/Info.plist` وأضف مفتاح
   `CFBundleDisplayName` = `أيام رويدا` (أو أي اسم عربي تحبّه).

---

## ٤) الأيقونة وشاشة البداية
- الأيقونة الحالية موجودة في `public/icon-512.png`.
- في Xcode: `App/Assets.xcassets ← AppIcon` واسحب صورة ١٠٢٤×١٠٢٤.
- (اختياري) اضبط لون شاشة البداية — مضبوط على `#F7F3F1` في `capacitor.config.json`.

---

## ٥) التجربة على جهازك
- وصّل الآيفون بالـ Mac، اختر جهازك أعلى Xcode، واضغط **▶ Run**.
- أول مرة: من الآيفون **الإعدادات ← عام ← VPN وإدارة الجهاز** ← وثّق شهادة المطوّر.

---

## ٦) التوزيع الخاص (اختر واحدًا)

### أ) TestFlight داخلي (الأسهل — بلا مراجعة أبل) ✅ موصى به
1. في Xcode: **Product ← Archive**.
2. **Distribute App ← App Store Connect ← Upload**.
3. في [App Store Connect](https://appstoreconnect.apple.com): أنشئ التطبيق، ثم **TestFlight ← Internal Testing**، أضِف بريدكم كمُختبِرين داخليين (حتى ١٠٠).
4. حمّلوا تطبيق **TestFlight** من App Store وثبّتوا منه. تحديثات فورية بلا مراجعة.

### ب) Ad Hoc (تثبيت مباشر على أجهزة محدّدة)
- سجّل **UDID** أجهزتكم في حساب المطوّر، ثم **Archive ← Distribute ← Ad Hoc** وثبّت ملف `.ipa`.

---

## ٧) تحديث التطبيق بعد أي تعديل على الموقع
كل ما عدّلنا الموقع (Vercel يتحدّث تلقائيًا)، حدّث النسخة الأصلية بأمر واحد:
```bash
npm run ios:sync
```
ثم Archive ورفع جديد لـ TestFlight.

---

## ⚠️ ملاحظة مهمّة عن الإشعارات
إشعارات الويب الحالية (Web Push) **لا تعمل داخل تطبيق Capacitor** على iOS (قيود أبل على WKWebView). لتشغيل الإشعارات داخل التطبيق الأصلي نضيف لاحقًا:
- `@capacitor/local-notifications` (تذكيرات مجدولة محليًا — تكفي للصلاة والأذكار)، أو
- `@capacitor/push-notifications` (APNs — للرسائل بين الزوجين).

قل لي وأضيفها ونربطها بمنطق الصلاة/الدورة الحالي.

---

## ملخّص سريع
| الخطوة | الأمر / المكان |
|---|---|
| توليد مشروع iOS | `npm run ios:add` |
| فتح Xcode | `npm run ios:open` |
| تحديث بعد تعديل الموقع | `npm run ios:sync` |
| التوزيع | Xcode ← Archive ← TestFlight داخلي |

*مُعدّ للتوزيع الخاص — لا نشر عام ولا تعرّض لمحتواكم الخاص.*
