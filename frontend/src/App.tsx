import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ScoreEntry from './pages/ScoreEntry'
import ExamList from './pages/ExamList'
import SubjectSettings from './pages/SubjectSettings'
import Reports from './pages/Reports'
import ChildInfo from './pages/ChildInfo'
import PrintReport from './pages/PrintReport'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/score-entry" element={<ProtectedRoute><ScoreEntry /></ProtectedRoute>} />
      <Route path="/exams" element={<ProtectedRoute><ExamList /></ProtectedRoute>} />
      <Route path="/subjects" element={<ProtectedRoute><SubjectSettings /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/child-info" element={<ProtectedRoute><ChildInfo /></ProtectedRoute>} />
      <Route path="/print" element={<ProtectedRoute><PrintReport /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
