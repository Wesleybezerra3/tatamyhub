import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Layers, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';
import styles from './AppLayout.module.css';

export function AppLayout({ academyName, logoUrl }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isSettingsRoute = location.pathname.startsWith('/configuracoes');

  const serverHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const fullLogoUrl = logoUrl 
    ? (logoUrl.startsWith('http') ? logoUrl : `http://${serverHost}:3001${logoUrl}`) 
    : null;

  return (
    <div className={styles.appShell}>
      {/* Sidebar Desktop (>= 768px) */}
      <Sidebar academyName={academyName} logoUrl={logoUrl} />

      {/* Área Principal de Conteúdo */}
      <div className={styles.contentWrapper}>
        {/* Mobile Top Header (< 768px) */}
        <header className={styles.mobileTopHeader}>
          <div className={styles.mobileBrand}>
            <div className={styles.logoBadge}>
              <ShieldCheck size={20} className={styles.brandIcon} />
            </div>
            <div className={styles.mobileBrandInfo}>
              <span className={styles.appName}>TatamyHub</span>
              <span className={styles.academyLabel}>
                {academyName || 'Minha Academia'}
              </span>
            </div>
          </div>

          <div className={styles.mobileHeaderActions}>
            {fullLogoUrl ? (
              <img src={fullLogoUrl} alt="Logo" className={styles.mobileAvatar} />
            ) : (
              <div className={styles.mobileAvatarPlaceholder}>
                {(academyName || 'TH').slice(0, 2).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className={styles.mobileLogoutBtn}
              title="Encerrar sessão"
              aria-label="Sair da conta"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Sub-navegação contextual para Configurações */}
        {isSettingsRoute && (
          <div className={styles.subHeaderContainer}>
            <nav className={styles.settingsSubNav} aria-label="Abas de Configurações">
              <NavLink 
                to="/configuracoes/academia" 
                className={({ isActive }) => `${styles.subTab} ${isActive ? styles.subTabActive : ''}`}
              >
                <Building2 size={16} />
                <span>Perfil da Academia</span>
              </NavLink>

              <NavLink 
                to="/configuracoes/modalidades" 
                className={({ isActive }) => `${styles.subTab} ${isActive ? styles.subTabActive : ''}`}
              >
                <Layers size={16} />
                <span>Modalidades</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Conteúdo Dinâmico */}
        <main className={styles.mainContainer}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Tab Bar (< 768px) */}
      <MobileTabBar />
    </div>
  );
}
