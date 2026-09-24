import { useState } from 'react'
import type { NavigateFn, User } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  DEFAULT_USERS,
  getRegisteredUsers,
  registerUser,
} from '../services/userRegistry'
import {
  CANONICAL_COUNTRIES,
  CANONICAL_CITIES,
  BUDGET_BANDS,
  TRAVEL_STYLES,
  TRAVELLER_TYPES,
  getCurrencyForCountry,
} from '../data/canonicalReferences'

interface Props {
  navigate: NavigateFn
  currentUser: User
  onSelectUser: (user: User) => void
}

export const sampleUsers: User[] = DEFAULT_USERS

const AVATAR_OPTIONS = ['👩🏽', '👨🏽', '👩🏻', '👨🏻', '🧑🏽', '🧳', '🎒', '✈️']

export default function LoginScreen({ navigate, currentUser, onSelectUser }: Props) {
  const [selectedUser, setSelectedUser] = useState<User>(currentUser)
  const [authMode, setAuthMode] = useState<'account' | 'persona'>('account')
  const [isSignUp, setIsSignUp] = useState(false)
  const [signUpStep, setSignUpStep] = useState<1 | 2>(1)

  // Step 1 Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2 Fields (Canonical PS-08 User Table)
  const [homeCountry, setHomeCountry] = useState('India')
  const [homeCity, setHomeCity] = useState('Bengaluru')
  const [travelStyle, setTravelStyle] = useState('comfort')
  const [budgetBand, setBudgetBand] = useState('mid')
  const [travellerType, setTravellerType] = useState('friends')
  const [locale, setLocale] = useState('en-IN')
  const [avatar, setAvatar] = useState('👩🏽')

  // Auto-derived currency from selected home country
  const autoCurrency = getCurrencyForCountry(homeCountry)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  const registeredUsersList = getRegisteredUsers()

  const handlePersonaLogin = (u: User) => {
    onSelectUser(u)
    navigate('trip-dashboard')
  }

  const handleCountryChange = (countryName: string) => {
    setHomeCountry(countryName)
    const country = CANONICAL_COUNTRIES.find((c) => c.name === countryName)
    if (country) {
      setLocale(country.locale)
      const matchingCity = CANONICAL_CITIES.find((c) => c.countryId === country.id)
      if (matchingCity) {
        setHomeCity(matchingCity.name)
      }
    }
  }

  const handleContinueToStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setMessage({ text: 'Please enter your full name', type: 'error' })
      return
    }
    if (!email.trim() || !password.trim()) {
      setMessage({ text: 'Please enter a valid email and password', type: 'error' })
      return
    }
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' })
      return
    }
    setMessage(null)
    setSignUpStep(2)
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isSignUp) {
        // Multi-Step Signup Completion
        let userId = `usr_${Date.now().toString(36)}`

        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                home_country: homeCountry,
                home_city: homeCity,
              },
            },
          })
          if (error) {
            console.warn('Supabase auth notice:', error.message)
          } else if (data.user) {
            userId = data.user.id
          }
        }

        const newUser: User = {
          id: userId,
          name: name.trim(),
          email: email.trim(),
          homeCurrency: autoCurrency,
          homeCountry,
          homeCity,
          avatar,
          role: 'Trip Organizer / Owner',
          budgetBand,
          travelStyle,
          travellerType,
          locale,
        }

        registerUser(newUser)
        onSelectUser(newUser)
        setMessage({ text: 'Profile created successfully! Loading your dashboard...', type: 'success' })
        setTimeout(() => navigate('trip-dashboard'), 800)
      } else {
        // Sign In
        if (!email.trim() || !password.trim()) {
          setMessage({ text: 'Please enter your email/username and password', type: 'error' })
          setLoading(false)
          return
        }

        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (error) {
            console.warn('Supabase signin notice:', error.message)
          }
          if (data?.user) {
            // Find matched local or build session user
            const matched = registeredUsersList.find((u) => u.email.toLowerCase() === email.toLowerCase())
            const activeUser: User = matched || {
              id: data.user.id,
              name: data.user.user_metadata?.full_name || email.split('@')[0],
              email: data.user.email || email,
              homeCurrency: autoCurrency,
              avatar: '👤',
              role: 'Trip Owner',
            }
            onSelectUser(activeUser)
            setMessage({ text: 'Signed in successfully!', type: 'success' })
            setTimeout(() => navigate('trip-dashboard'), 600)
            return
          }
        }

        // Check against registered users locally
        const matched = registeredUsersList.find(
          (u) =>
            u.email.toLowerCase() === email.toLowerCase() ||
            u.name.toLowerCase() === email.toLowerCase()
        )

        if (matched) {
          onSelectUser(matched)
          setMessage({ text: `Welcome back, ${matched.name}!`, type: 'success' })
          setTimeout(() => navigate('trip-dashboard'), 600)
        } else {
          // Allow fallback user with entered email
          const fallbackUser: User = {
            id: `usr_${Date.now().toString(36)}`,
            name: email.split('@')[0],
            email,
            homeCurrency: 'INR',
            avatar: '👤',
            role: 'Trip Owner',
          }
          registerUser(fallbackUser)
          onSelectUser(fallbackUser)
          setMessage({ text: 'Welcome to TripWallet!', type: 'success' })
          setTimeout(() => navigate('trip-dashboard'), 600)
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Authentication failed', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-[#f0fdfa] p-4 md:p-10 flex items-center justify-center">
      <div className="bg-white max-w-xl w-full rounded-3xl border border-teal-100 shadow-xl p-6 md:p-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md text-2xl">
            🧳
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#164e63]">
            TripWallet
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Smart Budget & Group Expense Companion
          </p>
        </div>

        {/* Tab Switcher: Account Auth vs Quick Persona Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setAuthMode('account')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              authMode === 'account'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🔐 {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('persona')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              authMode === 'persona'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👥 Quick Demo Personas
          </button>
        </div>

        {authMode === 'account' ? (
          <div>
            {/* Toggle Sign In vs Sign Up Tabs */}
            <div className="flex border-b border-slate-100 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false)
                  setSignUpStep(1)
                  setMessage(null)
                }}
                className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition ${
                  !isSignUp
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true)
                  setSignUpStep(1)
                  setMessage(null)
                }}
                className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition ${
                  isSignUp
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Create Account (Sign Up)
              </button>
            </div>

            {/* Error / Success Alerts */}
            {message && (
              <div
                className={`p-3 rounded-2xl text-xs font-semibold mb-4 ${
                  message.type === 'error'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {!isSignUp ? (
              /* ================= SIGN IN FORM ================= */
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Email Address or Username
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com or Aisha Rossi"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-700/20 hover:bg-teal-700 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? 'Signing In...' : 'Sign In to TripWallet'}
                </button>
              </form>
            ) : signUpStep === 1 ? (
              /* ================= SIGN UP STEP 1 ================= */
              <form onSubmit={handleContinueToStep2} className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-semibold">
                  <span>Step 1 of 2: Account Details</span>
                  <span className="text-teal-600 font-bold">50%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
                  <div className="bg-teal-600 h-full w-1/2 rounded-full" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Sharma"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Password (minimum 6 characters)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-700/20 hover:bg-teal-700 transition flex items-center justify-center gap-2 text-sm mt-4"
                >
                  Continue to Traveler Profile →
                </button>
              </form>
            ) : (
              /* ================= SIGN UP STEP 2: CANONICAL PROFILE ================= */
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-semibold">
                  <span>Step 2 of 2: Canonical Traveler Profile</span>
                  <span className="text-teal-600 font-bold">100%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
                  <div className="bg-teal-600 h-full w-full rounded-full" />
                </div>

                {/* Avatar selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Choose Profile Avatar
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setAvatar(av)}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition ${
                          avatar === av
                            ? 'bg-teal-50 border-2 border-teal-600 scale-105'
                            : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Home Country & Auto-Derived Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Home Country
                    </label>
                    <select
                      value={homeCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                    >
                      {CANONICAL_COUNTRIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.iso2})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Home Currency (Auto-Assigned)
                    </label>
                    <div className="px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-bold flex items-center justify-between">
                      <span>{autoCurrency}</span>
                      <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                        Auto-mapped
                      </span>
                    </div>
                  </div>
                </div>

                {/* Home City */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Home City
                  </label>
                  <input
                    type="text"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                  />
                </div>

                {/* Travel Style & Budget Band */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Travel Style
                    </label>
                    <select
                      value={travelStyle}
                      onChange={(e) => setTravelStyle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 outline-none"
                    >
                      {TRAVEL_STYLES.map((ts) => (
                        <option key={ts.value} value={ts.value}>
                          {ts.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Budget Band
                    </label>
                    <select
                      value={budgetBand}
                      onChange={(e) => setBudgetBand(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 outline-none"
                    >
                      {BUDGET_BANDS.map((bb) => (
                        <option key={bb.value} value={bb.value}>
                          {bb.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Traveller Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Primary Traveller Cohort
                  </label>
                  <select
                    value={travellerType}
                    onChange={(e) => setTravellerType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 outline-none"
                  >
                    {TRAVELLER_TYPES.map((tt) => (
                      <option key={tt.value} value={tt.value}>
                        {tt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignUpStep(1)}
                    className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-700/20 hover:bg-teal-700 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {loading ? 'Creating Profile...' : 'Complete Profile & Enter TripWallet ✨'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* ================= QUICK PERSONA SWITCHER ================= */
          <div className="space-y-3 mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Select Demo Account to Test
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {registeredUsersList.map((u) => {
                const isSelected = selectedUser.id === u.id
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUser(u)
                      handlePersonaLogin(u)
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-200'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-xs border border-slate-100">
                        {u.avatar || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800">{u.name}</p>
                          <span className="text-[9px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                            {u.homeCurrency || 'INR'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {u.homeCountry ? `${u.homeCity || ''}, ${u.homeCountry}` : u.role || 'Member'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 bg-white border border-teal-200 text-teal-700 font-bold rounded-xl text-xs hover:bg-teal-600 hover:text-white transition shadow-2xs"
                    >
                      Select
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
