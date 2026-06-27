import React from 'react'
import { cloudLoad, cloudSave, pushSubscribe, addCustomMessage, listCustomMessages, deleteCustomMessage, sendNow, sendNudge, SHARED_KEY, VAPID_PUBLIC } from './supabase.js'

// أيام تبويض رويدا — faithful React port of the Claude Design prototype.
// All cycle math, seeding and localStorage persistence mirror the original 1:1.
export default class App extends React.Component {
  constructor(props) {
    super(props)
    const n = new Date()
    this.load()
    // مجموعة بيانات مشتركة: الجميع على نفس المفتاح => نفس البيانات للكل.
    this.syncKey = SHARED_KEY
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
      locked: false, pinInput: '',
      obStep: 0,
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
  importData(file) {
    if (!file) return
    const r = new FileReader()
    r.onload = () => { try { const d = JSON.parse(r.result); if (d && d.settings) { d.updatedAt = new Date().toISOString(); this.persist(d); this.migrate(); this.setState({ tick: this.state.tick + 1 }); this.scheduleCloud(); this.showToast('✅ تم استيراد البيانات') } else if (typeof alert === 'function') alert('ملف غير صالح') } catch (e) { if (typeof alert === 'function') alert('تعذّر قراءة الملف') } }
    r.readAsText(file)
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
        this.save({ ...this.data, settings: { ...this.data.settings, couplePhoto: cv.toDataURL('image/jpeg', 0.7) } }); this.showToast('✅ تم تحديث الصورة')
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

  // ---- cloud sync (Supabase) ----
  async pollCloud() {
    try { if (typeof document !== 'undefined' && document.hidden) return } catch (e) {}
    if (this._cloudT) return // حفظ محلي معلّق — لا نستبدل تعديل المستخدمة الحالي
    const remote = await cloudLoad(this.syncKey)
    if (remote && remote.settings && (remote.updatedAt || '') > (this.data.updatedAt || '')) {
      const who = remote.editedBy && remote.editedBy !== this.identity ? this.identityView(remote.editedBy) : null
      this.persist(remote)
      this.setState({ tick: this.state.tick + 1, syncedAt: Date.now(), syncError: false })
      if (who) this.showToast('🔄 حدّث ' + who.emoji + ' ' + who.name + ' البيانات')
    }
  }
  async syncFromCloud() {
    this.setState({ syncing: true })
    const remote = await cloudLoad(this.syncKey)
    if (remote && remote.settings) {
      const rt = remote.updatedAt || '', lt = this.data.updatedAt || ''
      if (rt > lt) {
        const who = remote.editedBy && remote.editedBy !== this.identity ? this.identityView(remote.editedBy) : null
        this.persist(remote); this.setState({ tick: this.state.tick + 1, syncing: false, syncError: false, syncedAt: Date.now() })
        if (who) this.showToast('🔄 حدّث ' + who.emoji + ' ' + who.name + ' البيانات')
        return
      }
      if (lt > rt) { const ok = await cloudSave(this.syncKey, this.data); this.setState({ syncing: false, syncError: !ok, syncedAt: ok ? Date.now() : this.state.syncedAt }); return }
    } else {
      const ok = await cloudSave(this.syncKey, this.data)
      this.setState({ syncing: false, syncError: !ok, syncedAt: ok ? Date.now() : this.state.syncedAt }); return
    }
    this.setState({ syncing: false, syncError: false, syncedAt: Date.now() })
  }
  scheduleCloud() {
    clearTimeout(this._cloudT)
    this.setState({ syncing: true })
    this._cloudT = setTimeout(async () => {
      const ok = await cloudSave(this.syncKey, this.data)
      this._cloudT = null
      this.setState({ syncing: false, syncError: !ok, syncedAt: ok ? Date.now() : this.state.syncedAt })
    }, 800)
  }

  hap() { try { navigator.vibrate && navigator.vibrate(8) } catch (e) {} }

  // ---- المناسبات ----
  occDate(o) {
    const today = new Date(), y = today.getFullYear()
    let d = new Date(y, o.month - 1, o.day)
    if (this.startOf(d) < this.startOf(today)) d = new Date(y + 1, o.month - 1, o.day)
    return d
  }
  occasionsView() {
    const today = new Date()
    return (this.data.settings.occasions || []).map(o => {
      const d = this.occDate(o), days = this.diff(d, today)
      return { id: o.id, emoji: o.emoji || '🎉', label: o.label, dateLabel: this.arShort(d), days, when: days === 0 ? 'اليوم! 🎉' : days === 1 ? 'بكرة 🎉' : 'بعد ' + days + ' يوم' }
    }).sort((a, b) => a.days - b.days)
  }
  addOccasion(label, dateStr) {
    label = (label || '').trim(); if (!label || !dateStr) return
    const p = dateStr.split('-').map(Number)
    const occ = { id: 'o' + Date.now().toString(36), emoji: '🎉', label, month: p[1], day: p[2] }
    this.save({ ...this.data, settings: { ...this.data.settings, occasions: [...(this.data.settings.occasions || []), occ] } })
    this.setState({ occLabel: '', occDateV: '' }); this.showToast('✅ أُضيفت المناسبة')
  }
  delOccasion(id) { this.hap(); this.save({ ...this.data, settings: { ...this.data.settings, occasions: (this.data.settings.occasions || []).filter(o => o.id !== id) } }) }

  // ---- الأسبوعان بعد التبويض ----
  twwInfo() {
    if (this.pregActive()) return { show: false }
    const ov = this.ovulationEstimate().date, today = new Date(), since = this.diff(today, ov)
    if (since < 1 || since > 17) return { show: false }
    const testDate = this.addDays(ov, 14), toTest = this.diff(testDate, today)
    return { show: true, day: Math.min(since, 14), pct: Math.min(100, Math.round((since / 14) * 100)), msg: toTest > 0 ? ('اختبار الحمل المثالي بعد ' + toTest + ' ' + (toTest === 1 ? 'يوم' : 'أيام') + ' — ' + this.arShort(testDate)) : 'اليوم وقتٌ مناسب لإجراء اختبار الحمل المنزلي 🤍' }
  }

  // ---- المواعيد الطبية ----
  apptsView() {
    return [...(this.data.appointments || [])].sort((a, b) => a.date < b.date ? -1 : 1).map(a => {
      const d = this.parse(a.date), days = this.diff(d, new Date())
      return { id: a.id, type: a.type, note: a.note, dateLabel: this.arLong(d), when: days < 0 ? 'مضى' : days === 0 ? 'اليوم' : days === 1 ? 'بكرة' : 'بعد ' + days + ' يوم', past: days < 0 }
    })
  }
  addAppt() {
    const date = this.state.apDate, type = (this.state.apType || '').trim(), note = (this.state.apNote || '').trim()
    if (!date || !type) { if (typeof alert === 'function') alert('اكتبي نوع الموعد والتاريخ.'); return }
    const ap = { id: 'a' + Date.now().toString(36), date, type, note }
    this.save({ ...this.data, appointments: [...(this.data.appointments || []), ap] })
    this.setState({ apType: '', apDate: '', apNote: '' }); this.showToast('✅ أُضيف الموعد')
  }
  delAppt(id) { this.hap(); this.save({ ...this.data, appointments: (this.data.appointments || []).filter(a => a.id !== id) }) }

  nutritionTips() {
    return {
      wife: ['🥬 الورقيات الخضراء والبقوليات غنية بحمض الفوليك المهم قبل الحمل.', '🥚 البروتين الجيد (بيض، سمك، دجاج) يدعم جودة البويضات.', '🍊 فيتامين C والحديد يحسّنان الخصوبة — حمضيات ولحوم حمراء باعتدال.', '🥛 منتجات الألبان كاملة الدسم باعتدال قد تدعم الخصوبة.', '💧 رطّبي جسمكِ وقلّلي الكافيين والسكريات.'],
      husband: ['🦪 الزنك (المحار، اللحوم، المكسرات) يحسّن جودة الحيوانات المنوية.', '🥜 الأوميغا-3 والمكسرات (سمك، جوز) تدعم خصوبة الرجل.', '🍅 مضادات الأكسدة (طماطم، توت، خضار ملوّنة) تحمي الحيوانات المنوية.', '🚭 تجنّب التدخين والحرارة العالية (الساونا).', '🏃 رياضة معتدلة ووزن صحي يرفعان الخصوبة.'],
      both: ['🌰 حمض الفوليك يوميًا للطرفين أساسي قبل الحمل.', '😴 نوم كافٍ وتقليل التوتر يوازن الهرمونات.', '⚖️ الوزن الصحي للطرفين يرفع فرص الحمل.', '🚫 قلّلوا الأطعمة المصنّعة والدهون المتحوّلة.'],
    }
  }
  toggleVitamins() { const s = { ...this.data.settings, vitamins: { ...(this.data.settings.vitamins || {}), on: !(this.data.settings.vitamins && this.data.settings.vitamins.on) } }; this.hap(); this.save({ ...this.data, settings: s }) }
  printReport() { try { window.print() } catch (e) {} }

  // ---- persistence ----
  load() {
    let d = null
    try { d = JSON.parse(localStorage.getItem('rweida_v1')) } catch (e) {}
    // أي بيانات قديمة/تجريبية (بدون رقم الإصدار الحالي) تُمسح مرة واحدة لبداية نظيفة.
    if (!d || !d.settings || d.v !== 5) { d = this.seed(); this.persist(d) }
    this.data = d
    this.migrate()
  }
  // إضافة الحقول الجديدة دون مسّ البيانات الموجودة.
  migrate() {
    const d = this.data, s = d.settings; let changed = false
    if (!Array.isArray(s.occasions)) {
      s.occasions = [
        { id: 'eng', emoji: '💍', label: 'الملكة', month: 3, day: 22 },
        { id: 'wed', emoji: '💒', label: 'ذكرى الزواج', month: 5, day: 29 },
        { id: 'bh', emoji: '🎂', label: 'ميلاد عبدالرحمن', month: 11, day: 14, hideAge: true },
        { id: 'bw', emoji: '🎂', label: 'ميلاد رويدا', month: 11, day: 30, hideAge: true },
      ]; changed = true
    }
    if (!Array.isArray(d.appointments)) { d.appointments = []; changed = true }
    if (!s.vitamins) { s.vitamins = { on: true, hour: 21 }; changed = true }
    if (!s.msgPreset) { s.msgPreset = 'medium'; changed = true }
    if (s.fertileBoost === undefined) { s.fertileBoost = true; changed = true }
    if (changed) this.persist(d)
    return changed
  }
  setMsgPreset(p) { this.hap(); this.save({ ...this.data, settings: { ...this.data.settings, msgPreset: p } }); this.showToast('✅ تم تحديث جرعة الرسائل') }
  toggleBoost() { this.hap(); this.save({ ...this.data, settings: { ...this.data.settings, fertileBoost: !this.data.settings.fertileBoost } }) }
  persist(d) { this.data = d; try { localStorage.setItem('rweida_v1', JSON.stringify(d)) } catch (e) {} }
  save(d) { d = { ...d, updatedAt: new Date().toISOString(), editedBy: this.identity }; this.persist(d); this.setState({ tick: this.state.tick + 1 }); this.scheduleCloud() }
  seed() {
    // بداية نظيفة بلا بيانات تجريبية. آخر دورة ٢٣ يونيو، والدورة السابقة ٢٧ مايو
    // (دورة مكتملة طولها ٢٧ يومًا)، كلاهما مسجّل كبداية دورة. القيم قابلة للتعديل.
    const periodStart = () => ({ ...this.emptyLog(), flow: 'متوسط' })
    return {
      v: 5,
      settings: { lastPeriod: '2026-06-23', cycleLength: 27, periodLength: 5, theme: 'light', wife: 'رويدا', husband: 'عبدالرحمن', reminders: { fertile: true, ovulation: true, period: true, test: false } },
      history: [27],
      logs: { '2026-05-27': periodStart(), '2026-06-23': periodStart() },
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
  phaseOf(date) {
    const s = this.data.settings, L = s.cycleLength, P = s.periodLength, last = this.parse(s.lastPeriod)
    let off = this.diff(date, last) % L; if (off < 0) off += L; const ov = L - 14
    if (off < P) return 'period'; if (off === ov) return 'ovu'; if (off >= ov - 5 && off <= ov + 1) return 'fertile'
    if (off >= L - 3) return 'pred'; return 'normal'
  }
  arLong(d) { return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long' }).format(d) }
  arShort(d) { return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { day: 'numeric', month: 'long' }).format(d) }
  arMonth(y, m) { return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { month: 'long', year: 'numeric' }).format(new Date(y, m, 1)) }

  // ---- navigation & mutations ----
  go(s) { this.hap(); this.setState({ screen: s, saved: false }); if (s === 'settings' || s === 'us') this.loadCustoms() }
  bumpCycle(n) { const s = { ...this.data.settings }; s.cycleLength = Math.max(21, Math.min(40, s.cycleLength + n)); this.save({ ...this.data, settings: s }) }
  bumpPeriod(n) { const s = { ...this.data.settings }; s.periodLength = Math.max(2, Math.min(10, s.periodLength + n)); this.save({ ...this.data, settings: s }) }
  setLast(v) { if (!v) return; const s = { ...this.data.settings, lastPeriod: v }; this.save({ ...this.data, settings: s }) }
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
    const logs = { ...this.data.logs }
    for (let i = 0; i < P; i++) {
      const iso = this.iso(this.addDays(this.parse(startISO), i))
      const day = logs[iso] || this.emptyLog()
      logs[iso] = { ...day, flow: day.flow || (i === 0 ? 'متوسط' : 'خفيف') }
    }
    this.hap()
    this.save({ ...this.data, settings: { ...s, lastPeriod: startISO, cycleLength }, history: hist, logs })
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
    const logs = { ...this.data.logs }
    for (let i = span; i < 14; i++) {
      const iso = this.iso(this.addDays(start, i))
      if (logs[iso] && logs[iso].flow) logs[iso] = { ...logs[iso], flow: '' }
    }
    this.hap()
    this.save({ ...this.data, settings: { ...s, periodLength }, logs })
    this.showToast('✅ تم تسجيل انتهاء الدورة')
  }
  toggleTheme() { const s = { ...this.data.settings, theme: this.data.settings.theme === 'dark' ? 'light' : 'dark' }; this.hap(); this.save({ ...this.data, settings: s }) }
  toggleRem(k) { const r = { ...this.data.settings.reminders }; r[k] = !r[k]; this.hap(); this.save({ ...this.data, settings: { ...this.data.settings, reminders: r } }) }
  resetAll() { if (typeof confirm === 'function' && !confirm('سيتم حذف جميع البيانات. متابعة؟')) return; try { localStorage.removeItem('rweida_v1') } catch (e) {} const d = this.seed(); d.updatedAt = new Date().toISOString(); this.persist(d); this.setState({ tick: this.state.tick + 1, screen: 'home' }); this.scheduleCloud() }
  emptyLog() { return { flow: '', symptoms: [], mood: '', intimacy: false, ovTest: '', pregTest: '', bbt: '', weight: '', meds: false, note: '' } }
  curLog() { return this.data.logs[this.state.logISO] || this.emptyLog() }
  patchLog(p) { const iso = this.state.logISO, l = { ...this.curLog(), ...p }, logs = { ...this.data.logs, [iso]: l }; this.hap(); this.save({ ...this.data, logs }); this.setState({ saved: false }) }
  patchDay(iso, p) { const l = { ...(this.data.logs[iso] || this.emptyLog()), ...p }, logs = { ...this.data.logs, [iso]: l }; this.hap(); this.save({ ...this.data, logs }) }
  toggleSym(x) { const l = this.curLog(), s = l.symptoms.includes(x) ? l.symptoms.filter(y => y !== x) : [...l.symptoms, x]; this.patchLog({ symptoms: s }) }
  shiftLog(n) { this.hap(); this.setState({ logISO: this.iso(this.addDays(this.parse(this.state.logISO), n)), saved: false }) }
  doSave() { this.hap(); this.setState({ saved: true, screen: 'home' }) }

  offsetOf(date) { const s = this.data.settings, L = s.cycleLength, last = this.parse(s.lastPeriod); let o = this.diff(date, last) % L; if (o < 0) o += L; return o }
  chanceLevel(date) {
    const s = this.data.settings, L = s.cycleLength, ov = L - 14, o = this.offsetOf(date), d = o - ov
    if (o < s.periodLength) return 0; if (d === 0 || d === -1) return 4; if (d === -2) return 3; if (d === -3 || d === 1) return 2; if (d === -4 || d === -5) return 1; return 0
  }
  bestDays() { const c = this.calc(), out = []; for (let k = -2; k <= 0; k++) { const dt = this.addDays(c.ovu, k); out.push({ key: k, label: this.arShort(dt), tag: k === 0 ? 'يوم التبويض' : (k === -1 ? 'قبل التبويض بيوم' : 'قبل التبويض بيومين'), cls: 'bd' + (k >= -1 ? ' pk' : '') }) } return out }
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
    const c = this.calc(), late = this.diff(c.today, c.next)
    if (late >= 1) return { show: true, days: late, msg: 'تأخّرت دورتكِ ' + late + ' ' + (late === 1 ? 'يوم' : 'أيام') + ' عن الموعد المتوقّع — يمكنكِ إجراء اختبار الحمل المنزلي الآن. للتأكيد يُنصح بمراجعة الطبيب.' }
    return { show: false }
  }
  periodPromptInfo() {
    const c = this.calc(), late = this.diff(c.today, c.next)
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
    const temps = []
    for (let i = 0; i < L; i++) { const lg = this.data.logs[this.iso(this.addDays(last, i))]; temps.push(lg && lg.bbt ? +lg.bbt : null) }
    for (let i = 6; i < L; i++) {
      if (temps[i] == null) continue
      const prev = temps.slice(Math.max(0, i - 6), i).filter(x => x != null)
      if (prev.length >= 3) { const avg = prev.reduce((a, b) => a + b, 0) / prev.length; if (temps[i] >= avg + 0.2) return { date: this.addDays(last, i - 1), source: 'bbt' } }
    }
    return { date: c.ovu, source: 'calc' }
  }
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
    this.hap(); this.save({ ...this.data, pregnancy: p })
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
  maybeNotify() {
    if (!this.notifyEnabled() || this.pregActive()) return
    const today = new Date(), tISO = this.iso(today), c = this.calc(), ov = this.ovulationEstimate().date
    const events = []
    if (this.diff(ov, today) === 0) events.push(['ovu', 'يوم التبويض اليوم 🌸', 'أعلى فرص الحمل اليوم — التوقيت مثالي.'])
    else if (this.chanceLevel(today) >= 3) events.push(['best', 'من أفضل أيام الجماع 💞', 'أنتِ في ذروة الخصوبة — لا تفوّتي اليوم.'])
    if (this.diff(c.fS, today) === 0) events.push(['fertile', 'بدأت نافذة الخصوبة 🌱', 'ابدأ أيام الخصوبة المرتفعة.'])
    if (this.diff(c.next, today) === 0) events.push(['period', 'موعد الدورة المتوقّع اليوم 📅', 'إن لم تأتِ، يمكنكِ إجراء اختبار حمل.'])
    if (this.data.settings.reminders && this.data.settings.reminders.test && this.diff(ov, today) === 1) events.push(['test', 'ذكّري نفسك باختبار التبويض 🧪', 'التبويض غدًا تقريبًا — اختبار اليوم مفيد.'])
    for (const [type, title, body] of events) {
      const k = 'rweida_n_' + tISO + '_' + type
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
    const c = this.calc(), late = this.diff(c.today, c.next)
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
    const c = this.calc(), ph = this.phaseOf(c.today)
    const pmap = { period: 'p-period', fertile: 'p-fertile', ovu: 'p-ovu', pred: 'p-period', normal: 'p-normal' }
    const lab = { period: 'فترة الدورة', fertile: 'نافذة الخصوبة', ovu: 'يوم التبويض', pred: 'اقترب موعد الدورة', normal: 'مرحلة عادية' }
    const cvar = { period: 'var(--rose)', fertile: 'var(--fertile)', ovu: 'var(--ovu)', pred: 'var(--rose)', normal: 'var(--ink2)' }
    let title, desc, chance
    if (ph === 'ovu') { title = 'اليوم هو يوم التبويض 🌟'; desc = 'أعلى فرص الحمل اليوم — التوقيت مثالي.'; chance = 'مرتفعة جدًا' }
    else if (ph === 'fertile') { const d = c.dto; title = d > 0 ? ('باقٍ ' + d + ' ' + (d === 1 ? 'يوم' : 'أيام') + ' على التبويض') : 'نافذة الخصوبة مفتوحة'; desc = 'أنتِ ضمن نافذة الخصوبة، فرص الحمل مرتفعة.'; chance = d <= 1 ? 'مرتفعة جدًا' : 'مرتفعة' }
    else if (ph === 'period') { title = 'فترة الدورة الشهرية'; desc = 'اعتني بنفسكِ وسجّلي الأعراض لمتابعة أدق.'; chance = 'منخفضة' }
    else if (ph === 'pred') { const d = c.dtp; title = d > 0 ? ('باقٍ ' + d + ' ' + (d === 1 ? 'يوم' : 'أيام') + ' على الدورة') : 'موعد الدورة اليوم'; desc = 'قد تبدأ الدورة قريبًا، جهّزي نفسكِ.'; chance = 'منخفضة' }
    else { const d = c.dto; title = 'باقٍ ' + d + ' ' + (d === 1 ? 'يوم' : 'أيام') + ' على التبويض'; desc = 'أنتِ خارج نافذة الخصوبة حاليًا.'; chance = 'منخفضة' }
    const pct = Math.round((c.cycleDay / c.L) * 100), ang = pct * 3.6
    const ringStyle = 'conic-gradient(' + cvar[ph] + ' ' + pct + '%, var(--track) 0)'
    const ovE = this.ovulationEstimate()
    const srcTxt = ovE.source === 'lh' ? 'حسب اختبار التبويض' : ovE.source === 'bbt' ? 'حسب ارتفاع الحرارة' : 'حسب التقويم'
    // توقّع تكيّفي: عند توفّر بيانات (LH/حرارة) نُثبّت يوم التبويض ونافذة الخصوبة عليها.
    const ovuD = ovE.source !== 'calc' ? ovE.date : c.ovu
    const fS = this.addDays(ovuD, -5), fE = this.addDays(ovuD, 1)
    const meName = this.identity ? this.identityView(this.identity).name : this.data.settings.wife
    return {
      greeting: 'أهلاً، ' + meName, todayLabel: this.arLong(c.today),
      cycleDay: c.cycleDay, phaseLabel: lab[ph], phasePill: 'pill ' + pmap[ph], ringStyle, ang,
      statusTitle: title, statusDesc: desc, chanceLabel: chance, chancePct: this.conceptionPct(c.today),
      ovEstLabel: this.arShort(ovE.date), ovEstSmart: ovE.source !== 'calc', ovEstSrc: srcTxt,
      ovuDateLabel: this.arShort(ovuD), nextDateLabel: this.arShort(c.next),
      fertileRange: this.arShort(fS) + ' — ' + this.arShort(fE),
      cdOvu: Math.max(0, c.dto), cdFertile: Math.max(0, this.diff(c.fS, c.today)), cdPeriod: Math.max(0, c.dtp),
      cdOvuW: c.dto === 1 ? 'يوم' : 'أيام', cdFertileW: this.diff(c.fS, c.today) === 1 ? 'يوم' : 'أيام', cdPeriodW: c.dtp === 1 ? 'يوم' : 'أيام',
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
      cells.push({
        key: i, day: date.getDate(), iso, cls,
        inti: !!(lg && lg.intimacy), lhpk: !!(lg && lg.ovTest === 'إيجابي'), preg: !!(lg && lg.pregTest === 'إيجابي'),
        other: !!(lg && !lg.intimacy && lg.ovTest !== 'إيجابي' && lg.pregTest !== 'إيجابي' && (lg.ovTest || lg.pregTest || lg.bbt || lg.flow || (lg.symptoms && lg.symptoms.length) || lg.mood)),
        onClick: () => { this.hap(); this.setState({ selISO: iso }) },
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
    const sel = {
      dateLabel: this.arLong(d), isToday: si === today, phaseLabel: lab[phk], phasePill: 'pill ' + pm[phk], summary,
      isPeriodStart, markPeriod: () => this.confirmPeriod(si),
      inPeriodPhase: phk === 'period' && !isPeriodStart, endHere: () => this.endPeriod(si),
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
    return {
      logDateLabel: isToday ? 'اليوم • ' + this.arShort(d) : this.arLong(d),
      flowOpts: flows, symOpts: syms, moodOpts: moods, ovOpts: ovs, pregOpts: pregs,
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
      themeLabel: s.theme === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح', resetData: () => this.resetAll(),
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
                <span className="si">{g.sync.icon}</span>{g.sync.text}
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
          </div>
          {g.showNav && (
            <div className="nav">
              <button className={g.navHomeCls} onClick={g.goHome}><span className="ic">◐</span>الرئيسية</button>
              <button className={g.navCalCls} onClick={g.goCalendar}><span className="ic">▦</span>التقويم</button>
              <button className="add" onClick={() => this.openSheet()}><span className="ic">+</span></button>
              <button className={g.navUsCls} onClick={g.goUs}><span className="ic">♥</span>نحن</button>
              <button className={g.navMoreCls} onClick={g.goMore}><span className="ic">☰</span>المزيد</button>
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
    return (
      <div className="screen">
        <div className="hd">
          <div><div className="hi">{v.todayLabel}</div><h1 className="nm">{v.greeting} 🤍</h1></div>
          <button className="tbtn" onClick={g.goSettings}>⚙</button>
        </div>

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
            <div className="ring" style={{ background: v.ringStyle }}>
              <div className="knob" style={{ transform: `translateX(-50%) rotate(${v.ang}deg)` }}></div>
              <div className="rin"><div className="cd">{v.cycleDay}</div><div className="cdl">اليوم من الدورة</div></div>
            </div>
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
      <div className="screen">
        <div className="hd" style={{ alignItems: 'center' }}><div><div className="hi">نظرة تفصيلية</div><h1 className="nm">تفاصيل الدورة</h1></div><button className="tbtn" onClick={() => this.go('home')}>‹</button></div>
        {v.ovEstSmart && <div className="note" style={{ background: 'var(--fertile-s)', color: 'var(--fertile)', marginBottom: 15 }}>🎯 <div>التبويض المُقدّر من بياناتكِ: <b>{v.ovEstLabel}</b> ({v.ovEstSrc})</div></div>}
        <div className="ttl">العد التنازلي</div>
        <div className="cd3">
          <div className="cdc o"><div className="cv">{v.cdOvu}</div><div className="cu">{v.cdOvuW}</div><div className="ck">على التبويض</div></div>
          <div className="cdc f"><div className="cv">{v.cdFertile}</div><div className="cu">{v.cdFertileW}</div><div className="ck">على نافذة الخصوبة</div></div>
          <div className="cdc"><div className="cv">{v.cdPeriod}</div><div className="cu">{v.cdPeriodW}</div><div className="ck">على الدورة القادمة</div></div>
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
      <div className="screen">
        <div className="hd">
          <div><div className="hi">وضع متابعة الحمل 🤰</div><h1 className="nm">مبروك {this.data.settings.wife} 🤍</h1></div>
          <button className="tbtn" onClick={g.goSettings}>⚙</button>
        </div>
        <div className="card">
          <div className="ringwrap">
            <div className="ring" style={{ background: 'conic-gradient(var(--fertile) ' + v.pct + '%, var(--track) 0)' }}>
              <div className="rin"><div className="cd">{v.wk}</div><div className="cdl">أسبوع {v.dd > 0 ? '+' + v.dd + ' يوم' : ''}</div></div>
            </div>
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
      <div className="screen">
        <div className="hd"><div><div className="hi">تتبّعي دورتكِ بصريًا</div><h1 className="nm">التقويم</h1></div></div>
        <div className="card">
          <div className="calhd">
            <div className="mn">{v.monthLabel}</div>
            <div className="calnav"><button className="cn" onClick={v.nextMonth}>‹</button><button className="cn" onClick={v.prevMonth}>›</button></div>
          </div>
          <div className="wk">{v.weekDays.map(w => <span key={w.key}>{w.d}</span>)}</div>
          <div className="grid7">
            {v.calCells.map(c => (
              <button key={c.key} className={c.cls} onClick={c.onClick}>
                {c.day}
                <span className="mkrow">
                  {c.inti && <i className="mh">♥</i>}
                  {c.preg && <i className="mhg">♥</i>}
                  {c.lhpk && <i className="mp"></i>}
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
          </div>
        </div>
        <div className="card" style={{ animation: 'pop .3s' }}>
          <div className="hi" style={{ marginBottom: 4 }}>{v.sel.isToday ? 'اليوم • ' : ''}{v.sel.dateLabel}</div>
          <div className={v.sel.phasePill}><span className="dot"></span>{v.sel.phaseLabel}</div>
          <p className="selsum">{v.sel.summary}</p>
          <button className={'bigtog' + (v.sel.isPeriodStart ? ' on' : '')} onClick={v.sel.markPeriod} style={{ marginBottom: 13 }}>🩸 {v.sel.isPeriodStart ? 'يوم بدء دورتكِ' : 'تأكيد بدء الدورة هنا'}<span className="yn">{v.sel.isPeriodStart ? '✓' : 'تأكيد'}</span></button>
          {v.sel.inPeriodPhase && (
            <button className="bigtog" onClick={v.sel.endHere} style={{ marginBottom: 13 }}>🩸 انتهت دورتي هنا<span className="yn">تأكيد</span></button>
          )}
          <button className={v.sel.intiCls} onClick={v.sel.toggleInti} style={{ marginBottom: 13 }}>💞 جماع<span className="yn">{v.sel.intiTxt}</span></button>
          <div className="lbl">🧪 اختبار التبويض</div>
          <div className="opts" style={{ marginBottom: 13 }}>{v.sel.ovActs.map(o => <button key={o.key} className={o.cls} onClick={o.onClick}>{o.label}</button>)}</div>
          <div className="lbl">🤍 اختبار الحمل</div>
          <div className="opts" style={{ marginBottom: 15 }}>{v.sel.pregActs.map(o => <button key={o.key} className={o.cls} onClick={o.onClick}>{o.label}</button>)}</div>
          <button className="qbtn" onClick={v.sel.editDay}>✏️ تفاصيل أكثر (أعراض، مزاج، حرارة، ملاحظات)</button>
        </div>
      </div>
    )
  }

  renderLog() {
    const v = this.rvLog()
    return (
      <div className="screen">
        <div className="hd"><div><div className="hi">سجّلي بياناتكِ اليومية</div><h1 className="nm">تسجيل اليوم</h1></div></div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
          <button className="cn" onClick={v.nextDay}>‹</button>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>{v.logDateLabel}</div>
          <button className="cn" onClick={v.prevDay}>›</button>
        </div>
        <button className={v.intimacyCls} onClick={v.toggleIntimacy} style={{ marginBottom: 15 }}>💞 تسجيل الجماع<span className="yn">{v.intimacyTxt}</span></button>
        <div className="card">
          <div className="lbl">🧪 اختبار التبويض</div>
          <div className="opts">{v.ovOpts.map(o => <button key={o.key} className={o.cls} onClick={o.onClick}>{o.label}</button>)}</div>
        </div>
        <div className="card">
          <div className="lbl">🤍 اختبار الحمل</div>
          <div className="opts">{v.pregOpts.map(o => <button key={o.key} className={o.cls} onClick={o.onClick}>{o.label}</button>)}</div>
        </div>
        <div className="card">
          <div className="lbl">🌡 درجة الحرارة الأساسية (BBT)</div>
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
      <div className="screen">
        <div className="hd" style={{ alignItems: 'center' }}><div><div className="hi">اعرفي نمط دورتكِ</div><h1 className="nm">الإحصائيات</h1></div><button className="tbtn" onClick={() => this.go('more')}>‹</button></div>
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
      <div className="screen">
        <div className="hd" style={{ alignItems: 'center' }}><div><div className="hi">خصّصي تجربتكِ</div><h1 className="nm">الإعدادات</h1></div><button className="tbtn" onClick={() => this.go('more')}>‹</button></div>
        <div className="card"><div className="couple"><div className="ch">{v.coupleLabel} 🤍</div><div className="cs">رحلة الحمل تبدأ بالتخطيط معًا</div></div></div>
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
          <div className="srow">
            <div className="sl"><div className="si2">🔔</div>تنبيهات الجهاز</div>
            {v.notifOn ? <span style={{ fontSize: 12, color: 'var(--fertile)', fontWeight: 700 }}>مفعّلة ✓</span> : <button className="opt" style={{ flex: '0 0 auto', padding: '9px 16px' }} onClick={v.enableNotif}>تفعيل</button>}
          </div>
          <div className="srow">
            <div className="sl"><div className="si2">💊</div>تذكير الفيتامينات وحمض الفوليك (٩م)</div>
            <button className={'sw' + (v.vitOn ? ' on' : '')} onClick={v.toggleVit}></button>
          </div>
          {v.remOpts.map(r => (
            <div key={r.key} className="srow">
              <div className="sl"><div className="si2">{r.ic}</div>{r.label}</div>
              <button className={r.cls} onClick={r.onClick}></button>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="ttl">وضع متابعة الحمل 🤰</div>
          <div className="srow"><div className="sl"><div className="si2">🤰</div>{v.pregOn ? 'مفعّل — متابعة الحمل' : 'تفعيل عند ثبوت الحمل'}</div><button className={'sw' + (v.pregOn ? ' on' : '')} onClick={v.togglePreg}></button></div>
        </div>
        <div className="card">
          <div className="ttl">المظهر</div>
          <div className="srow"><div className="sl"><div className="si2">🌙</div>{v.themeLabel}</div><button className={v.themeCls} onClick={v.onTheme}></button></div>
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
              <div className="fld"><input className="num" type="number" value={this.state.pinInput} onChange={e => this.setState({ pinInput: e.target.value.slice(0, 4) })} placeholder="••••" /><button className="opt" style={{ flex: '0 0 auto', padding: '11px 16px' }} onClick={() => this.setPin()}>تفعيل القفل</button></div>
            </>
          )}
        </div>
        <div className="note">🔒 <div>البيانات مشتركة بين كل من يملك رابط التطبيق، ومحفوظة في قاعدة بيانات آمنة. هذا التطبيق لا يُغني عن استشارة الطبيب المختص.</div></div>
        <button className="danger" onClick={v.resetData}>حذف جميع البيانات</button>
      </div>
    )
  }

  renderTools() {
    const appts = this.apptsView()
    const tips = this.nutritionTips()
    return (
      <div className="screen">
        <div className="hd" style={{ alignItems: 'center' }}>
          <div><div className="hi">مواعيد · تغذية · تقرير</div><h1 className="nm">الأدوات</h1></div>
          <button className="tbtn" onClick={() => this.go('more')}>‹</button>
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
    let inti = 0, ovPos = 0, pregLogs = [], bbts = []
    for (let i = 0; i < 60; i++) {
      const iso = this.iso(this.addDays(today, -i)), lg = this.data.logs[iso]
      if (!lg) continue
      if (lg.intimacy) inti++
      if (lg.ovTest === 'إيجابي') ovPos++
      if (lg.pregTest) pregLogs.push(this.arShort(this.parse(iso)) + ': ' + lg.pregTest)
      if (lg.bbt) bbts.push(this.arShort(this.parse(iso)) + ': ' + lg.bbt + '°')
    }
    const ovE = this.ovulationEstimate()
    return (
      <div className="screen report">
        <div className="hd no-print" style={{ alignItems: 'center' }}>
          <div><div className="hi">للطبيب المختص</div><h1 className="nm">تقرير الدورة</h1></div>
          <button className="tbtn" onClick={() => this.go('tools')}>‹</button>
        </div>
        <div className="card">
          <div className="ttl">ملخّص لـ {s.wife}</div>
          <div className="info">
            <div className="irow"><div className="ib bp">📅</div><div><div className="it">تاريخ آخر دورة</div><div className="iv">{this.arShort(c.last)}</div></div></div>
            <div className="irow"><div className="ib bf">🔄</div><div><div className="it">طول الدورة / متوسطها</div><div className="iv">{s.cycleLength} يوم • متوسط {avg}</div></div></div>
            <div className="irow"><div className="ib bo">🩸</div><div><div className="it">أيام الدورة</div><div className="iv">{s.periodLength} أيام</div></div></div>
            <div className="irow"><div className="ib bo">🌸</div><div><div className="it">التبويض المُقدّر</div><div className="iv">{this.arShort(ovE.date)} ({ovE.source === 'lh' ? 'اختبار LH' : ovE.source === 'bbt' ? 'الحرارة' : 'تقويم'})</div></div></div>
            <div className="irow"><div className="ib bf">📊</div><div><div className="it">أطوال الدورات السابقة</div><div className="iv">{h.length ? h.join('، ') + ' يوم' : '—'}</div></div></div>
          </div>
        </div>
        <div className="card">
          <div className="ttl">آخر ٦٠ يومًا</div>
          <div className="info">
            <div className="irow"><div className="ib bp">💞</div><div><div className="it">مرات الجماع المسجّلة</div><div className="iv">{inti}</div></div></div>
            <div className="irow"><div className="ib bo">🧪</div><div><div className="it">اختبارات تبويض إيجابية</div><div className="iv">{ovPos}</div></div></div>
            <div className="irow"><div className="ib bf">🤍</div><div><div className="it">اختبارات الحمل</div><div className="iv">{pregLogs.length ? pregLogs.join(' • ') : '—'}</div></div></div>
            <div className="irow"><div className="ib bo">🌡</div><div><div className="it">قياسات الحرارة</div><div className="iv" style={{ fontSize: 12 }}>{bbts.length ? bbts.slice(0, 8).join(' • ') : '—'}</div></div></div>
          </div>
        </div>
        <div className="note no-print">💡 <div>اضغطي «طباعة / حفظ PDF» لحفظ التقرير ومشاركته مع الطبيب في الزيارة.</div></div>
        <button className="qbtn no-print" onClick={() => this.printReport()}>🖨️ طباعة / حفظ PDF</button>
      </div>
    )
  }

  renderUs(g) {
    const v = this.rvSet()
    const occs = this.occasionsView()
    const partnerName = this.identity === 'wife' ? this.data.settings.husband : this.data.settings.wife
    return (
      <div className="screen">
        <div className="hd"><div><div className="hi">رحلتكما معًا</div><h1 className="nm">نحن 💞</h1></div></div>

        <div className="card" style={{ textAlign: 'center' }}>
          {this.data.settings.couplePhoto
            ? <img src={this.data.settings.couplePhoto} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 18, marginBottom: 10 }} />
            : <div style={{ fontSize: 44, marginBottom: 4 }}>👨‍❤️‍👩</div>}
          <div style={{ fontWeight: 800, fontSize: 17 }}>{this.data.settings.husband} & {this.data.settings.wife} 🤍</div>
          <label className="linkbtn" style={{ cursor: 'pointer' }}>📷 {this.data.settings.couplePhoto ? 'تغيير الصورة' : 'إضافة صورة'}<input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => this.setCouplePhoto(e.target.files && e.target.files[0])} /></label>
        </div>

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
          <div className="srow" style={{ marginTop: 10 }}><div className="sl"><div className="si2">🔥</div>تكثيف في نافذة الخصوبة</div><button className={'sw' + (this.data.settings.fertileBoost ? ' on' : '')} onClick={() => this.toggleBoost()}></button></div>
        </div>

        <div className="card">
          <div className="ttl">🎉 مناسباتكم</div>
          {occs.map(o => (
            <div key={o.id} className="srow">
              <div className="sl"><div className="si2">{o.emoji}</div><div><div style={{ fontWeight: 600 }}>{o.label}</div><div style={{ fontSize: 11, color: 'var(--ink2)' }}>{o.dateLabel} • {o.when}</div></div></div>
              <button className="opt" style={{ flex: '0 0 auto', padding: '7px 11px', color: 'var(--rose-d)' }} onClick={() => this.delOccasion(o.id)}>حذف</button>
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
      <div className="screen">
        <div className="hd"><div><div className="hi">أدوات وإعدادات</div><h1 className="nm">المزيد ☰</h1></div></div>
        <button className="bigtog" style={{ marginBottom: 12 }} onClick={() => this.go('stats')}>📊 الإحصائيات<span className="yn">›</span></button>
        <button className="bigtog" style={{ marginBottom: 12 }} onClick={() => this.go('tools')}>🩺 الأدوات (مواعيد · تغذية · تقرير)<span className="yn">›</span></button>
        <button className="bigtog" style={{ marginBottom: 12 }} onClick={() => this.go('settings')}>⚙️ الإعدادات<span className="yn">›</span></button>
        <div className="note" style={{ marginTop: 6 }}>💡 <div>الرسائل والمناسبات وإعدادات الزوجين انتقلت إلى تبويب «نحن 💞».</div></div>
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
                <p className="selsum">اختاري صاحب هذا الجهاز ليظهر للطرف الآخر.</p>
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
