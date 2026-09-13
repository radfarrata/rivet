import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import NexusOS from './pages/NexusOS.jsx';
import Dashboard from './pages/Dashboard';
import RivetDashboard from './pages/RivetDashboard.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from '@/components/ProtectedRoute';
import ExpertWorkspace from './pages/ExpertWorkspace';
import EvaluationEvidence from '@/pages/EvaluationEvidence';
import DomainReport from '@/pages/DomainReport';
// Add page imports here

const AuthenticatedApp = () => (
  <Routes>
    {/* Auth pages (public) */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

    {/* All app routes gated behind login */}
    <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
      <Route path="/" element={<RivetDashboard />} />
      <Route path="/expert" element={<ExpertWorkspace />} />
      <Route path="/evidence" element={<EvaluationEvidence />} />
      <Route path="/report" element={<DomainReport />} />
      <Route path="/network" element={<NexusOS />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Route>

    <Route path="*" element={<PageNotFound />} />
  </Routes>
);


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App