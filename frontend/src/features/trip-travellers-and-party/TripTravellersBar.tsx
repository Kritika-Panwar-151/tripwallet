import React from 'react'
import type { Trip, User } from '../../types'
import { useTripTravellers } from './useTripTravellers'
import ManageMembersModal from './ManageMembersModal'

interface Props {
  trip?: Trip | null
  currentUser?: User | null
  onUpdateTrip?: (updatedTrip: Trip) => void
  onUpdateMemberBudget?: (tripId: string, userId: string, newBudget: number) => void
}

export default function TripTravellersBar({
  trip,
  currentUser,
  onUpdateTrip,
  onUpdateMemberBudget,
}: Props) {
  const {
    travellers,
    adultsCount,
    childrenCount,
    totalPartySize,
    accountsRuleNotice,
    isHost,
    hostId,
    isManageModalOpen,
    openManageModal,
    closeManageModal,
    draftMembers,
    draftBudgets,
    searchQuery,
    setSearchQuery,
    searchResults,
    handleAddMember,
    handleRemoveMember,
    handleBudgetChange,
    totalDraftBudget,
    handleSaveMembers,
  } = useTripTravellers(trip, currentUser, { onUpdateTrip, onUpdateMemberBudget })

  const currencySymbol = trip?.currency === 'USD' ? '$' : trip?.currency === 'EUR' ? '€' : '₹'
  const currencyCode = trip?.currency || 'INR'

  return (
    <div className="bg-white rounded-3xl border border-teal-100 shadow-sm p-4 md:p-5 mb-6">
      {/* Top Header Row with Manage Members Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">👥</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Trip Travellers & Party Members
              </h3>
              <span className="bg-teal-50 text-teal-800 border border-teal-200/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {adultsCount} Adults{childrenCount ? ` · ${childrenCount} Children` : ' · 0 Children'}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-md">
                Total: {totalPartySize} Travellers
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{accountsRuleNotice}</p>
          </div>
        </div>

        {/* Action Controls: [+ Manage / Edit Members] for Host */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {trip && isHost && (
            <button
              type="button"
              onClick={openManageModal}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-2xs flex items-center gap-1.5 hover:shadow-sm"
              title="Add, remove, or adjust member personal budgets"
            >
              <span>⚙️</span>
              <span>+ Manage / Edit Members</span>
            </button>
          )}

          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold px-2.5 py-1 rounded-lg">
            ✓ Accounts: Adults Only
          </span>
        </div>
      </div>

      {/* Member Avatars & Personal Budget Cards Grid */}
      <div className="flex flex-wrap items-center gap-2.5 pt-3">
        {travellers.map((traveller) => {
          const isMe = currentUser ? traveller.id === currentUser.id : traveller.id === 'usr_aisha'
          const isTripHost = traveller.role === 'Host'

          return (
            <div
              key={traveller.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition shadow-2xs ${
                isMe
                  ? 'border-indigo-300 bg-indigo-50/70'
                  : isTripHost
                  ? 'border-teal-200/80 bg-teal-50/40'
                  : 'border-slate-200/80 bg-slate-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-xs ${
                  isTripHost
                    ? 'bg-teal-600 text-white'
                    : isMe
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                {traveller.avatar}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {traveller.name} {isMe ? '(You)' : ''}
                  </span>
                  {isTripHost && (
                    <span className="text-[9px] font-extrabold bg-teal-100 text-teal-800 px-1 py-0.2 rounded">
                      Host
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-bold text-teal-700">
                    Budget: {currencySymbol}{(traveller.personalBudget || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Children Info Pill */}
        {childrenCount > 0 ? (
          <div className="flex items-center gap-2 bg-indigo-50/70 border border-indigo-100 px-3 py-2 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-base">
              👧
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-950 block leading-tight">
                {childrenCount} {childrenCount === 1 ? 'Child' : 'Children'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Info only · Not in accounts</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-2xl text-[11px] text-slate-400 border border-dashed border-slate-200">
            <span>👶 0 Children registered</span>
          </div>
        )}
      </div>

      {/* Post-Creation Manage & Edit Members Modal */}
      {trip && (
        <ManageMembersModal
          isOpen={isManageModalOpen}
          onClose={closeManageModal}
          trip={trip}
          hostId={hostId}
          draftMembers={draftMembers}
          draftBudgets={draftBudgets}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          onBudgetChange={handleBudgetChange}
          onSave={handleSaveMembers}
          currency={currencyCode}
          currencySymbol={currencySymbol}
          totalDraftBudget={totalDraftBudget}
        />
      )}
    </div>
  )
}
