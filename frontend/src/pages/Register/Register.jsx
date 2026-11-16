import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../utils/format';
import styles from './Register.module.css';

export const Register = () => {
  useDocumentTitle('Criar conta');
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(name, email, password);
      addToast('Conta criada com sucesso!', 'success');
      navigate('/dashboard');
    } catch (err) {
      // Ex.: "Já existe uma conta com este e-mail." ou "Esta senha é muito comum."
      addToast(errorMessage(err, 'Não foi possível criar a conta. Verifique os dados.'), 'error');
      setIsLoading(false);
    }
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className={styles.passwordField}>
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo de 8 caracteres"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
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
