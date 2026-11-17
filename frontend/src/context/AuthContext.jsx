import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('tatamyhub_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tatamyhub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [academia, setAcademia] = useState(() => {
    const saved = localStorage.getItem('tatamyhub_academia');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('tatamyhub_token');
    const storedUser = localStorage.getItem('tatamyhub_user');
    const storedAcademia = localStorage.getItem('tatamyhub_academia');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedAcademia) setAcademia(JSON.parse(storedAcademia));
    } else {
      setToken(null);
      setUser(null);
      setAcademia(null);
    }
    setLoading(false);
  }, []);

  const login = (newToken, newUser, newAcademia) => {
    localStorage.setItem('tatamyhub_token', newToken);
    localStorage.setItem('tatamyhub_user', JSON.stringify(newUser));
    if (newAcademia) {
      localStorage.setItem('tatamyhub_academia', JSON.stringify(newAcademia));
    }
    setToken(newToken);
    setUser(newUser);
    setAcademia(newAcademia || null);
  };

  const logout = () => {
    localStorage.removeItem('tatamyhub_token');
    localStorage.removeItem('tatamyhub_user');
    localStorage.removeItem('tatamyhub_academia');
    setToken(null);
    setUser(null);
    setAcademia(null);
  };

  const updateAcademia = (updatedAcademia) => {
    localStorage.setItem('tatamyhub_academia', JSON.stringify(updatedAcademia));
    setAcademia(updatedAcademia);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        academia,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        updateAcademia
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
