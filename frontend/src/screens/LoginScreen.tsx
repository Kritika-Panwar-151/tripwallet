import { useState } from 'react'
import type { NavigateFn, User } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

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
  const [authMode, setAuthMode] = useState<'persona' | 'supabase'>('supabase')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  const handlePersonaLogin = (u: User) => {
    onSelectUser(u)
    navigate('trip-dashboard')
  }

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setMessage({ text: 'Please enter email and password', type: 'error' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        
        setMessage({ text: 'Account created! Logging in...', type: 'success' })
        if (data.user) {
          const authUser: User = {
            id: data.user.id,
            name: email.split('@')[0],
            email: data.user.email || email,
            homeCurrency: 'INR (₹)',
            avatar: '👤',
            role: 'Trip Owner',
          }
          onSelectUser(authUser)
          setTimeout(() => navigate('trip-dashboard'), 1000)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        setMessage({ text: 'Login successful!', type: 'success' })
        if (data.user) {
          const authUser: User = {
            id: data.user.id,
            name: email.split('@')[0],
            email: data.user.email || email,
            homeCurrency: 'INR (₹)',
            avatar: '👤',
            role: 'Trip Owner',
          }
          onSelectUser(authUser)
          setTimeout(() => navigate('trip-dashboard'), 800)
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Authentication failed', type: 'error' })
    } finally {
      setLoading(false)
    }
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
            Smart Budget & Expense Companion with Supabase Authentication
          </p>
        </div>

        {/* Tab Switcher: Supabase Auth vs Persona Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setAuthMode('supabase')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              authMode === 'supabase'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚡ Supabase Auth
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('persona')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              authMode === 'persona'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👤 Demo Persona Switcher
          </button>
        </div>

        {authMode === 'supabase' ? (
          /* Supabase Real Auth Form */
          <form onSubmit={handleSupabaseAuth} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  message.type === 'error'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-700/20 hover:bg-teal-700 transition flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <span>{isSignUp ? 'Sign Up with Supabase' : 'Sign In with Supabase'}</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        ) : (
          /* Persona Switcher UI */
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

            <button
              onClick={() => handlePersonaLogin(selectedUser)}
              className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-700/20 hover:bg-teal-700 transition flex items-center justify-center gap-2 text-base"
            >
              <span>Continue as {selectedUser.name}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-5">
          🔒 Secure authentication backed by Supabase & PS-08 schema
        </p>
      </div>
    </div>
  )
}
