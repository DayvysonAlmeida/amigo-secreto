import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import styles from './Navbar.module.css';

export const Navbar = ({ title, subtitle }) => {
  return (
    <header className={styles.navbar}>
      <div className={styles.pageInfo}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.actions}>
        <button className={styles.notificationButton}>
          <Bell size={20} />
          <div className={styles.badgeWrapper}>
            <Badge variant="danger" className={styles.notificationBadge}>2</Badge>
          </div>
        </button>

        <div className={styles.userMenu}>
          <Avatar fallback="GS" size="md" />
          <div className={styles.userInfo}>
            <span className={styles.userName}>Olá, Gabriel!</span>
          </div>
          <ChevronDown size={16} className={styles.chevron} />
        </div>
      </div>
    </header>
  );
};
