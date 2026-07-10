/**
 * @component FieldEquipROICalculator
 * @description Multi-step ROI calculator for FieldEquip field service management SaaS.
 *              Screens: (1) Operation inputs → (2) Savings estimate / Custom enterprise path → (3) Summary + PDF download
 * @performance Lighthouse 100/100 target
 * @accessibility WCAG 2.1 AA compliant
 */

'use client'
import HubSpotForm from './HubSpotForm'
import { useState, useCallback, useEffect, useTransition } from 'react'
import { submitSavingsForm } from "@/src/lib/hubspot";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RefinedInputs {
  revenue: number | null
  office: number | null
  hours: number | null
}

interface Driver {
  name: string
  lo: number
  hi: number
}

interface CalcData {
  T: number
  O: number
  R: number
  H: number
  hc: number
  refined: boolean
  band: 'below' | 'self' | 'assisted' | 'custom'
  adminHrsLo: number
  adminHrsHi: number
  wcLo: number
  wcHi: number
  drivers: Driver[]
  recLo: number
  recHi: number
  y1Lo: number
  y1Hi: number
  y3Lo: number
  y3Hi: number
  fullname?: string
  email?: string
  company?: string
}

type Screen = 's1' | 's2' | 's2c' | 's3'

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

const A = {
  rate: 40,
  serviceShare: 0.50,
  dsoLow: 3,
  dsoHigh: 5,
  costOfCapital: 0.08,
  leakLow: 0.0015,
  leakHigh: 0.0030,
  perHeadLow: 350,
  perHeadHigh: 590,
  quoteLow: 0.0010,
  quoteHigh: 0.0019,
  entryHighMult: 1.33,
  officeRatio: 0.40,
  revPerTech: 300000,
  hoursPerHead: 0.06,
  bandSelf: 50,
  bandAssist: 150,
  bandCustom: 500,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function money(n: number): string {
  n = Math.round(n)
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(n >= 10000000 ? 1 : 2) + 'M'
  if (n >= 1000) return '$' + Math.round(n / 1000) + 'K'
  return '$' + n
}

function range(lo: number, hi: number): string {
  return money(lo) + ' – ' + money(hi)
}

function numFmt(n: number): string {
  return Math.round(n).toLocaleString()
}

function derive(T: number) {
  const O = Math.round(T * A.officeRatio)
  return { O, R: T * A.revPerTech, H: Math.round((T + O) * A.hoursPerHead) }
}

function compute(techs: number, refined: RefinedInputs): CalcData {
  const T = Math.max(1, techs)
  const d = derive(T)
  const R = refined.revenue != null ? refined.revenue : d.R
  const O = refined.office != null ? refined.office : d.O
  const H = refined.hours != null ? refined.hours : d.H
  const isRefined = refined.revenue != null || refined.office != null || refined.hours != null
  const hc = T + O

  const wcLo = (R * A.serviceShare) / 365 * A.dsoLow
  const wcHi = (R * A.serviceShare) / 365 * A.dsoHigh

  const entryLo = H * 52 * A.rate
  const entryHi = entryLo * A.entryHighMult
  const finLo = wcLo * A.costOfCapital
  const finHi = wcHi * A.costOfCapital
  const leakLo = R * A.leakLow
  const leakHi = R * A.leakHigh
  const opsLo = hc * A.perHeadLow
  const opsHi = hc * A.perHeadHigh
  const qLo = R * A.quoteLow
  const qHi = R * A.quoteHigh

  const recLo = entryLo + finLo + leakLo + opsLo + qLo
  const recHi = entryHi + finHi + leakHi + opsHi + qHi

  const band: CalcData['band'] =
    T < A.bandSelf ? 'below' :
    T < A.bandAssist ? 'self' :
    T < A.bandCustom ? 'assisted' : 'custom'

  return {
    T, O, R, H, hc, refined: isRefined, band,
    adminHrsLo: H * 52,
    adminHrsHi: H * 52 * A.entryHighMult,
    wcLo, wcHi,
    drivers: [
      { name: 'Eliminate manual data entry & reconciliation', lo: entryLo, hi: entryHi },
      { name: 'Faster billing cycle — ongoing financing benefit', lo: finLo, hi: finHi },
      { name: 'Real-time scheduling & resource visibility', lo: leakLo, hi: leakHi },
      { name: 'Workforce, standardization & compliance', lo: opsLo, hi: opsHi },
      { name: 'Quote pipeline visibility & revenue growth', lo: qLo, hi: qHi },
    ],
    recLo, recHi,
    y1Lo: recLo + wcLo,
    y1Hi: recHi + wcHi,
    y3Lo: recLo * 3 + wcLo,
    y3Hi: recHi * 3 + wcHi,
  }
}

// ---------------------------------------------------------------------------
// PDF Generator (uses jsPDF loaded via CDN script tag)
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    jspdf?: { jsPDF: unknown }
  }
}

async function downloadPDF(d: CalcData) {
  // Dynamically load jsPDF if not already present
  if (!window.jspdf) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      s.onload = () => resolve()
      s.onerror = reject
      document.head.appendChild(s)
    })
  }

  // @ts-ignore — jsPDF loaded at runtime
  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, lm = 18, rm = 192
  let y = 0

  const rect = (x: number, yy: number, w: number, h: number, c: number[]) => {
    doc.setFillColor(...c); doc.rect(x, yy, w, h, 'F')
  }
  const t = (s: string, x: number, yy: number, o?: Record<string, unknown>) =>
    doc.text(s, x, yy, o || {})

  // Header
  rect(0, 0, W, 28, [16, 40, 58])
  doc.setTextColor(255, 255, 255); doc.setFontSize(18); doc.setFont('helvetica', 'bold')
  t('FieldEquip Savings Summary', lm, 12)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  t('Prepared for: ' + ((d.fullname || '')).trim() + '  |  ' + (d.company || 'Your Company'), lm, 19)
  t('Generated: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), lm, 24)
  y = 36

  // Hero
  rect(lm, y, rm - lm, 32, [240, 250, 249])
  doc.setDrawColor(0, 167, 157); doc.setLineWidth(0.5); doc.rect(lm, y, rm - lm, 32, 'S')
  doc.setTextColor(0, 97, 89); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
  t('RECURRING ANNUAL VALUE', lm + 6, y + 8)
  doc.setFontSize(20); t(range(d.recLo, d.recHi) + ' / yr', lm + 6, y + 18)
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 80, 80)
  t('Plus, in year one: ' + range(d.wcLo, d.wcHi) + ' working capital unlocked (one-time)', lm + 6, y + 26)
  t('as the billing cycle shortens by 3–5 days', lm + 6, y + 30.2)
  y += 40

  const head = (s: string) => {
    rect(lm, y, rm - lm, 7, [0, 167, 157])
    doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
    t(s, lm + 4, y + 5); y += 11
  }

  const row = (l: string, v: string, sh: boolean) => {
    if (sh) rect(lm, y, rm - lm, 7, [245, 251, 250])
    doc.setTextColor(30, 40, 50); doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    t(l, lm + 4, y + 5)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 97, 89)
    t(v, rm - 4, y + 5, { align: 'right' }); y += 7
  }

  head('YOUR OPERATION')
  row('Field Technicians', d.T + ' techs', false)
  row('Office & Admin Staff', d.O + ' people' + (d.refined ? '' : ' (est.)'), true)
  row('Annual Revenue', money(d.R) + (d.refined ? '' : ' (est.)'), false)
  row('Manual Data-Entry Time', d.H + ' hrs/week' + (d.refined ? '' : ' (est.)'), true)
  y += 4

  head('RECURRING ANNUAL VALUE BY DRIVER  (CONSERVATIVE – OPTIMISTIC)')
  d.drivers.forEach((dr, i) => row(dr.name, range(dr.lo, dr.hi), i % 2 === 1))
  rect(lm, y, rm - lm, 8, [0, 167, 157])
  doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.setFont('helvetica', 'bold')
  t('Total Recurring Annual Value', lm + 4, y + 5.5)
  t(range(d.recLo, d.recHi), rm - 4, y + 5.5, { align: 'right' }); y += 12

  head('ONE-TIME, YEAR ONE')
  row('Working Capital Unlocked (3–5 day DSO improvement)', range(d.wcLo, d.wcHi), false)
  y += 4

  head('KEY OUTCOMES')
  row('Admin Hours Recovered / Year', numFmt(d.adminHrsLo) + '–' + numFmt(d.adminHrsHi) + ' hrs', false)
  row('Invoice Cycle Improvement', '3–5 days faster (DSO)', true)
  y += 4

  head('THREE-YEAR CUMULATIVE VALUE')
  row('Year 1 (recurring + working capital unlock)', range(d.y1Lo, d.y1Hi), false)
  row('Year 2 Cumulative', range(d.recLo * 2 + d.wcLo, d.recHi * 2 + d.wcHi), true)
  row('Year 3 Cumulative', range(d.y3Lo, d.y3Hi), false)
  y += 6

  doc.setTextColor(120, 130, 140); doc.setFontSize(8); doc.setFont('helvetica', 'italic')
  doc.text(
    'Working capital is unlocked once, in year one, and is not re-counted in later years; its ongoing 8%/yr financing benefit is included in the recurring total. This summary sizes the value of the status quo — your FieldEquip investment and a full payback analysis are prepared in a value-based quote conversation.',
    lm, y, { maxWidth: rm - lm }
  )

  rect(0, 282, W, 15, [16, 40, 58])
  doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  t('FieldEquip — A Bursys Company  |  www.fieldequip.com', W / 2, 290, { align: 'center' })
  t('Estimate based on FieldEquip enterprise benchmarks. Actual results vary by operation.', W / 2, 294, { align: 'center' })

  doc.save('FieldEquip_Savings_Summary_' + ((d.company || 'Estimate').replace(/\s+/g, '_')) + '.pdf')
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={[
      'md:w-[30px] md:h-[30px] w-[24px] h-[24px] rounded-full flex items-center justify-center md:text-[13px] text-[11px] font-bold border-2 transition-all duration-300',
      active || done
        ? 'bg-[#00A79D] border-[#00A79D] text-white'
        : 'bg-white border-[#cbd5e1] text-[#94a3b8]',
    ].join(' ')}>
      {done ? (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
          <path d="M2 6.5l3.5 3.5L11 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : n}
    </div>
  )
}

function StepLine({ done }: { done: boolean }) {
  return (
    <div className={[
      'hidden sm:block w-[54px] h-[2px] mx-1.5 transition-colors duration-300',
      done ? 'bg-[#00A79D]' : 'bg-[#e2e8f0]',
    ].join(' ')} />
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BarBadge({ children }: { children: string }) {
  return (
    <span className="bg-[#00A79D] text-white text-[12px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ROICalculator() {
  // Step 1 state
  const [techs, setTechs] = useState(50)
  const [refineOpen, setRefineOpen] = useState(false)
  const [refined, setRefined] = useState<RefinedInputs>({ revenue: null, office: null, hours: null })
  const [isPending, startTransition] = useTransition();

  // Derived hints
  const [hints, setHints] = useState(() => derive(50))
  useEffect(() => { setHints(derive(techs)) }, [techs])

  // Screen state
  const [screen, setScreen] = useState<Screen>('s1')
  const [calcData, setCalcData] = useState<CalcData | null>(null)

  // Step 2 — gate form
  const [s2Form, setS2Form] = useState({ fullname: '', email: '', company: '' })
  const [s2cForm, setS2cForm] = useState({ fullname: '', email: '', company: '' })
  const [s2EmailError, setS2EmailError] = useState('')

  // Screen 3 title (driven by state, never by DOM mutation)
  const [s3Title, setS3Title] = useState('')

  // Active step number for stepper
  const stepNum = screen === 's1' ? 1 : screen === 's2' || screen === 's2c' ? 2 : 3

  const goTo = useCallback((s: Screen) => { setScreen(s); window.scrollTo(0, 0) }, [])

  // ---------- Screen 1 — Calculate ----------
  const handleCalc = useCallback(() => {
    if (!techs || techs < 1) { alert('Please enter the number of field technicians your organization manages.'); return }
    const data = compute(techs, refined)
    setCalcData(data)
    if (data.band === 'custom') { goTo('s2c') } else { goTo('s2') }
  }, [techs, refined, goTo])

  // ---------- Screen 2 — Unlock report ----------
  const handleReport = useCallback(() => {
    if (!s2Form.fullname || !s2Form.email || !s2Form.email.includes('@')) {
      alert('Please enter your first name and a valid work email to continue.')
      return
    }
    const data = {
      firstname: s2Form.fullname.trim(),
      email: s2Form.email.trim(),
      company: s2Form.company.trim(),
    };
    setS2EmailError('')

    startTransition(async () => {
      const result = await submitSavingsForm(data);
      if (!result.success) {
        const isBlocked = (result as any).detail?.errors?.some(
          (e: { errorType?: string }) => e.errorType === 'BLOCKED_EMAIL'
        )
        if (isBlocked) {
          setS2EmailError('Please use your work email address to unlock your report.')
          return
        }
        console.error("[HubSpot] error:", result.error, "detail:", (result as any).detail);
      } else {
        console.log("[HubSpot] submitted ✓");
      }
      if (!calcData) return
      setCalcData({ ...calcData, ...s2Form })
      setS3Title(`Your savings summary is ready, <span class="text-[#00A79D]">${s2Form.fullname}</span>!`)
      goTo('s3')
    });
  }, [s2Form, calcData, goTo, s2EmailError])

  // ---------- Screen 2c — Custom ----------
  const handleCustom = useCallback(() => {
    if (!s2cForm.fullname || !s2cForm.email || !s2cForm.email.includes('@')) {
      alert('Please enter your first name and a valid work email to continue.')
      return
    }
     const data = {
      firstname: s2Form.fullname.trim(),
      email: s2Form.email.trim(),
      company: s2Form.company.trim(),
    };
    setS2EmailError('')
    startTransition(async () => {
      const result = await submitSavingsForm(data);
      if (!result.success) {
        const isBlocked = (result as any).detail?.errors?.some(
          (e: { errorType?: string }) => e.errorType === 'BLOCKED_EMAIL'
        )
        if (isBlocked) {
          setS2EmailError('Please use your work email address to unlock your report.')
          return
        }
        console.error("[HubSpot] error:", result.error, "detail:", (result as any).detail);
      } else {
        console.log("[HubSpot] submitted ✓");
      }
      if (!calcData) return
      setCalcData({ ...calcData, ...s2Form })
      setS3Title(`Your savings summary is ready, <span class="text-[#00A79D]">${s2Form.fullname}</span>!`)
      goTo('s3')
    });
    setS3Title(`Thanks, <span class="text-[#00A79D]">${s2cForm.fullname}</span>!`)
    goTo('s3')
  }, [s2cForm, goTo])

  const isAssisted = calcData?.band === 'assisted'

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-[#eef3f6] text-[#1a2634] font-sans antialiased">

      {/* ---- Header ---- */}
      <header className="bg-[#10283A] px-5 sm:px-10 py-[22px] flex items-center gap-4" role="banner">
        <div className="w-11 h-11 bg-white rounded-[10px] flex items-center justify-center flex-shrink-0">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="6" fill="#00A79D" />
            <path d="M6 18L11 13L15 17L22 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="22" cy="10" r="2.2" fill="white" />
          </svg>
        </div>
        <div>
          <h1 className="text-white text-[19px] sm:text-[19px] font-bold tracking-tight">FieldEquip ROI Calculator</h1>
          <p className="text-white/70 text-[12px] mt-0.5">See what running on disconnected systems is costing your operation</p>
        </div>
      </header>

      {/* ---- Wrap ---- */}
      <main className="max-w-5xl mx-auto px-2 pt-9 pb-16" id="main-content">

        {/* ---- Stepper ---- */}
        <nav aria-label="Progress steps" className="flex items-center justify-center mb-[34px]">
          {[
            { n: 1, label: 'Your operation' },
            { n: 2, label: 'Your savings' },
            { n: 3, label: 'Full summary' },
          ].map(({ n, label }, i) => (
            <div key={n} className="flex items-center px-1">
              <div className="flex items-center md:gap-2 gap-1">
                <StepDot n={n} active={stepNum === n} done={stepNum > n} />
                <span className={[
                  'md:text-[12.5px] text-[10px] font-medium transition-colors duration-300',
                  stepNum === n ? 'text-[#00A79D] font-semibold' : 'text-[#94a3b8]',
                ].join(' ')}>
                  {label}
                </span>
              </div>
              {i < 2 && <StepLine done={stepNum > n} />}
            </div>
          ))}
        </nav>

        {/* ======================================================= */}
        {/* SCREEN 1                                                  */}
        {/* ======================================================= */}
        {screen === 's1' && (
          <section aria-labelledby="s1-title" className="animate-[fadeUp_.35s_ease]">

            {/* Main card */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 mb-5 shadow-[0_1px_3px_rgba(16,40,58,.06),0_8px_30px_rgba(16,40,58,.06)]">
              <p className="text-[11.5px] font-bold text-[#00A79D] uppercase tracking-[1px] mb-2.5">Step 1 of 3</p>
              <h2 id="s1-title" className="text-[21px] font-bold text-[#1a2634] mb-1.5 tracking-tight">Let's size the opportunity</h2>
              <p className="text-[13.5px] text-[#64748b] mb-7 leading-[1.55]">
                Start with one number. We'll estimate the recurring annual value tied up in manual work, slow billing, and disconnected systems — plus the working capital a faster billing cycle puts back in your hands. Shown as an honest conservative-to-optimistic range, the way our team builds a real ROI review.
              </p>

              {/* Big field */}
              <div className="text-center py-2">
                <label htmlFor="techs" className="block text-[15px] font-semibold text-[#1a2634] mb-[18px] leading-snug">
                  How many field technicians does your organization manage?
                </label>
                <input
                  type="number"
                  id="techs"
                  value={techs}
                  min={1}
                  inputMode="numeric"
                  onChange={e => setTechs(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-[200px] h-[84px] text-center text-[44px] font-extrabold text-[#006159] border-2 border-[#b2e4e0] rounded-[14px] bg-[#f0faf9] outline-none transition focus:border-[#00A79D] focus:ring-4 focus:ring-[#00A79D]/14 [appearance:textfield] [&::-webkit-inner-spin-button]:opacity-30 tracking-[-1px]"
                />
                <span className="block mt-3 text-[12.5px] text-[#64748b] font-medium">field technicians</span>
              </div>

              {/* Refine toggle */}
              <button
                type="button"
                aria-expanded={refineOpen}
                aria-controls="refine-panel"
                onClick={() => setRefineOpen(v => !v)}
                className="flex items-center justify-center gap-1.5 w-full bg-transparent border-none text-[#007d75] text-[13px] font-semibold mt-6 py-2 cursor-pointer font-[inherit] hover:underline focus-visible:ring-2 focus-visible:ring-[#00A79D] focus-visible:ring-offset-2 rounded"
              >
                Refine your estimate (optional)
                <svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  className={`transition-transform duration-200 ${refineOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <path d="M3 5l4 4 4-4" stroke="#007d75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Refine panel */}
              {refineOpen && (
                <div id="refine-panel" className="mt-[18px] pt-[22px] border-t border-[#e2e8f0]">
                  <p className="text-[13.5px] text-[#64748b] mb-[18px] leading-[1.55]">
                    We've estimated these from your technician count. Adjust any of them for a sharper number — or leave them and we'll use the estimates shown.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">

                    {/* Revenue */}
                    <div>
                      <label htmlFor="revenue" className="block text-[12px] font-semibold text-[#475569] mb-1.5 uppercase tracking-[.4px]">Annual revenue</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-[14px] font-semibold text-[#00A79D] pointer-events-none">$</span>
                        <input
                          type="number"
                          id="revenue"
                          min={0}
                          step={500000}
                          value={refined.revenue ?? ''}
                          placeholder={numFmt(hints.R)}
                          onChange={e => setRefined(r => ({ ...r, revenue: e.target.value === '' ? null : Math.max(0, parseFloat(e.target.value)) }))}
                          className="w-full h-12 border-[1.5px] border-[#e2e8f0] rounded-[10px] pl-8 pr-[42px] text-[15px] text-[#1a2634] bg-white outline-none transition focus:border-[#00A79D] focus:ring-[3px] focus:ring-[#00A79D]/12 [appearance:textfield]"
                        />
                        <span className="absolute right-3 text-[12px] text-[#94a3b8] pointer-events-none">USD</span>
                      </div>
                      <p className="text-[11.5px] text-[#94a3b8] mt-1.5">Estimated {money(hints.R)} — adjust if you know it</p>
                    </div>

                    {/* Office */}
                    <div>
                      <label htmlFor="office" className="block text-[12px] font-semibold text-[#475569] mb-1.5 uppercase tracking-[.4px]">Office & admin staff</label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          id="office"
                          min={0}
                          value={refined.office ?? ''}
                          placeholder={String(hints.O)}
                          onChange={e => setRefined(r => ({ ...r, office: e.target.value === '' ? null : Math.max(0, parseFloat(e.target.value)) }))}
                          className="w-full h-12 border-[1.5px] border-[#e2e8f0] rounded-[10px] px-3.5 pr-[60px] text-[15px] text-[#1a2634] bg-white outline-none transition focus:border-[#00A79D] focus:ring-[3px] focus:ring-[#00A79D]/12 [appearance:textfield]"
                        />
                        <span className="absolute right-3 text-[12px] text-[#94a3b8] pointer-events-none">people</span>
                      </div>
                      <p className="text-[11.5px] text-[#94a3b8] mt-1.5">Estimated {hints.O} — dispatch, billing, back office</p>
                    </div>

                    {/* Hours */}
                    <div>
                      <label htmlFor="hours" className="block text-[12px] font-semibold text-[#475569] mb-1.5 uppercase tracking-[.4px]">Manual data-entry hours / week</label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          id="hours"
                          min={0}
                          max={200}
                          value={refined.hours ?? ''}
                          placeholder={String(hints.H)}
                          onChange={e => setRefined(r => ({ ...r, hours: e.target.value === '' ? null : Math.max(0, parseFloat(e.target.value)) }))}
                          className="w-full h-12 border-[1.5px] border-[#e2e8f0] rounded-[10px] px-3.5 pr-[60px] text-[15px] text-[#1a2634] bg-white outline-none transition focus:border-[#00A79D] focus:ring-[3px] focus:ring-[#00A79D]/12 [appearance:textfield]"
                        />
                        <span className="absolute right-3 text-[12px] text-[#94a3b8] pointer-events-none">hrs/wk</span>
                      </div>
                      <p className="text-[11.5px] text-[#94a3b8] mt-1.5">Estimated {hints.H} hrs/wk — re-keying & reconciliation</p>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Assumptions card */}
            <div className="bg-[#f0faf9] rounded-[10px] border border-[#b2e4e0] px-6 py-5 mb-0">
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#006159] mb-1.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="#006159" strokeWidth="1.5" />
                  <path d="M8 7v4M8 5.5v.5" stroke="#006159" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                How we calculate — FieldEquip benchmarks
              </div>
              <p className="text-[12px] text-[#64748b] mb-3 leading-[1.5]">
                These benchmarks come from enterprise field-service deployments and are applied as a low (conservative) to high (optimistic) range. Recurring annual value is reported separately from the one-time working capital your operation unlocks in year one. Your investment and a full payback analysis are prepared in a value-based quote conversation.
              </p>
              {[
                { label: 'Manual admin time eliminated', sub: 'Valued at a $40/hr fully-loaded rate', badge: '$40/hr' },
                { label: 'Invoice cycle / DSO improvement', sub: 'Applied to billable field-services revenue', badge: '3–5 days' },
                { label: 'Value of capital freed by faster billing', sub: 'Annual financing benefit on working capital unlocked', badge: '8% / yr' },
                { label: 'Revenue leakage recovered', sub: 'Idle equipment & missed scheduling', badge: '0.15–0.30%' },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between gap-3 py-[11px] ${i < 3 ? 'border-b border-[#b2e4e0]' : ''}`}>
                  <div>
                    <p className="text-[13px] text-[#334155] font-medium">{row.label}</p>
                    <p className="text-[11.5px] text-[#64748b] mt-0.5">{row.sub}</p>
                  </div>
                  <BarBadge>{row.badge}</BarBadge>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCalc}
              className="flex items-center justify-center gap-2 w-full mt-6 py-4 rounded-[10px] bg-[#00A79D] hover:bg-[#007d75] active:translate-y-px text-white text-[16px] font-bold cursor-pointer transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#00A79D] focus-visible:ring-offset-2"
            >
              See my savings estimate <CheckIcon />
            </button>
          </section>
        )}

        {/* ======================================================= */}
        {/* SCREEN 2                                                  */}
        {/* ======================================================= */}
        {screen === 's2' && calcData && (
          <section aria-labelledby="s2-title" className="animate-[fadeUp_.35s_ease]">

            {/* Hero */}
            <div className="bg-gradient-to-br from-[#00A79D] to-[#006159] rounded-2xl px-8 py-[34px] pb-7 text-center text-white mb-5 shadow-[0_1px_3px_rgba(16,40,58,.06),0_8px_30px_rgba(16,40,58,.06)]">
              <p className="text-[12.5px] font-semibold uppercase tracking-[1px] opacity-85">Recurring Annual Value</p>
              <p id="s2-title" className="text-[32px] sm:text-[46px] font-extrabold leading-[1.05] my-3 tracking-[-1.5px]">
                {range(calcData.recLo, calcData.recHi)} / yr
              </p>
              <p className="text-[13.5px] opacity-90 max-w-[480px] mx-auto leading-[1.5]">
                efficiency value your operation can recover every year, from eliminated manual work to recovered scheduling revenue
              </p>

              {/* Plus one-time */}
              <div className="mt-5 mx-auto max-w-[520px] border-t border-white/28 pt-4 flex flex-wrap items-center justify-center gap-3">
                <span className="bg-white/16 border border-white/35 rounded-full text-[11px] font-bold uppercase tracking-[.8px] px-3 py-1">Plus · Year One</span>
                <span className="text-[21px] font-extrabold tracking-[-0.5px]">{range(calcData.wcLo, calcData.wcHi)}</span>
                <span className="text-[12.5px] opacity-85 basis-full leading-[1.45]">
                  in working capital unlocked as your billing cycle accelerates — a one-time cash benefit as 3–5 days of receivables come off the books
                </span>
              </div>

              <p className="mt-4 text-[12.5px] opacity-78">
                Sized to <strong>{calcData.T}</strong> field technicians{calcData.refined ? ' and your refined inputs' : ''}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
              {[
                { val: `${numFmt(calcData.adminHrsLo)}–${numFmt(calcData.adminHrsHi)}`, label: 'Admin hours recovered / year' },
                { val: '3–5 days', label: 'Faster billing (DSO improvement)' },
                { val: range(calcData.y3Lo, calcData.y3Hi), label: 'Three-year cumulative value' },
              ].map((s, i) => (
                <div key={i} className="bg-white border border-[#e2e8f0] rounded-[10px] px-4 py-5 text-center shadow-[0_1px_3px_rgba(16,40,58,.06),0_8px_30px_rgba(16,40,58,.06)]">
                  <p className="text-[23px] font-extrabold text-[#006159] tracking-[-0.5px]">{s.val}</p>
                  <p className="text-[12px] text-[#64748b] mt-1.5 font-medium leading-snug">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Breakdown card */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 mb-5 shadow-[0_1px_3px_rgba(16,40,58,.06),0_8px_30px_rgba(16,40,58,.06)]">
              <div className="flex items-baseline justify-between mb-1">
                <h2 className="text-[17px] font-bold text-[#1a2634] tracking-tight">Where the recurring value comes from</h2>
                <span className="text-[11px] text-[#94a3b8] font-semibold uppercase tracking-[.5px]">Conservative – Optimistic</span>
              </div>
              <p className="text-[13.5px] text-[#64748b] mb-5 leading-[1.55]">
                Recurring annual value by driver. The solid bar is the conservative estimate; the lighter extension is the optimistic case.
              </p>

              {/* Bars */}
              {(() => {
                const maxHi = Math.max(...calcData.drivers.map(d => d.hi)) || 1
                return calcData.drivers.map((d, i) => {
                  const loPct = (d.lo / maxHi) * 100
                  const hiPct = (d.hi / maxHi) * 100
                  return (
                    <div key={i} className="py-[15px] border-b border-[#e2e8f0] last:border-none">
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <span className="text-[14px] font-semibold text-[#1a2634]">{d.name}</span>
                        <span className="text-[14px] font-bold text-[#006159] whitespace-nowrap">{range(d.lo, d.hi)}</span>
                      </div>
                      <div className="h-2 bg-[#eaf6f5] rounded-full overflow-hidden relative">
                        <div className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#00A79D] to-[#006159] opacity-50" style={{ width: `${hiPct}%` }} />
                        <div className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#00A79D] to-[#006159]" style={{ width: `${loPct}%` }} />
                      </div>
                    </div>
                  )
                })
              })()}

              {/* Total row */}
              <div className="flex items-center justify-between gap-3 bg-[#f0faf9] border border-[#b2e4e0] rounded-[10px] px-[18px] py-4 mt-[18px]">
                <span className="text-[14px] font-bold text-[#1a2634]">Total recurring annual value</span>
                <span className="text-[17px] font-extrabold text-[#006159] whitespace-nowrap">{range(calcData.recLo, calcData.recHi)}</span>
              </div>

              {/* WC callout */}
              <div className="flex items-start justify-between gap-3 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-[10px] px-[18px] py-4 mt-3">
                <div>
                  <p className="text-[13.5px] font-semibold text-[#1a2634]">One-time: working capital unlocked in year one</p>
                  <p className="text-[12px] text-[#64748b] mt-1 leading-[1.5]">
                    As your invoice cycle shortens by 3–5 days, this cash comes off your receivables once. The recurring total above already includes the ongoing financing benefit of holding it.
                  </p>
                </div>
                <span className="text-[15px] font-extrabold text-[#10283A] whitespace-nowrap">{range(calcData.wcLo, calcData.wcHi)}</span>
              </div>
              <p className="text-[11.5px] text-[#94a3b8] leading-[1.55] mt-4">
                Three-year cumulative value = recurring annual value × 3, plus the one-time working capital unlock counted once.
              </p>
            </div>

            {/* Gate card */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 mb-5 shadow-[0_1px_3px_rgba(16,40,58,.06),0_8px_30px_rgba(16,40,58,.06)]">
              <p className="text-[11.5px] font-bold text-[#00A79D] uppercase tracking-[1px] mb-2.5">Step 3 of 3</p>
              <h2 className="text-[21px] font-bold text-[#1a2634] mb-1.5 tracking-tight">
                {isAssisted ? 'Get your savings summary' : 'Get your full savings summary'}
              </h2>
              <p className="text-[13.5px] text-[#64748b] mb-7 leading-[1.55]">
                {isAssisted
                  ? 'Enter your details for the full breakdown and PDF. A FieldEquip specialist will also follow up to tailor these numbers to your operation.'
                  : 'Enter your details to unlock the complete breakdown and a branded PDF you can take to your leadership team.'}
              </p>

              {/* What's included */}
              <div className="bg-[#f8fafc] rounded-[10px] px-5 py-[18px] mb-[22px]">
                <p className="text-[11.5px] font-bold text-[#475569] uppercase tracking-[.5px] mb-2.5">What's included</p>
                {[
                  'Recurring value breakdown across every efficiency area',
                  'Working capital unlocked & admin hours recovered',
                  'Three-year cumulative value projection',
                  'A branded PDF you can share with leadership',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-[13.5px] text-[#334155] mb-2 last:mb-0 leading-snug">
                    <span className="text-[#00A79D] font-bold flex-shrink-0">✓</span>
                    {item}
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="fname" className="block text-[12px] font-semibold text-[#475569] mb-1.5 uppercase tracking-[.4px]">Full Name</label>
                  <input type="text" id="fname" placeholder="John" value={s2Form.fullname} onChange={e => setS2Form(f => ({ ...f, fullname: e.target.value }))}
                    className="w-full h-12 border-[1.5px] border-[#e2e8f0] rounded-[10px] px-3.5 text-[15px] text-[#1a2634] bg-white outline-none transition focus:border-[#00A79D] focus:ring-[3px] focus:ring-[#00A79D]/12" />
                </div>
                {/* <div>
                  <label htmlFor="lname" className="block text-[12px] font-semibold text-[#475569] mb-1.5 uppercase tracking-[.4px]">Last name</label>
                  <input type="text" id="lname" placeholder="Smith" value={s2Form.lname} onChange={e => setS2Form(f => ({ ...f, lname: e.target.value }))}
                    className="w-full h-12 border-[1.5px] border-[#e2e8f0] rounded-[10px] px-3.5 text-[15px] text-[#1a2634] bg-white outline-none transition focus:border-[#00A79D] focus:ring-[3px] focus:ring-[#00A79D]/12" />
                </div> */}
                <div>
                  <label htmlFor="email" className="block text-[12px] font-semibold text-[#475569] mb-1.5 uppercase tracking-[.4px]">Work email</label>
                  <input type="email" id="email" placeholder="john@company.com" value={s2Form.email} onChange={e => { setS2Form(f => ({ ...f, email: e.target.value })); setS2EmailError('') }}
                    className={`w-full h-12 border-[1.5px] rounded-[10px] px-3.5 text-[15px] text-[#1a2634] bg-white outline-none transition focus:ring-[3px] focus:ring-[#00A79D]/12 ${s2EmailError ? 'border-red-400 focus:border-red-400' : 'border-[#e2e8f0] focus:border-[#00A79D]'}`} />
                  {s2EmailError && <p className="text-[12px] text-red-500 mt-1.5">{s2EmailError}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="company" className="block text-[12px] font-semibold text-[#475569] mb-1.5 uppercase tracking-[.4px]">Company name</label>
                  <input type="text" id="company" placeholder="Acme Field Services" value={s2Form.company} onChange={e => setS2Form(f => ({ ...f, company: e.target.value }))}
                    className="w-full h-12 border-[1.5px] border-[#e2e8f0] rounded-[10px] px-3.5 text-[15px] text-[#1a2634] bg-white outline-none transition focus:border-[#00A79D] focus:ring-[3px] focus:ring-[#00A79D]/12" />
                </div>
              </div>

              <button
                type="button"
                onClick={handleReport}
                disabled={isPending}
                className={`flex items-center justify-center gap-2 w-full mt-6 py-4 rounded-[10px] bg-[#00A79D] text-white text-[16px] font-bold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#00A79D] focus-visible:ring-offset-2 ${isPending ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#007d75] active:translate-y-px cursor-pointer'}`}
              >
                {isPending ? 'Submitting…' : isAssisted ? 'Get my summary & specialist follow-up' : 'Unlock my savings summary'}
                {!isPending && <CheckIcon />}
              </button>
              {/* <HubSpotForm formId='cd910727-b09a-44f3-9d42-2239e121676a'/> */}
              <p className="text-[11.5px] text-[#94a3b8] text-center mt-3.5 leading-[1.5]">We respect your privacy. Your summary generates immediately in your browser.</p>
            </div>

            <button
              type="button"
              onClick={() => goTo('s1')}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-[10px] bg-transparent border-[1.5px] border-[#b2e4e0] text-[#00A79D] text-[16px] font-bold cursor-pointer transition-colors duration-150 hover:bg-[#f0faf9] focus-visible:ring-2 focus-visible:ring-[#00A79D] focus-visible:ring-offset-2"
            >
              ← Adjust my inputs
            </button>
          </section>
        )}

        {/* ======================================================= */}
        {/* SCREEN 2C — Custom (500+)                                */}
        {/* ======================================================= */}
        {screen === 's2c' && (
          <section aria-labelledby="s2c-title" className="animate-[fadeUp_.35s_ease]">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] px-8 py-9 mb-5 shadow-[0_1px_3px_rgba(16,40,58,.06),0_8px_30px_rgba(16,40,58,.06)]">
              <p className="text-[11.5px] font-bold text-[#00A79D] uppercase tracking-[1px] mb-2.5">Built for your scale</p>
              <h2 id="s2c-title" className="text-[21px] font-bold text-[#1a2634] mb-2.5 tracking-tight">Let's build your custom ROI analysis</h2>
              <p className="text-[13.5px] text-[#64748b] mb-6 leading-[1.55]">
                At your scale, a generic estimate would undersell the opportunity — the value tied up across your divisions, billing cycles, and field operations is too specific for a one-size calculator. A senior FieldEquip consultant will build a deal-specific ROI model with your real workflows, the same way we do for enterprise operations like yours.
              </p>

              {/* What's included */}
              <div className="bg-[#f8fafc] rounded-[10px] px-5 py-[18px] mb-6">
                <p className="text-[11.5px] font-bold text-[#475569] uppercase tracking-[.5px] mb-2.5">What your analysis will quantify</p>
                {[
                  'Manual data entry & reconciliation eliminated',
                  'Invoice-cycle acceleration & working capital unlocked',
                  'Cross-division scheduling & resource visibility',
                  'Standardization, compliance & quote-pipeline value',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-[13.5px] text-[#334155] mb-2 last:mb-0 leading-snug">
                    <span className="text-[#00A79D] font-bold flex-shrink-0">✓</span>
                    {item}
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="cfname" className="block text-[12px] font-semibold text-[#475569] mb-1.5 uppercase tracking-[.4px]">First name</label>
                  <input type="text" id="cfname" placeholder="John" value={s2cForm.fullname} onChange={e => setS2cForm(f => ({ ...f, fullname: e.target.value }))}
                    className="w-full h-12 border-[1.5px] border-[#e2e8f0] rounded-[10px] px-3.5 text-[15px] text-[#1a2634] bg-white outline-none transition focus:border-[#00A79D] focus:ring-[3px] focus:ring-[#00A79D]/12" />
                </div>
                {/* <div>
                  <label htmlFor="clname" className="block text-[12px] font-semibold text-[#475569] mb-1.5 uppercase tracking-[.4px]">Last name</label>
                  <input type="text" id="clname" placeholder="Smith" value={s2cForm.lname} onChange={e => setS2cForm(f => ({ ...f, lname: e.target.value }))}
                    className="w-full h-12 border-[1.5px] border-[#e2e8f0] rounded-[10px] px-3.5 text-[15px] text-[#1a2634] bg-white outline-none transition focus:border-[#00A79D] focus:ring-[3px] focus:ring-[#00A79D]/12" />
                </div> */}
                <div>
                  <label htmlFor="cemail" className="block text-[12px] font-semibold text-[#475569] mb-1.5 uppercase tracking-[.4px]">Work email</label>
                  <input type="email" id="cemail" placeholder="john@company.com" value={s2cForm.email} onChange={e => setS2cForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full h-12 border-[1.5px] border-[#e2e8f0] rounded-[10px] px-3.5 text-[15px] text-[#1a2634] bg-white outline-none transition focus:border-[#00A79D] focus:ring-[3px] focus:ring-[#00A79D]/12" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="ccompany" className="block text-[12px] font-semibold text-[#475569] mb-1.5 uppercase tracking-[.4px]">Company name</label>
                  <input type="text" id="ccompany" placeholder="Acme Field Services" value={s2cForm.company} onChange={e => setS2cForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full h-12 border-[1.5px] border-[#e2e8f0] rounded-[10px] px-3.5 text-[15px] text-[#1a2634] bg-white outline-none transition focus:border-[#00A79D] focus:ring-[3px] focus:ring-[#00A79D]/12" />
                </div>
              </div>
              

              <button
                type="button"
                onClick={handleCustom}
                className="flex items-center justify-center gap-2 w-full mt-6 py-4 rounded-[10px] bg-[#00A79D] hover:bg-[#007d75] active:translate-y-px text-white text-[16px] font-bold cursor-pointer transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#00A79D] focus-visible:ring-offset-2"
              >
                Request my custom analysis <CheckIcon />
              </button>
              <p className="text-[11.5px] text-[#94a3b8] text-center mt-3.5 leading-[1.5]">
                A senior FieldEquip specialist — not a third-party rep — will follow up within one business day.
              </p>
            </div>

            <button
              type="button"
              onClick={() => goTo('s1')}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-[10px] bg-transparent border-[1.5px] border-[#b2e4e0] text-[#00A79D] text-[16px] font-bold cursor-pointer transition-colors duration-150 hover:bg-[#f0faf9] focus-visible:ring-2 focus-visible:ring-[#00A79D] focus-visible:ring-offset-2"
            >
              ← Adjust my inputs
            </button>
          </section>
        )}

        {/* ======================================================= */}
        {/* SCREEN 3 — Confirmation                                   */}
        {/* ======================================================= */}
        {screen === 's3' && (
          <section aria-labelledby="s3-title" className="animate-[fadeUp_.35s_ease]">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] px-8 py-12 text-center shadow-[0_1px_3px_rgba(16,40,58,.06),0_8px_30px_rgba(16,40,58,.06)]">
              <div className="w-[66px] h-[66px] bg-[#f0faf9] rounded-full flex items-center justify-center mx-auto mb-[22px]">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <circle cx="16" cy="16" r="14" fill="#00A79D" />
                  <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h2
                id="s3-title"
                className="text-[23px] font-bold mb-2 tracking-tight"
                dangerouslySetInnerHTML={{ __html: s3Title }}
              />
              <p className="text-[#64748b] text-[14px] mb-7 leading-[1.55] max-w-md mx-auto">
                {calcData?.band === 'custom'
                  ? 'A senior FieldEquip consultant will reach out within one business day to build your custom ROI analysis with your real workflows.'
                  : isAssisted
                    ? 'Download your PDF below. A FieldEquip specialist will follow up within one business day to tailor these numbers to your operation.'
                    : 'Your personalized FieldEquip savings summary has been generated. Download the PDF below.'}
              </p>

              {calcData?.band !== 'custom' && (
                <button
                  type="button"
                  onClick={() => calcData && downloadPDF({ ...calcData, fullname: s2Form.fullname,  email: s2Form.email, company: s2Form.company })}
                  className="flex items-center justify-center gap-2 max-w-[340px] mx-auto mb-4 py-4 px-6 rounded-[10px] bg-[#00A79D] hover:bg-[#007d75] active:translate-y-px text-white text-[16px] font-bold cursor-pointer transition-colors duration-150 w-full focus-visible:ring-2 focus-visible:ring-[#00A79D] focus-visible:ring-offset-2"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 2v8m0 0l3-3m-3 3L5 7M3 13h10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Download savings summary (PDF)
                </button>
              )}

              <p className="text-[12.5px] text-[#94a3b8]">
                {calcData?.band === 'custom'
                  ? 'In the meantime, feel free to explore how implementation works.'
                  : 'Questions on the numbers? A FieldEquip specialist can walk you through them.'}
              </p>
            </div>
          </section>
        )}

      </main>

      {/* keyframe injection */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
        [appearance:textfield]::-webkit-inner-spin-button,
        [appearance:textfield]::-webkit-outer-spin-button {
          opacity: 0.3;
        }
      `}</style>
    </div>
  )
}
