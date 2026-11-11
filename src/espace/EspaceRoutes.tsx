import { Navigate, Route, Routes } from 'react-router-dom'
import { useStore } from '@/store'
import { EspaceLayout } from './EspaceLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { MailPage } from './pages/Mail'
import { Subscriptions } from './pages/Subscriptions'
import { Bookings } from './pages/Bookings'
import { Invoices } from './pages/Invoices'
import { EspaceServices } from './pages/Services'
import { Profile } from './pages/Profile'

export function EspaceRoutes() {
  const loggedIn = useStore((s) => !!s.customerId && s.customers.some((c) => c.id === s.customerId))
  return (
    <Routes>
      <Route path="connexion" element={loggedIn ? <Navigate to="/espace" replace /> : <Login />} />
      <Route element={loggedIn ? <EspaceLayout /> : <Navigate to="/espace/connexion" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="courrier" element={<MailPage />} />
        <Route path="abonnements" element={<Subscriptions />} />
        <Route path="reservations" element={<Bookings />} />
        <Route path="factures" element={<Invoices />} />
        <Route path="services" element={<EspaceServices />} />
        <Route path="profil" element={<Profile />} />
        <Route path="*" element={<Navigate to="/espace" replace />} />
      </Route>
    </Routes>
  )
}
