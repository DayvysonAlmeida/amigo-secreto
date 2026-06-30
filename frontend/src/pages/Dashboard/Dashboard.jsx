import React from 'react';
import { Users, Gift, Calendar, Plus } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  // Mock data based on the reference image
  const stats = [
    { label: 'Grupos Criados', value: '3', icon: Users, color: '#3b82f6', bgColor: '#dbeafe' },
    { label: 'Sorteios Realizados', value: '5', icon: Gift, color: '#ec4899', bgColor: '#fce7f3' },
    { label: 'Próximo Sorteio', value: '24/12/2024', icon: Calendar, color: '#10b981', bgColor: '#d1fae5' },
    { label: 'Participantes', value: '28', icon: Users, color: '#8b5cf6', bgColor: '#ede9fe' },
  ];

  const grupos = [
    {
      id: 1,
      name: 'Família',
      participants: 12,
      confirmed: 10,
      date: '24/12/2024',
      status: 'Ativo',
      statusVariant: 'success',
      icon: Users,
      iconColor: '#10b981'
    },
    {
      id: 2,
      name: 'Amigos da Faculdade',
      participants: 8,
      confirmed: 6,
      date: '15/12/2024',
      status: 'Em andamento',
      statusVariant: 'warning',
      icon: Gift,
      iconColor: '#f59e0b'
    },
    {
      id: 3,
      name: 'Trabalho',
      participants: 8,
      confirmed: 8,
      date: '01/12/2024',
      status: 'Concluído',
      statusVariant: 'neutral',
      icon: Users,
      iconColor: '#8b5cf6'
    }
  ];

  return (
    <div className={styles.dashboard}>
      {/* Stats Section */}
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

      {/* Meus Grupos Section */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Meus Grupos</h2>
        <Button>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Criar grupo
        </Button>
      </div>

      <div className={styles.groupsGrid}>
        {grupos.map((grupo) => {
          const Icon = grupo.icon;
          return (
            <Card key={grupo.id} className={styles.groupCard}>
              <CardContent className={styles.groupContent}>
                <div className={styles.groupHeader}>
                  <Badge variant={grupo.statusVariant}>{grupo.status}</Badge>
                </div>
                
                <div className={styles.groupMainInfo}>
                  <div className={styles.groupIconWrapper} style={{ color: grupo.iconColor }}>
                    <Icon size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className={styles.groupName}>{grupo.name}</h3>
                  <p className={styles.groupParticipants}>{grupo.participants} participantes</p>
                  {grupo.status === 'Concluído' ? (
                    <p className={styles.groupDate}>Sorteio realizado em {grupo.date}</p>
                  ) : (
                    <p className={styles.groupDate}>Sorteio em {grupo.date}</p>
                  )}
                </div>

                <div className={styles.groupFooter}>
                  <div className={styles.progressWrapper}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressText}>
                        <strong>{grupo.confirmed}/{grupo.participants}</strong> confirmados
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${(grupo.confirmed / grupo.participants) * 100}%`, backgroundColor: grupo.iconColor }}
                      ></div>
                    </div>
                  </div>
                  
                  <Button variant="outline" fullWidth>
                    {grupo.status === 'Concluído' ? 'Ver resultados' : 'Ver grupo'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Create New Group Card */}
        <button className={styles.createGroupCard}>
          <div className={styles.createGroupContent}>
            <Plus size={32} className={styles.createGroupIcon} />
            <span>Criar novo grupo</span>
          </div>
        </button>
      </div>
    </div>
  );
};
