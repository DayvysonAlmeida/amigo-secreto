import React from 'react';
import { Camera, User, Mail, Phone, Lock, Bell, Moon } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Avatar } from '../../components/Avatar/Avatar';
import { useTheme } from '../../context/ThemeContext';
import styles from './Perfil.module.css';

export const Perfil = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Card className={styles.avatarCard}>
          <CardContent className={styles.avatarContent}>
            <div className={styles.avatarWrapper}>
              <Avatar fallback="GS" size="lg" className={styles.largeAvatar} />
              <button className={styles.changeAvatarBtn}>
                <Camera size={16} />
              </button>
            </div>
            <h3 className={styles.userName}>Gabriel Silva</h3>
            <p className={styles.userRole}>Participante Ativo</p>
          </CardContent>
        </Card>

        <Card className={styles.preferencesCard}>
          <CardContent>
            <h4 className={styles.sectionTitle}>Preferências</h4>
            <div className={styles.preferenceItem}>
              <div className={styles.prefInfo}>
                <Moon size={18} className={styles.prefIcon} />
                <span>Modo Escuro</span>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={theme === 'dark'} 
                  onChange={toggleTheme} 
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.preferenceItem}>
              <div className={styles.prefInfo}>
                <Bell size={18} className={styles.prefIcon} />
                <span>Notificações</span>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" defaultChecked />
                <span className={styles.slider}></span>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={styles.mainContent}>
        <Card>
          <CardContent>
            <h3 className={styles.formTitle}>Informações Pessoais</h3>
            <form className={styles.form}>
              <div className={styles.formRow}>
                <Input label="Nome completo" icon={User} defaultValue="Gabriel Silva" />
                <Input label="E-mail" icon={Mail} defaultValue="gabriel@email.com" />
              </div>
              <div className={styles.formRow}>
                <Input label="Telefone" icon={Phone} defaultValue="(11) 99999-9999" />
              </div>
              
              <div className={styles.divider}></div>
              
              <h3 className={styles.formTitle}>Segurança</h3>
              <div className={styles.formRow}>
                <Input label="Senha Atual" type="password" icon={Lock} placeholder="••••••••" />
              </div>
              <div className={styles.formRow}>
                <Input label="Nova Senha" type="password" icon={Lock} placeholder="Nova senha" />
                <Input label="Confirmar Nova Senha" type="password" icon={Lock} placeholder="Confirme a senha" />
              </div>

              <div className={styles.actions}>
                <Button type="button">Salvar Alterações</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
