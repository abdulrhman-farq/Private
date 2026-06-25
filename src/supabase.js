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
