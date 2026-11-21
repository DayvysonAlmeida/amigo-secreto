import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Input } from '../../components/Input/Input';
import { PasswordInput } from '../../components/Input/PasswordInput';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import styles from '../../layouts/AuthLayout/AuthForm.module.css';

export const Login = () => {
  useDocumentTitle('Entrar');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      addToast(
        err.response?.status === 401
          ? 'E-mail ou senha incorretos. Confira e tente de novo.'
          : 'Não foi possível entrar agora. Verifique a sua internet e tente de novo.',
        'error'
      );
      setIsLoading(false);
    }
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Entrar</h1>
        <p className={styles.subtitle}>Acesse os seus grupos de amigo secreto.</p>
      </div>

      <CardContent>
        <form onSubmit={handleLogin} className={styles.form}>
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <PasswordInput
            label="Senha"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <Button type="submit" fullWidth isLoading={isLoading} size="lg" className={styles.submit}>
            Entrar
          </Button>

          <p className={styles.footer}>
            Primeira vez aqui? <Link to="/register">Criar conta grátis</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
