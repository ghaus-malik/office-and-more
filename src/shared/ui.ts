import { create } from 'zustand'

/** Transient UI state shared across areas (not persisted). */
export const useUi = create<{
  inboxOpen: boolean
  setInbox: (o: boolean) => void
  mrrBump: { amount: number; at: number } | null
  bumpMrr: (amount: number) => void
}>((set) => ({
  inboxOpen: false,
  setInbox: (inboxOpen) => set({ inboxOpen }),
  mrrBump: null,
  bumpMrr: (amount) => set({ mrrBump: { amount, at: Date.now() } }),
}))
