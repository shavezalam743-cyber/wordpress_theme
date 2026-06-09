import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, HardDrive, Image, Video, Eye,
  Clock, TrendingUp, Plus, Share2, Bookmark, ExternalLink,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { supabase, type Post, formatViews, formatTime } from '@/lib/supabase'
import { ContentCard } from '@/components/ContentCard'
import { Header } from '@/components/Header'
import { useSEO } from '@/hooks/useSEO'

function RelatedSection({ title, posts }: { title: string; posts: Post[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (posts.length === 0) return null

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('left')}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('right')}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {posts.map((p, i) => (
          <div key={p.id} className="flex-shrink-0 w-64">
            <ContentCard post={p} index={i} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [relatedByCategory, setRelatedByCategory] = useState<Post[]>([])
  const [relatedByTag, setRelatedByTag] = useState<Post[]>([])
  const [moreContent, setMoreContent] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useSEO({
    title: post?.title,
    description: post?.description ?? `Browse ${post?.title} - ${post?.image_count ?? 0} images, ${post?.video_count ?? 0} videos.`,
    image: post?.cover_image ?? undefined,
    type: 'article',
  })

  useEffect(() => {
    if (!slug) return
    setLoading(true)

    supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(async ({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
          setLoading(false)
          return
        }
        const p = data as Post
        setPost(p)

        // Track view
        supabase.from('analytics').insert({
          event_type: 'view',
          entity_type: 'post',
          entity_id: p.id,
          entity_slug: p.slug,
        }).then(() => {})

        // Related by category
        if (p.category_id) {
          const { data: catPosts } = await supabase
            .from('posts')
            .select('*')
            .eq('category_id', p.category_id)
            .neq('id', p.id)
            .order('view_count', { ascending: false })
            .limit(8)
          setRelatedByCategory((catPosts as Post[]) ?? [])
        }

        // Related by tags
        if (p.tags && p.tags.length > 0) {
          const { data: tagPosts } = await supabase
            .from('posts')
            .select('*')
            .neq('id', p.id)
            .overlaps('tags', p.tags)
            .order('published_at', { ascending: false })
            .limit(8)
          setRelatedByTag((tagPosts as Post[]) ?? [])
        }

        // More content
        const { data: more } = await supabase
          .from('posts')
          .select('*')
          .neq('id', p.id)
          .order('view_count', { ascending: false })
          .limit(8)
        setMoreContent((more as Post[]) ?? [])

        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <>
        <Header />
        <div className="px-4 md:px-5 pb-12 pt-6 space-y-6">
          <div className="h-10 w-32 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="rounded-2xl animate-pulse" style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.04)' }} />
          <div className="h-8 w-64 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </>
    )
  }

  if (notFound || !post) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center py-32 text-center px-5">
          <p className="text-xl font-bold text-white/50">Collection not found</p>
          <Link to="/" className="mt-4 text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Browse
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="pb-12">
        {/* Hero cover */}
        <div className="relative overflow-hidden" style={{ maxHeight: '500px' }}>
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
              style={{ maxHeight: '500px' }}
            />
          ) : (
            <div className="w-full h-64" style={{ background: 'linear-gradient(135deg, rgba(255,90,60,0.15), rgba(8,8,8,1))' }} />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(8,8,8,0.2) 0%, rgba(8,8,8,0.97) 100%)' }} />

          {/* Breadcrumb over hero */}
          <div className="absolute top-0 left-0 right-0 px-4 md:px-5 pt-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Browse
            </Link>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 px-4 md:px-5 pb-6">
            {post.is_trending && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white mb-3" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 12px rgba(255,90,60,0.4)' }}>
                <TrendingUp className="w-3 h-3" /> TRENDING
              </span>
            )}
            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight">{post.title}</h1>
            {post.description && (
              <p className="text-sm mt-2 text-white/50 max-w-2xl leading-relaxed line-clamp-2">{post.description}</p>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="px-4 md:px-5 pt-6">
          {/* Stats row */}
          <div
            className="flex flex-wrap items-center gap-4 p-4 rounded-2xl mb-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {post.file_size && (
              <div className="flex items-center gap-2 text-sm text-white/55">
                <HardDrive className="w-4 h-4 text-white/30" />
                {post.file_size}
              </div>
            )}
            {post.image_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-white/55">
                <Image className="w-4 h-4 text-white/30" />
                {post.image_count.toLocaleString()} Images
              </div>
            )}
            {post.video_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-white/55">
                <Video className="w-4 h-4 text-white/30" />
                {post.video_count} Videos
              </div>
            )}
            {post.view_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-white/55">
                <Eye className="w-4 h-4 text-white/30" />
                {formatViews(post.view_count)} Views
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-white/40 ml-auto">
              <Clock className="w-4 h-4 text-white/25" />
              {formatTime(post.published_at)}
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium text-white/55 hover:text-white transition-colors cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-12">
            <motion.a
              href={post.open_link ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 8px 28px rgba(255,90,60,0.45)' }}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)' }}>
                <span className="text-xs font-bold">M</span>
              </div>
              Open on MEGA
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Plus className="w-4 h-4" />
              Add to List
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Bookmark className="w-4 h-4" />
              Save
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={() => navigator.clipboard.writeText(window.location.href).catch(() => {})}
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
          </div>

          {/* Related by category */}
          <RelatedSection title="More in this Category" posts={relatedByCategory} />

          {/* Related by tags */}
          <RelatedSection title="Similar Collections" posts={relatedByTag.filter(p => !relatedByCategory.find(c => c.id === p.id))} />

          {/* More content */}
          <RelatedSection
            title="Recommended For You"
            posts={moreContent.filter(p =>
              !relatedByCategory.find(c => c.id === p.id) &&
              !relatedByTag.find(t => t.id === p.id)
            )}
          />
        </div>
      </div>
    </>
  )
}
