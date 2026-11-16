import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, Gift, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

// shortLabel aparece na barra inferior do celular.
const menuItems = [
  { path: '/dashboard', label: 'Dashboard', shortLabel: 'Início', icon: LayoutDashboard },
  { path: '/grupos/novo', label: 'Criar Grupo', shortLabel: 'Novo grupo', icon: Plus },
  { path: '/configuracoes', label: 'Configurações', shortLabel: 'Perfil', icon: Settings },
];

export const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // A página de um grupo pertence à seção "Dashboard" (é de lá que se chega nela).
  const isGroupPage = pathname.startsWith('/grupos/') && pathname !== '/grupos/novo';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoWrapper}>
          <Gift className={styles.logoIcon} size={24} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandTitle}>Amigo</span>
          <span className={styles.brandSubtitle}>Secreto</span>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Menu principal">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive || (isGroupPage && item.path === '/dashboard')
                  ? `${styles.navItem} ${styles.active}`
                  : styles.navItem
              }
            >
              <Icon size={20} />
              <span className={styles.label}>{item.label}</span>
              <span className={styles.shortLabel}>{item.shortLabel}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};
