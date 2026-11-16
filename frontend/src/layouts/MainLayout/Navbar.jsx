import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/Avatar/Avatar';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export const Navbar = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userName = user?.name || 'Usuário';
  const firstName = userName.split(' ')[0];
  const initials = userName.substring(0, 2).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.pageInfo}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.actions}>
        <div className={styles.userMenuWrapper} ref={dropdownRef}>
          <button
            type="button"
            className={styles.userMenu}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
            aria-label="Menu da conta"
          >
            <Avatar src={user?.avatar} fallback={initials} size="md" />
            <div className={styles.userInfo}>
              <span className={styles.userName}>Olá, {firstName}!</span>
            </div>
            <ChevronDown size={16} className={styles.chevron} />
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdown}>
              <button 
                className={styles.dropdownItem}
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/configuracoes');
                }}
              >
                <Settings size={16} />
                Configurações
              </button>
              <button 
                className={`${styles.dropdownItem} ${styles.logout}`}
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
