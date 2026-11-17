import React, { createContext, useState, useEffect } from 'react';

export const StudentAuthContext = createContext(null);

export function StudentAuthProvider({ children }) {
  const [studentToken, setStudentToken] = useState(() => localStorage.getItem('tatamyhub_aluno_token') || null);
  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem('tatamyhub_aluno_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [academia, setAcademia] = useState(() => {
    const saved = localStorage.getItem('tatamyhub_aluno_academia');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('tatamyhub_aluno_token');
    const storedStudent = localStorage.getItem('tatamyhub_aluno_data');
    const storedAcademia = localStorage.getItem('tatamyhub_aluno_academia');

    if (storedToken && storedStudent) {
      setStudentToken(storedToken);
      setStudent(JSON.parse(storedStudent));
      if (storedAcademia) setAcademia(JSON.parse(storedAcademia));
    } else {
      setStudentToken(null);
      setStudent(null);
      setAcademia(null);
    }
    setLoading(false);
  }, []);

  const login = (newToken, studentData, academiaData) => {
    localStorage.setItem('tatamyhub_aluno_token', newToken);
    localStorage.setItem('tatamyhub_aluno_data', JSON.stringify(studentData));
    if (academiaData) {
      localStorage.setItem('tatamyhub_aluno_academia', JSON.stringify(academiaData));
    }
    setStudentToken(newToken);
    setStudent(studentData);
    setAcademia(academiaData || null);
  };

  const logout = () => {
    localStorage.removeItem('tatamyhub_aluno_token');
    localStorage.removeItem('tatamyhub_aluno_data');
    localStorage.removeItem('tatamyhub_aluno_academia');
    sessionStorage.removeItem('tatamyhub_aluno_popup_dismissed');
    setStudentToken(null);
    setStudent(null);
    setAcademia(null);
  };

  return (
    <StudentAuthContext.Provider
      value={{
        studentToken,
        student,
        academia,
        isAuthenticated: !!studentToken,
        loading,
        login,
        logout
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}
