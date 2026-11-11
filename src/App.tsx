import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from './site/SiteLayout'
import { Home } from './site/pages/Home'
import { Offices } from './site/pages/Offices'
import { OfficeDetail } from './site/pages/OfficeDetail'
import { OfficeApply } from './site/pages/OfficeApply'
import { Room } from './site/pages/Room'
import { RoomCheckout } from './site/pages/RoomCheckout'
import { RoomConfirmation } from './site/pages/RoomConfirmation'
import { Domiciliation } from './site/pages/Domiciliation'
import { DomiSignup } from './site/pages/DomiSignup'
import { Services } from './site/pages/Services'
import { Contact } from './site/pages/Contact'
import { EspaceRoutes } from './espace/EspaceRoutes'
import { AdminRoutes } from './admin/AdminRoutes'
import { NotFound } from './NotFound'
import { DemoPill } from './core/layout/DemoPill'
import { Toaster } from './core/ui'

export function App() {
  return (
    <>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="bureaux" element={<Offices />} />
          <Route path="bureaux/:id" element={<OfficeDetail />} />
          <Route path="bureaux/:id/demande" element={<OfficeApply />} />
          <Route path="salle-de-conference" element={<Room />} />
          <Route path="salle-de-conference/reservation" element={<RoomCheckout />} />
          <Route path="salle-de-conference/confirmation/:id" element={<RoomConfirmation />} />
          <Route path="domiciliation" element={<Domiciliation />} />
          <Route path="domiciliation/inscription" element={<DomiSignup />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="espace/*" element={<EspaceRoutes />} />
        <Route path="admin/*" element={<AdminRoutes />} />
      </Routes>
      <DemoPill />
      <Toaster />
    </>
  )
}
