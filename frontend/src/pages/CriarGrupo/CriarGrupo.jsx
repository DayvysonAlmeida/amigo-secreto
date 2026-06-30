import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Calendar, DollarSign, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { createGroup } from '../../api';
import { useToast } from '../../context/ToastContext';
import styles from './CriarGrupo.module.css';

export const CriarGrupo = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const group = await createGroup({ name, description, budget });
      addToast('Grupo criado com sucesso!', 'success');
      navigate('/participantes', { state: { adminToken: group.admin_token } });
    } catch (err) {
      addToast(err.message || 'Erro ao criar grupo', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <Card>
          <CardContent>
            <form onSubmit={handleCreate} className={styles.form}>
              <h2 className={styles.formTitle}>Nome do grupo</h2>
              <Input 
                placeholder="Ex: Amigos de infância" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />

              <h2 className={styles.formTitle}>Descrição (opcional)</h2>
              <textarea 
                className={styles.textarea} 
                placeholder="Ex: Nosso amigo secreto de final de ano"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              ></textarea>

              <h2 className={styles.formTitle}>Configurações do sorteio</h2>
              
              <div className={styles.formRow}>
                <Input 
                  label="Valor sugerido (R$)" 
                  type="text" 
                  placeholder="Ex: 50,00 a 100,00" 
                  icon={DollarSign}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>

              <div className={styles.formActions}>
                <Button variant="outline" type="button" onClick={() => navigate('/dashboard')}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Criar grupo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className={styles.illustrationSection}>
        <div className={styles.illustrationCard}>
          <div className={styles.giftImageWrapper}>
            <Gift size={120} className={styles.giftIcon} />
          </div>
          
          <div className={styles.tipCard}>
            <div className={styles.tipHeader}>
              <Sparkles size={20} className={styles.tipIcon} />
              <h4>Dica</h4>
            </div>
            <p>Você poderá adicionar os participantes e realizar o sorteio na próxima tela, logo após criar o grupo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
