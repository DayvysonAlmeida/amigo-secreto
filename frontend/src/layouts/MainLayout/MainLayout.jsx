import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { PageLoader } from '../../components/PageLoader/PageLoader';
import { Credit } from '../../components/Credit/Credit';
import styles from './MainLayout.module.css';

export const MainLayout = () => {
  const location = useLocation();

  const getPageInfo = () => {
    const { pathname } = location;
    if (pathname === '/dashboard') {
      return { title: 'Meus grupos', subtitle: 'Acompanhe o próximo passo de cada amigo secreto.' };
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
          <Suspense fallback={<PageLoader fullScreen={false} />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className={styles.footer}>
          <Credit />
        </footer>
      </div>
    </div>
  );
};
