import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { Overview } from './pages/Overview'
import { AdminOffices } from './pages/Offices'
import { Applications } from './pages/Applications'
import { RoomCalendar } from './pages/RoomCalendar'
import { Clients } from './pages/Clients'
import { ClientProfile } from './pages/ClientProfile'
import { MailTool } from './pages/MailTool'
import { AdminSubscriptions } from './pages/Subscriptions'
import { AdminInvoices } from './pages/Invoices'
import { ServiceRequests } from './pages/ServiceRequests'
import { Automations } from './pages/Automations'
import { Settings } from './pages/Settings'

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="bureaux" element={<AdminOffices />} />
        <Route path="demandes" element={<Applications />} />
        <Route path="salle" element={<RoomCalendar />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientProfile />} />
        <Route path="courrier" element={<MailTool />} />
        <Route path="abonnements" element={<AdminSubscriptions />} />
        <Route path="factures" element={<AdminInvoices />} />
        <Route path="services" element={<ServiceRequests />} />
        <Route path="automatisations" element={<Automations />} />
        <Route path="parametres" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}
