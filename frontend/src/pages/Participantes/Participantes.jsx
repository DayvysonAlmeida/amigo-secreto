import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Copy, MessageCircle } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { Modal } from '../../components/Modal/Modal';
import { 
  TableContainer, Table, TableHead, TableBody, TableRow, TableHeader, TableCell 
} from '../../components/Table/Table';
import { getGroup, addParticipant, removeParticipant } from '../../api';
import { useToast } from '../../context/ToastContext';
import styles from './Participantes.module.css';

export const Participantes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const adminToken = location.state?.adminToken;
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWishlist, setNewWishlist] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (token) => {
    const url = `${window.location.origin}/revelar/${token}`;
    navigator.clipboard.writeText(url);
    addToast('Link copiado!', 'success');
  };

  const handleWhatsApp = (token) => {
    const url = `${window.location.origin}/revelar/${token}`;
    const text = encodeURIComponent(`Aqui está o seu link do Amigo Secreto: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  useEffect(() => {
    if (!adminToken) {
      navigate('/dashboard');
      return;
    }
    fetchGroup();
  }, [adminToken]);

  const fetchGroup = async () => {
    try {
      const data = await getGroup(adminToken);
      setGroup(data);
    } catch (err) {
      addToast('Erro ao carregar grupo', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addParticipant(adminToken, { name: newName, wishlist: newWishlist });
      addToast('Participante adicionado com sucesso!', 'success');
      setNewName('');
      setNewWishlist('');
      setIsModalOpen(false);
      fetchGroup();
    } catch (err) {
      addToast(err.response?.data?.detail || err.message || 'Erro ao adicionar', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este participante?')) return;
    try {
      await removeParticipant(adminToken, id);
      addToast('Participante removido', 'success');
      fetchGroup();
    } catch (err) {
      addToast(err.response?.data?.detail || err.message || 'Erro ao remover', 'error');
    }
  };

  if (loading || !group) return <div style={{ padding: '2rem' }}>Carregando participantes...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h2 className={styles.title}>{group.name}</h2>
          <Badge variant="primary">{group.participants.length} participantes</Badge>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!group.is_drawn && group.participants.length >= 3 && (
            <Button variant="outline" onClick={() => navigate('/sorteios', { state: { adminToken } })}>
              Ir para Sorteio
            </Button>
          )}
          {!group.is_drawn && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={18} style={{ marginRight: '8px' }} />
              Adicionar
            </Button>
          )}
        </div>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Participante</TableHeader>
              <TableHeader>Lista de Desejos</TableHeader>
              <TableHeader>Link de Revelação</TableHeader>
              {!group.is_drawn && <TableHeader>Ações</TableHeader>}
            </TableRow>
          </TableHead>
          <TableBody>
            {group.participants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                  Nenhum participante adicionado ainda.
                </TableCell>
              </TableRow>
            ) : (
              group.participants.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className={styles.userCell}>
                      <Avatar fallback={p.name.substring(0, 2).toUpperCase()} size="sm" />
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{p.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.wishlist ? (
                      <span style={{ color: 'var(--color-text-main)', fontSize: '0.875rem' }}>{p.wishlist}</span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Nenhum desejo adicionado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {group.is_drawn ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button 
                          className={styles.actionButton}
                          onClick={() => handleCopy(p.token)}
                          title="Copiar Link"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          <Copy size={18} />
                        </button>
                        <button 
                          className={styles.actionButton}
                          onClick={() => handleWhatsApp(p.token)}
                          title="Enviar no WhatsApp"
                          style={{ color: '#25D366' }}
                        >
                          <MessageCircle size={18} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Disponível após o sorteio</span>
                    )}
                  </TableCell>
                  {!group.is_drawn && (
                    <TableCell>
                      <button 
                        className={styles.actionButton} 
                        onClick={() => handleRemove(p.id)}
                        title="Remover"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Participante">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <Input
            label="Nome do participante"
            placeholder="Ex: João Silva"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-main)' }}>
              Lista de Desejos (Opcional)
            </label>
            <textarea
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                resize: 'vertical',
                minHeight: '80px'
              }}
              placeholder="Ex: Livros de ficção científica, camisa tamanho M..."
              value={newWishlist}
              onChange={(e) => setNewWishlist(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
