import React from 'react'

// أيام تبويض رويدا — faithful React port of the Claude Design prototype.
// All cycle math, seeding and localStorage persistence mirror the original 1:1.
export default class App extends React.Component {
  constructor(props) {
    super(props)
    const n = new Date()
    this.load()
    this.state = {
      screen: 'splash',
      calY: n.getFullYear(),
      calM: n.getMonth(),
      selISO: '',
      logISO: this.iso(n),
      saved: false,
      tick: 0,
    }
  }

  componentDidMount() {
    this._t = setTimeout(() => {
      if (this.state.screen === 'splash') this.setState({ screen: 'home' })
    }, 2300)
  }
  componentWillUnmount() { clearTimeout(this._t) }

  hap() { try { navigator.vibrate && navigator.vibrate(8) } catch (e) {} }

  // ---- persistence ----
  load() {
    let d = null
    try { d = JSON.parse(localStorage.getItem('rweida_v1')) } catch (e) {}
    if (!d || !d.settings) { d = this.seed(); this.persist(d) }
    this.data = d
  }
  persist(d) { this.data = d; try { localStorage.setItem('rweida_v1', JSON.stringify(d)) } catch (e) {} }
  save(d) { this.persist(d); this.setState({ tick: this.state.tick + 1 }) }
  seed() {
    const n = new Date(), last = this.addDays(n, -13), logs = {}
    const set = (o, v) => { logs[this.iso(this.addDays(n, o))] = v }
    set(0, { flow: '', symptoms: ['حساسية الصدر', 'رغبة عالية'], mood: '😌 هادئة', intimacy: true, ovTest: 'إيجابي', bbt: 36.6, note: '' })
    set(-1, { flow: '', symptoms: ['انتفاخ'], mood: '😀 سعيدة', intimacy: false, ovTest: 'سلبي', bbt: 36.5, note: '' })
    set(-2, { flow: '', symptoms: [], mood: '😐 عادية', intimacy: true, ovTest: 'سلبي', bbt: 36.4, note: '' })
    set(-3, { flow: '', symptoms: ['تعب'], mood: '😐 عادية', intimacy: false, ovTest: 'سلبي', bbt: 36.4, note: '' })
    set(-4, { flow: '', symptoms: [], mood: '😌 هادئة', intimacy: true, ovTest: '', bbt: 36.3, note: '' })
    set(-5, { flow: '', symptoms: [], mood: '😀 سعيدة', intimacy: false, ovTest: '', bbt: 36.3, note: '' })
    set(-6, { flow: '', symptoms: ['صداع'], mood: '😐 عادية', intimacy: false, ovTest: '', bbt: 36.4, note: '' })
    return { settings: { lastPeriod: this.iso(last), cycleLength: 29, periodLength: 5, theme: 'light', wife: 'رويدا', husband: 'عبدالرحمن', reminders: { fertile: true, ovulation: true, period: true, test: false } }, history: [28, 30, 29, 27, 29], logs }
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
  go(s) { this.hap(); this.setState({ screen: s, saved: false }) }
  bumpCycle(n) { const s = { ...this.data.settings }; s.cycleLength = Math.max(21, Math.min(40, s.cycleLength + n)); this.save({ ...this.data, settings: s }) }
  bumpPeriod(n) { const s = { ...this.data.settings }; s.periodLength = Math.max(2, Math.min(10, s.periodLength + n)); this.save({ ...this.data, settings: s }) }
  setLast(v) { if (!v) return; const s = { ...this.data.settings, lastPeriod: v }; this.save({ ...this.data, settings: s }) }
  toggleTheme() { const s = { ...this.data.settings, theme: this.data.settings.theme === 'dark' ? 'light' : 'dark' }; this.hap(); this.save({ ...this.data, settings: s }) }
  toggleRem(k) { const r = { ...this.data.settings.reminders }; r[k] = !r[k]; this.hap(); this.save({ ...this.data, settings: { ...this.data.settings, reminders: r } }) }
  resetAll() { if (typeof confirm === 'function' && !confirm('سيتم حذف جميع البيانات. متابعة؟')) return; localStorage.removeItem('rweida_v1'); const d = this.seed(); this.persist(d); this.setState({ tick: this.state.tick + 1, screen: 'home' }) }
  emptyLog() { return { flow: '', symptoms: [], mood: '', intimacy: false, ovTest: '', pregTest: '', bbt: '', note: '' } }
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
      navHomeCls: nc('home'), navCalCls: nc('calendar'), navStatsCls: nc('stats'), navSetCls: nc('settings'),
      dismissSplash: () => this.setState({ screen: 'home' }),
      goHome: () => this.go('home'), goCalendar: () => this.go('calendar'), goLog: () => this.go('log'), goStats: () => this.go('stats'), goSettings: () => this.go('settings'),
    }
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
    return {
      greeting: 'أهلاً، ' + this.data.settings.wife, todayLabel: this.arLong(c.today),
      cycleDay: c.cycleDay, phaseLabel: lab[ph], phasePill: 'pill ' + pmap[ph], ringStyle, ang,
      statusTitle: title, statusDesc: desc, chanceLabel: chance,
      ovuDateLabel: this.arShort(c.ovu), nextDateLabel: this.arShort(c.next),
      fertileRange: this.arShort(c.fS) + ' — ' + this.arShort(c.fE),
      cdOvu: Math.max(0, c.dto), cdFertile: Math.max(0, this.diff(c.fS, c.today)), cdPeriod: Math.max(0, c.dtp),
      cdOvuW: c.dto === 1 ? 'يوم' : 'أيام', cdFertileW: this.diff(c.fS, c.today) === 1 ? 'يوم' : 'أيام', cdPeriodW: c.dtp === 1 ? 'يوم' : 'أيام',
      dailyTip: this.dailyTip(ph), bestDays: this.bestDays(), lateAlert: this.lateInfo(), pregAlert: this.pregInfo(),
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
    const sel = {
      dateLabel: this.arLong(d), isToday: si === today, phaseLabel: lab[phk], phasePill: 'pill ' + pm[phk], summary,
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
      bbtVal: l.bbt || '', setBbt: e => this.patchLog({ bbt: e.target.value }),
      noteVal: l.note || '', setNote: e => this.patchLog({ note: e.target.value }),
      prevDay: () => this.shiftLog(-1), nextDay: () => this.shiftLog(1),
      saveLog: () => this.doSave(),
    }
  }
  rvStats() {
    const h = this.data.history, c = this.calc()
    const avg = Math.round(h.reduce((a, b) => a + b, 0) / h.length)
    const sd = this.stdev(h), reg = sd <= 1.5 ? 'منتظمة' : sd <= 3 ? 'شبه منتظمة' : 'متغيرة'
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
    const spread = Math.max(...h) - Math.min(...h)
    return {
      avgCycle: avg, regLabel: reg, avgPeriod: c.P, cycleBars: bars, hasBbt, bbtPath, bbtPts, bbtH,
      cyclesCount: h.length,
      fiInFertile: fi.inFertile, fiTotal: fi.total,
      lhTimeline: lh, hasLh: lh.length > 0,
      varAlert: spread >= 5, varMsg: 'لوحظ تفاوت ' + spread + ' أيام بين أطول وأقصر دورة — يُفضّل متابعة الطبيب إذا تكرر ذلك.',
      insight: reg === 'منتظمة' ? 'دورتكِ منتظمة بشكل ممتاز، ما يجعل توقّع التبويض أكثر دقة.' : 'هناك تفاوت بسيط في طول الدورة، استمري بالتسجيل لتحسين دقة التوقّعات.',
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
    }
  }

  render() {
    const g = this.rvGlobal()
    return (
      <div className={('app ' + g.themeClass).trim()}>
        <div className="phone">
          <div className="amb"><i></i><i></i></div>
          {g.isSplash && (
            <div className="splash" onClick={g.dismissSplash}>
              <div className="logo">🤍</div>
              <h1>أيام تبويض رويدا</h1>
              <p>رفيقكِ اليومي لمتابعة الخصوبة</p>
              <div className="ld"><i></i><i></i><i></i></div>
            </div>
          )}
          <div className="scroll">
            {g.isHome && this.renderHome(g)}
            {g.isCal && this.renderCalendar()}
            {g.isLog && this.renderLog()}
            {g.isStats && this.renderStats()}
            {g.isSet && this.renderSettings()}
          </div>
          {g.showNav && (
            <div className="nav">
              <button className={g.navHomeCls} onClick={g.goHome}><span className="ic">◐</span>الرئيسية</button>
              <button className={g.navCalCls} onClick={g.goCalendar}><span className="ic">▦</span>التقويم</button>
              <button className="add" onClick={g.goLog}><span className="ic">+</span></button>
              <button className={g.navStatsCls} onClick={g.goStats}><span className="ic">◔</span>الإحصائيات</button>
              <button className={g.navSetCls} onClick={g.goSettings}><span className="ic">⚙</span>الإعدادات</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  renderHome(g) {
    const v = this.rvHome()
    return (
      <div className="screen">
        <div className="hd">
          <div><div className="hi">{v.todayLabel}</div><h1 className="nm">{v.greeting} 🤍</h1></div>
          <button className="tbtn" onClick={g.goSettings}>⚙</button>
        </div>
        {v.pregAlert.show && (
          <div className="alert good"><div className="ae">🎉</div><div><div className="at">مبروك!</div><div className="ax">{v.pregAlert.msg}</div></div></div>
        )}
        {v.lateAlert.show && (
          <div className="alert"><div className="ae">🤍</div><div><div className="at">قد يكون موعد اختبار الحمل</div><div className="ax">{v.lateAlert.msg}</div></div></div>
        )}
        <div className="card">
          <div className="ringwrap">
            <div className="ring" style={{ background: v.ringStyle }}>
              <div className="knob" style={{ transform: `translateX(-50%) rotate(${v.ang}deg)` }}></div>
              <div className="rin"><div className="cd">{v.cycleDay}</div><div className="cdl">اليوم من الدورة</div></div>
            </div>
            <div className={v.phasePill} style={{ marginTop: 14 }}><span className="dot"></span>{v.phaseLabel}</div>
          </div>
          <div className="status">
            <h2>{v.statusTitle}</h2><p>{v.statusDesc}</p>
            <div className="chance">احتمالية الحمل اليوم: <b>{v.chanceLabel}</b></div>
          </div>
        </div>
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
            {v.bestDays.map(b => (
              <div key={b.key} className={b.cls}><div className="bdv">{b.label}</div><div className="bdt">{b.tag}</div></div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="tip"><div className="te">💡</div><div><div className="tt">نصيحة اليوم</div><div className="tx">{v.dailyTip}</div></div></div>
        </div>
        <button className="qbtn" onClick={g.goLog}>＋ تسجيل اليوم</button>
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
        <button className="qbtn" onClick={v.saveLog}>حفظ ✓</button>
      </div>
    )
  }

  renderStats() {
    const v = this.rvStats()
    return (
      <div className="screen">
        <div className="hd"><div><div className="hi">اعرفي نمط دورتكِ</div><h1 className="nm">الإحصائيات</h1></div></div>
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
        <div className="hd"><div><div className="hi">خصّصي تجربتكِ</div><h1 className="nm">الإعدادات</h1></div></div>
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
          {v.remOpts.map(r => (
            <div key={r.key} className="srow">
              <div className="sl"><div className="si2">{r.ic}</div>{r.label}</div>
              <button className={r.cls} onClick={r.onClick}></button>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="ttl">المظهر</div>
          <div className="srow"><div className="sl"><div className="si2">🌙</div>{v.themeLabel}</div><button className={v.themeCls} onClick={v.onTheme}></button></div>
        </div>
        <div className="note">🔒 <div>جميع بياناتكِ محفوظة محليًا على جهازكِ فقط، ولا تُرسل إلى أي خادم. هذا التطبيق لا يُغني عن استشارة الطبيب المختص.</div></div>
        <button className="danger" onClick={v.resetData}>حذف جميع البيانات</button>
      </div>
    )
  }
}
