import React, { useState } from 'react';
import { Shield, Users, List, Activity, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card/Card';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/Table/Table';
import { Input } from '../../components/Input/Input';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import styles from './Administracao.module.css';

export const Administracao = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'groups', label: 'Grupos', icon: List },
    { id: 'permissions', label: 'Permissões', icon: Shield },
    { id: 'logs', label: 'Logs do Sistema', icon: Activity },
  ];

  const usersMock = [
    { id: 1, name: 'Gabriel Silva', email: 'gabriel@email.com', role: 'Admin', status: 'Ativo' },
    { id: 2, name: 'Ana Souza', email: 'ana@email.com', role: 'Usuário', status: 'Ativo' },
    { id: 3, name: 'Carlos Lima', email: 'carlos@email.com', role: 'Usuário', status: 'Bloqueado' },
  ];

  return (
    <div className={styles.container}>
      <Card className={styles.navCard}>
        <div className={styles.tabsList}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className={styles.contentCard}>
        <CardHeader className={styles.header}>
          <CardTitle>Gerenciamento de {tabs.find(t => t.id === activeTab)?.label}</CardTitle>
          <div className={styles.headerActions}>
            <div className={styles.searchWrapper}>
              <Input placeholder="Buscar..." icon={Search} fullWidth={false} />
            </div>
            <Button>Novo Registro</Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Nome</TableHeader>
                  <TableHeader>E-mail</TableHeader>
                  <TableHeader>Nível</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Ações</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersMock.map(user => (
                  <TableRow key={user.id}>
                    <TableCell><strong>{user.name}</strong></TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Admin' ? 'primary' : 'neutral'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Ativo' ? 'success' : 'danger'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};
