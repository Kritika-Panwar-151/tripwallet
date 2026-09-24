import { useState, useEffect } from 'react'
import type { Screen, Trip, Expense, User } from './types'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import CurrencyConverterModal from './components/CurrencyConverterModal'
import HomeScreen from './screens/HomeScreen'
import CreateTripScreen from './screens/CreateTripScreen'
import TripDashboard from './screens/TripDashboard'
import AddExpense from './screens/AddExpense'
import ReceiptScanner from './screens/ReceiptScanner'
import OCRConfirm from './screens/OCRConfirm'
import ExpenseHistory from './screens/ExpenseHistory'
import AIGuardian from './screens/AIGuardian'
import WhatIf from './screens/WhatIf'
import GroupSettlement from './screens/GroupSettlement'
import LoginScreen, { sampleUsers } from './screens/LoginScreen'
import {
  fetchTripsFromSupabase,
  fetchExpensesFromSupabase,
  saveTripToSupabase,
  saveExpenseToSupabase,
  initialTripsFallback,
  initialExpensesFallback,
} from './services/supabaseDataService'

export default function App() {
  const [screen, setScreen] = useState<Screen>('trip-dashboard')
  const [currentUser, setCurrentUser] = useState<User>(sampleUsers[0])
  const [trips, setTrips] = useState<Trip[]>(initialTripsFallback)
  const [currentTrip, setCurrentTrip] = useState<Trip>(initialTripsFallback[0])
  const [expenses, setExpenses] = useState<Expense[]>(initialExpensesFallback)
  const [isConverterOpen, setIsConverterOpen] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Load Trips & Expenses from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const loadedTrips = await fetchTripsFromSupabase()
        const loadedExpenses = await fetchExpensesFromSupabase()
        if (loadedTrips && loadedTrips.length > 0) {
          setTrips(loadedTrips)
          setCurrentTrip(loadedTrips[0])
        }
        if (loadedExpenses && loadedExpenses.length > 0) {
          setExpenses(loadedExpenses)
        }
      } catch (err) {
        console.error('Failed to load Supabase data:', err)
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  const navigate = (s: Screen) => {
    setScreen(s)
    window.scrollTo(0, 0)
  }

  const handleCreateTrip = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev])
    setCurrentTrip(newTrip)
    saveTripToSupabase(newTrip, currentUser.id)
  }

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev])
    setCurrentTrip((prev) => ({
      ...prev,
      spent: prev.spent + newExpense.convertedAmount,
    }))
    saveExpenseToSupabase(newExpense, currentUser.id)
  }

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return (
          <LoginScreen
            navigate={navigate}
            currentUser={currentUser}
            onSelectUser={(u) => setCurrentUser(u)}
          />
        )
      case 'home':
        return (
          <HomeScreen
            navigate={navigate}
            trips={trips}
            onSelectTrip={(trip) => {
              setCurrentTrip(trip)
              navigate('trip-dashboard')
            }}
          />
        )
      case 'create-trip':
        return (
          <CreateTripScreen
            navigate={navigate}
            onCreated={handleCreateTrip}
          />
        )
      case 'trip-dashboard':
        return (
          <TripDashboard
            navigate={navigate}
            trip={currentTrip}
            expenses={expenses}
          />
        )
      case 'add-expense':
        return (
          <AddExpense
            navigate={navigate}
            onAddExpense={handleAddExpense}
          />
        )
      case 'receipt-scanner':
        return <ReceiptScanner navigate={navigate} />
      case 'ocr-confirm':
        return <OCRConfirm navigate={navigate} />
      case 'expense-history':
        return (
          <ExpenseHistory
            navigate={navigate}
            expenses={expenses}
            trips={trips}
          />
        )
      case 'ai-guardian':
        return <AIGuardian navigate={navigate} />
      case 'what-if':
        return <WhatIf navigate={navigate} />
      case 'group-settlement':
        return <GroupSettlement navigate={navigate} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f0fdfa] text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Mobile Top App Bar */}
      <TopBar
        currentUser={currentUser}
        currentTrip={currentTrip}
        navigate={navigate}
        onOpenConverter={() => setIsConverterOpen(true)}
      />

      {/* Main Screen Content with pb-24 for fixed bottom navigation */}
      <main className="flex-1 pb-24 overflow-x-hidden">
        {renderScreen()}
      </main>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <BottomNav
        currentScreen={screen}
        navigate={navigate}
      />

      {/* Global Currency Converter Modal */}
      <CurrencyConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
      />
    </div>
  )
}
