import { createClient } from '@supabase/supabase-js'

// مفاتيح عامة (publishable) آمنة للاستخدام في الواجهة — الوصول للبيانات محمي
// عبر دوال قاعدة البيانات التي تتطلب رمز المزامنة السري.
const SUPABASE_URL = 'https://qptaeyuqbtpcgtvbeshj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_gK9-hDqfocNrutsiJk37_w_kE34zLYU'

export const supa = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// مجموعة بيانات مشتركة واحدة: كل من يفتح الرابط يرى ويحدّث نفس البيانات.
export const SHARED_KEY = 'rweida-shared-9b7e2f4a1c8d6e30'

// مفتاح VAPID العام (آمن للنشر) — يُستخدم للاشتراك في الدفع.
export const VAPID_PUBLIC = 'BPHIn_6ARUJhuquRNWFJIP3oiTQ2vNZxONHks4Lhg97iHG8JoOiXD29NhNoPh0xWkD6ekWJmtWRs3RMsiW-QYqE'

// تسجيل اشتراك الدفع في الخادم.
export async function pushSubscribe(key, identity, sub) {
  try {
    const { error } = await supa.rpc('push_subscribe', { p_key: key, p_identity: identity || '', p_endpoint: sub.endpoint, p_p256dh: sub.p256dh, p_auth: sub.auth })
    return !error
  } catch (e) { return false }
}

// رسائل مخصّصة يكتبها المستخدم — تُرسل بعدد مرات خلال عدد أيام.
export async function addCustomMessage(key, text, times, days, target, mode, atHour) {
  try { const { error } = await supa.rpc('add_custom_message', { p_key: key, p_text: text, p_times: times, p_days: days, p_target: target, p_mode: mode || 'spread', p_at_hour: (atHour === null || atHour === undefined) ? null : atHour }); return !error } catch (e) { return false }
}
export async function listCustomMessages(key) {
  try { const { data, error } = await supa.rpc('list_custom_messages', { p_key: key }); return error ? [] : (data || []) } catch (e) { return [] }
}
export async function deleteCustomMessage(key, id) {
  try { const { error } = await supa.rpc('delete_custom_message', { p_key: key, p_id: id }); return !error } catch (e) { return false }
}
// إرسال فوري (الآن) عبر دالة الخادم.
export async function sendNow(key, text, target) {
  try { const { error } = await supa.functions.invoke('send-now', { body: { key, text, target } }); return !error } catch (e) { return false }
}

// تحميل بيانات رمز المزامنة من السحابة (أو null إن لم توجد / عند الخطأ).
export async function cloudLoad(key) {
  try {
    const { data, error } = await supa.rpc('tracker_load', { p_key: key })
    if (error) return null
    return data || null
  } catch (e) { return null }
}

// حفظ كامل البيانات في السحابة تحت رمز المزامنة. يُرجع true عند النجاح.
export async function cloudSave(key, data) {
  try {
    const { error } = await supa.rpc('tracker_save', { p_key: key, p_data: data })
    return !error
  } catch (e) { return false }
}
