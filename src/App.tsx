import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { NgoLayout } from './layouts/NgoLayout'
import { LandingPage } from './features/public/LandingPage'
import { CampaignDirectory } from './features/public/CampaignDirectory'
import { CampaignDetail } from './features/public/CampaignDetail'
import { LoginPage } from './features/ngo/LoginPage'
import { RequireAuth } from './features/ngo/RequireAuth'
import { DashboardPage } from './features/ngo/DashboardPage'
import { CampaignListPage } from './features/ngo/CampaignListPage'
import { CampaignForm } from './features/ngo/CampaignForm'
import { CampaignWorkspace } from './features/ngo/CampaignWorkspace'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/campaigns" element={<CampaignDirectory />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
      </Route>
      <Route path="/ngo/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<NgoLayout />}>
          <Route path="/ngo/dashboard" element={<DashboardPage />} />
          <Route path="/ngo/campaigns" element={<CampaignListPage />} />
          <Route path="/ngo/campaigns/new" element={<CampaignForm />} />
          <Route path="/ngo/campaigns/:id/edit" element={<CampaignForm />} />
          <Route path="/ngo/campaigns/:id" element={<CampaignWorkspace />} />
        </Route>
      </Route>
    </Routes>
  )
}
