import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { GroupFields } from '../../components/GroupFields/GroupFields';
import { createGroup } from '../../api';
import { useToast } from '../../context/ToastContext';
import { errorMessage } from '../../utils/format';
import { EMPTY_GROUP_VALUES, valuesToPayload } from '../../utils/group';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import styles from './CriarGrupo.module.css';

export const CriarGrupo = () => {
  useDocumentTitle('Criar grupo');
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [values, setValues] = useState(EMPTY_GROUP_VALUES);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const group = await createGroup(valuesToPayload(values));
      addToast('Grupo criado! Agora adicione quem vai participar.', 'success');
      navigate(`/grupos/${group.admin_token}`);
    } catch (err) {
      addToast(errorMessage(err, 'Não foi possível criar o grupo.'), 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <Card>
          <CardContent>
            <form onSubmit={handleCreate} className={styles.form}>
              <GroupFields values={values} onChange={setValues} autoFocusName />

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
            <p>Na próxima tela você adiciona quem vai participar e faz o sorteio. Dá para editar tudo depois, inclusive a data e o local.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
