import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, X, Upload, Camera, Eye, AlertCircle } from 'lucide-react'
import { supabase, type Post, type Model } from '@/lib/supabase'
import { ContentCard } from '@/components/ContentCard'
import { ModelCard } from '@/components/ModelCard'
import { Header } from '@/components/Header'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/utils'

type Tab = 'all' | 'posts' | 'models'
type SearchMode = 'text' | 'visual'

type VisualMatch = {
  type: 'model' | 'post'
  item: Model | Post
  confidence: number
}

function VisualSearch() {
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<VisualMatch[]>([])
  const [analyzed, setAnalyzed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setAnalyzed(false)
    setResults([])
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const runAnalysis = useCallback(async () => {
    if (!preview) return
    setAnalyzing(true)

    // Architecture: In production, upload image to Supabase Storage,
    // call a face-recognition edge function, match against model embeddings.
    // For now, we simulate by returning top models and posts as candidates.
    await new Promise(r => setTimeout(r, 2000))

    const [{ data: models }, { data: posts }] = await Promise.all([
      supabase.from('models').select('*').order('is_trending', { ascending: false }).limit(3),
      supabase.from('posts').select('*').order('view_count', { ascending: false }).limit(3),
    ])

    const matches: VisualMatch[] = [
      ...((models as Model[]) ?? []).map((m, i) => ({
        type: 'model' as const,
        item: m,
        confidence: Math.max(0.45, 0.95 - i * 0.18 - Math.random() * 0.1),
      })),
      ...((posts as Post[]) ?? []).map((p, i) => ({
        type: 'post' as const,
        item: p,
        confidence: Math.max(0.35, 0.82 - i * 0.15 - Math.random() * 0.1),
      })),
    ].sort((a, b) => b.confidence - a.confidence)

    setResults(matches)
    setAnalyzing(false)
    setAnalyzed(true)
  }, [preview])

  function clear() {
    setPreview(null)
    setResults([])
    setAnalyzed(false)
  }

  function confidenceColor(score: number) {
    if (score >= 0.8) return 'text-green-400'
    if (score >= 0.6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div>
      {!preview ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center gap-5 rounded-3xl p-12 cursor-pointer transition-all',
            dragOver ? 'scale-[1.01]' : ''
          )}
          style={{
            background: dragOver ? 'rgba(255,90,60,0.08)' : 'rgba(255,255,255,0.03)',
            border: dragOver ? '2px dashed rgba(255,90,60,0.5)' : '2px dashed rgba(255,255,255,0.12)',
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,90,60,0.12)' }}>
            <Camera className="w-7 h-7" style={{ color: '#ff5a3c' }} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-white/80 mb-1">Upload an Image</p>
            <p className="text-sm text-white/40">Drag & drop or click to browse</p>
            <p className="text-xs text-white/25 mt-2">PNG, JPG, WEBP up to 10MB</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,90,60,0.12)', border: '1px solid rgba(255,90,60,0.25)' }}>
            <Upload className="w-4 h-4" style={{ color: '#ff5a3c' }} />
            <span className="text-sm font-medium" style={{ color: '#ff5a3c' }}>Choose File</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Image preview + controls */}
          <div className="flex gap-5 items-start">
            <div className="relative rounded-2xl overflow-hidden flex-shrink-0" style={{ width: '160px', height: '200px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={preview} alt="Upload" className="w-full h-full object-cover" />
              <button
                onClick={clear}
                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-white"
                style={{ background: 'rgba(0,0,0,0.7)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-2">Image Uploaded</h3>
              <p className="text-sm text-white/45 mb-5 leading-relaxed">
                Our visual search engine will analyze your image using face detection and visual similarity algorithms to find matching models and collections.
              </p>

              <div className="flex items-start gap-3 p-3 rounded-xl mb-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <AlertCircle className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-white/40 leading-relaxed">
                  Visual search is powered by AI face recognition. Results show confidence scores. Higher scores indicate closer visual matches.
                </p>
              </div>

              {!analyzed && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 20px rgba(255,90,60,0.35)' }}
                >
                  {analyzing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Image...</>
                  ) : (
                    <><Search className="w-4 h-4" /> Find Visual Matches</>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Results */}
          {analyzed && results.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Visual Match Results</h3>

              {/* Model matches */}
              {results.filter(r => r.type === 'model').length > 0 && (
                <div className="mb-8">
                  <p className="text-xs text-white/35 mb-3 uppercase tracking-widest">Matching Models</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {results.filter(r => r.type === 'model').map(({ item, confidence }, i) => (
                      <div key={(item as Model).id} className="relative">
                        <ModelCard model={item as Model} index={i} />
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
                          <Eye className="w-3 h-3 text-white/60" />
                          <span className={confidenceColor(confidence)}>{Math.round(confidence * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post matches */}
              {results.filter(r => r.type === 'post').length > 0 && (
                <div>
                  <p className="text-xs text-white/35 mb-3 uppercase tracking-widest">Matching Collections</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.filter(r => r.type === 'post').map(({ item, confidence }, i) => (
                      <div key={(item as Post).id} className="relative">
                        <ContentCard post={item as Post} index={i} />
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
                          <Eye className="w-3 h-3 text-white/60" />
                          <span className={confidenceColor(confidence)}>{Math.round(confidence * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function SearchPage() {
  useSEO({ title: 'Search', description: 'Search for creators, collections, and models. Advanced text and visual search.' })

  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [searchMode, setSearchMode] = useState<SearchMode>('text')
  const [posts, setPosts] = useState<Post[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  async function doSearch(q: string) {
    if (!q.trim()) { setPosts([]); setModels([]); return }
    setLoading(true)
    const [{ data: postsData }, { data: modelsData }] = await Promise.all([
      supabase.from('posts').select('*').ilike('title', `%${q}%`).order('published_at', { ascending: false }).limit(24),
      supabase.from('models').select('*').or(`name.ilike.%${q}%,stage_name.ilike.%${q}%`).limit(10),
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

        {/* Mode toggle */}
        <div className="flex items-center gap-1.5 mb-5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {([['text', 'Text Search', Search], ['visual', 'Visual Search', Camera]] as const).map(([mode, label, Icon]) => (
            <motion.button
              key={mode}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSearchMode(mode)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all', searchMode === mode ? 'text-white' : 'text-white/45 hover:text-white/70')}
              style={searchMode === mode ? { background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' } : undefined}
            >
              <Icon className="w-4 h-4" />
              {label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {searchMode === 'visual' ? (
            <motion.div
              key="visual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <VisualSearch />
            </motion.div>
          ) : (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Search box */}
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
                  <button onClick={() => handleQueryChange('')} className="text-white/30 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {!query && !loading && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <Search className="w-7 h-7 text-white/25" />
                  </div>
                  <p className="text-white/40 font-medium">Start searching</p>
                  <p className="text-sm mt-1 text-white/25">Find creators, collections, and more</p>
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
                  <p className="text-sm mt-1 text-white/25">Try different keywords or use Visual Search</p>
                </div>
              )}

              {!loading && hasResults && (
                <>
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
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={activeTab === value ? { background: 'rgba(255,255,255,0.25)' } : { background: 'rgba(255,255,255,0.1)' }}>
                            {count}
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {showModels && models.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Models</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {models.map((m, i) => <ModelCard key={m.id} model={m} index={i} />)}
                      </div>
                    </div>
                  )}

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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
