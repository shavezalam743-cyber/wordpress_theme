import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { supabase, type Post } from '@/lib/supabase'
import { ContentCard } from '@/components/ContentCard'
import { Header, type SortOption } from '@/components/Header'

const PAGE_SIZE = 12

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-full animate-pulse" style={{ aspectRatio: '4/5', background: 'rgba(255,255,255,0.04)' }} />
      <div className="p-4 space-y-3">
        <div className="h-4 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: '70%' }} />
        <div className="h-3 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', width: '100%' }} />
        <div className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </div>
  )
}

export function BrowsePage() {
  const [searchParams] = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) ?? 'newest')

  const sentinelRef = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const fetchPosts = useCallback(
    async (pageNum: number, searchVal: string, sortVal: SortOption, replace = false) => {
      if (replace) setLoading(true)
      else setLoadingMore(true)

      let query = supabase
        .from('posts')
        .select('*')
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

      if (searchVal.trim()) query = query.ilike('title', `%${searchVal}%`)

      if (sortVal === 'trending') query = query.eq('is_trending', true).order('published_at', { ascending: false })
      else if (sortVal === 'views' || sortVal === 'popular') query = query.order('view_count', { ascending: false })
      else if (sortVal === 'size') query = query.order('image_count', { ascending: false })
      else if (sortVal === 'oldest') query = query.order('published_at', { ascending: true })
      else query = query.order('published_at', { ascending: false })

      const { data, error } = await query
      if (!error && data) {
        const newPosts = data as Post[]
        setPosts((prev) => (replace ? newPosts : [...prev, ...newPosts]))
        setHasMore(newPosts.length === PAGE_SIZE)
      }
      if (replace) setLoading(false)
      else setLoadingMore(false)
    },
    []
  )

  useEffect(() => {
    setPage(0)
    fetchPosts(0, search, sort, true)
  }, [sort])

  useEffect(() => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setPage(0)
      fetchPosts(0, search, sort, true)
    }, 350)
    return () => clearTimeout(searchTimeout.current)
  }, [search])

  useEffect(() => {
    if (page === 0) return
    fetchPosts(page, search, sort, false)
  }, [page])

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) setPage((p) => p + 1)
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading])

  return (
    <>
      <Header
        onSearch={setSearch}
        search={search}
        sort={sort}
        onSort={setSort}
        showSortFilter
      />

      <div className="px-4 md:px-5 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 pt-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-white/40">No results found</p>
            <p className="text-sm mt-1 text-white/22">Try adjusting your search or filters</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 pt-6">
              {posts.map((post, i) => <ContentCard key={post.id} post={post} index={i} />)}
            </div>
          </AnimatePresence>
        )}

        <div ref={sentinelRef} className="h-10" />

        {loadingMore && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-white/30" />
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8 text-sm text-white/20">All collections loaded</div>
        )}
      </div>
    </>
  )
}
