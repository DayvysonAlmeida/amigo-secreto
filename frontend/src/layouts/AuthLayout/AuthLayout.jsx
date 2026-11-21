import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Check, Gift, MessageCircle, Shuffle, Users } from 'lucide-react';
import { PageLoader } from '../../components/PageLoader/PageLoader';
import styles from './AuthLayout.module.css';

const STEPS = [
  { Icon: Users, title: 'Monte o grupo', text: 'Dê um nome, a data da festa e adicione quem vai participar.' },
  { Icon: Shuffle, title: 'Sorteie com um toque', text: 'Ninguém tira a si mesmo, e nem você vê o resultado.' },
  { Icon: MessageCircle, title: 'Envie pelo WhatsApp', text: 'Cada pessoa recebe um link secreto e escreve a lista de desejos.' },
];

const Logo = () => (
  <div className={styles.logo}>
    <span className={styles.logoIcon}><Gift size={22} /></span>
    Amigo Secreto
  </div>
);

export const AuthLayout = () => (
  <div className={styles.container}>
    <main className={styles.formPanel}>
      <div className={styles.mobileLogo}><Logo /></div>
      <Suspense fallback={<PageLoader fullScreen={false} />}>
        <Outlet />
      </Suspense>
    </main>

    <aside className={styles.brandPanel} aria-labelledby="como-funciona">
      <div className={styles.desktopLogo}><Logo /></div>
      <div className={styles.pitch}>
        <h2 id="como-funciona" className={styles.headline}>
          O amigo secreto da turma organizado em poucos minutos
        </h2>
        <ol className={styles.steps}>
          {STEPS.map(({ Icon, title, text }) => (
            <li key={title} className={styles.step}>
              <span className={styles.stepIcon}><Icon size={20} /></span>
              <div>
                <p className={styles.stepTitle}>{title}</p>
                <p className={styles.stepText}>{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className={styles.note}>
          <Check size={16} /> Quem participa não precisa criar conta nem baixar nada.
        </p>
      </div>
    </aside>
  </div>
);
