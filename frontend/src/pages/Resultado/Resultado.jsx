import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  AlertCircle, CalendarDays, Check, EyeOff, Gift, Hourglass, Loader2, Lock, MapPin, RefreshCw, Sparkles, Wallet,
} from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Avatar } from '../../components/Avatar/Avatar';
import { getRevealInfo, revealParticipant, updateMyWishlist } from '../../api';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatBudget, formatEventDate, initials, mapsUrl } from '../../utils/format';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import styles from './Resultado.module.css';

// Mesmo limite do backend (sorteio/serializers.py).
const WISHLIST_MAX = 1000;
// Tempo mínimo da animação do presente, para o momento ter um pouco de suspense.
const SUSPENSE_MS = 1200;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const CONFETTI_COLORS = ['#16a34a', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#14b8a6'];
const CONFETTI = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2;
  return {
    '--x': `${Math.round(Math.cos(angle) * 140)}px`,
    '--y': `${Math.round(Math.sin(angle) * 110 - 30)}px`,
    '--r': `${(i % 2 ? 1 : -1) * (180 + i * 20)}deg`,
    '--d': `${(i % 3) * 60}ms`,
    '--c': CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  };
});

const StateCard = ({ icon, tone, title, children }) => (
  <section className={clsx(styles.card, styles.stateCard)}>
    <div className={clsx(styles.stateIcon, tone === 'danger' && styles.stateIconDanger)}>{icon}</div>
    <h1 className={styles.stateTitle}>{title}</h1>
    {children}
  </section>
);

const GroupHeader = ({ info }) => (
  <header className={styles.cardHeader}>
    <p className={styles.hello}>Olá, {info.participant_name}!</p>
    <h1 className={styles.groupName}>{info.group_name}</h1>
    {info.group_description && <p className={styles.description}>{info.group_description}</p>}
    {(info.event_date || info.location || info.budget) && (
      <div className={styles.chips}>
        {info.event_date && (
          <span className={styles.chip}>
            <CalendarDays size={14} /> {formatEventDate(info.event_date, info.event_time)}
          </span>
        )}
        {info.location && (
          <a
            className={clsx(styles.chip, styles.chipLink)}
            href={mapsUrl(info.location)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${info.location} (abrir no mapa)`}
          >
            <MapPin size={14} /> {info.location}
          </a>
        )}
        {info.budget && (
          <span className={styles.chip}>
            <Wallet size={14} /> Valor sugerido: {formatBudget(info.budget)}
          </span>
        )}
      </div>
    )}
  </header>
);

const Waiting = () => (
  <div className={styles.waiting}>
    <div className={styles.stateIcon}><Hourglass size={28} /></div>
    <h2 className={styles.waitingTitle}>O sorteio ainda não foi feito</h2>
    <p className={styles.waitingText}>
      Quando o organizador sortear, abra este mesmo link de novo para descobrir quem você tirou.
      Enquanto isso, deixe a sua lista de desejos pronta aqui embaixo.
    </p>
  </div>
);

const RevealPrompt = ({ hasViewed, isRevealing, onReveal, buttonRef }) => (
  <div className={styles.revealArea}>
    <button
      ref={buttonRef}
      type="button"
      className={clsx(styles.giftButton, isRevealing && styles.opening)}
      onClick={onReveal}
      disabled={isRevealing}
      aria-describedby="dica-privacidade"
    >
      <span className={styles.giftIcon}><Gift size={52} /></span>
      <span className={styles.giftLabel}>
        {isRevealing ? 'Abrindo…' : hasViewed ? 'Toque para ver de novo' : 'Toque para revelar'}
      </span>
      <span className={styles.giftSub}>quem você tirou</span>
    </button>
    <p id="dica-privacidade" className={styles.hint}>
      <EyeOff size={14} /> Antes de abrir, confira se ninguém está olhando a sua tela.
    </p>
  </div>
);

const Revealed = ({ result, onHide, headingRef }) => (
  <div className={styles.result}>
    <div className={styles.confetti} aria-hidden="true">
      {CONFETTI.map((style, i) => <span key={i} style={style} />)}
    </div>
    <p className={styles.resultLabel}>Você tirou</p>
    <Avatar fallback={initials(result.name)} size="lg" className={styles.avatar} />
    <h2 ref={headingRef} tabIndex={-1} className={styles.resultName}>{result.name}</h2>

    <div className={styles.theirWishlist}>
      <h3 className={styles.boxTitle}><Gift size={14} /> Lista de desejos</h3>
      {result.wishlist ? (
        <p className={styles.wishlistText}>{result.wishlist}</p>
      ) : (
        <p className={styles.muted}>
          {result.name} ainda não escreveu uma lista de desejos. Ela pode ser preenchida a qualquer
          momento pelo link pessoal, então vale olhar de novo mais perto da festa.
        </p>
      )}
    </div>

    <Button variant="outline" onClick={onHide} className={styles.hideButton}>
      <span className={styles.btnContent}><EyeOff size={16} /> Esconder resultado</span>
    </Button>
    <p className={styles.secret}><Lock size={12} /> Guarde segredo até a festa!</p>
  </div>
);

const WishlistEditor = ({ token, saved, onSaved, emphasize }) => {
  const { addToast } = useToast();
  const [value, setValue] = useState(saved);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const isDirty = value.trim() !== saved.trim();
  const nearLimit = value.length > WISHLIST_MAX - 100;

  const handleChange = (e) => {
    setValue(e.target.value);
    setJustSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = await updateMyWishlist(token, value);
      onSaved(data.wishlist);
      setValue(data.wishlist);
      setJustSaved(true);
    } catch (err) {
      addToast(errorMessage(err, 'Não foi possível salvar a lista. Tente de novo.'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  let status = null;
  if (justSaved) status = <span className={styles.saved}><Check size={14} /> Lista salva</span>;
  else if (isDirty) status = 'Alterações não salvas';

  return (
    <section
      className={clsx(styles.card, styles.wishCard, emphasize && styles.wishCardEmphasis)}
      aria-labelledby="minha-lista"
    >
      <h2 id="minha-lista" className={styles.sectionTitle}>
        <Sparkles size={18} /> Sua lista de desejos
      </h2>
      <p id="minha-lista-dica" className={styles.sectionText}>
        Quem tirou você vai ver esta lista. Dê ideias de presente, tamanhos, cores ou o que você não curte.
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          aria-labelledby="minha-lista"
          aria-describedby="minha-lista-dica"
          rows={4}
          maxLength={WISHLIST_MAX}
          value={value}
          onChange={handleChange}
          placeholder="Ex: livro de suspense, caneca, chocolate amargo. Camiseta tamanho M."
        />
        <div className={styles.formFooter}>
          <span className={styles.saveStatus} role="status">
            {status}
            {nearLimit && <span className={styles.counter}>{value.length}/{WISHLIST_MAX}</span>}
          </span>
          <Button type="submit" isLoading={isSaving} disabled={!isDirty}>
            Salvar lista
          </Button>
        </div>
      </form>
    </section>
  );
};

export const Resultado = () => {
  const { token } = useParams();
  const { addToast } = useToast();
  const [status, setStatus] = useState('loading'); // loading | ready | invalid | failed
  const [info, setInfo] = useState(null);
  const [result, setResult] = useState(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const revealButtonRef = useRef(null);
  const resultHeadingRef = useRef(null);
  const wasRevealed = useRef(false);
  // Só o nome do grupo: o resultado nunca vai para o título da aba.
  useDocumentTitle(info?.group_name);

  const fetchInfo = useCallback(
    () =>
      getRevealInfo(token)
        .then((data) => {
          setInfo(data);
          setStatus('ready');
        })
        .catch((err) => setStatus(err.response?.status === 404 ? 'invalid' : 'failed')),
    [token]
  );

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  // Leva o foco para o nome revelado e, ao esconder, de volta para o presente.
  useEffect(() => {
    if (result) resultHeadingRef.current?.focus();
    else if (wasRevealed.current) revealButtonRef.current?.focus();
    wasRevealed.current = Boolean(result);
  }, [result]);

  const retry = () => {
    setStatus('loading');
    fetchInfo();
  };

  const handleReveal = async () => {
    setIsRevealing(true);
    try {
      const [data] = await Promise.all([
        revealParticipant(token),
        wait(prefersReducedMotion() ? 0 : SUSPENSE_MS),
      ]);
      setResult({ name: data.assigned_name, wishlist: data.assigned_wishlist });
      setInfo((prev) => ({ ...prev, has_viewed: true }));
    } catch (err) {
      addToast(errorMessage(err, 'Não foi possível revelar agora. Tente de novo.'), 'error');
      // Ex.: o organizador desfez o sorteio depois que a página abriu.
      if (err.response?.status === 400) fetchInfo();
    } finally {
      setIsRevealing(false);
    }
  };

  const handleWishlistSaved = useCallback((wishlist) => {
    setInfo((prev) => ({ ...prev, wishlist }));
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <p className={styles.brand}><Gift size={18} /> Amigo Secreto</p>

        {status === 'loading' && (
          <StateCard icon={<Loader2 size={28} className={styles.spin} />} title="Carregando o seu link…" />
        )}

        {status === 'invalid' && (
          <StateCard icon={<AlertCircle size={28} />} tone="danger" title="Link inválido">
            <p className={styles.stateText}>
              Confira se o link foi copiado inteiro. Se continuar assim, peça um novo ao organizador do grupo.
            </p>
          </StateCard>
        )}

        {status === 'failed' && (
          <StateCard icon={<AlertCircle size={28} />} tone="danger" title="Não foi possível carregar">
            <p className={styles.stateText}>Verifique a sua internet e tente de novo.</p>
            <Button onClick={retry}>
              <span className={styles.btnContent}><RefreshCw size={16} /> Tentar de novo</span>
            </Button>
          </StateCard>
        )}

        {status === 'ready' && (
          <>
            <section className={styles.card}>
              <GroupHeader info={info} />
              {!info.is_drawn ? (
                <Waiting />
              ) : result ? (
                <Revealed result={result} onHide={() => setResult(null)} headingRef={resultHeadingRef} />
              ) : (
                <RevealPrompt
                  hasViewed={info.has_viewed}
                  isRevealing={isRevealing}
                  onReveal={handleReveal}
                  buttonRef={revealButtonRef}
                />
              )}
            </section>

            <WishlistEditor
              token={token}
              saved={info.wishlist}
              onSaved={handleWishlistSaved}
              emphasize={!info.is_drawn}
            />
          </>
        )}
      </div>
    </main>
  );
};
