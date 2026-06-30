import React from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { 
  TableContainer, Table, TableHead, TableBody, TableRow, TableHeader, TableCell 
} from '../../components/Table/Table';
import styles from './Participantes.module.css';

export const Participantes = () => {
  const participantes = [
    { id: 1, name: 'Gabriel Silva', email: 'gabriel@email.com', status: 'Confirmado', initials: 'GS' },
    { id: 2, name: 'Ana Souza', email: 'ana@email.com', status: 'Confirmado', initials: 'AS' },
    { id: 3, name: 'Lucas Lima', email: 'lucas@email.com', status: 'Confirmado', initials: 'LL' },
    { id: 4, name: 'Mariana Costa', email: 'mariana@email.com', status: 'Pendente', initials: 'MC' },
    { id: 5, name: 'Pedro Almeida', email: 'pedro@email.com', status: 'Confirmado', initials: 'PA' },
    { id: 6, name: 'Juliana Martins', email: 'juliana@email.com', status: 'Confirmado', initials: 'JM' },
    { id: 7, name: 'Rafael Gomes', email: 'rafael@email.com', status: 'Confirmado', initials: 'RG' },
    { id: 8, name: 'Beatriz Fernandes', email: 'beatriz@email.com', status: 'Pendente', initials: 'BF' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h2 className={styles.title}>Amigos da Faculdade</h2>
          <Badge variant="primary">8 participantes</Badge>
        </div>
        <Button>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Adicionar
        </Button>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <Input 
            placeholder="Buscar participante..." 
            icon={Search} 
          />
        </div>
      </div>

      <TableContainer>
        <Table>
          <TableBody>
            {participantes.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className={styles.userCell}>
                    <Avatar fallback={p.initials} size="sm" />
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{p.name}</span>
                      <span className={styles.userEmail}>{p.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={styles.statusCell}>
                    <Badge variant={p.status === 'Confirmado' ? 'success' : 'warning'}>
                      {p.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={styles.actionCell}>
                    <button className={styles.actionButton}>
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className={styles.footer}>
        <div className={styles.progressText}>
          6 de 8 participantes confirmados
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
  );
};
