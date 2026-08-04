import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import BottomNav from '../../components/BottomNav'

function SearchIcon() {
  return (
    <svg className="search-bar-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function Search() {
  const [products, setProducts] = React.useState([])
  const [query, setQuery] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const navigate = useNavigate()

  React.useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      api.get('/api/product/feed', { params: { limit: 20, q: query.trim() || undefined } })
        .then((res) => { if (active) setProducts(res.data.data?.products || []) })
        .catch((error) => console.error('Failed to load explore feed', error))
        .finally(() => { if (active) setLoading(false) })
    }, 250)
    return () => { active = false; window.clearTimeout(timer) }
  }, [query])

  return (
    <div className="search-shell">
      <header className="search-header">
        <label className="search-bar">
          <SearchIcon />
          <input
            autoFocus
            type="search"
            className="search-input"
            placeholder="Search food or restaurants"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </header>

      <main className="search-content">
        {loading ? (
          <div className="search-status">Loading…</div>
        ) : products.length === 0 ? (
          <div className="search-status">{query.trim() ? 'No results found' : 'No reels to explore yet'}</div>
        ) : (
          <div className="explore-grid">
            {products.map((product) => (
              <button
                key={product._id}
                type="button"
                className="explore-tile"
                onClick={() => navigate('/', { state: { reelId: product._id } })}
                aria-label={`Open ${product.name || 'food reel'}`}
              >
                <video
                  src={product.videoUrl || product.video}
                  className="explore-tile-video"
                  muted
                  playsInline
                  preload="metadata"
                />
                <span className="explore-reel-badge" aria-hidden="true">▶</span>
                <span className="explore-tile-label">{product.name}</span>
              </button>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
