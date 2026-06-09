import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, HardDrive, Image, Video, Eye,
  Clock, TrendingUp, Plus, Share2, Bookmark, ExternalLink
} from 'lucide-react'
import { supabase, type Post } from '@/lib/supabase'
import { ContentCard } from '@/components/ContentCard'
import { Header } from '@/components/Header'

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} minutes ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ${hrs === 1 ? 'hour' : 'hours'} ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} days ago`
  return new Date(iso).toLocaleDateString()
}

export function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [related, setRelated] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

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

        // Fetch related posts
        const { data: relatedData } = await supabase
          .from('posts')
          .select('*')
          .neq('id', p.id)
          .order('published_at', { ascending: false })
          .limit(4)
        setRelated((relatedData as Post[]) ?? [])
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
            <div className="w-full h-64" style={{ background: 'rgba(255,255,255,0.03)' }} />
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(8,8,8,0.2) 0%, rgba(8,8,8,0.95) 100%)' }}
          />

          {/* Breadcrumb over hero */}
          <div className="absolute top-0 left-0 right-0 px-4 md:px-5 pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse
            </Link>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 px-4 md:px-5 pb-6">
            {post.is_trending && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white mb-3"
                style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 12px rgba(255,90,60,0.4)' }}
              >
                <TrendingUp className="w-3 h-3" /> TRENDING
              </span>
            )}
            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight">{post.title}</h1>
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

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-10">
            <motion.a
              href={post.open_link ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 8px 28px rgba(255,90,60,0.45)' }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.25)' }}
              >
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
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-5 tracking-tight">Related Collections</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {related.map((p, i) => <ContentCard key={p.id} post={p} index={i} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
