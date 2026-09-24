import { useState, useMemo, useEffect } from 'react'
import type { Trip, User } from '../../types'
import { getRegisteredUsers, searchUsers } from '../../services/userRegistry'

export interface Traveller {
  id: string
  name: string
  email?: string
  avatar: string
  role: 'Host' | 'Adult Member' | 'Child'
  isAdult: boolean
  isIncludedInAccounts: boolean
  personalBudget?: number
}

interface UseTripTravellersOptions {
  onUpdateTrip?: (updatedTrip: Trip) => void
  onUpdateMemberBudget?: (tripId: string, userId: string, newBudget: number) => void
}

export function useTripTravellers(
  trip?: Trip | null,
  currentUser?: User | null,
  options?: UseTripTravellersOptions
) {
  const registeredUsers = useMemo(() => getRegisteredUsers(), [])

  // Resolve Host ID: First member or host user
  const hostId = useMemo(() => {
    if (trip?.members && trip.members.length > 0) {
      return trip.members[0]
    }
    return 'usr_aisha'
  }, [trip?.members])

  // Check if active user is Host
  const isHost = useMemo(() => {
    if (!currentUser) return true // default organizer view
    if (currentUser.id === hostId) return true
    if (currentUser.id === 'usr_aisha' || currentUser.id === 'usr_you') return true
    return false
  }, [currentUser, hostId])

  // Resolve active travellers list from trip.members
  const travellers = useMemo<Traveller[]>(() => {
    const memberIds = trip?.members && trip.members.length > 0
      ? trip.members
      : ['usr_aisha', 'usr_ravi', 'usr_asha']

    return memberIds.map((id) => {
      const found = registeredUsers.find((u) => u.id === id)
      const isTripHost = id === hostId || id === 'usr_aisha'
      const personalAlloc = trip?.memberBudgets?.[id] ?? Math.round((trip?.budget || 60000) / Math.max(memberIds.length, 1))

      return {
        id,
        name: found ? found.name : id === currentUser?.id ? currentUser.name : id,
        email: found?.email,
        avatar: found ? found.avatar : '👤',
        role: isTripHost ? 'Host' : 'Adult Member',
        isAdult: true,
        isIncludedInAccounts: true,
        personalBudget: personalAlloc,
      }
    })
  }, [trip?.members, trip?.memberBudgets, trip?.budget, registeredUsers, hostId, currentUser])

  const adultsCount = trip?.adults ?? travellers.filter((t) => t.isAdult).length
  const childrenCount = trip?.children ?? 0
  const totalPartySize = adultsCount + childrenCount

  // ==========================================
  // POST-CREATION EDIT MEMBERS MODAL STATE
  // ==========================================
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [draftMembers, setDraftMembers] = useState<User[]>([])
  const [draftBudgets, setDraftBudgets] = useState<Record<string, number>>({})
  const [searchQuery, setSearchQuery] = useState('')

  // Sync draft state with trip when modal opens
  const openManageModal = () => {
    const initialMembers: User[] = travellers.map((t) => {
      const registered = registeredUsers.find((u) => u.id === t.id)
      return (
        registered || {
          id: t.id,
          name: t.name,
          email: t.email || `${t.id}@example.invalid`,
          avatar: t.avatar,
          homeCurrency: trip?.currency || 'INR',
        }
      )
    })

    const initialBudgets: Record<string, number> = {}
    initialMembers.forEach((m) => {
      initialBudgets[m.id] = trip?.memberBudgets?.[m.id] ?? Math.round((trip?.budget || 60000) / Math.max(initialMembers.length, 1))
    })

    setDraftMembers(initialMembers)
    setDraftBudgets(initialBudgets)
    setSearchQuery('')
    setIsManageModalOpen(true)
  }

  const closeManageModal = () => {
    setIsManageModalOpen(false)
    setSearchQuery('')
  }

  // Filter search results excluding already selected draft members
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const results = searchUsers(searchQuery)
    return results.filter((u) => !draftMembers.some((m) => m.id === u.id))
  }, [searchQuery, draftMembers])

  const handleAddMember = (user: User) => {
    if (!draftMembers.some((m) => m.id === user.id)) {
      setDraftMembers((prev) => [...prev, user])
      setDraftBudgets((prev) => ({
        ...prev,
        [user.id]: 25000, // default personal budget
      }))
      setSearchQuery('')
    }
  }

  const handleRemoveMember = (userId: string) => {
    if (userId === hostId || userId === 'usr_aisha') return // Host cannot be removed
    setDraftMembers((prev) => prev.filter((m) => m.id !== userId))
    setDraftBudgets((prev) => {
      const copy = { ...prev }
      delete copy[userId]
      return copy
    })
  }

  const handleBudgetChange = (userId: string, amount: number) => {
    setDraftBudgets((prev) => ({
      ...prev,
      [userId]: Math.max(0, amount),
    }))
  }

  // Total draft group budget calculated as exact sum of member personal budgets
  const totalDraftBudget = useMemo(() => {
    return draftMembers.reduce((sum, member) => {
      const val = draftBudgets[member.id] || 0
      return sum + val
    }, 0)
  }, [draftMembers, draftBudgets])

  // Save changes & recalculate trip.memberBudgets and total trip.budget
  const handleSaveMembers = () => {
    if (!trip) return

    const newMembers = draftMembers.map((m) => m.id)
    const newTotal = totalDraftBudget

    const updatedTrip: Trip = {
      ...trip,
      members: newMembers,
      adults: draftMembers.length,
      partySize: draftMembers.length + (trip.children || 0),
      budget: newTotal,
      memberBudgets: draftBudgets,
      personalBudget: currentUser ? (draftBudgets[currentUser.id] ?? trip.personalBudget) : trip.personalBudget,
      categoryCaps: {
        accommodation: Math.round(newTotal * 0.35),
        food: Math.round(newTotal * 0.25),
        transport: Math.round(newTotal * 0.20),
        activities: Math.round(newTotal * 0.10),
        misc: Math.round(newTotal * 0.10),
      },
    }

    // Call options callbacks if provided
    if (options?.onUpdateTrip) {
      options.onUpdateTrip(updatedTrip)
    }

    if (options?.onUpdateMemberBudget && currentUser) {
      Object.entries(draftBudgets).forEach(([uid, bVal]) => {
        options.onUpdateMemberBudget?.(trip.id, uid, bVal)
      })
    }

    closeManageModal()
  }

  return {
    travellers,
    adultsCount,
    childrenCount,
    totalPartySize,
    accountsRuleNotice: 'Group split calculations apply to adults only · Each member sets a personal budget',
    isHost,
    hostId,
    // Manage Members Modal exports
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
  }
}
