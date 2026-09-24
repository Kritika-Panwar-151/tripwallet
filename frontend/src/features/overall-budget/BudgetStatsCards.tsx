import type { Trip } from '../common/types'
import { useBudget } from './useBudget'

interface Props {
  trip: Trip
}

export default function BudgetStatsCards({ trip }: Props) {
  const { budget, spent, remaining, dailyAvg, daysGone, daysTotal, daysLeft } = useBudget(trip)

  const cards = [
    { label: 'Overall Budget', value: `₹${budget.toLocaleString()}`, sub: 'Allocated trip fund', icon: '💰' },
    { label: 'Spent to Date', value: `₹${spent.toLocaleString()}`, sub: `${daysGone} of ${daysTotal} days used`, icon: '🧾' },
    { label: 'Remaining Balance', value: `₹${remaining.toLocaleString()}`, sub: `${daysLeft} days remaining`, icon: '🌴', green: true },
    { label: 'Daily Average', value: `₹${dailyAvg.toLocaleString()}`, sub: 'Actual per day', icon: '📍' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => (
        <div key={i} className="bg-white rounded-3xl border border-teal-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl">{c.icon}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.label}</span>
          </div>
          <p className={`text-xl font-extrabold ${c.green ? 'text-teal-800' : 'text-slate-900'}`}>{c.value}</p>
          <p className="text-[11px] text-slate-400 mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
