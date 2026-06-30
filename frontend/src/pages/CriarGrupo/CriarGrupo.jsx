import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Calendar, DollarSign, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import styles from './CriarGrupo.module.css';

export const CriarGrupo = () => {
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    // Simulate creation
    navigate('/participantes');
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
                required 
              />

              <h2 className={styles.formTitle}>Descrição (opcional)</h2>
              <textarea 
                className={styles.textarea} 
                placeholder="Ex: Nosso amigo secreto de final de ano"
                rows={3}
              ></textarea>

              <h2 className={styles.formTitle}>Configurações do sorteio</h2>
              
              <div className={styles.formRow}>
                <Input 
                  label="Data do sorteio" 
                  type="date" 
                  icon={Calendar} 
                  required 
                />
                <Input 
                  label="Valor mínimo (R$)" 
                  type="number" 
                  placeholder="Ex: 50,00" 
                  icon={DollarSign} 
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.selectWrapper}>
                  <label className={styles.label}>Tipo de sorteio</label>
                  <select className={styles.select}>
                    <option value="automatico">Automático</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className={styles.toggleRow}>
                <label className={styles.label}>Permitir exclusões</label>
                <label className={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.formActions}>
                <Button variant="outline" type="button" onClick={() => navigate('/dashboard')}>
                  Cancelar
                </Button>
                <Button type="submit">
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
            <p>Você poderá adicionar os participantes e personalizar as regras do sorteio depois de criar o grupo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
