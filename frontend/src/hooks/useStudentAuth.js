import { useContext } from 'react';
import { StudentAuthContext } from '../context/StudentAuthContext';

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth deve ser utilizado dentro de um StudentAuthProvider');
  }
  return context;
}
