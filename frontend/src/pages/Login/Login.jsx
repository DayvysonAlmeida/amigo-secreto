import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import styles from './Login.module.css';

export const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className={styles.loginWrapper}>
      <Card className={styles.loginCard}>
        <div className={styles.header}>
          <h2>Entrar na sua conta</h2>
        </div>
        
        <CardContent>
          <form onSubmit={handleLogin} className={styles.form}>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              icon={Mail}
              required
            />
            
            <div className={styles.passwordField}>
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.remember}>
                <input type="checkbox" />
                <span>Lembrar de mim</span>
              </label>
              <Link to="/forgot-password" className={styles.forgotPassword}>
                Esqueci minha senha
              </Link>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading} size="lg">
              Entrar
            </Button>
            
            <p className={styles.register}>
              Não tem uma conta? <Link to="/register">Cadastre-se</Link>
            </p>
          </form>
        </CardContent>
      </Card>
      
      <p className={styles.footerText}>
        &copy; 2024 Amigo Secreto. Todos os direitos reservados.
      </p>
    </div>
  );
};
