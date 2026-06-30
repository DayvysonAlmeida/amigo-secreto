import React, { useState, useRef } from 'react';
import { Camera, User, Mail, Phone, Lock, Bell, Moon } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Avatar } from '../../components/Avatar/Avatar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateProfile } from '../../api';
import styles from './Perfil.module.css';

export const Perfil = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('notifications') !== 'false'
  );

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem('notifications', newState);
    addToast(`Notificações ${newState ? 'ativadas' : 'desativadas'}.`, 'info');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      addToast('As senhas novas não coincidem', 'error');
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    
    if (currentPassword && newPassword) {
      formData.append('current_password', currentPassword);
      formData.append('new_password', newPassword);
    }
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      const updatedUser = await updateProfile(formData);
      updateUser(updatedUser);
      if (updatedUser.avatar) {
        setPreviewUrl(updatedUser.avatar);
      }
      addToast('Perfil atualizado com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Erro ao atualizar perfil', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const initials = name ? name.substring(0, 2).toUpperCase() : 'US';

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Card className={styles.avatarCard}>
          <CardContent className={styles.avatarContent}>
            <div className={styles.avatarWrapper}>
              <Avatar src={previewUrl} fallback={initials} size="lg" className={styles.largeAvatar} />
              <button className={styles.changeAvatarBtn} onClick={() => fileInputRef.current?.click()} type="button">
                <Camera size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>
            <h3 className={styles.userName}>{name || 'Usuário'}</h3>
            <p className={styles.userRole}>Organizador</p>
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
                <input 
                  type="checkbox" 
                  checked={notificationsEnabled} 
                  onChange={toggleNotifications}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={styles.mainContent}>
        <Card>
          <CardContent>
            <form className={styles.form} onSubmit={handleSave}>
              <h3 className={styles.formTitle}>Informações Pessoais</h3>
              <div className={styles.formRow}>
                <Input 
                  label="Nome completo" 
                  icon={User} 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
                <Input 
                  label="E-mail" 
                  icon={Mail} 
                  value={user?.email || ''} 
                  disabled 
                />
              </div>
              <div className={styles.formRow}>
                <Input 
                  label="Telefone" 
                  icon={Phone} 
                  placeholder="(11) 99999-9999" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              <div className={styles.divider}></div>
              
              <h3 className={styles.formTitle}>Segurança</h3>
              <div className={styles.formRow}>
                <Input 
                  label="Senha Atual" 
                  type="password" 
                  icon={Lock} 
                  placeholder="••••••••" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className={styles.formRow}>
                <Input 
                  label="Nova Senha" 
                  type="password" 
                  icon={Lock} 
                  placeholder="Nova senha" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input 
                  label="Confirmar Nova Senha" 
                  type="password" 
                  icon={Lock} 
                  placeholder="Confirme a senha" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className={styles.actions}>
                <Button type="submit" isLoading={isLoading}>Salvar Alterações</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
