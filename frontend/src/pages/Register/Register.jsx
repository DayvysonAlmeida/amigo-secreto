import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Input } from '../../components/Input/Input';
import { PasswordInput } from '../../components/Input/PasswordInput';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../utils/format';
import styles from '../../layouts/AuthLayout/AuthForm.module.css';

export const Register = () => {
  useDocumentTitle('Criar conta');
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(name, email, password);
      addToast('Conta criada! Agora crie o seu primeiro grupo.', 'success');
      navigate('/dashboard');
    } catch (err) {
      // Ex.: "Já existe uma conta com este e-mail." ou "Esta senha é muito comum."
      addToast(errorMessage(err, 'Não foi possível criar a conta. Verifique os dados.'), 'error');
      setIsLoading(false);
    }
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Criar conta</h1>
        <p className={styles.subtitle}>Grátis. Só quem organiza precisa de conta.</p>
      </div>

      <CardContent>
        <form onSubmit={handleRegister} className={styles.form}>
          <Input
            label="Seu nome"
            type="text"
            placeholder="Seu nome ou apelido"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />

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
            placeholder="Mínimo de 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />

          <Button type="submit" fullWidth isLoading={isLoading} size="lg" className={styles.submit}>
            Criar conta
          </Button>

          <p className={styles.footer}>
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
