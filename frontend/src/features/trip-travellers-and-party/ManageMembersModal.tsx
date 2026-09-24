import React from 'react'
import type { User, Trip } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  trip: Trip
  hostId: string
  draftMembers: User[]
  draftBudgets: Record<string, number>
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchResults: User[]
  onAddMember: (user: User) => void
  onRemoveMember: (userId: string) => void
  onBudgetChange: (userId: string, amount: number) => void
  onSave: () => void
  currency: string
  currencySymbol: string
  totalDraftBudget: number
}

export default function ManageMembersModal({
  isOpen,
  onClose,
  trip,
  hostId,
  draftMembers,
  draftBudgets,
  searchQuery,
  setSearchQuery,
  searchResults,
  onAddMember,
  onRemoveMember,
  onBudgetChange,
  onSave,
  currency,
  currencySymbol,
  totalDraftBudget,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-teal-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xl shadow-xs">
              👥
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 text-base md:text-lg">
                  Manage Trip Members & Budgets
                </h3>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                  Host Authorized
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Trip: <strong className="text-slate-700">{trip.name}</strong> · Adjust member list & personal allocations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm transition"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Host Rule Notice */}
          <div className="p-3 bg-teal-50/70 border border-teal-200/60 rounded-2xl flex items-start gap-2.5 text-xs text-teal-900">
            <span className="text-base leading-none">🛡️</span>
            <div>
              <span className="font-bold block">Trip Host Control</span>
              <span className="text-[11px] text-teal-800 leading-tight">
                As the trip organizer, you can invite new registered travellers, remove party members, or re-balance individual personal budgets. The collective group budget recalculates dynamically.
              </span>
            </div>
          </div>

          {/* Section 1: Search & Invite New Members */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              🔍 Invite New Registered Travellers
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or country (e.g. David, Elena, Pooja)..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="bg-slate-50 border border-teal-200 rounded-2xl p-2 max-h-40 overflow-y-auto space-y-1 shadow-inner">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5">
                  Available Travellers ({searchResults.length})
                </p>
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-300 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{user.avatar || '👤'}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[10px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddMember(user)}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1"
                    >
                      <span>+</span>
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Current Members & Individual Budgets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Current Party Members ({draftMembers.length})
              </label>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Sum: {currencySymbol}{totalDraftBudget.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2.5">
              {draftMembers.map((member) => {
                const isHost = member.id === hostId || member.id === 'usr_you' || member.id === 'usr_aisha'
                const currentBudget = draftBudgets[member.id] ?? 25000

                return (
                  <div
                    key={member.id}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-2xs">
                        {member.avatar || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{member.name}</span>
                          {isHost ? (
                            <span className="text-[9px] font-extrabold bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded">
                              Host
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded">
                              Member
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                          {member.email}
                        </span>
                      </div>
                    </div>

                    {/* Member Budget Input & Remove Action */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-200">
                        <span className="text-xs font-bold text-slate-400 mr-1">{currencySymbol}</span>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={currentBudget}
                          onChange={(e) => onBudgetChange(member.id, parseFloat(e.target.value) || 0)}
                          className="w-24 text-xs font-extrabold text-slate-900 outline-none text-right"
                          title="Personal budget contribution"
                        />
                      </div>

                      {!isHost && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(member.id)}
                          className="w-8 h-8 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center text-xs font-bold transition"
                          title="Remove from trip"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 3: Dynamic Group Budget Summation */}
          <div className="bg-gradient-to-r from-teal-800 to-[#123B3A] text-white rounded-2xl p-4 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-teal-200 font-bold block">
                  New Collective Group Fund ({currency})
                </span>
                <span className="text-2xl font-black">
                  {currencySymbol} {totalDraftBudget.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-teal-600/80 px-2 py-0.5 rounded-full font-bold">
                  {draftMembers.length} Adult Contributors
                </span>
                <p className="text-[10px] text-teal-200 mt-1">
                  Avg: {currencySymbol}{' '}
                  {Math.round(totalDraftBudget / Math.max(draftMembers.length, 1)).toLocaleString()} / person
                </p>
              </div>
            </div>
            <p className="text-[11px] text-teal-100/90 pt-1 border-t border-teal-700 font-mono">
              Formula: Σ (Member Personal Budgets) = Total Group Budget
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-md transition text-xs flex items-center justify-center gap-2"
          >
            <span>✓</span>
            <span>Save & Recalculate Group Budget</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-white transition text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
