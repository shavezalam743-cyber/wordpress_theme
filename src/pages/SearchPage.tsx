import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Loader2, X } from 'lucide-react'
import { supabase, type Post, type Model } from '@/lib/supabase'
import { ContentCard } from '@/components/ContentCard'
import { ModelCard } from '@/components/ModelCard'
import { Header } from '@/components/Header'

type Tab = 'all' | 'posts' | 'models'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [posts, setPosts] = useState<Post[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  async function doSearch(q: string) {
    if (!q.trim()) {
      setPosts([])
      setModels([])
      return
    }
    setLoading(true)
    const [{ data: postsData }, { data: modelsData }] = await Promise.all([
      supabase
        .from('posts')
        .select('*')
        .ilike('title', `%${q}%`)
        .order('published_at', { ascending: false })
        .limit(24),
      supabase
        .from('models')
        .select('*')
        .or(`name.ilike.%${q}%,stage_name.ilike.%${q}%`)
        .limit(10),
    ])
    setPosts((postsData as Post[]) ?? [])
    setModels((modelsData as Model[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setQuery(q)
    doSearch(q)
  }, [searchParams])

  function handleQueryChange(val: string) {
    setQuery(val)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setSearchParams(val.trim() ? { q: val.trim() } : {})
    }, 400)
  }

  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: 'all', label: 'All', count: posts.length + models.length },
    { value: 'posts', label: 'Collections', count: posts.length },
    { value: 'models', label: 'Models', count: models.length },
  ]

  const showPosts = activeTab === 'all' || activeTab === 'posts'
  const showModels = activeTab === 'all' || activeTab === 'models'
  const hasResults = posts.length > 0 || models.length > 0

  return (
    <>
      <Header search={query} onSearch={handleQueryChange} />
      <div className="px-4 md:px-5 pb-12 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Search</h1>
          {query && (
            <p className="text-sm mt-1 text-white/40">
              Results for <span className="text-white/70">&ldquo;{query}&rdquo;</span>
            </p>
          )}
        </div>

        {/* Search box (large) */}
        <div
          className="relative flex items-center gap-3 px-5 py-4 rounded-2xl mb-6"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Search className="w-5 h-5 text-white/35 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search creators, collections, categories..."
            className="flex-1 bg-transparent text-white text-base placeholder:text-white/30 outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="text-white/30 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Empty state before search */}
        {!query && !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Search className="w-7 h-7 text-white/25" />
            </div>
            <p className="text-white/40 font-medium">Start searching</p>
            <p className="text-sm mt-1 text-white/22">Find creators, collections, and more</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-white/30" />
          </div>
        )}

        {!loading && query && !hasResults && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-white/40 font-medium">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-sm mt-1 text-white/22">Try different keywords</p>
          </div>
        )}

        {!loading && hasResults && (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6">
              {tabs.map(({ value, label, count }) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(value)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={
                    activeTab === value
                      ? { background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {label}
                  {count !== undefined && count > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={activeTab === value ? { background: 'rgba(255,255,255,0.25)' } : { background: 'rgba(255,255,255,0.1)' }}
                    >
                      {count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Models results */}
            {showModels && models.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Models</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {models.map((m, i) => <ModelCard key={m.id} model={m} index={i} />)}
                </div>
              </div>
            )}

            {/* Posts results */}
            {showPosts && posts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Collections</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {posts.map((post, i) => <ContentCard key={post.id} post={post} index={i} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
