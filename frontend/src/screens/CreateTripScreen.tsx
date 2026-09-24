import { useState } from 'react'
import type { NavigateFn, Trip } from '../types'

interface Props {
  navigate: NavigateFn
  onCreated: (trip: Trip) => void
}

const currencies = ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'JPY (¥)', 'AUD (A$)']

const availableTravellers = [
  { id: 'usr_you', name: 'You (Aisha)', avatar: '👩🏽', role: 'Owner' },
  { id: 'usr_ravi', name: 'Ravi Sharma', avatar: '👨🏽', role: 'Editor' },
  { id: 'usr_pooja', name: 'Pooja Tanaka', avatar: '👩🏻', role: 'Viewer' },
  { id: 'usr_david', name: 'David Chen', avatar: '👨🏻', role: 'Editor' },
]

export default function CreateTripScreen({ navigate, onCreated }: Props) {
  const [name, setName] = useState('Switzerland Expedition')
  const [destination, setDestination] = useState('Zurich & Lucerne, Switzerland')
  const [startDate, setStartDate] = useState('2026-10-15')
  const [endDate, setEndDate] = useState('2026-10-22')
  const [currency, setCurrency] = useState('INR (₹)')
  const [budget, setBudget] = useState('100000')
  const [adults, setAdults] = useState('2')
  const [children, setChildren] = useState('1')
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['usr_you', 'usr_ravi', 'usr_pooja'])

  // Category cap allocations based on total budget
  const numBudget = parseFloat(budget) || 0
  const [capPct, setCapPct] = useState({
    stay: 35,
    food: 25,
    transport: 20,
    activities: 10,
    misc: 10,
  })

  const totalParty = (parseInt(adults) || 0) + (parseInt(children) || 0)

  const toggleMember = (id: string) => {
    if (id === 'usr_you') return // owner cannot be removed
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const handleCreate = () => {
    const newTrip: Trip = {
      id: `trp_${Date.now().toString(36)}`,
      name,
      destination,
      startDate,
      endDate,
      currency: currency.split(' ')[0],
      budget: numBudget,
      spent: 0,
      adults: parseInt(adults) || 1,
      children: parseInt(children) || 0,
      partySize: totalParty,
      members: selectedMembers,
      isGroupTrip: selectedMembers.length > 1,
      categoryCaps: {
        accommodation: Math.round((numBudget * capPct.stay) / 100),
        food: Math.round((numBudget * capPct.food) / 100),
        transport: Math.round((numBudget * capPct.transport) / 100),
        activities: Math.round((numBudget * capPct.activities) / 100),
        misc: Math.round((numBudget * capPct.misc) / 100),
      },
    }

    onCreated(newTrip)
    navigate('trip-dashboard')
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to trips
      </button>

      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-teal-700 text-sm font-semibold mb-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Trip Planner
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Plan your trip</h1>
        <p className="text-slate-500 mt-1">Set up group members, budget limits, and passenger breakdown.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-teal-100 p-6 md:p-8 space-y-6">
        {/* Basic Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Trip Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Trip Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Europe Adventure"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Zurich, Switzerland"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* PARTY BREAKDOWN: ADULTS & CHILDREN */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Travellers Breakdown
            </h2>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
              Total Party Size: {totalParty} {totalParty === 1 ? 'person' : 'people'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Number of Adults (18+)
              </label>
              <input
                type="number"
                min="1"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Number of Children (Under 18)
              </label>
              <input
                type="number"
                min="0"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* ADD PEOPLE / INVITE MEMBERS */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Add Group Members from Team / Contacts
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {availableTravellers.map((member) => {
                const isSelected = selectedMembers.includes(member.id)
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/80 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">{member.avatar}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-400">{member.role}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* OVERALL GROUP BUDGET & CATEGORY LIMITS */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            3. Overall Group Budget
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Home Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {currencies.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Total Trip Budget Amount
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Category Caps Breakdown Preview */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Category Budget Limits (PS-08 Category Caps)</span>
              <span className="text-teal-700">Total ₹{numBudget.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">🏨 Stay (35%)</span>
                <strong className="text-slate-800">₹{Math.round((numBudget * 0.35)).toLocaleString()}</strong>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">🍽️ Food (25%)</span>
                <strong className="text-slate-800">₹{Math.round((numBudget * 0.25)).toLocaleString()}</strong>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">🚗 Transit (20%)</span>
                <strong className="text-slate-800">₹{Math.round((numBudget * 0.20)).toLocaleString()}</strong>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">⭐ Activity (10%)</span>
                <strong className="text-slate-800">₹{Math.round((numBudget * 0.10)).toLocaleString()}</strong>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">📦 Misc (10%)</span>
                <strong className="text-slate-800">₹{Math.round((numBudget * 0.10)).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleCreate}
            className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-md transition text-sm"
          >
            Create Trip & Budget
          </button>
          <button
            type="button"
            onClick={() => navigate('home')}
            className="px-6 py-3.5 border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
