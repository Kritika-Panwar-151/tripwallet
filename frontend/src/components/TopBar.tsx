import { useState, useEffect } from 'react'
import type { NavigateFn, User, Trip, Screen } from '../types'
import {
  detectLocationAndCurrency,
  type DetectedLocationCurrency,
} from '../features/trip-travellers-and-party/gpsCurrencyService'

interface Props {
  currentUser?: User | null
  currentTrip?: Trip | null
  currentScreen?: Screen
  navigate: NavigateFn
  onOpenConverter: () => void
  onSignOut?: () => void
}

export default function TopBar({
  currentUser,
  currentTrip,
  currentScreen,
  navigate,
  onOpenConverter,
  onSignOut,
}: Props) {
  // GPS Currency Detection State
  const [gpsData, setGpsData] = useState<DetectedLocationCurrency | null>(null)
  const [isDetectingGps, setIsDetectingGps] = useState(false)
  const [showGpsTooltip, setShowGpsTooltip] = useState(false)

  // Auto-detect on initial load
  useEffect(() => {
    let isMounted = true
    async function initGps() {
      try {
        const detected = await detectLocationAndCurrency()
        if (isMounted) {
          setGpsData(detected)
        }
      } catch (err) {
        console.warn('Initial GPS detection error:', err)
      }
    }
    initGps()
    return () => {
      isMounted = false
    }
  }, [])

  const handleManualGpsDetect = async () => {
    setIsDetectingGps(true)
    setShowGpsTooltip(true)
    try {
      const detected = await detectLocationAndCurrency()
      setGpsData(detected)
    } catch (e) {
      console.warn('GPS detection failed:', e)
    } finally {
      setIsDetectingGps(false)
    }
  }

  // Hide TopBar completely on login screen for full immersion
  if (currentScreen === 'login') return null

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-teal-100/80 px-4 py-2.5 flex items-center justify-between shadow-xs">
      {/* Brand & Active Trip */}
      <div
        onClick={() => navigate('trip-dashboard')}
        className="flex items-center gap-2.5 cursor-pointer"
      >
        <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center text-white text-base shadow-xs">
          🧳
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-sm leading-none">
              TripWallet
            </span>
            {currentTrip ? (
              <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-teal-200/60 truncate max-w-[120px]">
                {currentTrip.name}
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-500 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                No active trip
              </span>
            )}
          </div>
          <p className="text-[10px] text-teal-600 font-medium">Smart Travel Finance</p>
        </div>
      </div>

      {/* Right Actions: GPS Currency Detection, FX Calculator & User Profile */}
      <div className="flex items-center gap-2 relative">
        {/* GPS Currency Detector Button */}
        <div className="relative">
          <button
            type="button"
            onClick={handleManualGpsDetect}
            className={`px-2 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border shadow-2xs ${
              isDetectingGps
                ? 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
                : gpsData
                ? 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200/80 text-emerald-800'
                : 'bg-teal-50 hover:bg-teal-100/80 border-teal-200/70 text-teal-800'
            }`}
            title="GPS Currency Detection (Click to refresh location & currency)"
          >
            <span>{isDetectingGps ? '🛰️' : '📍'}</span>
            <span className="text-[11px] font-extrabold">
              {isDetectingGps
                ? 'Detecting...'
                : gpsData
                ? `${gpsData.currencySymbol} ${gpsData.currency}`
                : 'GPS'}
            </span>
          </button>

          {/* GPS Info Popover / Tooltip */}
          {showGpsTooltip && gpsData && (
            <div className="absolute right-0 top-10 z-40 bg-white border border-teal-200 shadow-xl rounded-2xl p-3 w-64 text-left animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
                  <span>📍 GPS Currency Lock</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowGpsTooltip(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="mt-2 space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  {gpsData.cityName}, {gpsData.countryName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-extrabold">
                  <span>Currency:</span>
                  <span className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {gpsData.currencySymbol} {gpsData.currency}
                  </span>
                </div>
                {gpsData.message && (
                  <p className="text-[10px] text-slate-400 mt-1">{gpsData.message}</p>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowGpsTooltip(false)
                    onOpenConverter()
                  }}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline"
                >
                  Open in FX Calculator →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Currency Converter Button */}
        <button
          onClick={onOpenConverter}
          className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100/80 border border-teal-200/70 text-teal-800 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
          title="Quick FX Calculator"
        >
          <span>💱</span>
          <span className="text-[11px]">FX</span>
        </button>

        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/70 py-1 px-2 rounded-xl">
          <div className="w-6 h-6 bg-teal-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-2xs">
            {currentUser?.avatar || '👤'}
          </div>
          <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[90px] truncate">
            {currentUser?.name?.split(' ')[0] || 'Account'}
          </span>
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="text-[10px] text-slate-400 hover:text-rose-600 font-bold ml-1 transition"
              title="Sign Out"
            >
              Exit
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
