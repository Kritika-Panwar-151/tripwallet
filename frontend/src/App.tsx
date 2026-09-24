import { useState } from 'react'
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

const initialTrips: Trip[] = [
  {
    id: 'europe',
    name: 'Europe Adventure',
    destination: 'Rome & Paris, Europe',
    startDate: '12 Sep',
    endDate: '20 Sep 2026',
    currency: 'INR',
    budget: 60000,
    spent: 26172,
    adults: 3,
    children: 0,
    partySize: 3,
    members: ['usr_you', 'usr_ravi', 'usr_asha'],
    isGroupTrip: true,
    categoryCaps: {
      accommodation: 21000,
      food: 15000,
      transport: 12000,
      activities: 6000,
      misc: 6000,
    },
  },
  {
    id: 'goa',
    name: 'Goa Getaway',
    destination: 'Goa, India',
    startDate: '2 Oct',
    endDate: '6 Oct 2026',
    currency: 'INR',
    budget: 25000,
    spent: 8420,
    adults: 2,
    children: 1,
    partySize: 3,
    members: ['usr_you', 'usr_pooja'],
    isGroupTrip: true,
  },
]

const initialExpenses: Expense[] = [
  {
    id: '1',
    tripId: 'europe',
    merchant: 'Restaurant Milano',
    amount: 42,
    currency: 'EUR',
    convertedAmount: 3948,
    category: 'Food',
    date: '15 Sep',
    paidBy: 'You (Aisha)',
    isShared: true,
    splitBetween: ['You (Aisha)', 'Ravi', 'Asha'],
  },
  {
    id: '2',
    tripId: 'europe',
    merchant: 'Hotel Roma',
    amount: 180,
    currency: 'EUR',
    convertedAmount: 16920,
    category: 'Accommodation',
    date: '14 Sep',
    paidBy: 'Ravi',
    isShared: true,
    splitBetween: ['You (Aisha)', 'Ravi', 'Asha'],
  },
  {
    id: '3',
    tripId: 'europe',
    merchant: 'Metro Pass',
    amount: 18,
    currency: 'EUR',
    convertedAmount: 1692,
    category: 'Transport',
    date: '15 Sep',
    paidBy: 'Asha',
    isShared: true,
    splitBetween: ['You (Aisha)', 'Ravi', 'Asha'],
  },
  {
    id: '4',
    tripId: 'europe',
    merchant: 'Colosseum Guided Tour',
    amount: 35,
    currency: 'EUR',
    convertedAmount: 3290,
    category: 'Activities',
    date: '15 Sep',
    paidBy: 'You (Aisha)',
    isShared: true,
    splitBetween: ['You (Aisha)', 'Ravi', 'Asha'],
  },
  {
    id: '5',
    tripId: 'europe',
    merchant: 'Italian Leather Souvenir',
    amount: 3200,
    currency: 'INR',
    convertedAmount: 3200,
    category: 'Shopping',
    date: '16 Sep',
    paidBy: 'You (Aisha)',
    isShared: false,
    splitBetween: ['You (Aisha)'],
  },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('trip-dashboard')
  const [currentUser, setCurrentUser] = useState<User>(sampleUsers[0])
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [currentTrip, setCurrentTrip] = useState<Trip>(initialTrips[0])
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [isConverterOpen, setIsConverterOpen] = useState(false)

  const navigate = (s: Screen) => {
    setScreen(s)
    window.scrollTo(0, 0)
  }

  const handleCreateTrip = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev])
    setCurrentTrip(newTrip)
  }

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev])
    // update current trip spent amount
    setCurrentTrip((prev) => ({
      ...prev,
      spent: prev.spent + newExpense.convertedAmount,
    }))
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
