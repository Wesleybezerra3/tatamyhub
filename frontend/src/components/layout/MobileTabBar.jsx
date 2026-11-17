import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings } from 'lucide-react';
import styles from './MobileTabBar.module.css';

export function MobileTabBar() {
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', label: 'Início', icon: <LayoutDashboard size={22} /> },
    { 
      to: '/alunos', 
      label: 'Alunos', 
      icon: <Users size={22} />,
      isMatchActive: (pathname) => pathname.startsWith('/alunos')
    },
    { to: '/mensalidades', label: 'Mensalidades', icon: <CreditCard size={22} /> },
    { 
      to: '/configuracoes/academia', 
      label: 'Configurações', 
      icon: <Settings size={22} />,
      isMatchActive: (pathname) => pathname.startsWith('/configuracoes')
    }
  ];

  return (
    <nav className={styles.tabBar} aria-label="Navegação inferior mobile">
      <div className={styles.tabContainer}>
        {navItems.map((item) => {
          const isActive = item.isMatchActive 
            ? item.isMatchActive(location.pathname)
            : location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={styles.iconWrapper}>
                {item.icon}
              </div>
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
