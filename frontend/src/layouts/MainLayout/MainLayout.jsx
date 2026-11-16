import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import styles from './MainLayout.module.css';

export const MainLayout = () => {
  const location = useLocation();

  const getPageInfo = () => {
    const { pathname } = location;
    if (pathname === '/dashboard') {
      return { title: 'Dashboard', subtitle: 'Bem-vindo! Aqui está um resumo dos seus grupos.' };
    }
    if (pathname === '/grupos/novo') {
      return { title: 'Criar grupo', subtitle: 'Dê um nome ao grupo e, se quiser, a data e o local da festa.' };
    }
    if (pathname.startsWith('/grupos/')) {
      return { title: 'Gerenciar grupo', subtitle: '' };
    }
    if (pathname === '/configuracoes') {
      return { title: 'Configurações', subtitle: 'Seu perfil e preferências.' };
    }
    return { title: 'Amigo Secreto', subtitle: '' };
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
