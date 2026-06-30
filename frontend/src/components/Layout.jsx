import { Link } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="container">
      <header className="hero">
        <div className="hero-badge">🎁 Amigo Secreto</div>
        <h1>Sorteie sem complicação</h1>
        <p>
          Crie um grupo, adicione os participantes e compartilhe links
          individuais. Cada pessoa descobre o amigo secreto só por conta
          própria.
        </p>
        <p style={{ marginTop: '1rem' }}>
          <Link to="/">← Voltar ao início</Link>
        </p>
      </header>
      {children}
    </div>
  )
}
