import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import styles from './ForgotPassword.module.css';

export const ForgotPassword = () => {
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <h2>Recuperar Senha</h2>
          <p>
            {isSent 
              ? 'Verifique sua caixa de entrada' 
              : 'Enviaremos um link para redefinir sua senha'}
          </p>
        </div>
        
        <CardContent>
          {isSent ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}>✓</div>
              <p>O link de recuperação foi enviado para o seu e-mail.</p>
              <Link to="/login" className={styles.backLink}>
                <ArrowLeft size={16} /> Voltar para o Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className={styles.form}>
              <Input
                label="E-mail cadastrado"
                type="email"
                placeholder="seu@email.com"
                icon={Mail}
                required
              />

              <Button type="submit" fullWidth isLoading={isLoading} size="lg" className={styles.submitBtn}>
                Enviar link de recuperação
              </Button>
              
              <Link to="/login" className={styles.backLink}>
                <ArrowLeft size={16} /> Voltar para o Login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
