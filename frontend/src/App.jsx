import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useAcademy } from './hooks/useAcademy';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/Landing/LandingPage';
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { StudentsPage } from './pages/Students/StudentsPage';
import { StudentDetailPage } from './pages/Students/StudentDetailPage';
import { PaymentsPage } from './pages/Payments/PaymentsPage';
import { AcademyProfilePage } from './pages/AcademyProfile/AcademyProfilePage';
import { ModalitiesPage } from './pages/Modalities/ModalitiesPage';
import { StudentAuthProvider } from './context/StudentAuthContext';
import { StudentProtectedRoute } from './components/studentPortal/StudentProtectedRoute';
import { StudentLoginPage } from './pages/StudentLogin/StudentLoginPage';
import { StudentHubPage } from './pages/StudentHub/StudentHubPage';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { profile } = useAcademy();

  if (loading) {
    return null;
  }

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
      />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route 
        path="/cadastro" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
      />

      {/* Rotas do Portal do Aluno */}
      <Route path="/aluno/login" element={<StudentLoginPage />} />
      <Route
        path="/aluno"
        element={
          <StudentProtectedRoute>
            <StudentHubPage />
          </StudentProtectedRoute>
        }
      />

      {/* Rotas Protegidas no Layout Compartilhado (Desktop Sidebar + Mobile Tab Bar) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout academyName={profile?.nome} logoUrl={profile?.logo_url} />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/alunos" element={<StudentsPage />} />
        <Route path="/alunos/:id" element={<StudentDetailPage />} />
        <Route path="/mensalidades" element={<PaymentsPage />} />
        <Route path="/configuracoes/academia" element={<AcademyProfilePage />} />
        <Route path="/configuracoes/modalidades" element={<ModalitiesPage />} />
        <Route path="/configuracoes" element={<Navigate to="/configuracoes/academia" replace />} />
      </Route>

      {/* Rota Fallback */}
      <Route 
        path="*" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </StudentAuthProvider>
    </AuthProvider>
  );
}
