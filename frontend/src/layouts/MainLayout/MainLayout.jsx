import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import styles from './MainLayout.module.css';

export const MainLayout = () => {
  const location = useLocation();

  // Simple logic to set title based on route for now
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'Bem-vindo! Aqui está um resumo dos seus grupos.' };
      case '/grupos':
        return { title: 'Meus Grupos', subtitle: 'Gerencie todos os seus amigos secretos.' };
      default:
        return { title: 'Amigo Secreto', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainWrapper}>
        <Navbar title={title} subtitle={subtitle} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
