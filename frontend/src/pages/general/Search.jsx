import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import BottomNav from '../../components/BottomNav'
import ProductGridTile from '../../components/ProductGridTile'
import { SearchInput, EmptyState, PageLevelError, LoadingSkeleton } from '../../components/ui'

export default function Search() {
  const [products, setProducts] = React.useState([])
  const [query, setQuery] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const navigate = useNavigate()

  const load = React.useCallback((search) => {
    setLoading(true)
    setError(false)
    return api.get('/api/product/feed', { params: { limit: 20, q: search.trim() || undefined } })
      .then((res) => setProducts(res.data.data?.products || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      if (active) load(query)
    }, 300)
    return () => { active = false; window.clearTimeout(timer) }
  }, [query, load])

  const openReel = (productId) => navigate('/', { state: { reelId: productId } })

  return (
    <div className="search-shell">
      <header className="search-header">
        <h1 className="search-title">Search</h1>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          loading={loading}
          placeholder="Search food or restaurants"
          autoFocus
        />
      </header>

      <main className="search-content">
        {loading ? (
          <LoadingSkeleton variant="grid" count={6} />
        ) : error ? (
          <PageLevelError message="Search failed. Something went wrong loading results." onRetry={() => load(query)} />
        ) : products.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No dishes found"
            subtitle="Try a different word from the dish name or description."
          />
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductGridTile key={product._id} product={product} onClick={() => openReel(product._id)} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
