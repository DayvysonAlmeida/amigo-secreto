import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  addParticipant,
  drawGroup,
  getGroup,
  removeParticipant,
} from '../api'

function participantRevealPath(token) {
  return `${window.location.origin}/revelar/${token}`
}

export default function AdminPage() {
  const { token } = useParams()
  const [group, setGroup] = useState(null)
  const [name, setName] = useState('')
  const [wishlist, setWishlist] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadGroup = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getGroup(token)
      setGroup(data)
    } catch (err) {
      setError(err.message)
      setGroup(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadGroup()
  }, [loadGroup])

  async function handleAddParticipant(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await addParticipant(token, { name, wishlist })
      setName('')
      setWishlist('')
      setSuccess('Participante adicionado!')
      await loadGroup()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemove(participantId) {
    setError('')
    setSuccess('')
    try {
      await removeParticipant(token, participantId)
      setSuccess('Participante removido.')
      await loadGroup()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDraw() {
    setDrawing(true)
    setError('')
    setSuccess('')
    try {
      const data = await drawGroup(token)
      setGroup(data)
      setSuccess('Sorteio realizado! Compartilhe os links individuais abaixo.')
    } catch (err) {
      setError(err.message)
    } finally {
      setDrawing(false)
    }
  }

  async function copyText(text) {
    await navigator.clipboard.writeText(text)
    setSuccess('Link copiado!')
  }

  if (loading) {
    return (
      <Layout>
        <div className="card">Carregando grupo...</div>
      </Layout>
    )
  }

  if (!group) {
    return (
      <Layout>
        <div className="error">{error || 'Grupo não encontrado.'}</div>
      </Layout>
    )
  }

  const adminUrl = `${window.location.origin}/admin/${group.admin_token}`

  return (
    <Layout>
      <div className="card">
        <h2>{group.name}</h2>
        <div className="meta-row">
          <span className="chip">
            {group.participants.length} participante
            {group.participants.length === 1 ? '' : 's'}
          </span>
          <span className="chip">
            {group.is_drawn ? 'Sorteio realizado' : 'Aguardando sorteio'}
          </span>
          {group.budget && <span className="chip">Presente: {group.budget}</span>}
        </div>
        {group.description && <p>{group.description}</p>}

        <label>
          Link do organizador (guarde este link!)
          <div className="copy-row">
            <input readOnly value={adminUrl} />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => copyText(adminUrl)}
            >
              Copiar
            </button>
          </div>
        </label>
      </div>

      {!group.is_drawn && (
        <div className="card">
          <h2>Adicionar participante</h2>
          <form className="form-grid" onSubmit={handleAddParticipant}>
            <label>
              Nome
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome completo ou apelido"
              />
            </label>
            <label>
              Lista de desejos (opcional)
              <textarea
                value={wishlist}
                onChange={(event) => setWishlist(event.target.value)}
                placeholder="Ideias de presente..."
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Adicionando...' : 'Adicionar'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Participantes</h2>
        {group.participants.length === 0 ? (
          <div className="empty-state">Nenhum participante ainda.</div>
        ) : (
          <ul className="participant-list">
            {group.participants.map((participant) => {
              const revealUrl = participantRevealPath(participant.token)
              return (
                <li key={participant.id} className="participant-item">
                  <div className="participant-info">
                    <strong>{participant.name}</strong>
                    {participant.wishlist && (
                      <small>{participant.wishlist}</small>
                    )}
                    {group.is_drawn && (
                      <div className="copy-row" style={{ marginTop: '0.75rem' }}>
                        <input readOnly value={revealUrl} />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => copyText(revealUrl)}
                        >
                          Copiar link
                        </button>
                      </div>
                    )}
                  </div>
                  {!group.is_drawn && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRemove(participant.id)}
                    >
                      Remover
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {!group.is_drawn && group.participants.length >= 2 && (
          <div className="actions">
            <button
              type="button"
              className="btn btn-success"
              onClick={handleDraw}
              disabled={drawing}
            >
              {drawing ? 'Sorteando...' : 'Realizar sorteio'}
            </button>
          </div>
        )}

        {!group.is_drawn && group.participants.length === 1 && (
          <div className="error" style={{ marginTop: '1rem' }}>
            Adicione pelo menos mais 1 participante para sortear.
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </Layout>
  )
}
