import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Gift, Calendar, Plus } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { getGroups } from '../../api';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGroups().then(data => {
      setGrupos(data);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const totalParticipantes = grupos.reduce((acc, g) => acc + g.participants.length, 0);
  const sorteiosRealizados = grupos.filter(g => g.is_drawn).length;

  const stats = [
    { label: 'Grupos Criados', value: grupos.length.toString(), icon: Users, color: '#3b82f6', bgColor: '#dbeafe' },
    { label: 'Sorteios Realizados', value: sorteiosRealizados.toString(), icon: Gift, color: '#ec4899', bgColor: '#fce7f3' },
    { label: 'Participantes', value: totalParticipantes.toString(), icon: Users, color: '#8b5cf6', bgColor: '#ede9fe' },
  ];

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Carregando seus grupos...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={styles.statCard}>
              <CardContent className={styles.statContent}>
                <div 
                  className={styles.statIconWrapper} 
                  style={{ backgroundColor: stat.bgColor, color: stat.color }}
                >
                  <Icon size={24} />
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>{stat.label}</p>
                  <h3 className={styles.statValue}>{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Meus Grupos</h2>
        <Button onClick={() => navigate('/grupos/novo')}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Criar grupo
        </Button>
      </div>

      <div className={styles.groupsGrid}>
        {grupos.map((grupo) => {
          const Icon = Users;
          const iconColor = grupo.is_drawn ? '#8b5cf6' : '#10b981';
          const status = grupo.is_drawn ? 'Concluído' : 'Ativo';
          const statusVariant = grupo.is_drawn ? 'neutral' : 'success';
          const dateStr = new Date(grupo.created_at).toLocaleDateString('pt-BR');

          return (
            <Card key={grupo.id} className={styles.groupCard}>
              <CardContent className={styles.groupContent}>
                <div className={styles.groupHeader}>
                  <Badge variant={statusVariant}>{status}</Badge>
                </div>
                
                <div className={styles.groupMainInfo}>
                  <div className={styles.groupIconWrapper} style={{ color: iconColor }}>
                    <Icon size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className={styles.groupName}>{grupo.name}</h3>
                  <p className={styles.groupParticipants}>{grupo.participants.length} participantes</p>
                  <p className={styles.groupDate}>Criado em {dateStr}</p>
                </div>

                <div className={styles.groupFooter}>
                  <Button variant="outline" fullWidth onClick={() => navigate('/participantes', { state: { adminToken: grupo.admin_token } })}>
                    Gerenciar grupo
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <button className={styles.createGroupCard} onClick={() => navigate('/grupos/novo')}>
          <div className={styles.createGroupContent}>
            <Plus size={32} className={styles.createGroupIcon} />
            <span>Criar novo grupo</span>
          </div>
        </button>
      </div>
    </div>
  );
};
