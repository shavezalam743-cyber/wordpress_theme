import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Star, Sparkles } from 'lucide-react'
import { supabase, type Model } from '@/lib/supabase'
import { ModelCard } from '@/components/ModelCard'
import { Header } from '@/components/Header'
import { useSEO } from '@/hooks/useSEO'

type Filter = 'all' | 'trending' | 'popular' | 'new'

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-full animate-pulse" style={{ aspectRatio: '3/4', background: 'rgba(255,255,255,0.04)' }} />
      <div className="p-4 space-y-2">
        <div className="h-4 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: '60%' }} />
        <div className="h-8 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </div>
  )
}

export function ModelsPage() {
  useSEO({
    title: 'Models',
    description: 'Discover trending and popular models. Browse creator profiles and their exclusive content collections.',
  })

  const [models, setModels] = useState<Model[]>([])
  const [filtered, setFiltered] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    supabase
      .from('models')
      .select('*')
      .order('is_trending', { ascending: false })
      .order('is_popular', { ascending: false })
      .then(({ data }) => {
        if (data) setModels(data as Model[])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let result = [...models]
    if (filter === 'trending') result = result.filter((m) => m.is_trending)
    if (filter === 'popular') result = result.filter((m) => m.is_popular)
    if (filter === 'new') result = result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.stage_name?.toLowerCase() ?? '').includes(q)
      )
    }
    setFiltered(result)
  }, [models, search, filter])

  const filters: { value: Filter; label: string; icon: React.ElementType }[] = [
    { value: 'all', label: 'All Models', icon: Star },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'popular', label: 'Popular', icon: Star },
    { value: 'new', label: 'New', icon: Sparkles },
  ]

  return (
    <>
      <Header search={search} onSearch={setSearch} />

      <div className="px-4 md:px-5 pb-12 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Models</h1>
          <p className="text-sm mt-1 text-white/40">{models.length} creators available</p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {filters.map(({ value, label, icon: Icon }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(value)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={
                filter === value
                  ? { background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', color: '#fff', boxShadow: '0 4px 16px rgba(255,90,60,0.4)' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Search className="w-10 h-10 text-white/20 mb-4" />
            <p className="text-white/40 font-medium">No models found</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {filtered.map((model, i) => (
              <ModelCard key={model.id} model={model} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </>
  )
}
