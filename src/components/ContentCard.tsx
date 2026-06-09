import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Plus, Image, Video, HardDrive, Eye, Clock } from 'lucide-react'
import type { Post } from '@/lib/supabase'
import { formatViews, formatTime } from '@/lib/supabase'

type Props = {
  post: Post
  index: number
}

export function ContentCard({ post, index }: Props) {
  const [hovered, setHovered] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return
    if (hovered && post.preview_video) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setVideoReady(false)
    }
  }, [hovered, post.preview_video])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: [0.23, 1, 0.32, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
        border: hovered ? '1px solid rgba(255,90,60,0.35)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: hovered
          ? '0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,90,60,0.08), 0 8px 32px rgba(255,90,60,0.1)'
          : '0 4px 20px rgba(0,0,0,0.25)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Cover / Video preview */}
      <Link to={`/post/${post.slug}`} className="block relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
        {/* Static cover image */}
        {post.cover_image ? (
          <motion.img
            src={post.cover_image}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ scale: hovered && !videoReady ? 1.06 : 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
        )}

        {/* Video preview on hover */}
        {post.preview_video && (
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: videoReady ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <video
                  ref={videoRef}
                  src={post.preview_video}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onCanPlay={() => setVideoReady(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)' }}
        />

        {/* Upcoming blur */}
        {post.is_upcoming && (
          <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: 'blur(14px)', background: 'rgba(0,0,0,0.4)' }} />
        )}

        {/* Top badges + menu */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {post.is_trending && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white tracking-wider uppercase" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 16px rgba(255,90,60,0.45)' }}>
                TRENDING
              </span>
            )}
            {post.is_upcoming && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white/80" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                COMING SOON
              </span>
            )}
            {post.is_featured && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(59,130,246,0.8)', color: '#fff' }}>
                FEATURED
              </span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Video indicator */}
        {post.preview_video && hovered && (
          <div className="absolute bottom-12 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white/80" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
            <Video className="w-3 h-3" />
            <span>Preview</span>
          </div>
        )}
      </Link>

      {/* Info panel */}
      <div className="p-4">
        <Link to={`/post/${post.slug}`}>
          <h3 className="text-white font-bold text-sm mb-3 truncate tracking-tight hover:text-white/80 transition-colors leading-snug">
            {post.title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
          {post.file_size && (
            <div className="flex items-center gap-1 text-xs text-white/45">
              <HardDrive className="w-3 h-3" />
              <span>{post.file_size}</span>
            </div>
          )}
          {post.image_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-white/45">
              <Image className="w-3 h-3" />
              <span>{post.image_count.toLocaleString()} imgs</span>
            </div>
          )}
          {post.video_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-white/45">
              <Video className="w-3 h-3" />
              <span>{post.video_count} videos</span>
            </div>
          )}
          {post.view_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-white/45">
              <Eye className="w-3 h-3" />
              <span>{formatViews(post.view_count)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-white/30 mb-4">
          <Clock className="w-3 h-3" />
          <span>{formatTime(post.published_at)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/post/${post.slug}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #ff5a3c, #ff784e)',
              boxShadow: hovered ? '0 8px 24px rgba(255,90,60,0.55)' : '0 4px 12px rgba(255,90,60,0.3)',
            }}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <span className="text-xs font-bold leading-none">M</span>
            </div>
            <span>Open Collection</span>
          </Link>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white/55 hover:text-white transition-colors flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
