import { useState } from 'react'
import type { NavigateFn, User } from '../types'

interface Props {
  navigate: NavigateFn
  currentUser: User
  onSelectUser: (user: User) => void
}

export const sampleUsers: User[] = [
  {
    id: 'usr_aisha',
    name: 'Aisha Rossi',
    email: 'aisha.rossi@example.invalid',
    homeCurrency: 'INR (₹)',
    avatar: '👩🏽',
    role: 'Trip Organizer / Owner',
  },
  {
    id: 'usr_ravi',
    name: 'Ravi Sharma',
    email: 'ravi.sharma@example.invalid',
    homeCurrency: 'INR (₹)',
    avatar: '👨🏽',
    role: 'Editor / Co-traveler',
  },
  {
    id: 'usr_pooja',
    name: 'Pooja Tanaka',
    email: 'pooja.tanaka@example.invalid',
    homeCurrency: 'INR (₹)',
    avatar: '👩🏻',
    role: 'Viewer / Co-traveler',
  },
  {
    id: 'usr_david',
    name: 'David Chen',
    email: 'david.chen@example.invalid',
    homeCurrency: 'USD ($)',
    avatar: '👨🏻',
    role: 'Editor / Co-traveler',
  },
]

export default function LoginScreen({ navigate, currentUser, onSelectUser }: Props) {
  const [selectedUser, setSelectedUser] = useState<User>(currentUser)

  const handleLogin = (u: User) => {
    onSelectUser(u)
    navigate('trip-dashboard')
  }

  return (
    <div className="min-h-full bg-[#f0fdfa] p-6 md:p-12 flex items-center justify-center">
      <div className="bg-white max-w-xl w-full rounded-3xl border border-teal-100 shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md text-3xl">
            🧳
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#164e63]">
            Welcome to TripWallet
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Choose your traveller persona or log in to manage your trip budget
          </p>
        </div>

        {/* User Account Selection */}
        <div className="space-y-3 mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Select Active Account
          </p>

          {sampleUsers.map((u) => {
            const isSelected = selectedUser.id === u.id
            return (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-200'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-slate-100">
                    {u.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-base">{u.name}</p>
                      {currentUser.id === u.id && (
                        <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                    <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                      {u.role} · Currency: {u.homeCurrency}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Action button */}
        <button
          onClick={() => handleLogin(selectedUser)}
          className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-700/20 hover:bg-teal-700 transition flex items-center justify-center gap-2 text-base"
        >
          <span>Continue as {selectedUser.name}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <p className="text-center text-xs text-slate-400 mt-5">
          🔒 Secure authentication backed by PS-08 synthetic identity schema
        </p>
      </div>
    </div>
  )
}
