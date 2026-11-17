import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStudentAuth } from '../../hooks/useStudentAuth';
import { Loader2 } from 'lucide-react';

export function StudentProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useStudentAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
        backgroundColor: '#0F172A',
        color: '#94A3B8'
      }}>
        <Loader2 size={36} className="spinner" style={{ animation: 'spin 1s linear infinite', color: '#3B82F6' }} />
        <p style={{ fontSize: '0.875rem' }}>Carregando Portal do Aluno...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/aluno/login" state={{ from: location }} replace />;
  }

  return children;
}
