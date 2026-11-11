import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BookingKind } from '@/store/types'

export interface BookingSelection {
  date: string
  kind: Exclude<BookingKind, 'block'>
  start: string
  end: string
}

/** The selection carried from the booking widget to the checkout (kept for this tab only). */
export const useBookingDraft = create<{ selection: BookingSelection | null; set: (s: BookingSelection | null) => void }>()(
  persist((set) => ({ selection: null, set: (selection) => set({ selection }) }), {
    name: 'om-booking-draft',
    storage: createJSONStorage(() => sessionStorage),
  }),
)
