import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import styles from './Register.module.css';

export const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <h2>Crie sua conta</h2>
          <p>Cadastre-se para começar a organizar seus sorteios</p>
        </div>
        
        <CardContent>
          <form onSubmit={handleRegister} className={styles.form}>
            <Input
              label="Nome completo"
              type="text"
              placeholder="Seu nome"
              icon={User}
              required
            />

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

            <Button type="submit" fullWidth isLoading={isLoading} size="lg" className={styles.submitBtn}>
              Criar conta
            </Button>
            
            <p className={styles.footerLink}>
              Já tem uma conta? <Link to="/login">Entrar</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
