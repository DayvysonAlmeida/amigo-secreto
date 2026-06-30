import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { createGroup } from '../api'

export default function HomePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    budget: '',
  })
  const [adminLink, setAdminLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const group = await createGroup(form)
      navigate(`/admin/${group.admin_token}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleOpenAdmin(event) {
    event.preventDefault()
    setError('')

    const token = adminLink.trim().split('/').filter(Boolean).pop()
    if (!token) {
      setError('Cole o link completo ou o código do grupo.')
      return
    }

    navigate(`/admin/${token}`)
  }

  return (
    <Layout>
      <div className="card">
        <h2>Criar novo grupo</h2>
        <form className="form-grid" onSubmit={handleCreate}>
          <label>
            Nome do grupo
            <input
              required
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Ex: Natal da Família Silva"
            />
          </label>
          <label>
            Descrição (opcional)
            <textarea
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Data da troca, local, regras..."
            />
          </label>
          <label>
            Valor sugerido do presente (opcional)
            <input
              value={form.budget}
              onChange={(event) => updateField('budget', event.target.value)}
              placeholder="Ex: R$ 80,00"
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar grupo'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Já tenho um grupo</h2>
        <form className="form-grid" onSubmit={handleOpenAdmin}>
          <label>
            Link ou código do organizador
            <input
              value={adminLink}
              onChange={(event) => setAdminLink(event.target.value)}
              placeholder="Cole o link que você salvou"
            />
          </label>
          <button className="btn btn-secondary" type="submit">
            Abrir painel
          </button>
        </form>
      </div>

      {error && <div className="error">{error}</div>}
    </Layout>
  )
}
