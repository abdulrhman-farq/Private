# أيام تبويض رويدا 🤍

تطبيق ويب (PWA) لمتابعة الدورة الشهرية وأيام التبويض ونافذة الخصوبة وتنظيم خطة الحمل — بواجهة عربية كاملة من اليمين إلى اليسار. تُحفظ البيانات محليًا على الجهاز، وتُزامَن أيضًا عبر السحابة (Supabase) بين الأجهزة المشتركة في نفس رمز المزامنة، لتظهر تعديلات أي طرف لدى الآخر.

A cycle & ovulation tracking Progressive Web App (Arabic, RTL). Data is stored locally **and** synced to the cloud (Supabase) so paired devices on the same sync key share the same data. Sync uses item-level merge to avoid overwriting the other device's changes.

## المزايا / Features

- **الرئيسية** — حلقة اليوم من الدورة، المرحلة الحالية واحتمالية الحمل، عدّ تنازلي للتبويض/الخصوبة/الدورة القادمة، أفضل أيام الجماع، ونصيحة يومية.
- **التقويم** — عرض شهري ملوّن لمراحل الدورة مع علامات للأيام المسجّلة (جماع، اختبار LH، سجلات أخرى) وملخص لكل يوم.
- **تسجيل اليوم** — الجماع، اختبار التبويض، درجة الحرارة الأساسية (BBT)، تدفّق الدورة، المزاج، الأعراض، والملاحظات.
- **الإحصائيات** — متوسط طول الدورة وانتظامها، أطوال الدورات السابقة، مرات الجماع ضمن نافذة الخصوبة، خط زمني لاختبارات التبويض، ومنحنى درجة الحرارة.
- **الإعدادات** — تاريخ آخر دورة، طول الدورة وأيامها، التذكيرات، والوضع الفاتح/الداكن.
- **PWA** — قابل للتثبيت ويعمل دون اتصال بعد أول تشغيل (Service Worker).

## التقنيات / Stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/)
- خطوط: IBM Plex Sans Arabic و Reem Kufi
- تخزين محلي عبر `localStorage` (المفتاح `rweida_v1`) + مزامنة سحابية عبر Supabase (دمج على مستوى العنصر)

## التشغيل / Development

```bash
npm install
npm run dev      # خادم التطوير
npm run build    # بناء الإنتاج إلى dist/
npm run preview  # معاينة بناء الإنتاج
```

## ملاحظة طبية / Disclaimer

هذا التطبيق أداة مساعدة للتخطيط ولا يُغني عن استشارة الطبيب المختص.
This app is a planning aid and is not a substitute for professional medical advice.
