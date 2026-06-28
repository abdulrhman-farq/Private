// أوقات الصلاة لمدينة الرياض — طريقة أم القرى (الرسمية في السعودية)
// حساب فلكي محلي بالكامل (يعمل دون اتصال). مبني على خوارزمية PrayTimes.
const LAT = 24.7136, LNG = 46.6753, TZ = 3
const FAJR_ANGLE = 18.5     // زاوية الفجر — أم القرى
const ISHA_GAP = 120        // العشاء بعد المغرب بـ120 دقيقة (مطابق لتقويم الرياض)

const dsin = d => Math.sin((d * Math.PI) / 180)
const dcos = d => Math.cos((d * Math.PI) / 180)
const dtan = d => Math.tan((d * Math.PI) / 180)
const darcsin = x => (Math.asin(x) * 180) / Math.PI
const darccos = x => (Math.acos(x) * 180) / Math.PI
const darccot = x => (Math.atan(1 / x) * 180) / Math.PI
const darctan2 = (y, x) => (Math.atan2(y, x) * 180) / Math.PI
const fixAngle = a => { a = a % 360; return a < 0 ? a + 360 : a }
const fixHour = h => { h = h % 24; return h < 0 ? h + 24 : h }

function julian(y, m, d) {
  if (m <= 2) { y -= 1; m += 12 }
  const A = Math.floor(y / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5
}

function sunPosition(jd) {
  const D = jd - 2451545.0
  const g = fixAngle(357.529 + 0.98560028 * D)
  const q = fixAngle(280.459 + 0.98564736 * D)
  const L = fixAngle(q + 1.915 * dsin(g) + 0.02 * dsin(2 * g))
  const e = 23.439 - 0.00000036 * D
  const decl = darcsin(dsin(e) * dsin(L))
  const RA = fixHour(darctan2(dcos(e) * dsin(L), dcos(L)) / 15)
  const eqt = q / 15 - RA
  return { decl, eqt }
}

// يُرجع أوقات الصلاة بالدقائق من منتصف الليل (بتوقيت الرياض).
export function prayerMinutes(date) {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate()
  const jDate = julian(y, m, d) - LNG / (15 * 24)

  const midDay = t => { const { eqt } = sunPosition(jDate + t); return fixHour(12 - eqt) }
  const sunAngle = (t, angle, ccw) => {
    const { decl } = sunPosition(jDate + t)
    const noon = midDay(t)
    const term = (-dsin(angle) - dsin(decl) * dsin(LAT)) / (dcos(decl) * dcos(LAT))
    const T = darccos(term) / 15
    return noon + (ccw ? -T : T)
  }
  const asrAngleTime = t => {
    const { decl } = sunPosition(jDate + t)
    const angle = -darccot(1 + dtan(Math.abs(LAT - decl)))
    return sunAngle(t, angle, false)
  }

  // تمريرتان لتحسين الدقة
  let fajr = 5 / 24, sunrise = 6 / 24, dhuhr = 12 / 24, asr = 13 / 24, sunset = 18 / 24
  for (let i = 0; i < 2; i++) {
    fajr = sunAngle(fajr, FAJR_ANGLE, true) / 24
    sunrise = sunAngle(sunrise, 0.833, true) / 24
    dhuhr = midDay(dhuhr) / 24
    asr = asrAngleTime(asr) / 24
    sunset = sunAngle(sunset, 0.833, false) / 24
  }
  const adj = t => fixHour(t * 24 + TZ - LNG / 15)
  const maghrib = adj(sunset)
  const isha = fixHour(maghrib + ISHA_GAP / 60)
  const toMin = h => Math.round(h * 60)
  return {
    fajr: toMin(adj(fajr)), sunrise: toMin(adj(sunrise)), dhuhr: toMin(adj(dhuhr)),
    asr: toMin(adj(asr)), maghrib: toMin(maghrib), isha: toMin(isha),
  }
}

export const PRAYER_NAMES = {
  fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
}
export const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

export function fmtMin(min) {
  let h = Math.floor(min / 60), m = min % 60
  const am = h < 12
  let hh = h % 12; if (hh === 0) hh = 12
  return hh + ':' + String(m).padStart(2, '0') + ' ' + (am ? 'ص' : 'م')
}

// الوقت الحالي بالرياض بالدقائق من منتصف الليل.
export function riyadhNowMin(now) {
  now = now || new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const r = new Date(utc + TZ * 3600000)
  return r.getHours() * 60 + r.getMinutes()
}

// الصلاة القادمة وكم تبقّى لها (بالدقائق) — يتخطّى الشروق (ليس صلاة).
export function nextPrayer(date, now) {
  const t = prayerMinutes(date)
  const cur = riyadhNowMin(now)
  const list = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  for (const k of list) { if (t[k] > cur) return { key: k, name: PRAYER_NAMES[k], at: t[k], inMin: t[k] - cur } }
  // بعد العشاء: القادمة فجر الغد
  const tmr = prayerMinutes(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1))
  return { key: 'fajr', name: PRAYER_NAMES.fajr, at: tmr.fajr, inMin: 1440 - cur + tmr.fajr }
}
