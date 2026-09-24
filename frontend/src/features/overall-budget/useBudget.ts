import type { Trip } from '../common/types'

export function useBudget(trip: Trip) {
  const budget = trip.budget || 60000
  const spent = trip.spent || 26172
  const remaining = Math.max(0, budget - spent)
  const pct = Math.min(100, Math.round((spent / budget) * 100))

  const daysTotal = 7
  const daysGone = 2
  const daysLeft = 5

  const dailyAvg = daysGone > 0 ? Math.round(spent / daysGone) : 0
  const safeDaily = daysLeft > 0 ? Math.round(remaining / daysLeft) : 0
  const projectedTotal = spent + dailyAvg * daysLeft
  const isOverBudgetProjected = projectedTotal > budget

  return {
    budget,
    spent,
    remaining,
    pct,
    daysTotal,
    daysGone,
    daysLeft,
    dailyAvg,
    safeDaily,
    projectedTotal,
    isOverBudgetProjected,
  }
}
