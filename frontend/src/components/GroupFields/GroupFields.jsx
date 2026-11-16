import { useId } from 'react';
import { MapPin, Wallet } from 'lucide-react';
import { Input } from '../Input/Input';
import styles from './GroupFields.module.css';

// Campos do grupo, usados ao criar (CriarGrupo) e ao editar (página do grupo).
// Os valores vêm de utils/group.js (EMPTY_GROUP_VALUES / groupToValues).
export const GroupFields = ({ values, onChange, autoFocusName = false }) => {
  const descriptionId = useId();
  const set = (field) => (e) => onChange({ ...values, [field]: e.target.value });

  return (
    <div className={styles.fields}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Sobre o grupo</legend>
        <div className={styles.group}>
          <Input
            label="Nome do grupo"
            placeholder="Ex: Família Silva 2026"
            value={values.name}
            onChange={set('name')}
            maxLength={120}
            autoComplete="off"
            autoFocus={autoFocusName}
            required
          />
          <div className={styles.field}>
            <label htmlFor={descriptionId} className={styles.label}>Descrição (opcional)</label>
            <textarea
              id={descriptionId}
              className={styles.textarea}
              rows={3}
              value={values.description}
              onChange={set('description')}
              placeholder="Ex: Vale presente criativo! Quem puder, leva um prato para a ceia."
            />
          </div>
          <Input
            label="Valor sugerido (opcional)"
            placeholder="Ex: 50 a 100"
            icon={Wallet}
            value={values.budget}
            onChange={set('budget')}
            maxLength={80}
            autoComplete="off"
          />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>A festa (opcional)</legend>
        <div className={styles.group}>
          <p className={styles.hint}>Cada pessoa vê a data e o local junto com o resultado do sorteio.</p>
          <div className={styles.row}>
            <Input label="Data" type="date" value={values.event_date} onChange={set('event_date')} />
            <Input
              label="Horário"
              type="time"
              value={values.event_time}
              onChange={set('event_time')}
              disabled={!values.event_date}
              title={values.event_date ? undefined : 'Escolha a data primeiro'}
            />
          </div>
          <Input
            label="Local"
            placeholder="Ex: Casa da vó, Rua das Flores, 123"
            icon={MapPin}
            value={values.location}
            onChange={set('location')}
            maxLength={200}
            autoComplete="off"
          />
        </div>
      </fieldset>
    </div>
  );
};
