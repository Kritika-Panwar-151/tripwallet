import type { Trip } from '../common/types'
import { useBudget } from './useBudget'

interface Props {
  trip: Trip
}

export default function BudgetDonutGauge({ trip }: Props) {
  const { budget, spent, remaining, pct, safeDaily } = useBudget(trip)

  const radius = 72
  const circ = 2 * Math.PI * radius
  const strokeDashoffset = circ - (pct / 100) * circ

  return (
    <div className="bg-white rounded-3xl border border-teal-100 shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* DONUT GAUGE VISUAL */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="14" />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#0D9488"
              strokeWidth="14"
              strokeDasharray={circ}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-slate-900">{pct}%</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Used</span>
          </div>
        </div>

        {/* FINANCIAL SUMMARY HIGHLIGHTS */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-semibold text-slate-500">Allocated Trip Fund</span>
            <span className="text-sm font-bold text-slate-900">₹{budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-semibold text-slate-500">Total Spent to Date</span>
            <span className="text-sm font-bold text-teal-800">₹{spent.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-semibold text-slate-500">Remaining Balance</span>
            <span className="text-sm font-extrabold text-emerald-700">₹{remaining.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-teal-50 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900">Safe Daily Runway</span>
            <span className="text-sm font-extrabold text-teal-800">₹{safeDaily.toLocaleString()} / day</span>
          </div>
        </div>
      </div>
    </div>
  )
}
