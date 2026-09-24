export interface ChatMessage {
  id: string
  sender: 'user' | 'guardian'
  text: string
  time: string
  itineraryCards?: Array<{
    title: string
    time: string
    location: string
    cost: string
    notes: string
    icon: string
  }>
}

export function queryGuardianKnowledge(userText: string): { text: string; itineraryCards?: ChatMessage['itineraryCards'] } {
  const lower = userText.toLowerCase().trim()

  if (lower.includes('month') || lower.includes('september') || lower.includes('total spend') || lower.includes('all trips')) {
    return {
      text: `Across all trips in **September 2026**, your consolidated spending is **₹37,792 INR**:\n\n• **Europe Adventure**: ₹26,172 INR (69.2%)\n• **Goa Getaway**: ₹8,420 INR (22.3%)\n• **Personal Expenses**: ₹3,200 INR (8.5%)\n\nYou have stayed within your collective monthly travel fund of ₹75,000 INR.`,
    }
  }

  if (lower.includes('itinerary') || lower.includes('schedule') || lower.includes('plan') || lower.includes('today')) {
    return {
      text: `Here is your scheduled itinerary for today in **Rome**:\n\n• Morning: Tour of Ancient Rome\n• Afternoon: Italian dining & Piazza Navona walk\n• Evening: Sunset Colosseum view`,
      itineraryCards: [
        {
          title: 'Colosseum & Roman Forum Guided Tour',
          time: '09:30 AM – 12:30 PM',
          location: 'Piazza del Colosseo, Rome',
          cost: '€18.00 / ₹1,692 INR (Pre-booked)',
          notes: 'Skip-the-line group ticket confirmed. Entry gate 3.',
          icon: '🏛️',
        },
        {
          title: 'Authentic Roman Lunch at Trattoria da Luigi',
          time: '01:00 PM – 02:30 PM',
          location: 'Near Piazza Navona',
          cost: 'Estimated €25.00 / ₹2,350 INR',
          notes: 'Famous for handmade Carbonara & Tiramisu.',
          icon: '🍽️',
        },
      ],
    }
  }

  if (lower.includes('budget') || lower.includes('kitna') || lower.includes('bacha') || lower.includes('remaining')) {
    return {
      text: `Aapka Europe Adventure trip ka **kul budget ₹60,000 INR** hai. Ab tak **₹26,172 INR** kharch hua hai aur **₹33,828 INR bacha hua hai**.\n\nAap agle 5 dino ke liye rozana **₹6,765 / day** surakshit roop se kharch kar sakte hain!`,
    }
  }

  return {
    text: `Your active trip is **Europe Adventure**.\n• Remaining fund: **₹33,828 INR**\n• Safe daily allowance: **₹6,765 / day**\n• Days left: **5 days**.\n\nAsk me about today's itinerary, total monthly spend, or category caps!`,
  }
}
