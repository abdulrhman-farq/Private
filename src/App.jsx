import React from 'react'
import { cloudLoad, cloudSave, pushSubscribe, addCustomMessage, listCustomMessages, deleteCustomMessage, sendNow, sendNudge, SHARED_KEY, VAPID_PUBLIC } from './supabase.js'
import { prayerMinutes, nextPrayer, fmtMin, PRAYER_NAMES, PRAYER_ORDER, riyadhNowMin } from './prayer.js'
import { MORNING, EVENING } from './athkar.js'
import { LETTER_MD, LETTER_TITLE } from './letter.js'
import { HM_HERO, HM_TIMELINE, HM_MEMORIES, HM_QUOTES, HM_PLACES, HM_ACTIVITIES, HM_INSIGHTS, HM_FUTURE, HM_FILTERS, HM_PHOTOS } from './honeymoon.js'
import { BOOK_COVER, BOOK_PAGES, BOOK_COVER_AR, BOOK_PAGES_AR } from './honeymoonbook.js'

// إصدار مخطّط البيانات الحالي. عند رفعه نُضيف دالة ترقية بدل مسح البيانات.
const DATA_VERSION = 6
const NOW = () => new Date().toISOString()
// معرّف ثابت لكل جهاز — يُستخدم في دمج البيانات وتتبّع مصدر التعديل.
const DEVICE_ID = (() => {
  try {
    let id = localStorage.getItem('rweida_device')
    if (!id) { id = 'd' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); localStorage.setItem('rweida_device', id) }
    return id
  } catch (e) { return 'd0' }
})()
const rid = (p) => p + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

// أيقونات SVG موحّدة (نمط Lucide) — ترث اللون من النص وتتناسق مع الثيم بدل الإيموجي.
const ICONS = {
  home: <><path d="m3 10.5 9-7 9 7" /><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" /></>,
  calendar: <><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></>,
  heart: <path d="M12 20s-7-4.6-9.2-9C1.4 7.9 3 4.5 6.3 4.5c2 0 3.1 1.2 3.7 2.1.6-.9 1.8-2.1 3.7-2.1 3.3 0 4.9 3.4 3.5 6.5C19 15.4 12 20 12 20Z" />,
  menu: <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>,
  'chevron-right': <polyline points="9 6 15 12 9 18" />,
  'chevron-left': <polyline points="15 6 9 12 15 18" />,
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  check: <polyline points="20 6 9 17 4 12" />,
  trash: <><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14" /></>,
  download: <><path d="M12 3v12" /><polyline points="7 10 12 15 17 10" /><path d="M5 21h14" /></>,
  upload: <><path d="M12 15V3" /><polyline points="7 8 12 3 17 8" /><path d="M5 21h14" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
  x: <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  sparkle: <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4Z" />,
}
function Icon({ name, className }) {
  return (
    <svg className={'icon' + (className ? ' ' + className : '')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name] || null}
    </svg>
  )
}

// رقم يتصاعد بسلاسة من قيمته السابقة إلى الهدف.
function CountUp({ value, className }) {
  const target = Number(value) || 0
  const [disp, setDisp] = React.useState(target)
  const prev = React.useRef(target)
  React.useEffect(() => {
    const from = prev.current, to = target
    if (from === to) { setDisp(to); return }
    let raf, start = null
    const step = (t) => {
      if (start === null) start = t
      const p = Math.min(1, (t - start) / 600)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisp(Math.round(from + (to - from) * eased))
      if (p < 1) raf = requestAnimationFrame(step); else prev.current = to
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return <span className={className}>{disp}</span>
}

// أيام تبويض رويدا — تطبيق متابعة الدورة والخصوبة.
// المزامنة تعتمد دمجًا على مستوى العنصر (لا استبدالًا كاملًا) لمنع فقدان البيانات بين جهازين.
export default class App extends React.Component {
  constructor(props) {
    super(props)
    const n = new Date()
    this.load()
    // مجموعة بيانات مشتركة: الجميع على نفس المفتاح => نفس البيانات للكل.
    this.syncKey = SHARED_KEY
    this.deviceId = DEVICE_ID
    this.identity = this.initIdentity()
    this.state = {
      screen: 'splash',
      calY: n.getFullYear(),
      calM: n.getMonth(),
      selISO: '',
      logISO: this.iso(n),
      saved: false,
      tick: 0,
      syncing: false,
      syncedAt: 0,
      syncError: false,
      toast: '',
      notifMsg: null,
      customs: [],
      cmText: '', cmTimes: 5, cmDays: 1, cmTarget: 'wife',
      cmMode: 'spread', cmWhen: 'now', cmHour: 9,
      occLabel: '', occDateV: '', apType: '', apDate: '', apNote: '',
      sheet: false,
      dayOpen: false,
      salTab: 'times', salAdj: false, dhText: '', dhCount: '',
      hmOpen: false, hmFilter: 'all', bookPage: 0, bookToc: false, hmPhoto: null, bookLang: 'ar',
      locked: false, pinInput: '',
      obStep: 0,
      resetModal: false, resetText: '', importPreview: null,
    }
    let pin = null; try { pin = localStorage.getItem('rweida_pin') } catch (e) {}
    if (pin) this.state.locked = true
    let onb = null; try { onb = localStorage.getItem('rweida_onboarded') } catch (e) {}
    if (!onb && !this.identity) this.state.obStep = 1
  }

  // هوية صاحب الجهاز: 👨 الزوج أو 👩 الزوجة — تُحفظ محليًا لكل جهاز.
  initIdentity() {
    let d = ''
    try { d = localStorage.getItem('rweida_identity') || '' } catch (e) {}
    return d
  }
  setIdentity(id) {
    this.identity = id
    try { localStorage.setItem('rweida_identity', id) } catch (e) {}
    this.hap(); this.setState({ tick: this.state.tick + 1 })
  }
  identityView(id) {
    const s = this.data.settings
    if (id === 'husband') return { emoji: '👨', name: s.husband || 'الزوج' }
    if (id === 'wife') return { emoji: '👩', name: s.wife || 'الزوجة' }
    return { emoji: '👤', name: 'جهاز' }
  }
  showToast(msg) {
    this.setState({ toast: msg })
    clearTimeout(this._toastT)
    this._toastT = setTimeout(() => this.setState({ toast: '' }), 4500)
  }
  // ---- الرسائل المخصّصة ----
  loadCustoms() { listCustomMessages(this.syncKey).then(rows => this.setState({ customs: rows })) }
  addCustoms() {
    const lines = (this.state.cmText || '').split('\n').map(s => s.trim()).filter(Boolean)
    if (!lines.length) { if (typeof alert === 'function') alert('اكتبي رسالة أولًا.'); return }
    const target = this.state.cmTarget || 'wife'
    const once = this.state.cmMode === 'once'
    const nowMode = once && this.state.cmWhen === 'now'
    const times = once ? 1 : Math.max(1, Math.min(200, parseInt(this.state.cmTimes) || 1))
    const days = once ? 1 : Math.max(1, Math.min(60, parseInt(this.state.cmDays) || 1))
    const atHour = (once && this.state.cmWhen === 'hour') ? Math.max(0, Math.min(23, parseInt(this.state.cmHour) || 0)) : null
    this.hap()
    const task = nowMode
      ? Promise.all(lines.map(t => sendNow(this.syncKey, t, target)))
      : Promise.all(lines.map(t => addCustomMessage(this.syncKey, t, times, days, target, this.state.cmMode, atHour)))
    task.then(() => {
      this.setState({ cmText: '' })
      this.showToast(nowMode ? '✅ أُرسلت الآن' : (atHour !== null ? '✅ ستُرسل عند الساعة ' + atHour : '✅ تمت الإضافة وستبدأ بالإرسال'))
      this.loadCustoms()
    })
  }
  delCustom(id) { this.hap(); deleteCustomMessage(this.syncKey, id).then(() => this.loadCustoms()) }
  nudgePartner() {
    const partner = this.identity === 'husband' ? 'wife' : 'husband'
    if (!this.identity) { this.go('us'); if (typeof alert === 'function') alert('اختاري صاحب الجهاز أولًا من «نحن».'); return }
    this.hap(); this.showToast('💗 أُرسلت نبضة شوق لـ ' + this.identityView(partner).name)
    sendNudge(this.syncKey, partner, 'hearts')
  }
  // ---- التسجيل السريع ----
  openSheet() { this.hap(); this.setState({ sheet: true, logISO: this.iso(new Date()), saved: false }) }
  closeSheet() { this.hap(); this.setState({ sheet: false }) }
  // ---- قفل PIN ----
  hasPin() { try { return !!localStorage.getItem('rweida_pin') } catch (e) { return false } }
  onPinKey(d) { let p = this.state.pinInput || ''; if (d === 'del') p = p.slice(0, -1); else if (p.length < 4) p += d; this.setState({ pinInput: p }); if (p.length === 4 && this.state.locked) setTimeout(() => this.tryUnlock(p), 120) }
  tryUnlock(p) { let pin = null; try { pin = localStorage.getItem('rweida_pin') } catch (e) {} if (p === pin) this.setState({ locked: false, pinInput: '' }); else { this.hap(); this.setState({ pinInput: '' }) } }
  setPin() { const p = (this.state.pinInput || '').trim(); if (!/^\d{4}$/.test(p)) { if (typeof alert === 'function') alert('أدخلي ٤ أرقام'); return } try { localStorage.setItem('rweida_pin', p) } catch (e) {} this.hap(); this.setState({ pinInput: '', tick: this.state.tick + 1 }); this.showToast('🔒 تم تفعيل القفل') }
  removePin() { try { localStorage.removeItem('rweida_pin') } catch (e) {} this.hap(); this.setState({ tick: this.state.tick + 1 }); this.showToast('تم إلغاء القفل') }
  // ---- التهيئة ----
  obFinish() { try { localStorage.setItem('rweida_onboarded', '1') } catch (e) {} this.setState({ obStep: 0, screen: 'home' }) }
  // ---- نسخ احتياطي ----
  exportData() {
    try {
      const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob), a = document.createElement('a')
      a.href = url; a.download = 'rweida-backup.json'; a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000); this.showToast('✅ تم تصدير نسخة احتياطية')
    } catch (e) {}
  }
  // التحقق من سلامة نسخة احتياطية قبل قبولها — يرفض الملفات الناقصة/التالفة/الأحدث.
  validateBackupData(d) {
    if (!d || typeof d !== 'object') return { ok: false, error: 'الملف ليس بصيغة JSON صحيحة.' }
    const s = d.settings
    if (!s || typeof s !== 'object') return { ok: false, error: 'لا يحتوي الملف على إعدادات صالحة.' }
    if (typeof s.lastPeriod !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s.lastPeriod)) return { ok: false, error: 'تاريخ آخر دورة غير صالح.' }
    if (typeof s.cycleLength !== 'number' || s.cycleLength < 15 || s.cycleLength > 60) return { ok: false, error: 'طول الدورة غير منطقي.' }
    if (typeof s.periodLength !== 'number' || s.periodLength < 1 || s.periodLength > 15) return { ok: false, error: 'عدد أيام الدورة غير منطقي.' }
    if (d.logs != null && typeof d.logs !== 'object') return { ok: false, error: 'سجلّات الأيام تالفة.' }
    if (d.appointments != null && !Array.isArray(d.appointments)) return { ok: false, error: 'قائمة المواعيد تالفة.' }
    if (d.occasions != null && !Array.isArray(d.occasions)) return { ok: false, error: 'قائمة المناسبات تالفة.' }
    if (d.history != null && !Array.isArray(d.history)) return { ok: false, error: 'سجل الدورات تالف.' }
    if (typeof d.v === 'number' && d.v > DATA_VERSION) return { ok: false, error: 'الملف من إصدار أحدث من التطبيق — حدّثي التطبيق أولًا.' }
    return { ok: true }
  }
  // الاستيراد: يتحقق أولًا، ثم يعرض معاينة — ولا يرفع للسحابة إلا بعد تأكيد المستخدم.
  importData(file) {
    if (!file) return
    const r = new FileReader()
    r.onload = () => {
      let d = null
      try { d = JSON.parse(r.result) } catch (e) { if (typeof alert === 'function') alert('تعذّر قراءة الملف.'); return }
      const v = this.validateBackupData(d)
      if (!v.ok) { if (typeof alert === 'function') alert('ملف غير صالح: ' + v.error); return }
      // توحيد شكل الملف (طوابع/معرّفات) للمعاينة — دالة نقية بلا أي مسٍّ للبيانات الحالية أو التخزين.
      const norm = this.normalizeForMerge(JSON.parse(JSON.stringify(d)))
      const counts = {
        logs: Object.keys(norm.logs || {}).length,
        appts: (norm.appointments || []).filter(a => !a.deletedAt).length,
        occ: (norm.occasions || []).filter(o => !o.deletedAt).length,
        cycles: (norm.history || []).length,
      }
      this.setState({ importPreview: { data: norm, counts } })
    }
    r.readAsText(file)
  }
  // تأكيد الاستيراد: دمج (لا استبدال) مع الحالي ثم مزامنة.
  confirmImport() {
    const p = this.state.importPreview; if (!p) return
    const { data: merged } = this.mergeData(p.data, this.data)
    this.persist({ ...merged, updatedAt: NOW(), editedBy: this.identity })
    this.setState({ importPreview: null, tick: this.state.tick + 1 })
    this.scheduleCloud()
    this.showToast('✅ تم استيراد البيانات ودمجها')
  }
  // ---- صورة الزوجين ----
  setCouplePhoto(file) {
    if (!file) return
    const r = new FileReader()
    r.onload = () => {
      const img = new Image()
      img.onload = () => {
        const cv = document.createElement('canvas'), max = 420; let w = img.width, h = img.height
        if (w > h) { if (w > max) { h = h * max / w; w = max } } else { if (h > max) { w = w * max / h; h = max } }
        cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h)
        this.commit({ settings: { ...this.data.settings, couplePhoto: cv.toDataURL('image/jpeg', 0.7) } }, ['settings']); this.showToast('✅ تم تحديث الصورة')
      }
      img.src = r.result
    }
    r.readAsDataURL(file)
  }
  // ---- الإنجازات ----
  achievements() {
    const today = new Date(); let streak = 0, total = 0
    for (let i = 0; i < 400; i++) { const iso = this.iso(this.addDays(today, -i)); if (this.data.logs[iso]) { total++; if (i === streak) streak++ } }
    const fi = this.fertileIntimacy()
    return { streak, total, fiInFertile: fi.inFertile, cycles: (this.data.history || []).length }
  }
  // ---- صندوق الرسائل (محلي) ----
  inbox() { try { return JSON.parse(localStorage.getItem('rweida_inbox') || '[]') } catch (e) { return [] } }
  pushInbox(title, body) { try { const arr = this.inbox(); arr.unshift({ t: title || '', b: body || '', at: Date.now() }); localStorage.setItem('rweida_inbox', JSON.stringify(arr.slice(0, 30))) } catch (e) {} }

  componentDidMount() {
    this._t = setTimeout(() => {
      if (this.state.screen === 'splash') this.setState({ screen: 'home' })
    }, 2300)
    this.syncFromCloud().then(() => { if (this.migrate()) this.scheduleCloud() })
    // تحديث حيّ: استقطاب دوري + عند العودة للتطبيق، فيظهر تعديل الطرف الآخر تلقائيًا.
    this._poll = setInterval(() => this.pollCloud(), 15000)
    this._onVis = () => {
      try {
        if (document.hidden) { this._hidAt = Date.now() }
        else {
          if (this.hasPin() && this._hidAt && Date.now() - this._hidAt > 60000 && !this.state.locked) this.setState({ locked: true, pinInput: '' })
          this.pollCloud(); this.maybeNotify()
        }
      } catch (e) {}
    }
    try { document.addEventListener('visibilitychange', this._onVis); window.addEventListener('focus', this._onVis) } catch (e) {}
    setTimeout(() => this.maybeNotify(), 2600)
    if (this.notifyEnabled()) this.enablePush()
    this.loadCustoms()
    // عند فتح التطبيق من إشعار: اعرض الرسالة كاملة.
    try {
      const q = new URLSearchParams(window.location.search)
      const n = q.get('n')
      if (n) { this.pushInbox(q.get('nt') || '', n); this.setState({ notifMsg: { title: q.get('nt') || '', body: n } }); window.history.replaceState(null, '', window.location.pathname) }
    } catch (e) {}
    try {
      if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', (ev) => {
        if (ev.data && ev.data.type === 'rweida-notif') { this.pushInbox(ev.data.title || '', ev.data.body || ''); this.setState({ notifMsg: { title: ev.data.title || '', body: ev.data.body || '' } }) }
      })
    } catch (e) {}
  }
  componentWillUnmount() {
    clearTimeout(this._t); clearTimeout(this._cloudT); clearInterval(this._poll); clearTimeout(this._toastT)
    try { document.removeEventListener('visibilitychange', this._onVis); window.removeEventListener('focus', this._onVis) } catch (e) {}
  }

  // ---- cloud sync (Supabase) — دمج على مستوى العنصر ----
  // يختار العنصر الأحدث (updatedAt) بين نسختين من نفس العنصر.
  newerItem(a, b) { return (b && (b.updatedAt || '') > ((a && a.updatedAt) || '')) ? b : a }
  // دمج قائمتين معرّفتين بـ id (مواعيد/مناسبات) مع احترام الحذف الناعم (deletedAt).
  mergeById(localArr, remoteArr) {
    const map = new Map(); let changed = false
    for (const it of (localArr || [])) if (it && it.id) map.set(it.id, it)
    for (const it of (remoteArr || [])) {
      if (!it || !it.id) continue
      const ex = map.get(it.id)
      if (!ex) { map.set(it.id, it); changed = true }
      else if ((it.updatedAt || '') > (ex.updatedAt || '')) { map.set(it.id, it); changed = true }
    }
    return { list: Array.from(map.values()), changed }
  }
  // توحيد مستند قادم من جهاز لم يُرقَّ بعد (v5) إلى شكل قابل للدمج — دون آثار جانبية.
  normalizeForMerge(d) {
    if (!d || !d.settings) return d
    if (d.v >= DATA_VERSION && Array.isArray(d.occasions)) return d
    const c = JSON.parse(JSON.stringify(d)), stamp = c.updatedAt || '2020-01-01T00:00:00.000Z'
    c.logs = c.logs || {}
    for (const k in c.logs) if (c.logs[k] && !c.logs[k].updatedAt) c.logs[k].updatedAt = stamp
    c.appointments = (c.appointments || []).map(a => ({ ...a, id: a.id || rid('a'), createdAt: a.createdAt || stamp, updatedAt: a.updatedAt || stamp }))
    const occ = Array.isArray(c.occasions) ? c.occasions : (Array.isArray(c.settings.occasions) ? c.settings.occasions : [])
    c.occasions = occ.map(o => ({ ...o, id: o.id || rid('o'), createdAt: o.createdAt || stamp, updatedAt: o.updatedAt || stamp }))
    if (c.settings.occasions) delete c.settings.occasions
    c.settingsUpdatedAt = c.settingsUpdatedAt || stamp
    c.historyUpdatedAt = c.historyUpdatedAt || stamp
    c.pregnancyUpdatedAt = c.pregnancyUpdatedAt || stamp
    c.v = Math.max(c.v || 0, DATA_VERSION)
    return c
  }
  // الدمج الكامل: كل قسم يُدمج باستقلال — فلا يمسح تعديلُ قسمٍ تعديلَ قسمٍ آخر.
  mergeData(local, remote) {
    if (!remote || !remote.settings) return { data: local, changed: false }
    if (!local || !local.settings) return { data: this.normalizeForMerge(remote), changed: true }
    local = this.normalizeForMerge(local); remote = this.normalizeForMerge(remote)
    let changed = false
    const out = { v: Math.max(local.v || DATA_VERSION, remote.v || DATA_VERSION) }
    // السجلات اليومية: لكل تاريخ عنصرٌ مستقل، الأحدث يفوز.
    out.logs = {}
    const keys = new Set([...Object.keys(local.logs || {}), ...Object.keys(remote.logs || {})])
    for (const k of keys) {
      const a = (local.logs || {})[k], b = (remote.logs || {})[k]
      if (a && b) { const pick = this.newerItem(a, b); out.logs[k] = pick; if (pick === b) changed = true }
      else { out.logs[k] = a || b; if (!a) changed = true }
    }
    // المواعيد والمناسبات: دمج حسب id.
    const ap = this.mergeById(local.appointments, remote.appointments); out.appointments = ap.list; if (ap.changed) changed = true
    const oc = this.mergeById(local.occasions, remote.occasions); out.occasions = oc.list; if (oc.changed) changed = true
    // الأذكار: قوائم مشتركة قابلة للإضافة/الحذف — دمج حسب id.
    const am = this.mergeById(local.athkarM, remote.athkarM); out.athkarM = am.list; if (am.changed) changed = true
    const ae = this.mergeById(local.athkarE, remote.athkarE); out.athkarE = ae.list; if (ae.changed) changed = true
    // الأقسام أحادية القيمة: الأحدث (حسب طابع القسم) يفوز.
    const sec = (name) => {
      const lt = local[name + 'UpdatedAt'] || '', rt = remote[name + 'UpdatedAt'] || ''
      if (rt > lt) { out[name] = remote[name]; out[name + 'UpdatedAt'] = rt; changed = true }
      else { out[name] = local[name]; out[name + 'UpdatedAt'] = lt }
    }
    sec('settings'); sec('history'); sec('pregnancy')
    // بيانات وصفية: من أجراء آخر تعديل ومتى.
    if ((remote.updatedAt || '') > (local.updatedAt || '')) { out.updatedAt = remote.updatedAt; out.editedBy = remote.editedBy }
    else { out.updatedAt = local.updatedAt; out.editedBy = local.editedBy }
    return { data: out, changed }
  }
  async pollCloud() {
    try { if (typeof document !== 'undefined' && document.hidden) return } catch (e) {}
    if (this._cloudT || this._futureData) return // حفظ معلّق أو نسخة أحدث محليًا — لا نلمس البيانات
    const remote = await cloudLoad(this.syncKey)
    if (!remote || !remote.settings) return
    const { data: merged, changed } = this.mergeData(this.data, remote)
    if (!changed) return
    const who = remote.editedBy && remote.editedBy !== this.identity ? this.identityView(remote.editedBy) : null
    this.persist(merged)
    this.setState({ tick: this.state.tick + 1, syncedAt: Date.now(), syncError: false })
    if (who) this.showToast('🔄 حدّث ' + who.emoji + ' ' + who.name + ' البيانات')
    this.scheduleCloud() // ادفع النتيجة المدموجة ليصل ما لدينا للطرف الآخر أيضًا
  }
  async syncFromCloud() {
    if (this._futureData) { this.setState({ syncing: false, syncError: true }); this.showToast('⚠️ بيانات هذا الجهاز أحدث من المتوقّع — تم إيقاف المزامنة مؤقتًا'); return }
    this.setState({ syncing: true })
    const remote = await cloudLoad(this.syncKey)
    if (remote && remote.settings) {
      const { data: merged, changed } = this.mergeData(this.data, remote)
      if (changed) {
        const who = remote.editedBy && remote.editedBy !== this.identity ? this.identityView(remote.editedBy) : null
        this.persist(merged); this.setState({ tick: this.state.tick + 1 })
        if (who) this.showToast('🔄 حدّث ' + who.emoji + ' ' + who.name + ' البيانات')
      }
    }
    const ok = await cloudSave(this.syncKey, this.data)
    this.setState({ syncing: false, syncError: !ok, syncedAt: ok ? Date.now() : this.state.syncedAt })
  }
  scheduleCloud() {
    if (this._futureData) return
    clearTimeout(this._cloudT)
    this.setState({ syncing: true })
    this._cloudT = setTimeout(() => this.pushCloud(), 800)
  }
  // اقرأ السحابة، ادمج معها محليًا، ثم اكتب الناتج — يقلّص نافذة فقدان التحديثات.
  async pushCloud() {
    this._cloudT = 'busy' // يمنع pollCloud من التداخل أثناء الكتابة
    try {
      const remote = await cloudLoad(this.syncKey)
      const { data: merged } = this.mergeData(this.data, remote)
      this.persist(merged)
      const ok = await cloudSave(this.syncKey, merged)
      this.setState({ tick: this.state.tick + 1, syncing: false, syncError: !ok, syncedAt: ok ? Date.now() : this.state.syncedAt })
    } catch (e) {
      this.setState({ syncing: false, syncError: true })
    } finally { this._cloudT = null }
  }

  hap() { try { navigator.vibrate && navigator.vibrate(8) } catch (e) {} }

  // ---- المناسبات ----
  occDate(o) {
    const today = new Date()
    if (o.monthly) {
      // ذكرى شهرية: تتكرر في نفس اليوم من كل شهر.
      let d = new Date(today.getFullYear(), today.getMonth(), o.day)
      if (this.startOf(d) < this.startOf(today)) d = new Date(today.getFullYear(), today.getMonth() + 1, o.day)
      return d
    }
    const y = today.getFullYear()
    let d = new Date(y, o.month - 1, o.day)
    if (this.startOf(d) < this.startOf(today)) d = new Date(y + 1, o.month - 1, o.day)
    return d
  }
  occasionsView() {
    const today = new Date()
    return (this.data.occasions || []).filter(o => !o.deletedAt).map(o => {
      const d = this.occDate(o), days = this.diff(d, today)
      let extra = ''
      if (o.monthly && o.anchor) {
        const a = this.parse(o.anchor)
        const months = (d.getFullYear() - a.getFullYear()) * 12 + (d.getMonth() - a.getMonth())
        extra = months === 1 ? 'أول شهر 🎉' : 'إتمام ' + months + ' شهر 💞'
      }
      return { id: o.id, emoji: o.emoji || '🎉', label: o.label, dateLabel: this.arShort(d), days, extra, monthly: !!o.monthly, when: days === 0 ? 'اليوم! 🎉' : days === 1 ? 'بكرة 🎉' : 'بعد ' + days + ' يوم' }
    }).sort((a, b) => a.days - b.days)
  }
  // علامات اليوم: مناسبة و/أو موعد طبي على هذا التاريخ (للتقويم).
  dayMarks(date, iso) {
    const mo = date.getMonth() + 1, dy = date.getDate()
    const occ = (this.data.occasions || []).find(o => !o.deletedAt && (o.monthly ? o.day === dy : (o.month === mo && o.day === dy)))
    const appt = (this.data.appointments || []).some(a => !a.deletedAt && a.date === iso)
    return { occ: occ ? (occ.emoji || '🎉') : null, appt }
  }
  // أبرز ما هو قادم: تبويض، خصوبة، دورة، مناسبات، مواعيد — مرتّبة بالأقرب.
  upcomingItems() {
    const today = new Date(), out = []
    if (!this.pregActive()) {
      const c = this.calc()
      const ovE = this.ovulationEstimate(), ovuD = ovE.source !== 'calc' ? ovE.date : c.ovu
      const dOvu = this.diff(ovuD, today)
      if (dOvu >= 0) out.push({ icon: '🌸', label: 'يوم التبويض', date: ovuD, days: dOvu })
      const fS = this.addDays(ovuD, -5), dF = this.diff(fS, today)
      if (dF > 0) out.push({ icon: '🌱', label: 'بداية نافذة الخصوبة', date: fS, days: dF })
      const dPer = this.diff(c.next, today)
      if (dPer >= 0) out.push({ icon: '📅', label: 'موعد الدورة المتوقّع', date: c.next, days: dPer })
    }
    for (const o of this.occasionsView()) if (o.days >= 0 && o.days <= 120) out.push({ icon: o.emoji, label: o.label + (o.extra ? ' — ' + o.extra : ''), days: o.days, dateLabel: o.dateLabel })
    for (const a of this.apptsView()) if (!a.past) out.push({ icon: '🩺', label: a.type + (a.note ? ' — ' + a.note : ''), days: a.days != null ? a.days : 0, dateLabel: a.dateLabel })
    return out.map(it => ({ ...it, dateLabel: it.dateLabel || this.arShort(it.date), when: it.days === 0 ? 'اليوم 🎉' : it.days === 1 ? 'بكرة' : 'بعد ' + it.days + ' يوم' }))
      .sort((a, b) => a.days - b.days).slice(0, 6)
  }
  addOccasion(label, dateStr) {
    label = (label || '').trim(); if (!label || !dateStr) return
    const p = dateStr.split('-').map(Number), now = NOW()
    const occ = { id: rid('o'), emoji: '🎉', label, month: p[1], day: p[2], createdAt: now, updatedAt: now }
    this.commit({ occasions: [...(this.data.occasions || []), occ] }, [])
    this.setState({ occLabel: '', occDateV: '' }); this.showToast('✅ أُضيفت المناسبة')
  }
  // حذف ناعم: نُبقي العنصر مع deletedAt حتى ينتشر الحذف للأجهزة الأخرى عبر الدمج.
  delOccasion(id) { this.hap(); const now = NOW(); this.commit({ occasions: (this.data.occasions || []).map(o => o.id === id ? { ...o, deletedAt: now, updatedAt: now } : o) }, []) }

  // ---- الأسبوعان بعد التبويض ----
  twwInfo() {
    if (this.pregActive()) return { show: false }
    // نافذة الأسبوعين = ١٤ يومًا. نعرضها حتى اليوم ١٤ فقط فلا يتجمّد العدّاد عند الرقم نفسه لأيام زائدة.
    const ov = this.ovulationEstimate().date, today = new Date(), since = this.diff(today, ov)
    if (since < 1 || since > 14) return { show: false }
    const testDate = this.addDays(ov, 14), toTest = this.diff(testDate, today)
    return { show: true, day: since, pct: Math.min(100, Math.round((since / 14) * 100)), msg: toTest > 0 ? ('اختبار الحمل المثالي بعد ' + toTest + ' ' + (toTest === 1 ? 'يوم' : 'أيام') + ' — ' + this.arShort(testDate)) : 'اليوم وقتٌ مناسب لإجراء اختبار الحمل المنزلي 🤍' }
  }

  // ---- المواعيد الطبية ----
  apptsView() {
    return (this.data.appointments || []).filter(a => !a.deletedAt).sort((a, b) => a.date < b.date ? -1 : 1).map(a => {
      const d = this.parse(a.date), days = this.diff(d, new Date())
      return { id: a.id, type: a.type, note: a.note, days, dateLabel: this.arLong(d), when: days < 0 ? 'مضى' : days === 0 ? 'اليوم' : days === 1 ? 'بكرة' : 'بعد ' + days + ' يوم', past: days < 0 }
    })
  }
  addAppt() {
    const date = this.state.apDate, type = (this.state.apType || '').trim(), note = (this.state.apNote || '').trim()
    if (!date || !type) { if (typeof alert === 'function') alert('اكتبي نوع الموعد والتاريخ.'); return }
    const now = NOW(), ap = { id: rid('a'), date, type, note, createdAt: now, updatedAt: now }
    this.commit({ appointments: [...(this.data.appointments || []), ap] }, [])
    this.setState({ apType: '', apDate: '', apNote: '' }); this.showToast('✅ أُضيف الموعد')
  }
  delAppt(id) { this.hap(); const now = NOW(); this.commit({ appointments: (this.data.appointments || []).map(a => a.id === id ? { ...a, deletedAt: now, updatedAt: now } : a) }, []) }

  nutritionTips() {
    return {
      wife: ['🥬 الورقيات الخضراء والبقوليات غنية بحمض الفوليك المهم قبل الحمل.', '🥚 البروتين الجيد (بيض، سمك، دجاج) يدعم جودة البويضات.', '🍊 فيتامين C والحديد يحسّنان الخصوبة — حمضيات ولحوم حمراء باعتدال.', '🥛 منتجات الألبان كاملة الدسم باعتدال قد تدعم الخصوبة.', '💧 رطّبي جسمكِ وقلّلي الكافيين والسكريات.'],
      husband: ['🦪 الزنك (المحار، اللحوم، المكسرات) يحسّن جودة الحيوانات المنوية.', '🥜 الأوميغا-3 والمكسرات (سمك، جوز) تدعم خصوبة الرجل.', '🍅 مضادات الأكسدة (طماطم، توت، خضار ملوّنة) تحمي الحيوانات المنوية.', '🚭 تجنّب التدخين والحرارة العالية (الساونا).', '🏃 رياضة معتدلة ووزن صحي يرفعان الخصوبة.'],
      both: ['🌰 حمض الفوليك يوميًا للطرفين أساسي قبل الحمل.', '😴 نوم كافٍ وتقليل التوتر يوازن الهرمونات.', '⚖️ الوزن الصحي للطرفين يرفع فرص الحمل.', '🚫 قلّلوا الأطعمة المصنّعة والدهون المتحوّلة.'],
    }
  }
  toggleVitamins() { const s = { ...this.data.settings, vitamins: { ...(this.data.settings.vitamins || {}), on: !(this.data.settings.vitamins && this.data.settings.vitamins.on) } }; this.hap(); this.commit({ settings: s }, ['settings']) }
  printReport() { try { window.print() } catch (e) {} }

  // ---- persistence ----
  load() {
    let d = null
    try { d = JSON.parse(localStorage.getItem('rweida_v1')) } catch (e) {}
    if (!d || !d.settings) { d = this.seed(); this.persist(d); this.data = d; return }
    this.data = d
    // نسخة أحدث من المعروفة: لا نمسح البيانات — نحتفظ بها ونحذّر.
    if (d.v > DATA_VERSION) { this._futureData = true; return }
    this.migrate()
  }
  // ترقية البيانات تدريجيًا مع الاحتفاظ الكامل بالموجود (لا مسح أبدًا).
  migrate() {
    const d = this.data; let changed = false
    // ضمان الحقول الأساسية (متوافقة مع إصدارات ٥ وما قبلها).
    const s = d.settings
    if (!Array.isArray(d.appointments)) { d.appointments = []; changed = true }
    if (!s.reminders) { s.reminders = { fertile: true, ovulation: true, period: true, test: false }; changed = true }
    if (!s.vitamins) { s.vitamins = { on: true, hour: 21 }; changed = true }
    if (!s.msgPreset) { s.msgPreset = 'off'; changed = true }
    if (s.fertileBoost === undefined) { s.fertileBoost = false; changed = true }
    if (s.prayer === undefined) { s.prayer = true; changed = true }
    if (s.athkar === undefined) { s.athkar = true; changed = true }
    if (!s.prayerAdj) { s.prayerAdj = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }; changed = true }
    // إيقاف رسائل الحب التلقائية لمرة واحدة — نعتمد على الرسائل المكتوبة بالموقع فقط.
    // يُرفع طابع الإعدادات لـ NOW كي يفوز هذا التغيير على السحابة ويصل للطرف الآخر أيضًا.
    // العلم محفوظ داخل الإعدادات حتى يبقى بعد الدمج، فلا يُعاد فرض الإيقاف لو فعّلتها لاحقًا يدويًا.
    if (!s.autoMsgDisabled) {
      s.msgPreset = 'off'; s.fertileBoost = false; s.autoMsgDisabled = true
      d.settingsUpdatedAt = NOW(); changed = true
    }
    // ترقية v5 → v6: إضافة طوابع زمنية لكل عنصر/قسم لدعم الدمج على مستوى العنصر.
    if (!d.v || d.v < 6) { this.migrateV5ToV6(d); changed = true }
    // قوائم الأذكار المشتركة — تُزرع بمعرّفات ثابتة (m0../e0..) ليتطابق الجهازان دون تكرار.
    const seed = '2020-01-01T00:00:00.000Z'
    if (!Array.isArray(d.athkarM)) { d.athkarM = MORNING.map((x, i) => ({ id: 'm' + i, t: x.t, c: x.c, n: x.n || '', createdAt: seed, updatedAt: seed })); changed = true }
    if (!Array.isArray(d.athkarE)) { d.athkarE = EVENING.map((x, i) => ({ id: 'e' + i, t: x.t, c: x.c, n: x.n || '', createdAt: seed, updatedAt: seed })); changed = true }
    // ذكرى الزواج الشهرية — تُكمَّل في الـ٢٩ من كل شهر (زواج ٢٩ مايو ٢٠٢٦).
    if (Array.isArray(d.occasions) && !d.occasions.some(o => o.id === 'wedm')) {
      const now = NOW()
      d.occasions = [...d.occasions, { id: 'wedm', emoji: '💞', label: 'ذكرى زواجنا الشهرية', monthly: true, day: 29, anchor: '2026-05-29', createdAt: now, updatedAt: now }]
      changed = true
    }
    if (changed) this.persist(d)
    return changed
  }
  // v5→v6: لا نحذف شيئًا — نضيف فقط معرّفات وطوابع زمنية، وننقل المناسبات لأعلى المستند.
  migrateV5ToV6(d) {
    const stamp = d.updatedAt || '2020-01-01T00:00:00.000Z'
    // نسخة احتياطية تلقائية قبل الترقية (احتياطًا).
    try { localStorage.setItem('rweida_v1_backup_pre_v6', JSON.stringify(d)) } catch (e) {}
    d.logs = d.logs || {}
    for (const k in d.logs) { if (d.logs[k] && !d.logs[k].updatedAt) d.logs[k].updatedAt = stamp }
    d.appointments = (d.appointments || []).map(a => ({ ...a, id: a.id || rid('a'), createdAt: a.createdAt || stamp, updatedAt: a.updatedAt || stamp }))
    // المناسبات: تنتقل من settings.occasions إلى المستوى الأعلى مع معرّفات وطوابع.
    const legacyOcc = Array.isArray(d.occasions) ? d.occasions : (Array.isArray(d.settings.occasions) ? d.settings.occasions : [])
    d.occasions = legacyOcc.map(o => ({ ...o, id: o.id || rid('o'), createdAt: o.createdAt || stamp, updatedAt: o.updatedAt || stamp }))
    if (d.settings.occasions) delete d.settings.occasions
    d.settingsUpdatedAt = d.settingsUpdatedAt || stamp
    d.historyUpdatedAt = d.historyUpdatedAt || stamp
    d.pregnancyUpdatedAt = d.pregnancyUpdatedAt || stamp
    d.v = DATA_VERSION
  }
  setMsgPreset(p) { this.hap(); this.commit({ settings: { ...this.data.settings, msgPreset: p } }, ['settings']); this.showToast('✅ تم تحديث جرعة الرسائل') }
  toggleBoost() { this.hap(); this.commit({ settings: { ...this.data.settings, fertileBoost: !this.data.settings.fertileBoost } }, ['settings']) }
  togglePrayer() { this.hap(); this.commit({ settings: { ...this.data.settings, prayer: !this.data.settings.prayer } }, ['settings']) }
  toggleAthkar() { this.hap(); this.commit({ settings: { ...this.data.settings, athkar: !this.data.settings.athkar } }, ['settings']) }
  adjustPrayer(k, delta) { const adj = { ...(this.data.settings.prayerAdj || {}) }; adj[k] = Math.max(-30, Math.min(30, (adj[k] || 0) + delta)); this.hap(); this.commit({ settings: { ...this.data.settings, prayerAdj: adj } }, ['settings']) }
  // أوقات صلوات اليوم بالرياض مع تعديلات المستخدم (بالدقائق).
  prayerToday() { const t = prayerMinutes(new Date()); const adj = this.data.settings.prayerAdj || {}; const out = {}; PRAYER_ORDER.forEach(k => { out[k] = (t[k] + (adj[k] || 0) + 1440) % 1440 }); return out }
  // قائمة الأذكار المشتركة لكل فترة (m=الصباح · e=المساء) — بدون المحذوف.
  athkarItems(period) { return ((period === 'e' ? this.data.athkarE : this.data.athkarM) || []).filter(x => !x.deletedAt) }
  addDhikr(period, text, count) {
    text = (text || '').trim(); if (!text) return
    const key = period === 'e' ? 'athkarE' : 'athkarM', now = NOW()
    const item = { id: rid('dh'), t: text, c: Math.max(1, Math.min(1000, parseInt(count) || 1)), n: '', createdAt: now, updatedAt: now }
    this.hap(); this.commit({ [key]: [...(this.data[key] || []), item] }, [])
    this.setState({ dhText: '', dhCount: '' }); this.showToast('✅ أُضيف الذكر')
  }
  delDhikr(period, id) {
    const key = period === 'e' ? 'athkarE' : 'athkarM', now = NOW()
    this.hap(); this.commit({ [key]: (this.data[key] || []).map(x => x.id === id ? { ...x, deletedAt: now, updatedAt: now } : x) }, [])
  }
  // عدّاد الأذكار — يُحفظ يوميًا محليًا (شخصي لكل جهاز، لا يُزامن). مفتاحه id الذكر.
  loadAth() { try { const r = JSON.parse(localStorage.getItem('rweida_ath') || '{}'); if (r.date === this.iso(new Date())) return r } catch (e) {} return { date: this.iso(new Date()), c: {} } }
  tapDhikr(id, max) { const a = this.loadAth(); if (!a.c) a.c = {}; const cur = a.c[id] || 0; a.c[id] = cur + 1 >= max ? max : cur + 1; try { localStorage.setItem('rweida_ath', JSON.stringify(a)) } catch (e) {} this.hap(); this.setState({ tick: this.state.tick + 1 }) }
  resetAth(ids) { const a = this.loadAth(); if (!a.c) a.c = {}; for (const id of ids) delete a.c[id]; try { localStorage.setItem('rweida_ath', JSON.stringify(a)) } catch (e) {} this.hap(); this.setState({ tick: this.state.tick + 1 }) }
  persist(d) { this.data = d; try { localStorage.setItem('rweida_v1', JSON.stringify(d)) } catch (e) {} }
  // الحفظ العام: يطبع الطوابع الزمنية للأقسام المعدّلة، يخزّن محليًا، ثم يزامن بالدمج.
  commit(patch, sections) {
    const now = NOW()
    const d = { ...this.data, ...patch, updatedAt: now, editedBy: this.identity }
    for (const sec of (sections || [])) d[sec + 'UpdatedAt'] = now
    this.persist(d); this.setState({ tick: this.state.tick + 1 }); this.scheduleCloud()
  }
  // متوافق مع النداءات القديمة: يحفظ كامل الكائن مع تحديث طوابع كل الأقسام (للاستيراد/إعادة الضبط).
  save(d) { this.persist({ ...d, updatedAt: NOW(), editedBy: this.identity }); this.setState({ tick: this.state.tick + 1 }); this.scheduleCloud() }
  seed() {
    // بداية محايدة بلا أي بيانات شخصية. التواريخ والأسماء يدخلها المستخدم لاحقًا.
    // مهم: طوابع الأقسام تبدأ بقيمة قديمة جدًا (EPOCH) كي تخسر دائمًا أمام بيانات السحابة الحقيقية
    // عند أول مزامنة على جهاز جديد — فلا يمسح القالب الفارغ إعدادات/سجلّ الزوجين.
    const today = this.iso(new Date()), stamp = '1970-01-01T00:00:00.000Z'
    return {
      v: DATA_VERSION,
      settings: { lastPeriod: today, cycleLength: 28, periodLength: 5, theme: 'light', wife: 'الزوجة', husband: 'الزوج', reminders: { fertile: true, ovulation: true, period: true, test: false }, vitamins: { on: true, hour: 21 }, msgPreset: 'off', fertileBoost: false, autoMsgDisabled: true },
      history: [],
      logs: {},
      appointments: [],
      occasions: [],
      settingsUpdatedAt: stamp, historyUpdatedAt: stamp, pregnancyUpdatedAt: stamp, updatedAt: stamp,
    }
  }

  // ---- date helpers ----
  iso(d) { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10) }
  parse(s) { const a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]) }
  addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
  startOf(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() }
  diff(a, b) { return Math.round((this.startOf(a) - this.startOf(b)) / 864e5) }

  // ---- cycle math ----
  calc() {
    const s = this.data.settings, last = this.parse(s.lastPeriod), L = s.cycleLength, P = s.periodLength
    const next = this.addDays(last, L), ovu = this.addDays(next, -14), fS = this.addDays(ovu, -5), fE = this.addDays(ovu, 1), today = new Date()
    let cd = this.diff(today, last) % L; if (cd < 0) cd += L
    return { last, L, P, next, ovu, fS, fE, today, cycleDay: cd + 1, dto: this.diff(ovu, today), dtp: this.diff(next, today) }
  }
  // محرك الحساب الموحّد — مصدر واحد للمرحلة/التبويض/نافذة الخصوبة/الاحتمال/العد التنازلي.
  // يأخذ بيانات LH/الحرارة في الاعتبار فتنعكس على كل النتائج معًا (لا تناقض بين الأجزاء).
  getCycleInsights(today) {
    today = today || new Date()
    const c = this.calc()
    const est = this.ovulationEstimate()
    const ovu = est.date
    const fS = this.addDays(ovu, -5), fE = this.addDays(ovu, 1)
    const next = est.source !== 'calc' ? this.addDays(ovu, 14) : c.next
    const dto = this.diff(ovu, today), dtp = this.diff(next, today)
    const offFromLast = this.diff(today, c.last)
    let phase
    if (offFromLast >= 0 && offFromLast < c.P) phase = 'period'
    else if (dto === 0) phase = 'ovu'
    else if (this.diff(today, fS) >= 0 && this.diff(fE, today) >= 0) phase = 'fertile'
    else if (dtp >= 0 && dtp <= 3) phase = 'pred'
    else phase = 'normal'
    return {
      last: c.last, L: c.L, P: c.P,
      ovuDate: ovu, fertileStart: fS, fertileEnd: fE, nextDate: next,
      cycleDay: c.cycleDay, daysToOvu: dto, daysToPeriod: dtp,
      phase, conceptionPct: this.conceptionPct(today),
      source: est.source, confidence: est.source === 'lh' ? 'مرتفعة' : est.source === 'mucus' ? 'مرتفعة' : est.source === 'bbt' ? 'متوسطة' : 'تقويمية',
    }
  }
  // تلوين أيام التقويم — مثبَّت على يوم التبويض المُقدّر نفسه ليتطابق مع الرئيسية.
  phaseOf(date) {
    const ins = this.getCycleInsights()
    const L = ins.L, P = ins.P, last = ins.last
    let off = this.diff(date, last) % L; if (off < 0) off += L
    let ov = this.diff(ins.ovuDate, last) % L; if (ov < 0) ov += L
    if (off < P) return 'period'
    if (off === ov) return 'ovu'
    if (off >= ov - 5 && off <= ov + 1) return 'fertile'
    if (off >= L - 3) return 'pred'
    return 'normal'
  }
  arLong(d) { return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long' }).format(d) }
  arShort(d) { return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { day: 'numeric', month: 'long' }).format(d) }
  arMonth(y, m) { return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { month: 'long', year: 'numeric' }).format(new Date(y, m, 1)) }

  // ---- navigation & mutations ----
  go(s) { this.hap(); this.setState({ screen: s, saved: false }); if (s === 'settings' || s === 'us') this.loadCustoms() }
  bumpCycle(n) { const s = { ...this.data.settings }; s.cycleLength = Math.max(21, Math.min(40, s.cycleLength + n)); this.commit({ settings: s }, ['settings']) }
  bumpPeriod(n) { const s = { ...this.data.settings }; s.periodLength = Math.max(2, Math.min(10, s.periodLength + n)); this.commit({ settings: s }, ['settings']) }
  setLast(v) { if (!v) return; const s = { ...this.data.settings, lastPeriod: v }; this.commit({ settings: s }, ['settings']) }
  // تأكيد بدء الدورة فعليًا: يسجّل طول الدورة المنتهية، يحدّث تاريخ آخر دورة،
  // ويعيد ضبط متوسط طول الدورة ليُحسب التبويض بدقة من البيانات الحقيقية.
  confirmPeriod(startISO) {
    if (!startISO) return
    const s = this.data.settings
    const len = this.diff(this.parse(startISO), this.parse(s.lastPeriod))
    let hist = Array.isArray(this.data.history) ? [...this.data.history] : []
    if (len >= 15 && len <= 60) { hist.push(len); if (hist.length > 12) hist = hist.slice(hist.length - 12) }
    const avg = hist.length ? Math.round(hist.reduce((a, b) => a + b, 0) / hist.length) : s.cycleLength
    const cycleLength = Math.max(21, Math.min(40, avg))
    // علّم أيام الدورة المتوقّعة فقط (من يوم البدء حتى طول الدورة) كأيام حيض — لا كل أيام الشهر.
    const P = Math.max(2, Math.min(10, s.periodLength || 5))
    const logs = { ...this.data.logs }, now = NOW()
    for (let i = 0; i < P; i++) {
      const iso = this.iso(this.addDays(this.parse(startISO), i))
      const day = logs[iso] || this.emptyLog()
      logs[iso] = { ...day, flow: day.flow || (i === 0 ? 'متوسط' : 'خفيف'), updatedAt: now }
    }
    this.hap()
    this.commit({ settings: { ...s, lastPeriod: startISO, cycleLength }, history: hist, logs }, ['settings', 'history'])
    this.showToast('🩸 تم تأكيد بدء الدورة')
  }
  // تأكيد انتهاء الدورة: يضبط طول الحيض الفعلي ويمسح علامة الحيض عمّا بعد يوم الانتهاء.
  endPeriod(endISO) {
    if (!endISO) return
    const s = this.data.settings, start = this.parse(s.lastPeriod), end = this.parse(endISO)
    const span = this.diff(end, start) + 1
    if (span < 1 || span > 15) return
    const periodLength = Math.max(2, Math.min(10, span))
    // امسح علامة الحيض عن أي يوم بعد يوم الانتهاء ضمن نافذة الدورة الحالية.
    const logs = { ...this.data.logs }, now = NOW()
    for (let i = span; i < 14; i++) {
      const iso = this.iso(this.addDays(start, i))
      if (logs[iso] && logs[iso].flow) logs[iso] = { ...logs[iso], flow: '', updatedAt: now }
    }
    this.hap()
    this.commit({ settings: { ...s, periodLength }, logs }, ['settings'])
    this.showToast('✅ تم تسجيل انتهاء الدورة')
  }
  toggleTheme() { const s = { ...this.data.settings, theme: this.data.settings.theme === 'dark' ? 'light' : 'dark' }; this.hap(); this.commit({ settings: s }, ['settings']) }
  toggleRem(k) { const r = { ...this.data.settings.reminders }; r[k] = !r[k]; this.hap(); this.commit({ settings: { ...this.data.settings, reminders: r } }, ['settings']) }
  // تحديث اسم الزوج/الزوجة من الإعدادات أو onboarding.
  setName(which, val) { const s = { ...this.data.settings, [which]: val }; this.commit({ settings: s }, ['settings']) }
  openResetModal() { this.hap(); this.setState({ resetModal: true, resetText: '' }) }
  // حذف من هذا الجهاز فقط: لا يرفع شيئًا للسحابة — بيانات الشريك تبقى سليمة.
  resetLocalOnly() {
    try { localStorage.removeItem('rweida_v1') } catch (e) {}
    const d = this.seed(); this.persist(d)
    this.setState({ resetModal: false, resetText: '', tick: this.state.tick + 1, screen: 'home' })
    this.showToast('🧹 تم مسح بيانات هذا الجهاز فقط')
  }
  // حذف من كل الأجهزة: يتطلب كتابة عبارة التأكيد بالضبط، ثم يستبدل بيانات السحابة (حذف نهائي مقصود).
  async resetAllDevices() {
    if ((this.state.resetText || '').trim() !== 'حذف من كل الأجهزة') { this.showToast('اكتبي عبارة التأكيد بالضبط'); return }
    try { localStorage.removeItem('rweida_v1') } catch (e) {}
    const d = this.seed(); this.persist(d)
    this.setState({ resetModal: false, resetText: '', syncing: true, tick: this.state.tick + 1, screen: 'home' })
    const ok = await cloudSave(this.syncKey, d)
    this.setState({ syncing: false, syncError: !ok, syncedAt: ok ? Date.now() : this.state.syncedAt })
    this.showToast(ok ? '🗑️ تم الحذف من كل الأجهزة' : '⚠️ تعذّر الحذف من السحابة')
  }
  emptyLog() { return { flow: '', symptoms: [], mood: '', intimacy: false, ovTest: '', pregTest: '', mucus: '', bbt: '', weight: '', meds: false, note: '' } }
  curLog() { return this.data.logs[this.state.logISO] || this.emptyLog() }
  patchLog(p) { const iso = this.state.logISO, l = { ...this.curLog(), ...p, updatedAt: NOW() }, logs = { ...this.data.logs, [iso]: l }; this.hap(); this.commit({ logs }, []); this.setState({ saved: false }) }
  patchDay(iso, p) { const l = { ...(this.data.logs[iso] || this.emptyLog()), ...p, updatedAt: NOW() }, logs = { ...this.data.logs, [iso]: l }; this.hap(); this.commit({ logs }, []) }
  toggleSym(x) { const l = this.curLog(), s = l.symptoms.includes(x) ? l.symptoms.filter(y => y !== x) : [...l.symptoms, x]; this.patchLog({ symptoms: s }) }
  shiftLog(n) { this.hap(); this.setState({ logISO: this.iso(this.addDays(this.parse(this.state.logISO), n)), saved: false }) }
  doSave() { this.hap(); this.setState({ saved: true, screen: 'home' }) }

  offsetOf(date) { const s = this.data.settings, L = s.cycleLength, last = this.parse(s.lastPeriod); let o = this.diff(date, last) % L; if (o < 0) o += L; return o }
  chanceLevel(date) {
    const s = this.data.settings, L = s.cycleLength, ov = L - 14, o = this.offsetOf(date), d = o - ov
    if (o < s.periodLength) return 0; if (d === 0 || d === -1) return 4; if (d === -2) return 3; if (d === -3 || d === 1) return 2; if (d === -4 || d === -5) return 1; return 0
  }
  bestDays() { const ovu = this.getCycleInsights().ovuDate, out = []; for (let k = -2; k <= 0; k++) { const dt = this.addDays(ovu, k); out.push({ key: k, label: this.arShort(dt), tag: k === 0 ? 'يوم التبويض' : (k === -1 ? 'قبل التبويض بيوم' : 'قبل التبويض بيومين'), cls: 'bd' + (k >= -1 ? ' pk' : '') }) } return out }
  dayOfYear(d) { return Math.floor((this.startOf(d) - this.startOf(new Date(d.getFullYear(), 0, 1))) / 864e5) }
  dailyTip(ph) {
    const T = {
      period: ['اشربي كمية كافية من الماء وتناولي أطعمة غنية بالحديد لتعويض الفقد.', 'احصلي على راحة كافية وخفّفي المجهود البدني خلال أيام الدورة.'],
      fertile: ['هذه أيامكِ الأكثر خصوبة — انتظام التوقيت يرفع فرص الحمل.', 'حافظي على تغذية متوازنة ونوم كافٍ لدعم الخصوبة.'],
      ovu: ['اليوم ذروة الخصوبة — أفضل وقت لزيادة فرص الحمل.', 'خفّفي التوتر ومارسي نشاطًا بدنيًا خفيفًا اليوم.'],
      pred: ['اقترب موعد دورتكِ — جهّزي نفسكِ وراقبي الأعراض.', 'قلّلي التوتر وخذي قسطًا كافيًا من النوم.'],
      normal: ['مارسي نشاطًا بدنيًا معتدلًا وتجنّبي التدخين والكحول.', 'حافظي على تغذية متوازنة وشرب الماء بانتظام.'],
    }
    const a = T[ph] || T.normal; return a[this.dayOfYear(new Date()) % a.length]
  }
  lateInfo() {
    const ins = this.getCycleInsights(), late = -ins.daysToPeriod
    if (late >= 1) return { show: true, days: late, msg: 'تأخّرت دورتكِ ' + late + ' ' + (late === 1 ? 'يوم' : 'أيام') + ' عن الموعد المتوقّع — يمكنكِ إجراء اختبار الحمل المنزلي الآن. للتأكيد يُنصح بمراجعة الطبيب.' }
    return { show: false }
  }
  periodPromptInfo() {
    const ins = this.getCycleInsights(), late = -ins.daysToPeriod
    if (late < -3) return { show: false }
    let title
    if (late > 0) title = 'تأخّرت دورتكِ ' + late + ' ' + (late === 1 ? 'يوم' : 'أيام')
    else if (late === 0) title = 'موعد دورتكِ المتوقّع اليوم'
    else title = 'باقٍ ' + (-late) + ' ' + ((-late) === 1 ? 'يوم' : 'أيام') + ' على موعد دورتكِ'
    return { show: true, title }
  }
  pregInfo() {
    for (let i = 0; i <= 21; i++) {
      const lg = this.data.logs[this.iso(this.addDays(new Date(), -i))]
      if (lg && lg.pregTest) {
        if (lg.pregTest === 'إيجابي') return { show: true, msg: 'نتيجة اختبار الحمل إيجابية 🎉 — مبروك! يُنصح بمراجعة الطبيب لتأكيد الحمل ومتابعته.' }
        return { show: false }
      }
    }
    return { show: false }
  }
  // (٢) تقدير يوم التبويض الفعلي من بيانات الدورة الحالية: اختبار LH أولًا، ثم ارتفاع الحرارة، وإلا التقويم.
  ovulationEstimate() {
    const c = this.calc(), L = c.L, last = c.last
    let lhDay = null
    for (let i = 0; i < L; i++) { const dt = this.addDays(last, i), lg = this.data.logs[this.iso(dt)]; if (lg && lg.ovTest === 'إيجابي') lhDay = dt }
    if (lhDay) return { date: this.addDays(lhDay, 1), source: 'lh' }
    // مؤشر كتابي بلا قياس: مخاط عنق الرحم كبياض البيض = ذروة الخصوبة (يوم التبويض تقريبًا).
    let ewDay = null
    for (let i = 0; i < L; i++) { const dt = this.addDays(last, i), lg = this.data.logs[this.iso(dt)]; if (lg && lg.mucus === 'مثل بياض البيض') ewDay = dt }
    if (ewDay) return { date: ewDay, source: 'mucus' }
    const temps = []
    for (let i = 0; i < L; i++) { const lg = this.data.logs[this.iso(this.addDays(last, i))]; temps.push(lg && lg.bbt ? +lg.bbt : null) }
    for (let i = 6; i < L; i++) {
      if (temps[i] == null) continue
      const prev = temps.slice(Math.max(0, i - 6), i).filter(x => x != null)
      if (prev.length >= 3) { const avg = prev.reduce((a, b) => a + b, 0) / prev.length; if (temps[i] >= avg + 0.2) return { date: this.addDays(last, i - 1), source: 'bbt' } }
    }
    return { date: c.ovu, source: 'calc' }
  }
  // جدول اختبار التبويض (LH): من ٥ أيام قبل التبويض حتى يوم بعده.
  // الأيام البعيدة: مرة/يوم (١٢ظ–٨م) · الأيام القريبة (تبويض-٢ حتى التبويض): مرتين (١ظ و٧م).
  lhSchedule() {
    if (this.pregActive()) return []
    const ovE = this.ovulationEstimate(), ovuD = ovE.source !== 'calc' ? ovE.date : this.calc().ovu
    const out = []
    for (let off = -5; off <= 1; off++) {
      const d = this.addDays(ovuD, off), iso = this.iso(d), lg = this.data.logs[iso]
      const twice = off >= -2 && off <= 0
      out.push({
        iso, date: d, label: this.arShort(d), off, twice, isOvu: off === 0,
        done: !!(lg && lg.ovTest), result: lg ? lg.ovTest : '',
        times: twice ? '١:٠٠ ظهرًا و ٧:٠٠ مساءً' : 'مرة بين ١٢ ظهرًا و ٨ مساءً',
      })
    }
    return out
  }
  // بند اليوم من جدول الشرائط (أو null إن لم يكن اليوم ضمن نافذة الاختبار).
  lhToday() { const t = this.iso(new Date()); return this.lhSchedule().find(x => x.iso === t) || null }
  // (٣) احتمال الحمل ليوم معيّن (٪) بناءً على قربه من التبويض المقدّر — منحنى خصوبة تقريبي معروف.
  conceptionPct(date) {
    const ov = this.ovulationEstimate().date, d = this.diff(ov, date)
    const m = { '5': 4, '4': 10, '3': 16, '2': 27, '1': 31, '0': 26, '-1': 8 }
    if (m[String(d)] != null) return m[String(d)]
    return 0
  }
  // (٤) وضع متابعة الحمل
  pregActive() { return !!(this.data.pregnancy && this.data.pregnancy.active) }
  setPregnancy(on) {
    const p = on ? { active: true, lmp: this.data.settings.lastPeriod } : { active: false }
    this.hap(); this.commit({ pregnancy: p }, ['pregnancy'])
  }
  pregView() {
    const p = this.data.pregnancy || {}, lmp = this.parse(p.lmp || this.data.settings.lastPeriod), today = new Date()
    let days = this.diff(today, lmp); if (days < 0) days = 0
    const wk = Math.floor(days / 7), dd = days % 7
    const edd = this.addDays(lmp, 280), toEdd = this.diff(edd, today)
    const tri = wk < 13 ? 'الثلث الأول' : wk < 28 ? 'الثلث الثاني' : 'الثلث الثالث'
    const pct = Math.max(0, Math.min(100, Math.round((days / 280) * 100)))
    const milestones = ['🫘 بحجم حبة الفاصولياء', '🍇 بحجم حبة العنب', '🍓 بحجم الفراولة', '🍋 بحجم الليمونة', '🥑 بحجم الأفوكادو', '🌽 بحجم الذرة', '🥕 بحجم الجزرة', '🥦 بحجم القرنبيط', '🥬 بحجم الخس', '🍍 بحجم الأناناس', '🎃 بحجم اليقطين']
    const mi = Math.min(milestones.length - 1, Math.max(0, Math.floor((wk - 6) / 3)))
    return { wk, dd, eddLabel: this.arShort(edd), toEdd: Math.max(0, toEdd), tri, pct, milestone: wk >= 5 ? milestones[mi] : '🤍 بداية الرحلة', lmpLabel: this.arShort(lmp) }
  }
  // (١) تنبيهات: عرض إشعار لأحداث اليوم المهمة (عند فتح/تنشيط التطبيق).
  notifyEnabled() { try { return typeof Notification !== 'undefined' && Notification.permission === 'granted' } catch (e) { return false } }
  requestNotif() {
    try {
      if (typeof Notification === 'undefined') { if (typeof alert === 'function') alert('جهازك لا يدعم التنبيهات. على الآيفون: ثبّتي التطبيق على الشاشة الرئيسية أولًا، ثم فعّلي التنبيهات.'); return }
      Notification.requestPermission().then((perm) => {
        this.setState({ tick: this.state.tick + 1 })
        if (perm === 'granted') { this.enablePush(); this.maybeNotify() }
      })
    } catch (e) {}
  }
  urlB64ToUint8(s) {
    const pad = '='.repeat((4 - s.length % 4) % 4)
    const b = (s + pad).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(b), arr = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
    return arr
  }
  async enablePush() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: this.urlB64ToUint8(VAPID_PUBLIC) })
      const j = sub.toJSON()
      const ok = await pushSubscribe(this.syncKey, this.identity, { endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth })
      if (ok) this.showToast('🔔 تم تفعيل التنبيهات على هذا الجهاز')
      return ok
    } catch (e) { return false }
  }
  pushNote(title, body) {
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.ready) { navigator.serviceWorker.ready.then(reg => reg.showNotification(title, { body, icon: './icon-192.png', badge: './icon-192.png' })).catch(() => { try { new Notification(title, { body }) } catch (e) {} }) }
      else new Notification(title, { body })
    } catch (e) {}
  }
  // تذكيرات محلية تظهر عند فتح التطبيق/الرجوع إليه فقط. تعتمد المحرّك الموحّد (getCycleInsights)،
  // ومفتاح إزالة التكرار موحّد notification:{coupleId}:{date}:{type} حتى لا يتكرّر التنبيه نفسه.
  maybeNotify() {
    if (!this.notifyEnabled() || this.pregActive()) return
    const today = new Date(), tISO = this.iso(today), ins = this.getCycleInsights(today)
    const r = this.data.settings.reminders || {}
    const events = []
    if (ins.daysToOvu === 0) { if (r.ovulation !== false) events.push(['ovu', 'يوم التبويض اليوم 🌸', 'أعلى فرص الحمل اليوم — التوقيت مثالي.']) }
    else if (this.chanceLevel(today) >= 3) events.push(['best', 'من أفضل أيام الجماع 💞', 'أنتِ في ذروة الخصوبة — لا تفوّتي اليوم.'])
    if (r.fertile !== false && this.diff(ins.fertileStart, today) === 0) events.push(['fertile', 'بدأت نافذة الخصوبة 🌱', 'ابدأ أيام الخصوبة المرتفعة.'])
    if (r.period !== false && ins.daysToPeriod === 0) events.push(['period', 'موعد الدورة المتوقّع اليوم 📅', 'إن لم تأتِ، يمكنكِ إجراء اختبار حمل.'])
    if (r.test && ins.daysToOvu === 1) events.push(['test', 'ذكّري نفسك باختبار التبويض 🧪', 'التبويض غدًا تقريبًا — اختبار اليوم مفيد.'])
    for (const [type, title, body] of events) {
      const k = 'notification:' + this.syncKey + ':' + tISO + ':' + type
      let done = false; try { done = localStorage.getItem(k) === '1' } catch (e) {}
      if (!done) { this.pushNote(title, body); try { localStorage.setItem(k, '1') } catch (e) {} }
    }
  }
  smartTips() {
    const tips = [], today = new Date(), tISO = this.iso(today)
    // اختبار تبويض إيجابي خلال آخر يومين → التبويض وشيك.
    let lhPos = false
    for (let i = 0; i <= 2; i++) { const lg = this.data.logs[this.iso(this.addDays(today, -i))]; if (lg && lg.ovTest === 'إيجابي') { lhPos = true; break } }
    if (lhPos) tips.push({ icon: '🧪', text: 'ظهر اختبار تبويض إيجابي — التبويض متوقّع خلال ٢٤–٣٦ ساعة. اليوم وغدًا هما الأفضل للجماع.' })
    // خصوبة عالية اليوم ولم يُسجَّل جماع → تذكير لطيف بعدم تفويت اليوم.
    const lvl = this.chanceLevel(today), todayLog = this.data.logs[tISO]
    if (lvl >= 3 && !(todayLog && todayLog.intimacy)) tips.push({ icon: '🔥', text: 'اليوم من أعلى أيامكِ خصوبة — لا تفوّتي فرصة اليوم لزيادة احتمال الحمل.' })
    // تأكيد البدء: مرّت أيام على الموعد المتوقّع دون تأكيد الدورة.
    const late = -this.getCycleInsights(today).daysToPeriod
    if (late >= 3 && !(this.data.logs[tISO] && this.data.logs[tISO].pregTest)) tips.push({ icon: '🤍', text: 'تأخّر الموعد المتوقّع للدورة — يُنصح بإجراء اختبار حمل منزلي وتسجيل نتيجته.' })
    // دورة متغيّرة → ينصح بتتبّع اختبار التبويض لتحديد أدق.
    const h = this.data.history || []
    if (h.length >= 3 && this.stdev(h) > 3 && this.ovulationEstimate().source === 'calc') tips.push({ icon: '📈', text: 'دورتكِ متغيّرة قليلًا — تتبّعي اختبار التبويض (LH) هذه الأيام لتحديد يوم التبويض بدقّة.' })
    return tips
  }
  fertileIntimacy() {
    const c = this.calc(); let n = 0, t = 0
    for (let i = 0; i < c.L; i++) { const dt = this.addDays(c.last, i), lg = this.data.logs[this.iso(dt)]; if (lg && lg.intimacy) { t++; const o = this.offsetOf(dt), ov = c.L - 14; if (o >= ov - 5 && o <= ov + 1) n++ } }
    return { inFertile: n, total: t }
  }
  lhTimeline() {
    const out = []
    for (let i = 11; i >= 0; i--) { const dt = this.addDays(new Date(), -i), lg = this.data.logs[this.iso(dt)]; if (lg && lg.ovTest) { const peak = lg.ovTest === 'إيجابي'; out.push({ key: i, d: new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { day: 'numeric' }).format(dt), res: lg.ovTest, peak, cls: 'lh' + (peak ? ' pk' : lg.ovTest === 'سلبي' ? ' ng' : '') }) } }
    return out
  }
  stdev(a) { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / a.length) }

  // ---- value builders ----
  rvGlobal() {
    const sc = this.state.screen, dark = this.data.settings.theme === 'dark'
    const nc = k => 'nav ' + (sc === k ? 'on' : '')
    return {
      themeClass: dark ? 'dark' : '', isSplash: sc === 'splash', showNav: sc !== 'splash',
      isHome: sc === 'home', isCal: sc === 'calendar', isLog: sc === 'log', isStats: sc === 'stats', isSet: sc === 'settings',
      navHomeCls: nc('home'), navCalCls: nc('calendar'), navUsCls: nc('us'), navMoreCls: nc('more'),
      dismissSplash: () => this.setState({ screen: 'home' }),
      goHome: () => this.go('home'), goCalendar: () => this.go('calendar'), goLog: () => this.go('log'), goStats: () => this.go('stats'), goSettings: () => this.go('settings'),
      goUs: () => this.go('us'), goMore: () => this.go('more'),
      sync: this.syncView(), meEmoji: this.identity ? this.identityView(this.identity).emoji : '',
    }
  }
  syncView() {
    if (this.state.syncing) return { cls: 'syncing', icon: '☁', text: 'يحفظ…' }
    if (this.state.syncError) return { cls: 'err', icon: '⚠', text: 'غير متصل' }
    if (this.state.syncedAt) return { cls: 'ok', icon: '☁', text: 'محفوظ' }
    return { cls: '', icon: '☁', text: 'المزامنة' }
  }
  rvHome() {
    const today = new Date(), ins = this.getCycleInsights(today), ph = ins.phase
    const dto = ins.daysToOvu, dtp = ins.daysToPeriod, cdFert = this.diff(ins.fertileStart, today)
    const pmap = { period: 'p-period', fertile: 'p-fertile', ovu: 'p-ovu', pred: 'p-period', normal: 'p-normal' }
    const lab = { period: 'فترة الدورة', fertile: 'نافذة الخصوبة', ovu: 'يوم التبويض', pred: 'اقترب موعد الدورة', normal: 'مرحلة عادية' }
    const cvar = { period: 'var(--rose)', fertile: 'var(--fertile)', ovu: 'var(--ovu)', pred: 'var(--rose)', normal: 'var(--ink2)' }
    let title, desc, chance
    if (ph === 'ovu') { title = 'اليوم هو يوم التبويض 🌟'; desc = 'أعلى فرص الحمل اليوم — التوقيت مثالي.'; chance = 'مرتفعة جدًا' }
    else if (ph === 'fertile') { const d = dto; title = d > 0 ? ('باقٍ ' + d + ' ' + (d === 1 ? 'يوم' : 'أيام') + ' على التبويض') : 'نافذة الخصوبة مفتوحة'; desc = 'أنتِ ضمن نافذة الخصوبة، فرص الحمل مرتفعة.'; chance = d <= 1 ? 'مرتفعة جدًا' : 'مرتفعة' }
    else if (ph === 'period') { title = 'فترة الدورة الشهرية'; desc = 'اعتني بنفسكِ وسجّلي الأعراض لمتابعة أدق.'; chance = 'منخفضة' }
    else if (ph === 'pred') { const d = dtp; title = d > 0 ? ('باقٍ ' + d + ' ' + (d === 1 ? 'يوم' : 'أيام') + ' على الدورة') : 'موعد الدورة اليوم'; desc = 'قد تبدأ الدورة قريبًا، جهّزي نفسكِ.'; chance = 'منخفضة' }
    else { const d = Math.max(0, dto); title = 'باقٍ ' + d + ' ' + (d === 1 ? 'يوم' : 'أيام') + ' على التبويض'; desc = 'أنتِ خارج نافذة الخصوبة حاليًا.'; chance = 'منخفضة' }
    const pct = Math.round((ins.cycleDay / ins.L) * 100), ang = pct * 3.6
    const ringStyle = 'conic-gradient(' + cvar[ph] + ' ' + pct + '%, var(--track) 0)'
    const smart = ins.source !== 'calc'
    const srcTxt = ins.source === 'lh' ? 'حسب اختبار التبويض' : ins.source === 'mucus' ? 'حسب الإفرازات' : ins.source === 'bbt' ? 'حسب ارتفاع الحرارة' : 'حسب التقويم'
    const meName = this.identity ? this.identityView(this.identity).name : this.data.settings.wife
    return {
      greeting: 'أهلاً، ' + meName, todayLabel: this.arLong(today),
      cycleDay: ins.cycleDay, phaseLabel: lab[ph], phasePill: 'pill ' + pmap[ph], ringStyle, ang, ringColor: cvar[ph], ringPct: pct,
      statusTitle: title, statusDesc: desc, chanceLabel: chance, chancePct: ins.conceptionPct,
      ovEstLabel: this.arShort(ins.ovuDate), ovEstSmart: smart, ovEstSrc: srcTxt,
      ovuDateLabel: this.arShort(ins.ovuDate), nextDateLabel: this.arShort(ins.nextDate),
      fertileRange: this.arShort(ins.fertileStart) + ' — ' + this.arShort(ins.fertileEnd),
      cdOvu: Math.max(0, dto), cdFertile: Math.max(0, cdFert), cdPeriod: Math.max(0, dtp),
      cdOvuW: dto === 1 ? 'يوم' : 'أيام', cdFertileW: cdFert === 1 ? 'يوم' : 'أيام', cdPeriodW: dtp === 1 ? 'يوم' : 'أيام',
      dailyTip: this.dailyTip(ph), bestDays: this.bestDays(), lateAlert: this.lateInfo(), pregAlert: this.pregInfo(),
      smartTips: this.smartTips(),
      periodPrompt: this.periodPromptInfo(),
      confirmToday: () => this.confirmPeriod(this.iso(new Date())),
      confirmOnDate: e => this.confirmPeriod(e.target.value),
      inPeriod: ph === 'period',
      endToday: () => this.endPeriod(this.iso(new Date())),
      endOnDate: e => this.endPeriod(e.target.value),
    }
  }
  rvCal() {
    const y = this.state.calY, m = this.state.calM, first = new Date(y, m, 1)
    const lead = (first.getDay() + 1) % 7, today = this.iso(new Date())
    const pmap = { period: 'ph-period', fertile: 'ph-fertile', ovu: 'ph-ovu', pred: 'ph-pred', normal: '' }
    const si = this.state.selISO || today
    const cells = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(y, m, 1 - lead + i), iso = this.iso(date), inM = date.getMonth() === m
      const lg = this.data.logs[iso], ph = this.phaseOf(date)
      let cls = 'cell ' + pmap[ph]; if (!inM) cls += ' out'; if (iso === today) cls += ' today'; if (iso === si) cls += ' sel'
      const mk = this.dayMarks(date, iso)
      cells.push({
        key: i, day: date.getDate(), iso, cls,
        inti: !!(lg && lg.intimacy), lhpk: !!(lg && lg.ovTest === 'إيجابي'), preg: !!(lg && lg.pregTest === 'إيجابي'),
        occ: mk.occ, appt: mk.appt,
        other: !!(lg && !lg.intimacy && lg.ovTest !== 'إيجابي' && lg.pregTest !== 'إيجابي' && (lg.ovTest || lg.pregTest || lg.bbt || lg.flow || (lg.symptoms && lg.symptoms.length) || lg.mood)),
        onClick: () => { this.hap(); this.setState({ selISO: iso, dayOpen: true }) },
      })
    }
    const weekDays = [{ k: 'س' }, { k: 'ح' }, { k: 'ن' }, { k: 'ث' }, { k: 'ر' }, { k: 'خ' }, { k: 'ج' }].map((w, i) => ({ key: i, d: w.k }))
    const d = this.parse(si), phk = this.phaseOf(d), l = this.data.logs[si], e = l || this.emptyLog()
    const lab = { period: 'فترة الدورة', fertile: 'نافذة الخصوبة', ovu: 'يوم التبويض', pred: 'موعد متوقع للدورة', normal: 'مرحلة عادية' }
    const pm = { period: 'p-period', fertile: 'p-fertile', ovu: 'p-ovu', pred: 'p-period', normal: 'p-normal' }
    let summary = 'لا توجد سجلات لهذا اليوم — سجّلي بسرعة بالأسفل 👇'
    if (l) { const parts = []; if (l.intimacy) parts.push('💞 جماع'); if (l.ovTest) parts.push('🧪 تبويض: ' + l.ovTest); if (l.pregTest) parts.push('🤍 حمل: ' + l.pregTest); if (l.flow) parts.push('🩸 ' + l.flow); if (l.bbt) parts.push('🌡 ' + l.bbt + '°'); if (l.mood) parts.push(l.mood); if (l.symptoms && l.symptoms.length) parts.push(l.symptoms.join('، ')); if (parts.length) summary = parts.join('  •  ') }
    const ovActs = ['سلبي', 'إيجابي'].map((o, i) => ({ key: i, label: o, cls: 'opt' + (e.ovTest === o ? (o === 'إيجابي' ? ' onp' : ' on') : ''), onClick: () => this.patchDay(si, { ovTest: e.ovTest === o ? '' : o }) }))
    const pregActs = ['سلبي', 'إيجابي'].map((o, i) => ({ key: i, label: o, cls: 'opt' + (e.pregTest === o ? (o === 'إيجابي' ? ' onp' : ' on') : ''), onClick: () => this.patchDay(si, { pregTest: e.pregTest === o ? '' : o }) }))
    const isPeriodStart = si === this.data.settings.lastPeriod
    // زر الدورة حسب سياق اليوم — لا نعرض "تأكيد بدء" إذا كانت الدورة بادية أصلاً:
    //  start = يوم البدء المسجّل · during = ضمن أيام الحيض (يعرض إنهاء) · new = يوم مرشّح لبدء دورة جديدة · none = إخفاء
    const dSince = this.diff(d, this.parse(this.data.settings.lastPeriod))
    const Pp = Math.max(2, Math.min(10, this.data.settings.periodLength || 5)), Lc = this.data.settings.cycleLength || 27
    let periodAction = 'none'
    if (dSince === 0) periodAction = 'start'
    else if (dSince > 0 && dSince < Pp) periodAction = 'during'
    else if (dSince < 0 || dSince >= Math.round(Lc / 2)) periodAction = 'new'
    const sel = {
      dateLabel: this.arLong(d), isToday: si === today, phaseLabel: lab[phk], phasePill: 'pill ' + pm[phk], summary,
      isPeriodStart, periodAction, markPeriod: () => this.confirmPeriod(si),
      endHere: () => this.endPeriod(si),
      intiCls: 'bigtog' + (e.intimacy ? ' on' : ''), intiTxt: e.intimacy ? 'نعم' : 'لا', toggleInti: () => this.patchDay(si, { intimacy: !e.intimacy }),
      ovActs, pregActs,
      editDay: () => { this.hap(); this.setState({ logISO: si, screen: 'log', saved: false }) },
    }
    return {
      monthLabel: this.arMonth(y, m), weekDays, calCells: cells, sel,
      prevMonth: () => { this.hap(); let nm = m - 1, ny = y; if (nm < 0) { nm = 11; ny-- } this.setState({ calM: nm, calY: ny }) },
      nextMonth: () => { this.hap(); let nm = m + 1, ny = y; if (nm > 11) { nm = 0; ny++ } this.setState({ calM: nm, calY: ny }) },
    }
  }
  rvLog() {
    const l = this.curLog(), iso = this.state.logISO, d = this.parse(iso), isToday = iso === this.iso(new Date())
    const flows = ['خفيف', 'متوسط', 'غزير'].map((f, i) => ({ key: i, label: f, cls: 'opt' + (l.flow === f ? ' on' : ''), onClick: () => this.patchLog({ flow: l.flow === f ? '' : f }) }))
    const symList = ['تقلصات', 'صداع', 'انتفاخ', 'تعب', 'إفرازات', 'ألم التبويض', 'حساسية الصدر', 'ألم بالظهر', 'مزاج متقلب', 'شهية مفتوحة', 'بثور', 'رغبة عالية']
    const syms = symList.map((s, i) => ({ key: i, label: s, cls: 'chip' + (l.symptoms.includes(s) ? ' on' : ''), onClick: () => this.toggleSym(s) }))
    const moods = ['😀 سعيدة', '😌 هادئة', '😐 عادية', '😣 متوترة', '😢 حزينة'].map((mo, i) => ({ key: i, label: mo, cls: 'mood' + (l.mood === mo ? ' on' : ''), onClick: () => this.patchLog({ mood: l.mood === mo ? '' : mo }) }))
    const ovs = ['سلبي', 'إيجابي', 'غير مؤكد'].map((o, i) => ({ key: i, label: o, cls: 'opt' + (l.ovTest === o ? (o === 'إيجابي' ? ' onp' : ' on') : ''), onClick: () => this.patchLog({ ovTest: l.ovTest === o ? '' : o }) }))
    const pregs = ['سلبي', 'إيجابي', 'غير مؤكد'].map((o, i) => ({ key: i, label: o, cls: 'opt' + (l.pregTest === o ? (o === 'إيجابي' ? ' onp' : ' on') : ''), onClick: () => this.patchLog({ pregTest: l.pregTest === o ? '' : o }) }))
    // مخاط عنق الرحم — مؤشر خصوبة كتابي بلا قياس. «مثل بياض البيض» = ذروة الخصوبة.
    const mucusList = ['جاف', 'لزج', 'كريمي', 'مائي', 'مثل بياض البيض']
    const mucus = mucusList.map((o, i) => ({ key: i, label: o, cls: 'opt' + (l.mucus === o ? (o === 'مثل بياض البيض' ? ' onp' : ' on') : ''), onClick: () => this.patchLog({ mucus: l.mucus === o ? '' : o }) }))
    return {
      logDateLabel: isToday ? 'اليوم • ' + this.arShort(d) : this.arLong(d),
      flowOpts: flows, symOpts: syms, moodOpts: moods, ovOpts: ovs, pregOpts: pregs, mucusOpts: mucus,
      intimacyTxt: l.intimacy ? 'نعم' : 'لا', intimacyCls: 'bigtog' + (l.intimacy ? ' on' : ''), toggleIntimacy: () => this.patchLog({ intimacy: !l.intimacy }),
      medsTxt: l.meds ? 'نعم' : 'لا', medsCls: 'bigtog' + (l.meds ? ' on' : ''), toggleMeds: () => this.patchLog({ meds: !l.meds }),
      weightVal: l.weight || '', setWeight: e => this.patchLog({ weight: e.target.value }),
      bbtVal: l.bbt || '', setBbt: e => this.patchLog({ bbt: e.target.value }),
      noteVal: l.note || '', setNote: e => this.patchLog({ note: e.target.value }),
      prevDay: () => this.shiftLog(-1), nextDay: () => this.shiftLog(1),
      saveLog: () => this.doSave(),
    }
  }
  rvStats() {
    const h = this.data.history || [], c = this.calc(), hasHist = h.length > 0
    const avg = hasHist ? Math.round(h.reduce((a, b) => a + b, 0) / h.length) : c.L
    const sd = hasHist ? this.stdev(h) : 0, reg = !hasHist ? '—' : sd <= 1.5 ? 'منتظمة' : sd <= 3 ? 'شبه منتظمة' : 'متغيرة'
    const mx = Math.max(...h, c.L)
    const bars = h.map((v, i) => ({ key: i, len: v, h: Math.round((v / mx) * 100) + '%', label: 'د' + (i + 1), cls: 'bar' }))
    bars.push({ key: 'cur', len: c.L, h: Math.round((c.L / mx) * 100) + '%', label: 'الآن', cls: 'bar cur' })
    const bbts = []; for (let i = 9; i >= 0; i--) { const iso = this.iso(this.addDays(new Date(), -i)), lg = this.data.logs[iso]; if (lg && lg.bbt) bbts.push({ iso, v: +lg.bbt }) }
    const hasBbt = bbts.length >= 2
    let bbtPath = '', bbtPts = [], bbtH = 118
    if (hasBbt) {
      const W = 300, H = 118, pad = 16, vs = bbts.map(b => b.v), mn = Math.min(...vs) - .1, mxx = Math.max(...vs) + .1
      const X = i => pad + i * (W - 2 * pad) / (bbts.length - 1), Y = v => H - pad - ((v - mn) / (mxx - mn)) * (H - 2 * pad)
      bbtPts = bbts.map((b, i) => [X(i), Y(b.v)])
      bbtPath = bbtPts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
      bbtH = H
    }
    const fi = this.fertileIntimacy(), lh = this.lhTimeline()
    const spread = hasHist ? Math.max(...h) - Math.min(...h) : 0
    return {
      avgCycle: avg, regLabel: reg, avgPeriod: c.P, cycleBars: bars, hasBbt, bbtPath, bbtPts, bbtH,
      cyclesCount: h.length,
      fiInFertile: fi.inFertile, fiTotal: fi.total,
      lhTimeline: lh, hasLh: lh.length > 0,
      varAlert: hasHist && spread >= 5, varMsg: 'لوحظ تفاوت ' + spread + ' أيام بين أطول وأقصر دورة — يُفضّل متابعة الطبيب إذا تكرر ذلك.',
      insight: !hasHist ? 'سجّلي بدء كل دورة (بزر "تأكيد بدء الدورة") لبناء سجلكِ وتحسين دقة توقّع التبويض تدريجيًا.' : reg === 'منتظمة' ? 'دورتكِ منتظمة بشكل ممتاز، ما يجعل توقّع التبويض أكثر دقة.' : 'هناك تفاوت بسيط في طول الدورة، استمري بالتسجيل لتحسين دقة التوقّعات.',
    }
  }
  rvSet() {
    const s = this.data.settings, r = s.reminders
    const rem = [{ k: 'fertile', label: 'بداية نافذة الخصوبة', ic: '🌱' }, { k: 'ovulation', label: 'يوم التبويض', ic: '🌸' }, { k: 'period', label: 'موعد الدورة القادمة', ic: '📅' }, { k: 'test', label: 'تذكير اختبار التبويض', ic: '🧪' }]
      .map((x, i) => ({ key: i, label: x.label, ic: x.ic, on: !!r[x.k], cls: 'sw' + (r[x.k] ? ' on' : ''), onClick: () => this.toggleRem(x.k) }))
    return {
      coupleLabel: s.husband + ' & ' + s.wife,
      setLastVal: s.lastPeriod, onLast: e => this.setLast(e.target.value),
      setCycle: s.cycleLength, setPeriod: s.periodLength,
      incCycle: () => this.bumpCycle(1), decCycle: () => this.bumpCycle(-1),
      incPeriod: () => this.bumpPeriod(1), decPeriod: () => this.bumpPeriod(-1),
      remOpts: rem, themeCls: 'sw' + (s.theme === 'dark' ? ' on' : ''), onTheme: () => this.toggleTheme(),
      themeLabel: s.theme === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح', openReset: () => this.openResetModal(),
      syncKey: this.syncKey,
      syncStatus: this.state.syncing ? 'جارٍ الحفظ…' : this.state.syncError ? '⚠️ غير متصل — سيُحفظ عند عودة الاتصال' : (this.state.syncedAt ? 'محفوظ ☁️ ' + new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { hour: 'numeric', minute: 'numeric' }).format(new Date(this.state.syncedAt)) : 'بانتظار المزامنة'),
      identity: this.identity,
      husbandCls: 'opt' + (this.identity === 'husband' ? ' on' : ''), wifeCls: 'opt' + (this.identity === 'wife' ? (' onp') : ''),
      pickHusband: () => this.setIdentity('husband'), pickWife: () => this.setIdentity('wife'),
      husbandName: s.husband, wifeName: s.wife,
      lastEdit: (() => { const e = this.data.editedBy; if (!e) return ''; const v = this.identityView(e); return v.emoji + ' ' + v.name })(),
      notifOn: this.notifyEnabled(), enableNotif: () => this.requestNotif(),
      vitOn: !!(s.vitamins && s.vitamins.on), toggleVit: () => this.toggleVitamins(),
      openTools: () => this.go('tools'),
      pregOn: this.pregActive(), togglePreg: () => this.setPregnancy(!this.pregActive()),
      cmText: this.state.cmText, cmTimes: this.state.cmTimes, cmDays: this.state.cmDays, cmTarget: this.state.cmTarget,
      cmMode: this.state.cmMode, cmWhen: this.state.cmWhen, cmHour: this.state.cmHour,
      onCmText: e => this.setState({ cmText: e.target.value }),
      onCmTimes: e => this.setState({ cmTimes: e.target.value }),
      onCmDays: e => this.setState({ cmDays: e.target.value }),
      onCmHour: e => this.setState({ cmHour: e.target.value }),
      setCmTarget: t => this.setState({ cmTarget: t }),
      setCmMode: m => this.setState({ cmMode: m }),
      setCmWhen: w => this.setState({ cmWhen: w }),
      addCustoms: () => this.addCustoms(),
      customs: (this.state.customs || []).map(c => ({
        id: c.id, text: c.text,
        targetLabel: c.target === 'wife' ? '👩 رويدا' : c.target === 'husband' ? '👨 عبدالرحمن' : '👫 الاثنين',
        progress: c.mode === 'once'
          ? (c.done ? 'أُرسلت ✓' : (c.at_hour !== null && c.at_hour !== undefined ? 'مرة واحدة عند الساعة ' + c.at_hour : 'مرة واحدة — قريبًا'))
          : (c.done ? 'انتهت' : 'أُرسلت ' + c.sent + ' من ' + c.times) + ' • خلال ' + c.days + (c.days === 1 ? ' يوم' : ' أيام'),
        del: () => this.delCustom(c.id),
      })),
    }
  }

  // حلقة تقدّم SVG (يستبدل conic-gradient): أنعم وأدق وقابلة للتحريك عبر stroke-dashoffset.
  renderRing(pct, colorVar, center) {
    const C = 2 * Math.PI * 44
    const p = Math.max(0, Math.min(100, pct || 0))
    return (
      <div className="ringbox">
        <svg className="ring-svg" viewBox="0 0 100 100">
          <circle className="ring-track" cx="50" cy="50" r="44" />
          <circle className="ring-prog" cx="50" cy="50" r="44" style={{ stroke: colorVar, strokeDasharray: C, strokeDashoffset: C * (1 - p / 100) }} />
        </svg>
        <div className="ring-center">{center}</div>
      </div>
    )
  }

  render() {
    const g = this.rvGlobal()
    if (this.state.locked) return this.renderLock(g)
    if (this.state.obStep > 0) return this.renderOnboarding(g)
    return (
      <div className={('app ' + g.themeClass).trim()}>
        <div className="phone">
          <div className="amb"><i></i><i></i></div>
          {this.state.sheet && this.renderSheet(g)}
          {g.isSplash && (
            <div className="splash" onClick={g.dismissSplash}>
              <div className="logo">🤍</div>
              <h1>أيام تبويض رويدا</h1>
              <p>رفيقكِ اليومي لمتابعة الخصوبة</p>
              <div className="ld"><i></i><i></i><i></i></div>
            </div>
          )}
          {g.showNav && (
            <div className="topbar">
              <button className={'syncbadge ' + g.sync.cls} onClick={g.goSettings} title="حالة المزامنة">
                <span className="si"><Icon name="cloud" /></span>{g.sync.text}
                {g.meEmoji && <span className="me">{g.meEmoji}</span>}
              </button>
            </div>
          )}
          {this.state.toast && <div className="toast">{this.state.toast}</div>}
          {this.state.notifMsg && (
            <div className="modal" onClick={() => this.setState({ notifMsg: null })}>
              <div className="modalcard" onClick={e => e.stopPropagation()}>
                <div className="modale">💌</div>
                {this.state.notifMsg.title && <div className="modalt">{this.state.notifMsg.title}</div>}
                <div className="modalb">{this.state.notifMsg.body}</div>
                <button className="qbtn" onClick={() => this.setState({ notifMsg: null })}>إغلاق</button>
              </div>
            </div>
          )}
          {this.state.resetModal && (
            <div className="modal" onClick={() => this.setState({ resetModal: false })}>
              <div className="modalcard" onClick={e => e.stopPropagation()} style={{ textAlign: 'right' }}>
                <div className="modale" style={{ textAlign: 'center' }}>🗑️</div>
                <div className="modalt" style={{ textAlign: 'center' }}>حذف البيانات</div>
                <p className="selsum" style={{ margin: '0 0 14px' }}>اختاري نطاق الحذف. تنبيه: «الحذف من كل الأجهزة» يمسح البيانات من جميع الأجهزة المرتبطة، وليس من هذا الجهاز فقط.</p>
                <button className="opt" style={{ width: '100%', marginBottom: 10 }} onClick={() => this.resetLocalOnly()}>🧹 حذف من هذا الجهاز فقط</button>
                <div className="lbl" style={{ marginTop: 6 }}>لحذف الكل، اكتبي: <b>حذف من كل الأجهزة</b></div>
                <input className="datein" type="text" aria-label="عبارة تأكيد الحذف" style={{ width: '100%', marginBottom: 10 }} value={this.state.resetText} onChange={e => this.setState({ resetText: e.target.value })} placeholder="حذف من كل الأجهزة" />
                <button className="danger" style={{ marginBottom: 8 }} disabled={(this.state.resetText || '').trim() !== 'حذف من كل الأجهزة'} onClick={() => this.resetAllDevices()}>حذف من كل الأجهزة نهائيًا</button>
                <button className="linkbtn" onClick={() => this.setState({ resetModal: false, resetText: '' })}>إلغاء</button>
              </div>
            </div>
          )}
          {this.state.importPreview && (
            <div className="modal" onClick={() => this.setState({ importPreview: null })}>
              <div className="modalcard" onClick={e => e.stopPropagation()} style={{ textAlign: 'right' }}>
                <div className="modale" style={{ textAlign: 'center' }}>⬆️</div>
                <div className="modalt" style={{ textAlign: 'center' }}>تأكيد الاستيراد</div>
                <p className="selsum" style={{ margin: '0 0 12px' }}>سيتم دمج هذه البيانات مع الحالية (الأحدث لكل عنصر يُعتمد). قد ينعكس ذلك على الأجهزة الأخرى بعد المزامنة.</p>
                <div className="info" style={{ marginBottom: 16 }}>
                  <div className="irow"><div className="ib bp">📅</div><div><div className="it">أيام مسجّلة</div><div className="iv">{this.state.importPreview.counts.logs}</div></div></div>
                  <div className="irow"><div className="ib bo">🩺</div><div><div className="it">مواعيد</div><div className="iv">{this.state.importPreview.counts.appts}</div></div></div>
                  <div className="irow"><div className="ib bf">🎉</div><div><div className="it">مناسبات</div><div className="iv">{this.state.importPreview.counts.occ}</div></div></div>
                  <div className="irow"><div className="ib bp">🔄</div><div><div className="it">دورات سابقة</div><div className="iv">{this.state.importPreview.counts.cycles}</div></div></div>
                </div>
                <button className="qbtn" style={{ marginBottom: 8 }} onClick={() => this.confirmImport()}>دمج واستيراد</button>
                <button className="linkbtn" onClick={() => this.setState({ importPreview: null })}>إلغاء</button>
              </div>
            </div>
          )}
          <div className="scroll">
            {g.isHome && this.renderHome(g)}
            {g.isCal && this.renderCalendar()}
            {g.isLog && this.renderLog()}
            {g.isStats && this.renderStats()}
            {g.isSet && this.renderSettings()}
            {this.state.screen === 'us' && this.renderUs(g)}
            {this.state.screen === 'more' && this.renderMore(g)}
            {this.state.screen === 'cycle' && this.renderCycleDetails(g)}
            {this.state.screen === 'tools' && this.renderTools()}
            {this.state.screen === 'report' && this.renderReport()}
            {this.state.screen === 'salah' && this.renderSalah(g)}
            {this.state.screen === 'letter' && this.renderLetter(g)}
            {this.state.screen === 'honeymoon' && this.renderHoneymoon(g)}
            {this.state.screen === 'book' && this.renderBook(g)}
            {this.state.screen === 'lhplan' && this.renderLhPlan(g)}
          </div>
          {g.showNav && (
            <div className="nav">
              <button className={g.navHomeCls} onClick={g.goHome}><span className="ic"><Icon name="home" /></span>الرئيسية</button>
              <button className={g.navCalCls} onClick={g.goCalendar}><span className="ic"><Icon name="calendar" /></span>التقويم</button>
              <button className="add" aria-label="تسجيل سريع" onClick={() => this.openSheet()}><span className="ic"><Icon name="plus" /></span></button>
              <button className={g.navUsCls} onClick={g.goUs}><span className="ic"><Icon name="heart" /></span>نحن</button>
              <button className={g.navMoreCls} onClick={g.goMore}><span className="ic"><Icon name="menu" /></span>المزيد</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  dailyEncouragement() {
    const a = [
      '🤲 اللهم ارزقهما ذريةً صالحةً تقرّ بها أعينهما.',
      '🌷 كل يوم تقتربان فيه من حلمكما خطوة — توكّلا على الله.',
      '💗 الحبّ والصبر أساس الرحلة الجميلة، وأنتما معًا أقوى.',
      '🤍 خير الأمور التوكّل على الله بعد الأخذ بالأسباب.',
      '✨ لا تيأسا من رحمة الله، فرزقه يأتي في أحسن وقت.',
      '🌿 الطمأنينة والراحة النفسية تقرّبان الخير بإذن الله.',
      '🤲 «ربِّ هب لي من لدنك ذريةً طيبة إنك سميع الدعاء».',
    ]
    return a[this.dayOfYear(new Date()) % a.length]
  }

  renderHome(g) {
    if (this.pregActive()) return this.renderPregnancy(g)
    const v = this.rvHome()
    const tww = this.twwInfo()
    const topTip = v.smartTips && v.smartTips[0]
    const apptSoon = this.apptsView().find(a => !a.past && (a.when === 'اليوم' || a.when === 'بكرة'))
    const showPreg = v.pregAlert.show
    const showPeriod = !showPreg && v.periodPrompt.show
    const showAppt = !showPreg && !showPeriod && apptSoon
    const showTww = !showPreg && !showPeriod && !showAppt && tww.show
    // سطر بسيط للصلاة القادمة بالرياض
    const pt = this.prayerToday(), np = nextPrayer(new Date())
    const npMin = np.key !== 'sunrise' ? pt[np.key] : np.at
    let pin = npMin - riyadhNowMin(); if (pin < 0) pin += 1440
    const pcd = pin >= 60 ? Math.floor(pin / 60) + ' س ' + (pin % 60) + ' د' : pin + ' د'
    const upcoming = this.upcomingItems()
    const lhT = this.lhToday()
    // هيرو الذكرى: يظهر يوم الذكرى الشهرية وقبلها بيوم
    const wedm = (this.data.occasions || []).find(o => o.id === 'wedm' && !o.deletedAt)
    let anniv = null
    if (wedm) {
      const ad = this.occDate(wedm), adays = this.diff(ad, new Date())
      if (adays <= 1) {
        const a = this.parse(wedm.anchor), months = (ad.getFullYear() - a.getFullYear()) * 12 + (ad.getMonth() - a.getMonth())
        anniv = { days: adays, months, label: months === 1 ? 'أول شهر زواج' : 'إتمام ' + months + ' شهر زواج', when: adays === 0 ? 'اليوم 🎉' : 'بكرة 🎉' }
      }
    }
    return (
      <div className="screen stagger">
        <div className="hd">
          <div><div className="hi">{v.todayLabel}</div><h1 className="nm">{v.greeting} 🤍</h1></div>
          <button className="tbtn" aria-label="الإعدادات" onClick={g.goSettings}><Icon name="settings" /></button>
        </div>

        {anniv && (
          <div className="card annivhero">
            <div className="ahe">💞</div>
            <div className="aht">{anniv.label}</div>
            <div className="ahs">عبدالرحمن 🤍 رويدا · {anniv.when}</div>
            <button className="qbtn" style={{ marginTop: 14 }} onClick={() => this.go('letter')}>💌 افتحي رسالتنا</button>
          </div>
        )}

        {!this.identity && (
          <div className="card">
            <div className="ttl">مين يستخدم هذا الجهاز؟</div>
            <div className="opts">
              <button className="opt" onClick={() => this.setIdentity('husband')}>👨 {this.data.settings.husband}</button>
              <button className="opt onp" onClick={() => this.setIdentity('wife')}>👩 {this.data.settings.wife}</button>
            </div>
          </div>
        )}

        {/* ١) بطاقة البطل — أهم شيء اليوم */}
        <div className="card">
          <div className="ringwrap">
            {this.renderRing(v.ringPct, v.ringColor, (
              <><div className="cd"><CountUp value={v.cycleDay} /></div><div className="cdl">اليوم من الدورة</div></>
            ))}
            <div className={v.phasePill} style={{ marginTop: 14 }}><span className="dot"></span>{v.phaseLabel}</div>
          </div>
          <div className="status">
            <h2>{v.statusTitle}</h2>
            <div className="chance">احتمالية الحمل اليوم: <b>{v.chancePct}%</b> · {v.chanceLabel}</div>
          </div>
          {topTip && <div className="herohint"><span className="se">{topTip.icon}</span><span>{topTip.text}</span></div>}
          <button className="qbtn" style={{ marginTop: 14 }} onClick={g.goLog}>＋ تسجيل اليوم</button>
          <button className="linkbtn" onClick={() => this.go('cycle')}>تفاصيل الدورة ‹</button>
        </div>

        {/* جدول اختبار التبويض (LH) — يظهر أيام الاختبار */}
        {lhT && (
          <div className="card lhcard">
            <div className="ttl">🧪 وقت اختبار التبويض اليوم</div>
            {lhT.done
              ? <p className="selsum" style={{ margin: '0 0 8px' }}>✅ سجّلتِ نتيجة اليوم: <b style={{ color: 'var(--rose-d)' }}>{lhT.result}</b>{lhT.twice ? ' — ينصح باختبار ثانٍ مساءً في أيام الذروة.' : ''}</p>
              : <p className="selsum" style={{ margin: '0 0 8px' }}>{lhT.twice ? 'اختبري مرّتين اليوم (١ ظهرًا و٧ مساءً) حتى لا تفوتكِ ذروة الـLH.' : 'اختبري مرّة اليوم (بين ١٢ ظهرًا و٨ مساءً).'}{lhT.isOvu ? ' اليوم يوم الذروة المتوقّع 🎯' : ''}</p>}
            <button className="qbtn" onClick={() => { this.setState({ logISO: this.iso(new Date()) }); this.go('log') }}>سجّلي نتيجة الشريط</button>
            <button className="linkbtn" onClick={() => this.go('lhplan')}>الجدول الكامل ‹</button>
          </div>
        )}

        {/* الصلاة القادمة — سطر بسيط */}
        {this.data.settings.prayer !== false && (
          <button className="card prayerchip" onClick={() => this.go('salah')}>
            <span className="pcl"><span className="pce">🕌</span><span>الصلاة القادمة · <b>{np.name}</b></span></span>
            <span className="pcr">{fmtMin(npMin)}<span className="pcd">بعد {pcd}</span></span>
          </button>
        )}

        {/* شهر العسل — مدخل سريع */}
        <button className="card hmentry" onClick={() => this.go('honeymoon')}>
          <span className="hmel">🏝️</span>
          <span className="hmem"><span className="hmet">شهر العسل</span><span className="hmed">ذكرياتنا الأولى بعد الزواج</span></span>
          <span className="hmear">›</span>
        </button>

        {/* أبرز ما هو قادم — تبويض ومناسبات ومواعيد */}
        {upcoming.length > 0 && (
          <div className="card">
            <div className="ttl">📌 أبرز ما هو قادم</div>
            <div className="upc">
              {upcoming.map((it, i) => (
                <div key={i} className="upcrow" onClick={() => this.go('calendar')}>
                  <span className="upe">{it.icon}</span>
                  <div className="upm"><div className="upl">{it.label}</div><div className="upd">{it.dateLabel}</div></div>
                  <span className="upw">{it.when}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ٢) نصيحة اليوم */}
        <div className="card">
          <div className="tip"><div className="te">💡</div><div><div className="tt">نصيحة اليوم</div><div className="tx">{v.dailyTip}</div></div></div>
        </div>

        {/* ٣) تنبيه مهم — يظهر فقط عند الحاجة */}
        {showPreg && (
          <div className="card" style={{ animation: 'pop .3s' }}>
            <div className="alert good" style={{ marginBottom: 13 }}><div className="ae">🎉</div><div><div className="at">مبروك!</div><div className="ax">{v.pregAlert.msg}</div></div></div>
            <button className="qbtn" onClick={() => this.setPregnancy(true)}>🤰 تفعيل وضع متابعة الحمل</button>
          </div>
        )}
        {showPeriod && (
          <div className="card">
            <div className="ttl">{v.periodPrompt.title}</div>
            <p className="selsum">هل بدأت دورتكِ فعلًا؟ أكّدي ليُعاد حساب التبويض والخصوبة بدقّة.</p>
            <button className="qbtn" onClick={v.confirmToday}>🩸 نعم، بدأت اليوم</button>
            <div className="fld" style={{ marginTop: 13 }}>
              <span style={{ fontSize: 13, color: 'var(--ink2)' }}>أو اختاري يوم البداية</span>
              <input className="datein" type="date" value="" onChange={v.confirmOnDate} />
            </div>
          </div>
        )}
        {v.inPeriod && (
          <div className="card">
            <div className="ttl">🩸 دورتكِ مستمرة</div>
            <p className="selsum">عند انتهائها أكّدي ليُضبط طول الحيض الفعلي — تُحدَّد أيام الدورة فقط لا كل الشهر.</p>
            <button className="qbtn" onClick={v.endToday}>✅ انتهت دورتي اليوم</button>
            <div className="fld" style={{ marginTop: 13 }}>
              <span style={{ fontSize: 13, color: 'var(--ink2)' }}>أو اختاري يوم الانتهاء</span>
              <input className="datein" type="date" value="" onChange={v.endOnDate} />
            </div>
          </div>
        )}
        {showAppt && (
          <div className="alert"><div className="ae">🩺</div><div><div className="at">{apptSoon.when === 'اليوم' ? 'موعدكم اليوم' : 'تذكير موعد بكرة'}</div><div className="ax">{apptSoon.type}{apptSoon.note ? ' — ' + apptSoon.note : ''}</div></div></div>
        )}
        {showTww && (
          <div className="card">
            <div className="ttl">⏳ الأسبوعان بعد التبويض — اليوم {tww.day} من 14</div>
            <div className="track" style={{ height: 8, borderRadius: 6, background: 'var(--track)', overflow: 'hidden', margin: '4px 0 10px' }}>
              <div style={{ width: tww.pct + '%', height: '100%', background: 'var(--grad)' }}></div>
            </div>
            <p className="selsum" style={{ margin: 0 }}>{tww.msg}</p>
          </div>
        )}

        {/* ٤) رسالة لطيفة / دعاء */}
        <div className="note" style={{ marginTop: 4 }}>{this.dailyEncouragement()}</div>
      </div>
    )
  }

  renderCycleDetails(g) {
    const v = this.rvHome()
    const tww = this.twwInfo()
    return (
      <div className="screen stagger">
        <div className="hd" style={{ alignItems: 'center' }}><div><div className="hi">نظرة تفصيلية</div><h1 className="nm">تفاصيل الدورة</h1></div><button className="tbtn" aria-label="رجوع" onClick={() => this.go('home')}><Icon name="chevron-right" /></button></div>
        {v.ovEstSmart && <div className="note" style={{ background: 'var(--fertile-s)', color: 'var(--fertile)', marginBottom: 15 }}>🎯 <div>التبويض المُقدّر من بياناتكِ: <b>{v.ovEstLabel}</b> ({v.ovEstSrc})</div></div>}
        <div className="ttl">العد التنازلي</div>
        <div className="cd3">
          <div className="cdc o"><div className="cv"><CountUp value={v.cdOvu} /></div><div className="cu">{v.cdOvuW}</div><div className="ck">على التبويض</div></div>
          <div className="cdc f"><div className="cv"><CountUp value={v.cdFertile} /></div><div className="cu">{v.cdFertileW}</div><div className="ck">على نافذة الخصوبة</div></div>
          <div className="cdc"><div className="cv"><CountUp value={v.cdPeriod} /></div><div className="cu">{v.cdPeriodW}</div><div className="ck">على الدورة القادمة</div></div>
        </div>
        <div className="card">
          <div className="ttl">تفاصيل الدورة</div>
          <div className="info">
            <div className="irow"><div className="ib bf">🌱</div><div><div className="it">نافذة الخصوبة</div><div className="iv">{v.fertileRange}</div></div></div>
            <div className="irow"><div className="ib bo">🌸</div><div><div className="it">يوم التبويض المتوقع</div><div className="iv">{v.ovuDateLabel}</div></div></div>
            <div className="irow"><div className="ib bp">📅</div><div><div className="it">الدورة القادمة المتوقعة</div><div className="iv">{v.nextDateLabel}</div></div></div>
          </div>
        </div>
        <div className="card">
          <div className="ttl">أفضل أيام الجماع</div>
          <div className="best">
            {v.bestDays.map(b => (<div key={b.key} className={b.cls}><div className="bdv">{b.label}</div><div className="bdt">{b.tag}</div></div>))}
          </div>
        </div>
        {tww.show && (
          <div className="card">
            <div className="ttl">⏳ الأسبوعان بعد التبويض — اليوم {tww.day} من 14</div>
            <div className="track" style={{ height: 8, borderRadius: 6, background: 'var(--track)', overflow: 'hidden', margin: '4px 0 10px' }}><div style={{ width: tww.pct + '%', height: '100%', background: 'var(--grad)' }}></div></div>
            <p className="selsum" style={{ margin: 0 }}>{tww.msg}</p>
          </div>
        )}
      </div>
    )
  }

  renderPregnancy(g) {
    const v = this.pregView()
    return (
      <div className="screen stagger">
        <div className="hd">
          <div><div className="hi">وضع متابعة الحمل 🤰</div><h1 className="nm">مبروك {this.data.settings.wife} 🤍</h1></div>
          <button className="tbtn" aria-label="الإعدادات" onClick={g.goSettings}><Icon name="settings" /></button>
        </div>
        <div className="card">
          <div className="ringwrap">
            {this.renderRing(v.pct, 'var(--fertile)', (
              <><div className="cd"><CountUp value={v.wk} /></div><div className="cdl">أسبوع {v.dd > 0 ? '+' + v.dd + ' يوم' : ''}</div></>
            ))}
            <div className="pill p-fertile" style={{ marginTop: 14 }}><span className="dot"></span>{v.tri}</div>
          </div>
          <div className="status">
            <h2>{v.milestone}</h2>
            <p>طفلكِ ينمو يومًا بعد يوم — اعتني بنفسكِ وتغذيتكِ. 🤍</p>
          </div>
        </div>
        <div className="cd3">
          <div className="cdc f"><div className="cv">{v.wk}</div><div className="cu">أسبوع</div><div className="ck">عمر الحمل</div></div>
          <div className="cdc o"><div className="cv">{v.toEdd}</div><div className="cu">يوم</div><div className="ck">على الولادة</div></div>
          <div className="cdc"><div className="cv">{40 - v.wk > 0 ? 40 - v.wk : 0}</div><div className="cu">أسبوع</div><div className="ck">متبقٍّ تقريبًا</div></div>
        </div>
        <div className="card">
          <div className="ttl">تفاصيل الحمل</div>
          <div className="info">
            <div className="irow"><div className="ib bo">📅</div><div><div className="it">موعد الولادة المتوقّع</div><div className="iv">{v.eddLabel}</div></div></div>
            <div className="irow"><div className="ib bf">🌱</div><div><div className="it">بداية آخر دورة (LMP)</div><div className="iv">{v.lmpLabel}</div></div></div>
            <div className="irow"><div className="ib bp">🤰</div><div><div className="it">المرحلة</div><div className="iv">{v.tri} — {v.pct}%</div></div></div>
          </div>
        </div>
        <div className="note">🤍 <div>التواريخ تقديرية بناءً على تاريخ آخر دورة. للمتابعة الدقيقة راجعي طبيبتكِ المختصة.</div></div>
        <button className="danger" onClick={() => { if (typeof confirm !== 'function' || confirm('إيقاف وضع متابعة الحمل والعودة لتتبّع الدورة؟')) this.setPregnancy(false) }}>إيقاف وضع الحمل</button>
      </div>
    )
  }

  renderCalendar() {
    const v = this.rvCal()
    return (
      <div className="screen stagger">
        <div className="hd"><div><div className="hi">تتبّعي دورتكِ بصريًا</div><h1 className="nm">التقويم</h1></div></div>
        <div className="card">
          <div className="calhd">
            <div className="mn">{v.monthLabel}</div>
            <div className="calnav"><button className="cn" aria-label="الشهر السابق" onClick={v.prevMonth}><Icon name="chevron-right" /></button><button className="cn" aria-label="الشهر التالي" onClick={v.nextMonth}><Icon name="chevron-left" /></button></div>
          </div>
          <div className="wk">{v.weekDays.map(w => <span key={w.key}>{w.d}</span>)}</div>
          <div className="grid7">
            {v.calCells.map(c => (
              <button key={c.key} className={c.cls} onClick={c.onClick}>
                {c.occ && <span className="occmk">{c.occ}</span>}
                {c.day}
                <span className="mkrow">
                  {c.inti && <i className="mh">♥</i>}
                  {c.preg && <i className="mhg">♥</i>}
                  {c.lhpk && <i className="mp"></i>}
                  {c.appt && <i className="mappt">🩺</i>}
                  {c.other && <i className="mn"></i>}
                </span>
              </button>
            ))}
          </div>
          <div className="legend">
            <span><i className="li-period"></i>الدورة</span>
            <span><i className="li-fertile"></i>الخصوبة</span>
            <span><i className="li-ovu"></i>التبويض</span>
            <span><i className="li-pred"></i>متوقعة</span>
            <span><i style={{ background: 'var(--rose-d)', width: 8, height: 8, borderRadius: '50%' }}></i>جماع</span>
            <span><i style={{ background: 'var(--fertile)', width: 8, height: 8, borderRadius: '50%' }}></i>حمل</span>
            <span>🎉 مناسبة</span>
            <span>🩺 موعد</span>
          </div>
        </div>
        <div className="card" style={{ animation: 'pop .3s' }}>
          <button className="dayhdr" onClick={() => { this.hap(); this.setState({ dayOpen: !this.state.dayOpen }) }}>
            <span className={'chev' + (this.state.dayOpen ? ' open' : '')}>⌄</span>
            <div className="dayhdr-main">
              <div className="hi" style={{ marginBottom: 4 }}>{v.sel.isToday ? 'اليوم • ' : ''}{v.sel.dateLabel}</div>
              <div className={v.sel.phasePill}><span className="dot"></span>{v.sel.phaseLabel}</div>
            </div>
          </button>
          {this.state.dayOpen && (
            <div style={{ animation: 'pop .25s', marginTop: 12 }}>
              <p className="selsum">{v.sel.summary}</p>
              {v.sel.periodAction === 'start' && (
                <button className="bigtog on" onClick={v.sel.markPeriod} style={{ marginBottom: 13 }}>🩸 يوم بدء دورتكِ<span className="yn">✓</span></button>
              )}
              {v.sel.periodAction === 'during' && (
                <button className="bigtog" onClick={v.sel.endHere} style={{ marginBottom: 13 }}>🩸 انتهت دورتي هنا<span className="yn">تأكيد</span></button>
              )}
              {v.sel.periodAction === 'new' && (
                <button className="bigtog" onClick={v.sel.markPeriod} style={{ marginBottom: 13 }}>🩸 تأكيد بدء الدورة هنا<span className="yn">تأكيد</span></button>
              )}
              <button className={v.sel.intiCls} onClick={v.sel.toggleInti} style={{ marginBottom: 13 }}>💞 جماع<span className="yn">{v.sel.intiTxt}</span></button>
              <div className="lbl">🧪 اختبار التبويض</div>
              <div className="opts" style={{ marginBottom: 13 }}>{v.sel.ovActs.map(o => <button key={o.key} className={o.cls} onClick={o.onClick}>{o.label}</button>)}</div>
              <div className="lbl">🤍 اختبار الحمل</div>
              <div className="opts" style={{ marginBottom: 15 }}>{v.sel.pregActs.map(o => <button key={o.key} className={o.cls} onClick={o.onClick}>{o.label}</button>)}</div>
              <button className="qbtn" onClick={v.sel.editDay}>✏️ تفاصيل أكثر (أعراض، مزاج، حرارة، ملاحظات)</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  renderLog() {
    const v = this.rvLog()
    return (
      <div className="screen stagger">
        <div className="hd"><div><div className="hi">سجّلي بياناتكِ اليومية</div><h1 className="nm">تسجيل اليوم</h1></div></div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
          <button className="cn" aria-label="اليوم السابق" onClick={v.prevDay}><Icon name="chevron-right" /></button>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>{v.logDateLabel}</div>
          <button className="cn" aria-label="اليوم التالي" onClick={v.nextDay}><Icon name="chevron-left" /></button>
        </div>
        <button className={v.intimacyCls} onClick={v.toggleIntimacy} style={{ marginBottom: 15 }}>💞 تسجيل الجماع<span className="yn">{v.intimacyTxt}</span></button>
        <div className="card">
          <div className="lbl">🧪 اختبار التبويض</div>
          <div className="opts">{v.ovOpts.map(o => <button key={o.key} className={o.cls} onClick={o.onClick}>{o.label}</button>)}</div>
        </div>
        <div className="card">
          <div className="lbl">💧 الإفرازات (مخاط عنق الرحم)</div>
          <div className="opts" style={{ flexWrap: 'wrap', gap: 8 }}>{v.mucusOpts.map(o => <button key={o.key} className={o.cls} style={{ flex: '1 0 28%' }} onClick={o.onClick}>{o.label}</button>)}</div>
          <p className="selsum" style={{ margin: '9px 2px 0' }}>«مثل بياض البيض» = ذروة الخصوبة — أفضل أيام المحاولة 🎯</p>
        </div>
        <div className="card">
          <div className="lbl">🤍 اختبار الحمل</div>
          <div className="opts">{v.pregOpts.map(o => <button key={o.key} className={o.cls} onClick={o.onClick}>{o.label}</button>)}</div>
        </div>
        <div className="card">
          <div className="lbl">🌡 درجة الحرارة الأساسية (BBT) — اختياري</div>
          <div className="fld">
            <span style={{ fontSize: 13, color: 'var(--ink2)' }}>بالدرجة المئوية °</span>
            <input className="num" type="number" step="0.1" placeholder="36.6" value={v.bbtVal} onChange={v.setBbt} />
          </div>
        </div>
        <div className="card">
          <div className="lbl">🩸 تدفّق الدورة</div>
          <div className="opts">{v.flowOpts.map(f => <button key={f.key} className={f.cls} onClick={f.onClick}>{f.label}</button>)}</div>
        </div>
        <div className="card">
          <div className="lbl">😌 المزاج</div>
          <div className="moods">{v.moodOpts.map(m => <button key={m.key} className={m.cls} onClick={m.onClick}>{m.label}</button>)}</div>
        </div>
        <div className="card">
          <div className="lbl">✨ الأعراض</div>
          <div className="chips">{v.symOpts.map(s => <button key={s.key} className={s.cls} onClick={s.onClick}>{s.label}</button>)}</div>
        </div>
        <div className="card">
          <div className="lbl">📝 ملاحظات</div>
          <textarea className="area" placeholder="اكتبي أي ملاحظة لهذا اليوم..." value={v.noteVal} onChange={v.setNote} />
        </div>
        <div className="savebar"><button className="qbtn" onClick={v.saveLog}>تم ✓ (يُحفظ تلقائيًا)</button></div>
      </div>
    )
  }

  renderStats() {
    const v = this.rvStats()
    return (
      <div className="screen stagger">
        <div className="hd" style={{ alignItems: 'center' }}><div><div className="hi">اعرفي نمط دورتكِ</div><h1 className="nm">الإحصائيات</h1></div><button className="tbtn" aria-label="رجوع" onClick={() => this.go('more')}><Icon name="chevron-right" /></button></div>
        <div className="mini">
          <div className="mc"><div className="mv">{v.avgCycle}</div><div className="ml">متوسط طول الدورة (يوم)</div></div>
          <div className="mc"><div className="mv">{v.avgPeriod}</div><div className="ml">متوسط أيام الدورة</div></div>
          <div className="mc"><div className="mv">{v.regLabel}</div><div className="ml">انتظام الدورة</div></div>
          <div className="mc"><div className="mv">{v.cyclesCount}</div><div className="ml">دورات مسجّلة</div></div>
        </div>
        <div className="card">
          <div className="ttl">أطوال الدورات السابقة</div>
          <div className="bars">
            {v.cycleBars.map(b => (
              <div key={b.key} className="barc"><span className="bk">{b.len}</span><div className={b.cls} style={{ height: b.h }}></div><span className="bl">{b.label}</span></div>
            ))}
          </div>
        </div>
        <div className="fistat">
          <div className="fie">💞</div>
          <div><div className="fiv">{v.fiInFertile} من {v.fiTotal}</div><div className="fil">مرات الجماع ضمن نافذة الخصوبة هذه الدورة</div></div>
        </div>
        {v.hasLh && (
          <div className="card">
            <div className="ttl">اختبارات التبويض (LH)</div>
            <div className="lhrow">
              {v.lhTimeline.map(t => <div key={t.key} className={t.cls}><div className="lhd">{t.d}</div><div className="lhx">{t.res}</div></div>)}
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--ink2)', margin: '11px 2px 0', lineHeight: 1.6 }}>يشير ظهور نتيجة إيجابية إلى اقتراب التبويض خلال 24–36 ساعة.</p>
          </div>
        )}
        {v.varAlert && (
          <div className="alert"><div className="ae">⚠️</div><div><div className="at">تفاوت في طول الدورة</div><div className="ax">{v.varMsg}</div></div></div>
        )}
        {v.hasBbt && (
          <div className="card">
            <div className="ttl">منحنى درجة الحرارة الأساسية</div>
            <svg viewBox={`0 0 300 ${v.bbtH}`} width="100%" height={v.bbtH} preserveAspectRatio="none">
              <path d={v.bbtPath} fill="none" stroke="var(--rose)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              {v.bbtPts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3.4} fill="var(--card)" stroke="var(--rose)" strokeWidth={2} />)}
            </svg>
            <p style={{ fontSize: 11.5, color: 'var(--ink2)', margin: '10px 2px 0', lineHeight: 1.6 }}>يساعد ارتفاع الحرارة الطفيف على تأكيد حدوث التبويض.</p>
          </div>
        )}
        <div className="note">💡 <div>{v.insight}</div></div>
      </div>
    )
  }

  renderSettings() {
    const v = this.rvSet()
    return (
      <div className="screen stagger">
        <div className="hd" style={{ alignItems: 'center' }}><div><div className="hi">خصّصي تجربتكِ</div><h1 className="nm">الإعدادات</h1></div><button className="tbtn" aria-label="رجوع" onClick={() => this.go('more')}><Icon name="chevron-right" /></button></div>
        <div className="card"><div className="couple"><div className="ch">{v.coupleLabel} 🤍</div><div className="cs">رحلة الحمل تبدأ بالتخطيط معًا</div></div></div>
        <div className="card">
          <div className="ttl">الأسماء</div>
          <div className="srow">
            <div className="sl"><div className="si2">👩</div>اسم الزوجة</div>
            <input className="datein" type="text" aria-label="اسم الزوجة" value={this.data.settings.wife} onChange={e => this.setName('wife', e.target.value)} placeholder="الزوجة" />
          </div>
          <div className="srow">
            <div className="sl"><div className="si2">👨</div>اسم الزوج</div>
            <input className="datein" type="text" aria-label="اسم الزوج" value={this.data.settings.husband} onChange={e => this.setName('husband', e.target.value)} placeholder="الزوج" />
          </div>
        </div>
        <div className="card">
          <div className="ttl">بيانات الدورة</div>
          <div className="srow">
            <div className="sl"><div className="si2">🩸</div>تاريخ آخر دورة</div>
            <input className="datein" type="date" value={v.setLastVal} onChange={v.onLast} />
          </div>
          <div className="srow">
            <div className="sl"><div className="si2">🔄</div>طول الدورة</div>
            <div className="stp"><button onClick={v.decCycle}>−</button><span className="sv2">{v.setCycle}</span><button onClick={v.incCycle}>+</button></div>
          </div>
          <div className="srow">
            <div className="sl"><div className="si2">📆</div>أيام الدورة</div>
            <div className="stp"><button onClick={v.decPeriod}>−</button><span className="sv2">{v.setPeriod}</span><button onClick={v.incPeriod}>+</button></div>
          </div>
        </div>
        <div className="card">
          <div className="ttl">التذكيرات</div>
          <p className="selsum" style={{ marginTop: 0 }}>التذكيرات المحلية تظهر عند فتح التطبيق أو الرجوع إليه. أما رسائل الحب من شريككِ فتصل كإشعارات فورية عبر الخادم.</p>
          <div className="srow">
            <div className="sl"><div className="si2">🔔</div>تنبيهات الجهاز</div>
            {v.notifOn ? <span style={{ fontSize: 12, color: 'var(--fertile)', fontWeight: 700 }}>مفعّلة ✓</span> : <button className="opt" style={{ flex: '0 0 auto', padding: '9px 16px' }} onClick={v.enableNotif}>تفعيل</button>}
          </div>
          <div className="srow">
            <div className="sl"><div className="si2">💊</div>تذكير الفيتامينات وحمض الفوليك (٩م)</div>
            <button className={'sw' + (v.vitOn ? ' on' : '')} role="switch" aria-checked={v.vitOn} aria-label="تذكير الفيتامينات" onClick={v.toggleVit}></button>
          </div>
          {v.remOpts.map(r => (
            <div key={r.key} className="srow">
              <div className="sl"><div className="si2">{r.ic}</div>{r.label}</div>
              <button className={r.cls} role="switch" aria-checked={r.on} aria-label={r.label} onClick={r.onClick}></button>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="ttl">وضع متابعة الحمل 🤰</div>
          <div className="srow"><div className="sl"><div className="si2">🤰</div>{v.pregOn ? 'مفعّل — متابعة الحمل' : 'تفعيل عند ثبوت الحمل'}</div><button className={'sw' + (v.pregOn ? ' on' : '')} role="switch" aria-checked={v.pregOn} aria-label="وضع متابعة الحمل" onClick={v.togglePreg}></button></div>
        </div>
        <div className="card">
          <div className="ttl">المظهر</div>
          <div className="srow"><div className="sl"><div className="si2">🌙</div>{v.themeLabel}</div><button className={v.themeCls} role="switch" aria-checked={this.data.settings.theme === 'dark'} aria-label="الوضع الداكن" onClick={v.onTheme}></button></div>
        </div>
        <div className="card">
          <div className="ttl">المزامنة المشتركة</div>
          <p className="selsum">بيانات مشتركة واحدة: أي شخص يفتح الرابط يرى نفس البيانات، وأي تعديل من أي طرف يظهر للجميع تلقائيًا خلال ثوانٍ.</p>
          <div className="srow"><div className="sl"><div className="si2">☁️</div>الحالة</div><div style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 600 }}>{v.syncStatus}</div></div>
          {v.lastEdit && <div className="srow"><div className="sl"><div className="si2">✏️</div>آخر تعديل بواسطة</div><div style={{ fontSize: 13, fontWeight: 700 }}>{v.lastEdit}</div></div>}
          <div className="lbl" style={{ marginTop: 12 }}>👤 صاحب هذا الجهاز</div>
          <div className="opts">
            <button className={v.husbandCls} onClick={v.pickHusband}>👨 {v.husbandName}</button>
            <button className={v.wifeCls} onClick={v.pickWife}>👩 {v.wifeName}</button>
          </div>
        </div>
        <div className="card">
          <div className="ttl">الحساب 💾</div>
          <button className="opt" style={{ width: '100%', marginBottom: 9 }} onClick={() => this.exportData()}>⬇️ تصدير نسخة احتياطية</button>
          <label className="opt" style={{ display: 'block', textAlign: 'center', cursor: 'pointer' }}>⬆️ استيراد نسخة احتياطية<input type="file" accept="application/json" style={{ display: 'none' }} onChange={e => this.importData(e.target.files && e.target.files[0])} /></label>
        </div>
        <div className="card">
          <div className="ttl">الخصوصية 🔒</div>
          {this.hasPin() ? (
            <div className="srow"><div className="sl"><div className="si2">🔒</div>قفل التطبيق مفعّل</div><button className="opt" style={{ flex: '0 0 auto', padding: '8px 14px', color: 'var(--rose-d)' }} onClick={() => this.removePin()}>إلغاء القفل</button></div>
          ) : (
            <>
              <p className="selsum">أدخلي رمزًا من ٤ أرقام لقفل التطبيق عند فتحه.</p>
              <div className="fld"><input className="num" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} aria-label="رمز القفل (٤ أرقام)" value={this.state.pinInput} onChange={e => this.setState({ pinInput: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="••••" /><button className="opt" style={{ flex: '0 0 auto', padding: '11px 16px' }} onClick={() => this.setPin()}>تفعيل القفل</button></div>
            </>
          )}
        </div>
        <div className="note">🔒 <div>البيانات مشتركة بين كل من يملك رابط التطبيق، ومحفوظة في قاعدة بيانات آمنة. هذا التطبيق لا يُغني عن استشارة الطبيب المختص.</div></div>
        <button className="danger" onClick={v.openReset}>حذف البيانات…</button>
      </div>
    )
  }

  renderTools() {
    const appts = this.apptsView()
    const tips = this.nutritionTips()
    return (
      <div className="screen stagger">
        <div className="hd" style={{ alignItems: 'center' }}>
          <div><div className="hi">مواعيد · تغذية · تقرير</div><h1 className="nm">الأدوات</h1></div>
          <button className="tbtn" aria-label="رجوع" onClick={() => this.go('more')}><Icon name="chevron-right" /></button>
        </div>

        <div className="card">
          <div className="ttl">🩺 المواعيد الطبية</div>
          {appts.length === 0 && <p className="selsum">لا توجد مواعيد. أضيفي موعد الطبيب أو السونار بالأسفل.</p>}
          {appts.map(a => (
            <div key={a.id} className="srow">
              <div className="sl"><div className="si2">📅</div><div><div style={{ fontWeight: 600, opacity: a.past ? 0.5 : 1 }}>{a.type}</div><div style={{ fontSize: 11, color: 'var(--ink2)' }}>{a.dateLabel} • {a.when}{a.note ? ' • ' + a.note : ''}</div></div></div>
              <button className="opt" style={{ flex: '0 0 auto', padding: '7px 11px', color: 'var(--rose-d)' }} onClick={() => this.delAppt(a.id)}>حذف</button>
            </div>
          ))}
          <div className="lbl" style={{ marginTop: 12 }}>إضافة موعد</div>
          <input className="area" style={{ minHeight: 0, padding: '12px 13px', marginBottom: 8 }} placeholder="نوع الموعد (طبيب، سونار، تحليل...)" value={this.state.apType} onChange={e => this.setState({ apType: e.target.value })} />
          <input className="datein" type="date" value={this.state.apDate} onChange={e => this.setState({ apDate: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <input className="area" style={{ minHeight: 0, padding: '12px 13px', marginBottom: 10 }} placeholder="ملاحظة (اختياري)" value={this.state.apNote} onChange={e => this.setState({ apNote: e.target.value })} />
          <button className="qbtn" onClick={() => this.addAppt()}>➕ إضافة الموعد</button>
        </div>

        <div className="card">
          <div className="ttl">🥗 نصائح التغذية للخصوبة</div>
          <div className="lbl" style={{ marginTop: 4 }}>👩 لرويدا</div>
          {tips.wife.map((t, i) => <div key={'w' + i} className="smarttip"><span>{t}</span></div>)}
          <div className="lbl" style={{ marginTop: 12 }}>👨 لعبدالرحمن</div>
          {tips.husband.map((t, i) => <div key={'h' + i} className="smarttip"><span>{t}</span></div>)}
          <div className="lbl" style={{ marginTop: 12 }}>👫 للطرفين</div>
          {tips.both.map((t, i) => <div key={'b' + i} className="smarttip"><span>{t}</span></div>)}
        </div>

        <button className="qbtn" onClick={() => this.go('report')}>📄 تقرير شهري للطبيب</button>
      </div>
    )
  }

  renderReport() {
    const c = this.calc(), h = this.data.history || [], s = this.data.settings
    const avg = h.length ? Math.round(h.reduce((a, b) => a + b, 0) / h.length) : c.L
    const today = new Date()
    const sd = h.length >= 2 ? this.stdev(h) : 0
    const reg = h.length < 3 ? 'بيانات غير كافية' : sd <= 2 ? 'منتظمة' : sd <= 4 ? 'شبه منتظمة (تفاوت بسيط)' : 'متفاوتة'
    const minC = h.length ? Math.min(...h) : s.cycleLength, maxC = h.length ? Math.max(...h) : s.cycleLength
    const ovE = this.ovulationEstimate()
    const ovuD = ovE.source !== 'calc' ? ovE.date : c.ovu
    const fS = this.addDays(ovuD, -5), fE = this.addDays(ovuD, 1)
    const luteal = this.diff(c.next, ovuD)
    // مسح 90 يومًا للأنماط
    let inti = 0, intiFertile = 0, ovPos = [], pregLogs = [], bbts = [], meds = 0, sym = {}, weights = [], firstLog = null, mucusPeak = [], ovPain = []
    for (const k in this.data.logs) { if (!firstLog || k < firstLog) firstLog = k }
    for (let i = 0; i < 90; i++) {
      const d = this.addDays(today, -i), iso = this.iso(d), lg = this.data.logs[iso]
      if (!lg) continue
      if (lg.intimacy) { inti++; const ph = this.phaseOf(d); if (ph === 'fertile' || ph === 'ovu') intiFertile++ }
      if (lg.ovTest === 'إيجابي') ovPos.push(this.arShort(d))
      if (lg.pregTest) pregLogs.push(this.arShort(d) + ': ' + lg.pregTest)
      if (lg.mucus === 'مثل بياض البيض') mucusPeak.push(this.arShort(d))
      if (lg.bbt) bbts.push(this.arShort(d) + ': ' + lg.bbt + '°')
      if (lg.meds) meds++
      if (lg.weight) weights.push({ d, v: parseFloat(lg.weight) })
      if (lg.symptoms) { for (const sy of lg.symptoms) sym[sy] = (sym[sy] || 0) + 1; if (lg.symptoms.includes('ألم التبويض')) ovPain.push(this.arShort(d)) }
    }
    const topSym = Object.entries(sym).sort((a, b) => b[1] - a[1]).slice(0, 6)
    weights.sort((a, b) => a.d - b.d)
    const wFirst = weights[0], wLast = weights[weights.length - 1]
    const cyclesRecorded = h.length + 1
    const appts = this.apptsView()
    const preg = this.pregActive() ? this.pregView() : null
    const gen = this.arLong(today)
    const srcTxt = ovE.source === 'lh' ? 'اختبار تبويض (LH) إيجابي' : ovE.source === 'mucus' ? 'مخاط عنق الرحم (كبياض البيض)' : ovE.source === 'bbt' ? 'ارتفاع حرارة الجسم القاعدية' : 'حساب تقويمي تقديري'
    return (
      <div className="screen stagger report">
        <div className="hd no-print" style={{ alignItems: 'center' }}>
          <div><div className="hi">لطبيب النساء والولادة والخصوبة</div><h1 className="nm">تقرير طبي</h1></div>
          <button className="tbtn" aria-label="رجوع" onClick={() => this.go('tools')}><Icon name="chevron-right" /></button>
        </div>

        <div className="card rephead">
          <div className="reptitle">تقرير متابعة الخصوبة والدورة الشهرية</div>
          <div className="repsub">قسم النساء والولادة — طب الخصوبة والإنجاب</div>
          <div className="repmeta">
            <span><b>المريضة:</b> {s.wife}</span>
            <span><b>الزوج:</b> {s.husband}</span>
            <span><b>تاريخ التقرير:</b> {gen}</span>
          </div>
        </div>

        <div className="card">
          <div className="ttl">١) ملخّص الدورة الشهرية</div>
          <table className="reptable">
            <tbody>
              <tr><td>تاريخ آخر دورة (LMP)</td><td>{this.arShort(c.last)}</td></tr>
              <tr><td>طول الدورة الحالي</td><td>{s.cycleLength} يوم</td></tr>
              <tr><td>متوسط طول الدورة</td><td>{avg} يوم</td></tr>
              <tr><td>مدى الدورات (أقصر–أطول)</td><td>{h.length ? minC + ' – ' + maxC + ' يوم' : '—'}</td></tr>
              <tr><td>انتظام الدورة</td><td>{reg}{h.length >= 3 ? ' (انحراف ±' + sd.toFixed(1) + ')' : ''}</td></tr>
              <tr><td>مدة الطمث</td><td>{s.periodLength} أيام</td></tr>
              <tr><td>عدد الدورات المسجّلة</td><td>{cyclesRecorded}</td></tr>
              {firstLog && <tr><td>بداية التتبّع</td><td>{this.arShort(this.parse(firstLog))}</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="ttl">٢) التبويض ونافذة الخصوبة</div>
          <table className="reptable">
            <tbody>
              <tr><td>يوم التبويض المُقدّر</td><td>{this.arShort(ovuD)}</td></tr>
              <tr><td>طريقة التقدير</td><td>{srcTxt}</td></tr>
              <tr><td>نافذة الخصوبة المتوقّعة</td><td>{this.arShort(fS)} – {this.arShort(fE)}</td></tr>
              <tr><td>طول الطور الأصفري التقديري</td><td>{luteal} يوم</td></tr>
              <tr><td>موعد الدورة القادمة المتوقّع</td><td>{this.arShort(c.next)}</td></tr>
              <tr><td>أطوال الدورات السابقة</td><td>{h.length ? h.join('، ') + ' يوم' : '—'}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="ttl">٣) محاولات الحمل والتوقيت (آخر ٩٠ يومًا)</div>
          <table className="reptable">
            <tbody>
              <tr><td>مرات الجماع المسجّلة</td><td>{inti}</td></tr>
              <tr><td>منها ضمن نافذة الخصوبة</td><td>{intiFertile}{inti ? ' (' + Math.round(intiFertile / inti * 100) + '%)' : ''}</td></tr>
              <tr><td>اختبارات تبويض إيجابية (LH)</td><td>{ovPos.length ? ovPos.join('، ') : '—'}</td></tr>
              <tr><td>اختبارات الحمل المنزلية</td><td>{pregLogs.length ? pregLogs.join(' • ') : '—'}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="ttl">٤) مؤشرات الخصوبة الكتابية (بلا قياس)</div>
          <table className="reptable">
            <tbody>
              <tr><td>أيام ذروة الإفرازات (كبياض البيض)</td><td>{mucusPeak.length ? mucusPeak.join('، ') : '—'}</td></tr>
              <tr><td>أيام ألم/نغزة التبويض</td><td>{ovPain.length ? ovPain.join('، ') : '—'}</td></tr>
              <tr><td>أبرز الأعراض المتكرّرة</td><td>{topSym.length ? topSym.map(x => x[0] + ' (' + x[1] + ')').join('، ') : '—'}</td></tr>
              <tr><td>الأدوية / المكمّلات</td><td>{meds ? meds + ' يوم مسجّل' : '—'}{s.vitamins && s.vitamins.on ? ' · تذكير الفوليك/الفيتامينات مُفعّل' : ''}</td></tr>
              <tr><td>الوزن</td><td>{weights.length ? (wFirst.v + ' → ' + wLast.v + ' كجم') + (weights.length > 1 ? ' (' + (wLast.v - wFirst.v >= 0 ? '+' : '') + (wLast.v - wFirst.v).toFixed(1) + ')' : '') : '—'}</td></tr>
              {bbts.length > 0 && <tr><td>حرارة الجسم القاعدية (اختياري)</td><td style={{ fontSize: 12 }}>{bbts.slice(0, 10).join(' • ')}</td></tr>}
            </tbody>
          </table>
        </div>

        {preg && (
          <div className="card">
            <div className="ttl">٥) حالة الحمل الحالية</div>
            <table className="reptable">
              <tbody>
                <tr><td>عمر الحمل</td><td>{preg.wk} أسبوع + {preg.dd} يوم ({preg.tri})</td></tr>
                <tr><td>بداية آخر دورة (LMP)</td><td>{preg.lmpLabel}</td></tr>
                <tr><td>موعد الولادة المتوقّع (EDD)</td><td>{preg.eddLabel}</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {appts.length > 0 && (
          <div className="card">
            <div className="ttl">٦) المواعيد الطبية</div>
            <table className="reptable">
              <tbody>
                {appts.slice(0, 8).map(a => <tr key={a.id}><td>{a.type}{a.note ? ' — ' + a.note : ''}</td><td>{a.dateLabel} ({a.when})</td></tr>)}
              </tbody>
            </table>
          </div>
        )}

        <div className="repsign print-only">
          <div className="repsigcol"><div className="repsigline"></div><span>ملاحظات الطبيب</span></div>
          <div className="repsigcol"><div className="repsigline"></div><span>اسم الطبيب المعالج والتوقيع</span></div>
        </div>

        <div className="repnote">
          هذا التقرير مُولّد من تتبّع منزلي ذاتي عبر تطبيق «أيام تبويض رويدا»، والتقديرات (يوم التبويض، نافذة الخصوبة) تقريبية تعتمد على البيانات المُدخَلة؛ يُرجى الاعتماد على التقييم السريري والفحوصات المخبرية.
        </div>

        <div className="repfoot print-only">أيام تبويض رويدا · تقرير خصوبة · صفحة ١ · {gen}</div>

        <div className="note no-print">💡 <div>اضغط «طباعة / حفظ PDF» لحفظ التقرير ومشاركته مع الطبيب في الزيارة. اختر حجم A4 وفعّل «الرسومات الخلفية» لأفضل نتيجة.</div></div>
        <button className="qbtn no-print" onClick={() => this.printReport()}>🖨️ طباعة / حفظ PDF</button>
      </div>
    )
  }

  renderUs(g) {
    const v = this.rvSet()
    const occs = this.occasionsView()
    const partnerName = this.identity === 'wife' ? this.data.settings.husband : this.data.settings.wife
    return (
      <div className="screen stagger">
        <div className="hd"><div><div className="hi">رحلتكما معًا</div><h1 className="nm">نحن 💞</h1></div></div>

        <div className="card" style={{ textAlign: 'center' }}>
          {this.data.settings.couplePhoto
            ? <img src={this.data.settings.couplePhoto} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 18, marginBottom: 10 }} />
            : <div style={{ fontSize: 44, marginBottom: 4 }}>👨‍❤️‍👩</div>}
          <div style={{ fontWeight: 800, fontSize: 17 }}>{this.data.settings.husband} & {this.data.settings.wife} 🤍</div>
          <label className="linkbtn" style={{ cursor: 'pointer' }}>📷 {this.data.settings.couplePhoto ? 'تغيير الصورة' : 'إضافة صورة'}<input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => this.setCouplePhoto(e.target.files && e.target.files[0])} /></label>
        </div>

        <button className="bigtog" style={{ marginBottom: 12 }} onClick={() => this.go('letter')}>💌 رسالتنا — إلى رويدا من عبدالرحمن<span className="yn">›</span></button>
        <button className="bigtog" style={{ marginBottom: 12 }} onClick={() => this.go('honeymoon')}>🏝️ شهر العسل — ذكرياتنا الأولى<span className="yn">›</span></button>
        <button className="qbtn" style={{ marginBottom: 16, fontSize: 16, padding: 18 }} onClick={() => this.nudgePartner()}>💗 نبضة شوق{partnerName ? ' لـ ' + partnerName : ''}</button>

        {(() => { const a = this.achievements(); return (
          <div className="card">
            <div className="ttl">🏆 إنجازاتكما</div>
            <div className="mini">
              <div className="mc"><div className="mv">{a.streak}</div><div className="ml">أيام متتابعة في التسجيل</div></div>
              <div className="mc"><div className="mv">{a.total}</div><div className="ml">إجمالي الأيام المسجّلة</div></div>
              <div className="mc"><div className="mv">{a.fiInFertile}</div><div className="ml">جماع في نافذة الخصوبة</div></div>
              <div className="mc"><div className="mv">{a.cycles}</div><div className="ml">دورات مسجّلة</div></div>
            </div>
          </div>
        ) })()}

        {this.inbox().length > 0 && (
          <div className="card">
            <div className="ttl">📬 آخر الرسائل</div>
            {this.inbox().slice(0, 8).map((m, i) => (
              <div key={i} className="srow"><div className="sl" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{m.b}</div><div style={{ fontSize: 10.5, color: 'var(--ink2)' }}>{m.t}</div></div></div>
            ))}
          </div>
        )}

        <div className="card">
          <div className="ttl">💌 رسالة</div>
          <p className="selsum">اكتبي رسالة (أو عدة أسطر)، حدّدي متى تُرسل ولمن — تصل كإشعار.</p>
          <textarea className="area" placeholder="اكتبي رسالتك هنا... (كل سطر = رسالة)" value={v.cmText} onChange={v.onCmText} />
          <div className="lbl" style={{ marginTop: 12 }}>نوع الإرسال</div>
          <div className="opts">
            <button className={'opt' + (v.cmMode === 'spread' ? ' on' : '')} onClick={() => v.setCmMode('spread')}>🔁 متكرر</button>
            <button className={'opt' + (v.cmMode === 'once' ? ' on' : '')} onClick={() => v.setCmMode('once')}>1️⃣ مرة واحدة</button>
          </div>
          {v.cmMode === 'spread' ? (
            <>
              <div className="fld" style={{ marginTop: 12 }}><span style={{ fontSize: 13, color: 'var(--ink2)' }}>كم مرة تتكرر</span><input className="num" type="number" min="1" max="200" value={v.cmTimes} onChange={v.onCmTimes} /></div>
              <div className="fld" style={{ marginTop: 10 }}><span style={{ fontSize: 13, color: 'var(--ink2)' }}>خلال كم يوم</span><input className="num" type="number" min="1" max="60" value={v.cmDays} onChange={v.onCmDays} /></div>
            </>
          ) : (
            <>
              <div className="lbl" style={{ marginTop: 12 }}>متى تُرسل</div>
              <div className="opts">
                <button className={'opt' + (v.cmWhen === 'now' ? ' on' : '')} onClick={() => v.setCmWhen('now')}>⚡ الآن</button>
                <button className={'opt' + (v.cmWhen === 'hour' ? ' on' : '')} onClick={() => v.setCmWhen('hour')}>🕐 ساعة محددة</button>
              </div>
              {v.cmWhen === 'hour' && (<div className="fld" style={{ marginTop: 10 }}><span style={{ fontSize: 13, color: 'var(--ink2)' }}>الساعة (٠–٢٣)</span><input className="num" type="number" min="0" max="23" value={v.cmHour} onChange={v.onCmHour} /></div>)}
            </>
          )}
          <div className="lbl" style={{ marginTop: 12 }}>تُرسل إلى</div>
          <div className="opts">
            <button className={'opt' + (v.cmTarget === 'wife' ? ' on' : '')} onClick={() => v.setCmTarget('wife')}>👩 {this.data.settings.wife}</button>
            <button className={'opt' + (v.cmTarget === 'husband' ? ' on' : '')} onClick={() => v.setCmTarget('husband')}>👨 {this.data.settings.husband}</button>
            <button className={'opt' + (v.cmTarget === 'both' ? ' on' : '')} onClick={() => v.setCmTarget('both')}>👫 الاثنين</button>
          </div>
          <button className="qbtn" style={{ marginTop: 14 }} onClick={v.addCustoms}>➕ إضافة</button>
          {v.customs.length > 0 && (
            <div style={{ marginTop: 14 }}>
              {v.customs.map(c => (
                <div key={c.id} className="srow">
                  <div className="sl" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink2)' }}>{c.targetLabel} • {c.progress}</div>
                  </div>
                  <button className="opt" style={{ flex: '0 0 auto', padding: '8px 12px', color: 'var(--rose-d)' }} onClick={c.del}>حذف</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="ttl">🔔 جرعة رسائل الحب</div>
          <p className="selsum">كم مرة تصل رسائل الحب التلقائية يوميًا؟</p>
          <div className="opts" style={{ flexWrap: 'wrap', gap: 8 }}>
            {[['off', 'إيقاف'], ['low', 'مرتين'], ['medium', '٤ مرات'], ['high', 'كل ساعتين'], ['max', 'مكثّف']].map(([k, l]) => (
              <button key={k} className={'opt' + (this.data.settings.msgPreset === k ? ' on' : '')} style={{ flex: '1 0 28%' }} onClick={() => this.setMsgPreset(k)}>{l}</button>
            ))}
          </div>
          <div className="srow" style={{ marginTop: 10 }}><div className="sl"><div className="si2">🔥</div>تكثيف في نافذة الخصوبة</div><button className={'sw' + (this.data.settings.fertileBoost ? ' on' : '')} role="switch" aria-checked={!!this.data.settings.fertileBoost} aria-label="تكثيف الرسائل في نافذة الخصوبة" onClick={() => this.toggleBoost()}></button></div>
        </div>

        <div className="card">
          <div className="ttl">🎉 مناسباتكم</div>
          {occs.map(o => (
            <div key={o.id} className="srow">
              <div className="sl"><div className="si2">{o.emoji}</div><div><div style={{ fontWeight: 600 }}>{o.label}{o.extra && <span style={{ color: 'var(--rose-d)', fontWeight: 700 }}> — {o.extra}</span>}</div><div style={{ fontSize: 11, color: 'var(--ink2)' }}>{o.dateLabel} • {o.when}</div></div></div>
              {!o.monthly && <button className="opt" style={{ flex: '0 0 auto', padding: '7px 11px', color: 'var(--rose-d)' }} onClick={() => this.delOccasion(o.id)}>حذف</button>}
            </div>
          ))}
          <div className="lbl" style={{ marginTop: 12 }}>إضافة مناسبة</div>
          <input className="area" style={{ minHeight: 0, padding: '12px 13px', marginBottom: 8 }} placeholder="اسم المناسبة" value={this.state.occLabel} onChange={e => this.setState({ occLabel: e.target.value })} />
          <div className="fld">
            <input className="datein" type="date" value={this.state.occDateV} onChange={e => this.setState({ occDateV: e.target.value })} style={{ flex: 1, minWidth: 0 }} />
            <button className="opt" style={{ flex: '0 0 auto', padding: '11px 16px' }} onClick={() => this.addOccasion(this.state.occLabel, this.state.occDateV)}>إضافة</button>
          </div>
        </div>

        <div className="card">
          <div className="ttl">👫 إعدادات الزوجين</div>
          <div className="lbl">صاحب هذا الجهاز</div>
          <div className="opts">
            <button className={'opt' + (this.identity === 'husband' ? ' on' : '')} onClick={() => this.setIdentity('husband')}>👨 {this.data.settings.husband}</button>
            <button className={'opt' + (this.identity === 'wife' ? ' onp' : '')} onClick={() => this.setIdentity('wife')}>👩 {this.data.settings.wife}</button>
          </div>
          {v.lastEdit && <div className="srow" style={{ marginTop: 8 }}><div className="sl"><div className="si2">✏️</div>آخر تعديل بواسطة</div><div style={{ fontSize: 13, fontWeight: 700 }}>{v.lastEdit}</div></div>}
        </div>
      </div>
    )
  }

  renderMore(g) {
    return (
      <div className="screen stagger">
        <div className="hd"><div><div className="hi">أدوات وإعدادات</div><h1 className="nm">المزيد ☰</h1></div></div>
        <button className="bigtog" style={{ marginBottom: 12 }} onClick={() => this.go('salah')}>🕌 الصلاة والأذكار<span className="yn">›</span></button>
        <button className="bigtog" style={{ marginBottom: 12 }} onClick={() => this.go('stats')}>📊 الإحصائيات<span className="yn">›</span></button>
        <button className="bigtog" style={{ marginBottom: 12 }} onClick={() => this.go('tools')}>🩺 الأدوات (مواعيد · تغذية · تقرير)<span className="yn">›</span></button>
        <button className="bigtog" style={{ marginBottom: 12 }} onClick={() => this.go('settings')}>⚙️ الإعدادات<span className="yn">›</span></button>
        <div className="note" style={{ marginTop: 6 }}>💡 <div>الرسائل والمناسبات وإعدادات الزوجين انتقلت إلى تبويب «نحن 💞».</div></div>
      </div>
    )
  }

  mdInline(text) {
    return text.split('**').map((p, i) => i % 2 === 1 ? <b key={i}>{p}</b> : <React.Fragment key={i}>{p}</React.Fragment>)
  }
  renderLetterBody(md) {
    const lines = md.split('\n'), out = []; let para = [], quote = [], key = 0
    const flushP = () => { if (para.length) { out.push(<p key={key++} className="ltp">{this.mdInline(para.join(' '))}</p>); para = [] } }
    const flushQ = () => { if (quote.length) { out.push(<blockquote key={key++} className="ltq">{quote.map((q, i) => <div key={i}>{this.mdInline(q)}</div>)}</blockquote>); quote = [] } }
    for (const raw of lines) {
      const line = raw.trim()
      if (!line || line === '---') { flushP(); flushQ(); continue }
      if (line.startsWith('## ')) { flushP(); flushQ(); out.push(<div key={key++} className="lth2">{line.slice(3)}</div>); continue }
      if (line.startsWith('### ')) { flushP(); flushQ(); out.push(<div key={key++} className="lth3">{line.slice(4)}</div>); continue }
      if (line.startsWith('# ')) continue
      if (line.startsWith('> ')) { flushP(); quote.push(line.slice(2)); continue }
      flushQ(); para.push(line)
    }
    flushP(); flushQ()
    return out
  }
  renderLetter(g) {
    return (
      <div className="screen">
        <div className="hd" style={{ alignItems: 'center' }}><div><div className="hi">أول شهر زواج 💞</div><h1 className="nm">رسالتنا</h1></div><button className="tbtn" onClick={() => this.go('us')}>‹</button></div>
        <div className="card lethero">
          <div className="lhe">💌</div>
          <div className="lht">{LETTER_TITLE}</div>
          <div className="lhs">عبدالرحمن 🤍 رويدا</div>
        </div>
        <div className="card letter">{this.renderLetterBody(LETTER_MD)}</div>
      </div>
    )
  }
  renderLhPlan(g) {
    const plan = this.lhSchedule(), todayISO = this.iso(new Date())
    const remOn = !this.data.settings.reminders || this.data.settings.reminders.test !== false
    return (
      <div className="screen stagger">
        <div className="hd" style={{ alignItems: 'center' }}><div><div className="hi">حتى لا تفوتكِ ذروة الـ LH</div><h1 className="nm">جدول اختبار التبويض 🧪</h1></div><button className="tbtn" onClick={() => this.go('home')}>‹</button></div>

        <div className="card">
          <div className="srow"><div className="sl"><div className="si2">🔔</div>تذكيري بأيام الاختبار</div><button className={'sw' + (remOn ? ' on' : '')} onClick={() => this.toggleRem('test')}></button></div>
          <p className="selsum" style={{ margin: '8px 2px 0' }}>يصلكِ تنبيه في أيام الجدول (١ ظهرًا، وأيام الذروة تنبيه ثانٍ ٧ مساءً) حتى لو كان التطبيق مغلقًا 🤍</p>
        </div>

        <div className="card">
          <div className="ttl">الخطة — من ٥ أيام قبل التبويض حتى بعده</div>
          {plan.length === 0
            ? <p className="selsum">وضع متابعة الحمل مفعّل حاليًا.</p>
            : plan.map(x => (
              <div key={x.iso} className={'lhrow' + (x.iso === todayISO ? ' today' : '') + (x.isOvu ? ' ovu' : '')}>
                <div className="lhd">
                  <div className="lhdate">{x.label}{x.iso === todayISO ? ' • اليوم' : ''}</div>
                  <div className="lhtimes">{x.times}</div>
                </div>
                <div className="lhstat">
                  {x.isOvu && <span className="lhpeak">ذروة متوقّعة</span>}
                  {x.twice && !x.isOvu && <span className="lhtwice">مرّتين</span>}
                  {x.done ? <span className="lhdone">✓ {x.result}</span> : <span className="lhpending">بانتظار</span>}
                </div>
              </div>
            ))}
        </div>

        <div className="card">
          <div className="ttl">كيف تقرئين النتيجة</div>
          <div className="info">
            <div className="irow"><div className="ib bp">🧪</div><div><div className="it">إيجابي</div><div className="iv" style={{ fontSize: 13 }}>خط T مساوٍ أو أغمق من خط C → التبويض غالبًا خلال ٢٤–٣٦ ساعة</div></div></div>
            <div className="irow"><div className="ib bo">💞</div><div><div className="it">أفضل توقيت للجماع</div><div className="iv" style={{ fontSize: 13 }}>يوم النتيجة الإيجابية واليوم اللي بعده</div></div></div>
            <div className="irow"><div className="ib bf">⏱️</div><div><div className="it">وقت الاختبار</div><div className="iv" style={{ fontSize: 13 }}>بين ١٢ ظهرًا و٨ مساءً، وقلّلي شرب الماء قبلها بساعتين</div></div></div>
          </div>
        </div>
      </div>
    )
  }
  renderBook(g) {
    const ar = this.state.bookLang === 'ar'
    const COVER = ar ? BOOK_COVER_AR : BOOK_COVER
    const PAGES = ar ? BOOK_PAGES_AR : BOOK_PAGES
    const dir = ar ? 'rtl' : 'ltr'
    const T = ar
      ? { keep: 'كتاب الذكرى 📖', title: 'شهر العسل', contents: 'المحتويات', cover: 'الغلاف', back: 'الغلاف الخلفي', page: 'صفحة', chap: 'الفصل ', of: ' / ' }
      : { keep: 'Keepsake book 📖', title: 'Our Honeymoon', contents: 'Contents', cover: 'Cover', back: 'Back cover', page: 'Page', chap: 'Chapter ', of: ' / ' }
    // الصفحة 0 = الغلاف، ثم صفحات الكتاب. آخر صفحة = الغلاف الخلفي.
    const total = PAGES.length + 1
    const pi = Math.max(0, Math.min(total - 1, this.state.bookPage))
    const goPage = n => { this.hap(); this.setState({ bookPage: Math.max(0, Math.min(total - 1, n)), bookToc: false }) }
    const chapters = PAGES.map((p, i) => ({ p, i: i + 1 })).filter(x => x.p.kind === 'chapter' || x.p.kind === 'letter')
    const prevG = ar ? '›' : '‹', nextG = ar ? '‹' : '›'
    return (
      <div className="screen">
        <div className="hd" style={{ alignItems: 'center' }}>
          <div><div className="hi">{T.keep}</div><h1 className="nm">{T.title}</h1></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="tbtn" style={{ width: 'auto', padding: '0 14px', fontSize: 13, fontWeight: 800 }} onClick={() => { this.hap(); this.setState({ bookLang: ar ? 'en' : 'ar' }) }}>{ar ? 'EN' : 'ع'}</button>
            <button className="tbtn" onClick={() => this.go('honeymoon')}>‹</button>
          </div>
        </div>

        <div className="bookwrap" dir={dir}>
          {pi === 0 ? (
            <div className="bookpage cover">
              {COVER.photo && <div className="bcphoto"><img src={COVER.photo} alt="" /></div>}
              <div className="bcdeco">✦</div>
              <div className={'bctitle' + (ar ? ' ar' : '')}>{COVER.title}</div>
              <div className="bcrule"></div>
              <div className="bcauthors">{COVER.authors}</div>
              {COVER.byline && <div className="bcbyline">{COVER.byline}</div>}
              <div className="bcmeta">{COVER.place}</div>
              <div className="bcmeta">{COVER.date}</div>
              <div className="bcepi">{COVER.epigraph.map((l, i) => <div key={i}>«{l}»</div>)}</div>
            </div>
          ) : (() => {
            const p = PAGES[pi - 1]
            return (
              <div className={'bookpage ' + p.kind + (ar ? ' ar' : '')}>
                {p.kind === 'chapter' && <div className="bchn">{T.chap}{p.n}</div>}
                {p.title && <div className="bptitle">{p.title}</div>}
                {(p.kind === 'chapter' || p.title) && <div className="bprule"></div>}
                <div className="bpbody">
                  {p.lines.map((l, i) => l === '' ? <div key={i} className="bpgap"></div> : <p key={i} className={p.kind === 'back' || p.kind === 'dedication' || p.kind === 'letter' ? 'bpverse' : 'bppar'}>{l}</p>)}
                </div>
              </div>
            )
          })()}
        </div>

        <div className="booknav" dir={dir}>
          <button className="bnbtn" disabled={pi === 0} onClick={() => goPage(pi - 1)}>{prevG}</button>
          <button className="bntoc" onClick={() => { this.hap(); this.setState({ bookToc: !this.state.bookToc }) }}>{pi === 0 ? T.cover : pi === total - 1 ? T.back : T.page + ' ' + pi + T.of + (total - 2)} ▾</button>
          <button className="bnbtn" disabled={pi === total - 1} onClick={() => goPage(pi + 1)}>{nextG}</button>
        </div>

        {this.state.bookToc && (
          <div className="card booktoc" dir={dir}>
            <div className="ttl">{T.contents}</div>
            <button className="tocrow" onClick={() => goPage(0)}>{T.cover}</button>
            {chapters.map(c => (
              <button key={c.i} className="tocrow" onClick={() => goPage(c.i)}>
                <span className="tocn">{c.p.kind === 'chapter' ? c.p.n : '✦'}</span>
                <span>{c.p.title}</span>
              </button>
            ))}
            <button className="tocrow" onClick={() => goPage(total - 1)}>{T.back}</button>
          </div>
        )}
      </div>
    )
  }
  renderHoneymoon(g) {
    const f = this.state.hmFilter
    const match = it => f === 'all' || it.cat === f || it.category === f
    const timeline = HM_TIMELINE.filter(match)
    const memories = HM_MEMORIES.filter(match)
    const moodCls = { 'رومانسي': 'mr', 'مضحك': 'mf', 'مغامرة': 'ma', 'هادئ': 'mc', 'عميق': 'md' }
    const qGroups = [['romantic', '💞 رومانسي'], ['funny', '😄 مضحك'], ['deep', '🌙 عميق'], ['future', '🌱 المستقبل']]
    if (!this.state.hmOpen) {
      return (
        <div className="screen">
          <div className="hd" style={{ alignItems: 'center' }}><div><div className="hi">ذكرياتنا الأولى بعد الزواج</div><h1 className="nm">شهر العسل 🏝️</h1></div><button className="tbtn" onClick={() => this.go('us')}>‹</button></div>
          <div className="card hmhero">
            <div className="hme">🌙✈️💞</div>
            <div className="hmt">{HM_HERO.title}</div>
            <div className="hmsub">{HM_HERO.subtitle}</div>
            <p className="hmintro">{HM_HERO.intro}</p>
            <button className="qbtn" onClick={() => { this.hap(); this.setState({ hmOpen: true }) }}>{HM_HERO.cta} 💌</button>
            <button className="qbtn" style={{ marginTop: 11, background: 'rgba(255,255,255,.16)', boxShadow: 'none' }} onClick={() => this.go('book')}>📖 افتح الكتاب — Our Honeymoon</button>
          </div>
        </div>
      )
    }
    return (
      <div className="screen">
        <div className="hd" style={{ alignItems: 'center' }}><div><div className="hi">ذكرياتنا الأولى بعد الزواج</div><h1 className="nm">شهر العسل 🏝️</h1></div><button className="tbtn" onClick={() => this.go('us')}>‹</button></div>

        <button className="bigtog" style={{ marginBottom: 12 }} onClick={() => this.go('book')}>📖 اقرأ الكتاب — Our Honeymoon<span className="yn">›</span></button>

        <div className="hmgal">
          {HM_PHOTOS.map((p, i) => (
            <button key={i} className={'hmgi' + (i === 0 ? ' big' : '')} onClick={() => { this.hap(); this.setState({ hmPhoto: i }) }}>
              <img src={p.src} alt={p.cap} loading="lazy" />
              <span className="hmgcap">{p.cap}</span>
            </button>
          ))}
        </div>

        {this.state.hmPhoto != null && (
          <div className="lightbox" onClick={() => this.setState({ hmPhoto: null })}>
            <img src={HM_PHOTOS[this.state.hmPhoto].src} alt="" onClick={e => e.stopPropagation()} />
            <div className="lbcap">{HM_PHOTOS[this.state.hmPhoto].cap}</div>
            <button className="lbclose" onClick={() => this.setState({ hmPhoto: null })}>✕</button>
          </div>
        )}

        <div className="hmfilters">
          {HM_FILTERS.map(ff => <button key={ff.k} className={'hmchip' + (f === ff.k ? ' on' : '')} onClick={() => { this.hap(); this.setState({ hmFilter: ff.k }) }}>{ff.label}</button>)}
        </div>

        {timeline.length > 0 && (
          <>
            <div className="ttl" style={{ marginTop: 6 }}>🧭 رحلتنا يومًا بيوم</div>
            <div className="hmtl">
              {timeline.map(it => (
                <div key={it.id} className="hmcard">
                  <div className="hmrow"><span className={'mood ' + (moodCls[it.mood] || 'mc')}>{it.mood}</span><span className="hmloc">📍 {it.location}</span></div>
                  <div className="hmctitle">{it.title}</div>
                  <p className="hmstory">{it.story}</p>
                  {it.quote && <div className="hmquote">“{it.quote}”</div>}
                  {it.sourceConfidence === 'needs-review' && <div className="hmflag">⚠︎ بعض التفاصيل بحاجة تأكيد</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {memories.length > 0 && (
          <>
            <div className="ttl" style={{ marginTop: 10 }}>💞 بطاقات الذكريات</div>
            {memories.map(m => (
              <div key={m.id} className="card hmmem">
                <div className="hmctitle">{m.title}{m.privateOnly && <span className="hmlock"> 🔒</span>}</div>
                {m.location && <div className="hmloc">📍 {m.location}</div>}
                <p className="hmstory">{m.story}</p>
                {m.quote && <div className="hmquote">“{m.quote}”</div>}
                {m.tags && <div className="hmtags">{m.tags.map((t, i) => <span key={i} className="hmtag">{t}</span>)}</div>}
                {m.sourceConfidence === 'needs-review' && <div className="hmflag">⚠︎ بحاجة تأكيد</div>}
              </div>
            ))}
          </>
        )}

        {f === 'all' && (
          <>
            <div className="card">
              <div className="ttl">📜 جدار الاقتباسات</div>
              {qGroups.map(([t, lbl]) => {
                const qs = HM_QUOTES.filter(q => q.type === t)
                return qs.length ? <div key={t} style={{ marginBottom: 12 }}>
                  <div className="hmqlbl">{lbl}</div>
                  {qs.map((q, i) => <div key={i} className="hmwallq">“{q.text}”</div>)}
                </div> : null
              })}
            </div>

            <div className="card">
              <div className="ttl">📍 الأماكن</div>
              <div className="hmplaces">
                {HM_PLACES.map((p, i) => (
                  <div key={i} className={'hmplace' + (p.confidence === 'needs-review' ? ' rev' : '')}>
                    <div className="hmpn">{p.name}</div>
                    {p.note && <div className="hmpnote">{p.note}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="ttl">🎯 الأنشطة</div>
              <div className="hmacts">
                {HM_ACTIVITIES.map((a, i) => <div key={i} className="hmact"><span className="hmae">{a.icon}</span>{a.label}</div>)}
              </div>
            </div>

            <div className="card">
              <div className="ttl">🤍 ماذا تعلّمنا عن بعض؟</div>
              <div className="hmins"><div className="hminl">رويدة تحب</div>{HM_INSIGHTS.ruwaida.map((x, i) => <span key={i} className="hminc">{x}</span>)}</div>
              <div className="hmins"><div className="hminl">عبدالرحمن يحب</div>{HM_INSIGHTS.abdulrahman.map((x, i) => <span key={i} className="hminc">{x}</span>)}</div>
              <div className="hmins"><div className="hminl">كلانا</div>{HM_INSIGHTS.both.map((x, i) => <span key={i} className="hminc he">{x}</span>)}</div>
            </div>

            <div className="card">
              <div className="ttl">🌱 أحلامنا القادمة</div>
              <div className="info">
                {HM_FUTURE.map((x, i) => <div key={i} className="irow"><div className="ib bp">{x.icon}</div><div className="iv" style={{ fontWeight: 600 }}>{x.text}</div></div>)}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
  renderSalah(g) {
    const s = this.data.settings
    const t = this.prayerToday()
    const np = nextPrayer(new Date())
    const adj = s.prayerAdj || {}
    const npAt = (t[np.key] !== undefined && np.key !== 'sunrise') ? t[np.key] : np.at
    const curMin = riyadhNowMin()
    let inMin = npAt - curMin; if (inMin < 0) inMin += 1440
    const hrs = Math.floor(inMin / 60), mins = inMin % 60
    const remain = hrs > 0 ? hrs + ' س ' + mins + ' د' : mins + ' دقيقة'
    const rows = PRAYER_ORDER.map(k => ({ k, name: PRAYER_NAMES[k], min: t[k], passed: t[k] < curMin, isNext: k === np.key && k !== 'sunrise', sun: k === 'sunrise' }))
    const tab = this.state.salTab
    const ath = this.loadAth(), athc = ath.c || {}
    const pkey = tab === 'evening' ? 'e' : 'm'
    const list = this.athkarItems(pkey)
    const prog = list.reduce((a, dh) => a + ((athc[dh.id] || 0) >= dh.c ? 1 : 0), 0)
    return (
      <div className="screen">
        <div className="hd" style={{ alignItems: 'center' }}><div><div className="hi">بتوقيت الرياض 🕌</div><h1 className="nm">الصلاة والأذكار</h1></div><button className="tbtn" onClick={() => this.go('more')}>‹</button></div>

        <div className="seg" style={{ marginBottom: 14 }}>
          <button className={'segb' + (tab === 'times' ? ' on' : '')} onClick={() => this.setState({ salTab: 'times' })}>أوقات الصلاة</button>
          <button className={'segb' + (tab === 'morning' ? ' on' : '')} onClick={() => this.setState({ salTab: 'morning' })}>أذكار الصباح</button>
          <button className={'segb' + (tab === 'evening' ? ' on' : '')} onClick={() => this.setState({ salTab: 'evening' })}>أذكار المساء</button>
        </div>

        {tab === 'times' && (
          <>
            <div className="card prayhero">
              <div className="hi">الصلاة القادمة</div>
              <div className="prayname">{np.name}</div>
              <div className="praytime">{fmtMin(npAt)}</div>
              <div className="praycd">بعد {remain}</div>
            </div>
            <div className="card" style={{ padding: '6px 6px' }}>
              {rows.map(r => (
                <div key={r.k} className={'prayrow' + (r.isNext ? ' next' : '') + (r.passed && !r.isNext ? ' past' : '')}>
                  <span className="pn">{r.sun ? '🌅 ' : ''}{r.name}</span>
                  <span className="pt">{fmtMin(r.min)}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="srow"><div className="sl"><div className="si2">🔔</div>تذكير أوقات الصلاة</div><button className={'sw' + (s.prayer ? ' on' : '')} onClick={() => this.togglePrayer()}></button></div>
              <div className="srow"><div className="sl"><div className="si2">📿</div>تذكير أذكار الصباح والمساء</div><button className={'sw' + (s.athkar ? ' on' : '')} onClick={() => this.toggleAthkar()}></button></div>
              <p className="selsum" style={{ margin: '8px 2px 0' }}>تصل التذكيرات لكِ ولعبدالرحمن حتى لو كان التطبيق مغلقًا 🤍</p>
            </div>
            <button className="bigtog" onClick={() => this.setState({ salAdj: !this.state.salAdj })}>⏱️ تعديل المواقيت (±دقائق)<span className="yn">{this.state.salAdj ? '▴' : '▾'}</span></button>
            {this.state.salAdj && (
              <div className="card" style={{ marginTop: 12 }}>
                <p className="selsum" style={{ marginTop: 0 }}>عدّلي أي وقت ليطابق مصدركِ الرسمي المفضّل.</p>
                {PRAYER_ORDER.filter(k => k !== 'sunrise').map(k => (
                  <div key={k} className="srow"><div className="sl">{PRAYER_NAMES[k]}</div>
                    <div className="stp"><button onClick={() => this.adjustPrayer(k, -1)}>−</button><span className="sv2">{(adj[k] || 0) > 0 ? '+' : ''}{adj[k] || 0}</span><button onClick={() => this.adjustPrayer(k, 1)}>+</button></div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab !== 'times' && (
          <>
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
              <span style={{ fontWeight: 700 }}>{prog} / {list.length} ✓</span>
              <button className="opt" style={{ flex: '0 0 auto', padding: '8px 14px' }} onClick={() => this.resetAth(list.map(x => x.id))}>إعادة الضبط</button>
            </div>
            {list.map(dh => {
              const done = athc[dh.id] || 0
              const finished = done >= dh.c
              return (
                <div key={dh.id} className={'card dhikr' + (finished ? ' done' : '')} onClick={() => this.tapDhikr(dh.id, dh.c)}>
                  <button className="dhdel" onClick={e => { e.stopPropagation(); this.delDhikr(pkey, dh.id) }} aria-label="إزالة">✕</button>
                  <div className="dhtext">{dh.t}</div>
                  {dh.n && <div className="dhnote">{dh.n}</div>}
                  <div className="dhfoot"><span className="dhcount">{finished ? '✓ تمّ' : done + ' / ' + dh.c}</span><span className="dhhint">اضغط في أي مكان للعدّ</span></div>
                </div>
              )
            })}
            <div className="card">
              <div className="ttl">➕ أضِف ذكرًا جديدًا</div>
              <textarea className="area" value={this.state.dhText} onChange={e => this.setState({ dhText: e.target.value })} placeholder="اكتب نص الذكر..." />
              <div className="fld" style={{ marginTop: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--ink2)' }}>عدد المرات</span>
                <input className="num" type="number" min="1" value={this.state.dhCount} onChange={e => this.setState({ dhCount: e.target.value })} placeholder="1" />
                <button className="opt" style={{ flex: '0 0 auto', padding: '11px 16px' }} onClick={() => this.addDhikr(pkey, this.state.dhText, this.state.dhCount)}>إضافة</button>
              </div>
              <p className="selsum" style={{ margin: '8px 2px 0' }}>يُحفظ ويُزامن — تقرأونه أنتِ وعبدالرحمن معًا 🤍</p>
            </div>
          </>
        )}
      </div>
    )
  }

  renderSheet(g) {
    const v = this.rvLog()
    return (
      <div className="sheetwrap" onClick={() => this.closeSheet()}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="sheethandle"></div>
          <div className="ttl" style={{ marginBottom: 12 }}>تسجيل سريع • {v.logDateLabel}</div>
          <button className={v.intimacyCls} onClick={v.toggleIntimacy} style={{ marginBottom: 12 }}>💞 جماع<span className="yn">{v.intimacyTxt}</span></button>
          <div className="lbl">💧 الإفرازات (مخاط عنق الرحم)</div>
          <div className="opts" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>{v.mucusOpts.map(o => <button key={o.key} className={o.cls} style={{ flex: '1 0 28%' }} onClick={o.onClick}>{o.label}</button>)}</div>
          <div className="lbl">😌 المزاج</div>
          <div className="moods" style={{ marginBottom: 12 }}>{v.moodOpts.map(m => <button key={m.key} className={m.cls} onClick={m.onClick}>{m.label}</button>)}</div>
          <div className="lbl">✨ الأعراض</div>
          <div className="chips" style={{ marginBottom: 12 }}>{v.symOpts.map(s => <button key={s.key} className={s.cls} onClick={s.onClick}>{s.label}</button>)}</div>
          <button className={v.medsCls} onClick={v.toggleMeds} style={{ marginBottom: 10 }}>💊 الأدوية / المكملات<span className="yn">{v.medsTxt}</span></button>
          <div className="fld" style={{ marginBottom: 10 }}><span style={{ fontSize: 13, color: 'var(--ink2)' }}>⚖️ الوزن (كجم)</span><input className="num" type="number" step="0.1" value={v.weightVal} onChange={v.setWeight} placeholder="—" /></div>
          <div className="fld" style={{ marginBottom: 10 }}><span style={{ fontSize: 13, color: 'var(--ink2)' }}>🌡 الحرارة °</span><input className="num" type="number" step="0.1" value={v.bbtVal} onChange={v.setBbt} placeholder="36.6" /></div>
          <textarea className="area" value={v.noteVal} onChange={v.setNote} placeholder="📝 ملاحظة سريعة..." />
          <button className="qbtn" style={{ marginTop: 14 }} onClick={() => this.closeSheet()}>تم ✓</button>
          <button className="linkbtn" onClick={() => { this.closeSheet(); this.go('log') }}>تفاصيل أكثر (تبويض، حمل، تدفّق) ‹</button>
        </div>
      </div>
    )
  }

  renderLock(g) {
    const p = this.state.pinInput || ''
    return (
      <div className={('app ' + g.themeClass).trim()}>
        <div className="phone" style={{ justifyContent: 'center' }}>
          <div className="lockscreen">
            <div className="logo" style={{ margin: '0 auto 18px' }}>🔒</div>
            <h2 style={{ textAlign: 'center', margin: '0 0 18px' }}>أدخلي رمز القفل</h2>
            <div className="pindots">{[0, 1, 2, 3].map(i => <span key={i} className={'pd' + (p.length > i ? ' on' : '')}></span>)}</div>
            <div className="keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k, i) => k === '' ? <div key={i}></div> : <button key={i} className="keyb" onClick={() => this.onPinKey(k)}>{k === 'del' ? '⌫' : k}</button>)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderOnboarding(g) {
    const step = this.state.obStep, s = this.data.settings
    return (
      <div className={('app ' + g.themeClass).trim()}>
        <div className="phone">
          <div className="scroll" style={{ padding: '34px 22px' }}>
            <div className="logo" style={{ margin: '6px auto 16px' }}>🤍</div>
            <div className="pindots" style={{ marginBottom: 22 }}>{[1, 2, 3].map(i => <span key={i} className={'pd' + (step >= i ? ' on' : '')}></span>)}</div>
            {step === 1 && (
              <div className="card">
                <div className="ttl">مين أنتما؟ 👤</div>
                <p className="selsum">أدخلي أسماءكما، ثم اختاري صاحب هذا الجهاز.</p>
                <div className="srow"><div className="sl"><div className="si2">👩</div>اسم الزوجة</div><input className="datein" type="text" aria-label="اسم الزوجة" value={s.wife} onChange={e => this.setName('wife', e.target.value)} placeholder="الزوجة" /></div>
                <div className="srow"><div className="sl"><div className="si2">👨</div>اسم الزوج</div><input className="datein" type="text" aria-label="اسم الزوج" value={s.husband} onChange={e => this.setName('husband', e.target.value)} placeholder="الزوج" /></div>
                <div className="lbl" style={{ marginTop: 12 }}>صاحب هذا الجهاز</div>
                <div className="opts">
                  <button className={'opt' + (this.identity === 'husband' ? ' on' : '')} onClick={() => this.setIdentity('husband')}>👨 {s.husband}</button>
                  <button className={'opt' + (this.identity === 'wife' ? ' onp' : '')} onClick={() => this.setIdentity('wife')}>👩 {s.wife}</button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="card">
                <div className="ttl">معلومات الدورة 📅</div>
                <div className="srow"><div className="sl"><div className="si2">🩸</div>تاريخ آخر دورة</div><input className="datein" type="date" value={s.lastPeriod} onChange={e => this.setLast(e.target.value)} /></div>
                <div className="srow"><div className="sl"><div className="si2">🔄</div>طول الدورة</div><div className="stp"><button onClick={() => this.bumpCycle(-1)}>−</button><span className="sv2">{s.cycleLength}</span><button onClick={() => this.bumpCycle(1)}>+</button></div></div>
                <div className="srow"><div className="sl"><div className="si2">📆</div>أيام الحيض</div><div className="stp"><button onClick={() => this.bumpPeriod(-1)}>−</button><span className="sv2">{s.periodLength}</span><button onClick={() => this.bumpPeriod(1)}>+</button></div></div>
              </div>
            )}
            {step === 3 && (
              <div className="card">
                <div className="ttl">التنبيهات 🔔</div>
                <p className="selsum">فعّلي التنبيهات لتصلكِ تذكيرات أيامكِ المهمة ورسائل شريككِ.</p>
                {this.notifyEnabled() ? <div style={{ color: 'var(--fertile)', fontWeight: 700 }}>مفعّلة ✓</div> : <button className="opt" onClick={() => this.requestNotif()}>🔔 تفعيل التنبيهات</button>}
              </div>
            )}
            <button className="qbtn" style={{ marginTop: 16 }} onClick={() => step < 3 ? this.setState({ obStep: step + 1 }) : this.obFinish()}>{step < 3 ? 'التالي ›' : 'ابدأ 🤍'}</button>
            <button className="linkbtn" onClick={() => this.obFinish()}>تخطّي</button>
          </div>
        </div>
      </div>
    )
  }
}
