import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase, type Post } from '@/lib/supabase'
import { ContentCard } from '@/components/ContentCard'
import { Header, type SortOption } from '@/components/Header'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 12

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-full animate-pulse" style={{ aspectRatio: '4/5', background: 'rgba(255,255,255,0.04)' }} />
      <div className="p-4 space-y-3">
        <div className="h-4 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: '70%' }} />
        <div className="h-3 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', width: '100%' }} />
        <div className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null

  const pages: (number | 'ellipsis')[] = []
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i)
  } else {
    pages.push(0)
    if (page > 2) pages.push('ellipsis')
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i)
    if (page < totalPages - 3) pages.push('ellipsis')
    pages.push(totalPages - 1)
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-8 pb-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
          page === 0 ? 'opacity-30 cursor-not-allowed text-white/40' : 'text-white/70 hover:text-white'
        )}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        <ChevronLeft className="w-4 h-4" />
        Prev
      </motion.button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e${i}`} className="w-9 text-center text-sm text-white/25">…</span>
          ) : (
            <motion.button
              key={p}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onPage(p as number)}
              className={cn(
                'w-9 h-9 rounded-xl text-sm font-medium transition-all',
                page === p ? 'text-white font-bold' : 'text-white/50 hover:text-white'
              )}
              style={
                page === p
                  ? { background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 16px rgba(255,90,60,0.35)' }
                  : { background: 'rgba(255,255,255,0.05)' }
              }
            >
              {(p as number) + 1}
            </motion.button>
          )
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages - 1}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
          page >= totalPages - 1 ? 'opacity-30 cursor-not-allowed text-white/40' : 'text-white/70 hover:text-white'
        )}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  )
}

export function BrowsePage() {
  useSEO({
    title: 'Browse Collections',
    description: 'Browse premium exclusive creator collections. Find trending, popular and newest content from top models.',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const pageParam = parseInt(searchParams.get('page') ?? '1', 10)
  const page = Math.max(1, pageParam) - 1 // 0-indexed internally

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) ?? 'newest')

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const fetchPosts = useCallback(async (pageNum: number, searchVal: string, sortVal: SortOption) => {
    setLoading(true)

    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

    if (searchVal.trim()) query = query.ilike('title', `%${searchVal}%`)

    if (sortVal === 'trending') query = query.eq('is_trending', true).order('published_at', { ascending: false })
    else if (sortVal === 'views' || sortVal === 'popular') query = query.order('view_count', { ascending: false })
    else if (sortVal === 'size') query = query.order('image_count', { ascending: false })
    else if (sortVal === 'oldest') query = query.order('published_at', { ascending: true })
    else query = query.order('published_at', { ascending: false })

    const { data, error, count } = await query
    if (!error) {
      setPosts((data as Post[]) ?? [])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPosts(page, search, sort)
  }, [page, search, sort, fetchPosts])

  function handleSort(newSort: SortOption) {
    setSort(newSort)
    setSearchParams(p => { p.set('sort', newSort); p.set('page', '1'); return p })
  }

  function handleSearch(val: string) {
    setSearch(val)
    setSearchParams(p => { if (val) p.set('q', val); else p.delete('q'); p.set('page', '1'); return p })
  }

  function handlePage(p: number) {
    setSearchParams(prev => { prev.set('page', String(p + 1)); return prev })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Header
        onSearch={handleSearch}
        search={search}
        sort={sort}
        onSort={handleSort}
        showSortFilter
      />

      <div className="px-4 md:px-5 pb-12">
        {/* Count info */}
        {!loading && total > 0 && (
          <div className="pt-5 pb-2 flex items-center justify-between">
            <p className="text-xs text-white/30">
              {total.toLocaleString()} collections &bull; Page {page + 1} of {totalPages}
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 pt-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-white/40">No results found</p>
            <p className="text-sm mt-1 text-white/25">Try adjusting your search or filters</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${page}-${sort}-${search}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 pt-4"
            >
              {posts.map((post, i) => <ContentCard key={post.id} post={post} index={i} />)}
            </motion.div>
          </AnimatePresence>
        )}

        <Pagination page={page} totalPages={totalPages} onPage={handlePage} />
      </div>
    </>
  )
}
