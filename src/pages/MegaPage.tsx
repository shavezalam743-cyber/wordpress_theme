import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, TrendingUp, Star, Loader2 } from 'lucide-react'
import { supabase, type Post } from '@/lib/supabase'
import { ContentCard } from '@/components/ContentCard'
import { Header } from '@/components/Header'

function FeaturedBanner({ post }: { post: Post }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="relative rounded-3xl overflow-hidden mb-8"
      style={{ height: '280px', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {post.cover_image && (
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.4) 50%, transparent 100%)' }}
      />
      <div className="absolute inset-0 flex flex-col justify-center px-8">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white mb-3 w-fit"
          style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 12px rgba(255,90,60,0.4)' }}
        >
          <Flame className="w-3 h-3" /> FEATURED
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-white max-w-sm leading-tight tracking-tight">{post.title}</h2>
        <div className="flex items-center gap-3 mt-3">
          {post.file_size && <span className="text-xs text-white/55">{post.file_size}</span>}
          {post.image_count > 0 && <span className="text-xs text-white/55">{post.image_count.toLocaleString()} imgs</span>}
        </div>
        <motion.a
          href={`/post/${post.slug}`}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white w-fit"
          style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 6px 20px rgba(255,90,60,0.45)' }}
        >
          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <span className="text-xs font-bold leading-none">M</span>
          </div>
          Open Collection
        </motion.a>
      </div>
    </motion.div>
  )
}

export function MegaPage() {
  const [featured, setFeatured] = useState<Post | null>(null)
  const [trending, setTrending] = useState<Post[]>([])
  const [mostViewed, setMostViewed] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: featuredData }, { data: trendingData }, { data: viewedData }] = await Promise.all([
        supabase.from('posts').select('*').eq('is_featured', true).order('published_at', { ascending: false }).limit(1),
        supabase.from('posts').select('*').eq('is_trending', true).order('published_at', { ascending: false }).limit(4),
        supabase.from('posts').select('*').order('view_count', { ascending: false }).limit(4),
      ])

      const allPosts = (featuredData ?? []) as Post[]
      if (allPosts.length > 0) setFeatured(allPosts[0])
      else {
        // fallback: use most viewed as featured
        const { data: fallback } = await supabase.from('posts').select('*').order('view_count', { ascending: false }).limit(1)
        if (fallback?.[0]) setFeatured(fallback[0] as Post)
      }

      setTrending((trendingData as Post[]) ?? [])
      setMostViewed((viewedData as Post[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <Header />
      <div className="px-4 md:px-5 pb-12 pt-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 16px rgba(255,90,60,0.4)' }}
            >
              <Flame className="w-5 h-5 text-white" />
            </div>
            Mega Collections
          </h1>
          <p className="text-sm mt-2 text-white/40">Featured, trending, and most popular collections</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-white/30" />
          </div>
        ) : (
          <>
            {/* Featured banner */}
            {featured && <FeaturedBanner post={featured} />}

            {/* Trending */}
            {trending.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-5 h-5" style={{ color: '#ff5a3c' }} />
                  <h2 className="text-lg font-bold text-white tracking-tight">Trending Now</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {trending.map((post, i) => <ContentCard key={post.id} post={post} index={i} />)}
                </div>
              </section>
            )}

            {/* Most viewed */}
            {mostViewed.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Star className="w-5 h-5" style={{ color: '#f59e0b' }} />
                  <h2 className="text-lg font-bold text-white tracking-tight">Most Viewed</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {mostViewed.map((post, i) => <ContentCard key={post.id} post={post} index={i} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  )
}
