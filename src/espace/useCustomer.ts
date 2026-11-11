import { useStore } from '@/store'
import type { Customer } from '@/store/types'

/** The logged-in customer. Only call inside the authenticated espace layout. */
export function useCustomer(): Customer {
  return useStore((s) => s.customers.find((c) => c.id === s.customerId)!)
}
