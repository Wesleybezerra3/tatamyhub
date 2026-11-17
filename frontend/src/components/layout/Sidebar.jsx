import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

export function Sidebar({ academyName, logoUrl }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const serverHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const fullLogoUrl = logoUrl 
    ? (logoUrl.startsWith('http') ? logoUrl : `http://${serverHost}:3001${logoUrl}`) 
    : null;

  const navItems = [
    { to: '/dashboard', label: 'Início', icon: <LayoutDashboard size={20} /> },
    { 
      to: '/alunos', 
      label: 'Alunos', 
      icon: <Users size={20} />,
      isMatchActive: (pathname) => pathname.startsWith('/alunos')
    },
    { to: '/mensalidades', label: 'Mensalidades', icon: <CreditCard size={20} /> },
    { 
      to: '/configuracoes/academia', 
      label: 'Configurações', 
      icon: <Settings size={20} />,
      isMatchActive: (pathname) => pathname.startsWith('/configuracoes')
    }
  ];

  return (
    <aside className={styles.sidebar}>
      {/* Topo: Marca e Academia */}
      <div className={styles.topSection}>
        <div className={styles.brandGroup}>
          <div className={styles.logoBadge}>
            <ShieldCheck size={22} className={styles.brandIcon} />
          </div>
          <span className={styles.brandName}>TatamyHub</span>
        </div>

        <div className={styles.academyCard}>
          {fullLogoUrl ? (
            <img src={fullLogoUrl} alt="Logo" className={styles.academyAvatar} />
          ) : (
            <div className={styles.academyAvatarPlaceholder}>
              {(academyName || 'TH').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className={styles.academyDetails}>
            <span className={styles.academyTitle}>{academyName || 'Minha Academia'}</span>
            <span className={styles.planBadge}>Tatame Ativo</span>
          </div>
        </div>
      </div>

      {/* Menu Principal */}
      <nav className={styles.navMenu}>
        <span className={styles.navSectionLabel}>Navegação</span>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => {
              const active = item.isMatchActive 
                ? item.isMatchActive(location.pathname) 
                : isActive;
              return `${styles.navItem} ${active ? styles.navItemActive : ''}`;
            }}
          >
            <div className={styles.navIcon}>{item.icon}</div>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Rodapé da Sidebar: Usuário & Logout */}
      <div className={styles.footerSection}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.nome || 'Professor'}</span>
          <span className={styles.userEmail}>{user?.email || ''}</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={styles.logoutBtn}
          title="Encerrar sessão"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
