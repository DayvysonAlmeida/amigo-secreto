import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { revealParticipant } from '../api'

export default function RevealPage() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReveal() {
      setLoading(true)
      setError('')
      try {
        const result = await revealParticipant(token)
        setData(result)
      } catch (err) {
        setError(err.message)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    loadReveal()
  }, [token])

  return (
    <Layout>
      <div className="card reveal-card">
        {loading && <p>Carregando seu sorteio...</p>}

        {!loading && error && <div className="error">{error}</div>}

        {!loading && data && (
          <>
            <p>Olá, {data.participant_name}!</p>
            <h2>Seu amigo secreto é</h2>
            <div className="reveal-name">{data.assigned_name}</div>
            <p style={{ color: '#cbd5e1' }}>
              Grupo: <strong>{data.group_name}</strong>
            </p>
            {data.budget && (
              <p style={{ color: '#cbd5e1' }}>
                Valor sugerido: <strong>{data.budget}</strong>
              </p>
            )}
            {data.group_description && (
              <p style={{ color: '#94a3b8' }}>{data.group_description}</p>
            )}
            {data.assigned_wishlist && (
              <div className="wishlist-box">
                <strong>Lista de desejos:</strong>
                <div>{data.assigned_wishlist}</div>
              </div>
            )}
            <p style={{ marginTop: '1.5rem', color: '#94a3b8' }}>
              🤫 Guarde segredo! Não compartilhe este link com ninguém.
            </p>
          </>
        )}
      </div>
    </Layout>
  )
}
