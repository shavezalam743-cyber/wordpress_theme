import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUp, ThumbsDown, MessageCircle, Eye } from 'lucide-react'
import { supabase, formatViews } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import type { ExtendedPost, PostLike } from '@/lib/types'

type Props = {
  post: ExtendedPost
  onCommentClick?: () => void
}

export function PostInteractions({ post, onCommentClick }: Props) {
  const { user } = useAuth()
  const [userVote, setUserVote] = useState<PostLike | null>(null)
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0)
  const [dislikeCount, setDislikeCount] = useState(post.dislike_count ?? 0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setUserVote(null)
      return
    }

    supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setUserVote(data as PostLike)
      })
  }, [user, post.id])

  async function handleVote(isLike: boolean) {
    if (!user || loading) return

    setLoading(true)

    if (userVote) {
      if (userVote.is_like === isLike) {
        await supabase.from('post_likes').delete().eq('id', userVote.id)
        setUserVote(null)
        setLikeCount((prev: number) => isLike ? prev - 1 : prev)
        setDislikeCount((prev: number) => isLike ? prev : prev - 1)
      } else {
        await supabase.from('post_likes').update({ is_like: isLike }).eq('id', userVote.id)
        setUserVote({ ...userVote, is_like: isLike })
        setLikeCount((prev: number) => isLike ? prev + 1 : prev - 1)
        setDislikeCount((prev: number) => isLike ? prev - 1 : prev + 1)
      }
    } else {
      const { data } = await supabase
        .from('post_likes')
        .insert({ post_id: post.id, user_id: user.id, is_like: isLike })
        .select()
        .single()

      if (data) {
        setUserVote(data as PostLike)
        setLikeCount((prev: number) => isLike ? prev + 1 : prev)
        setDislikeCount((prev: number) => isLike ? prev : prev + 1)
      }
    }

    setLoading(false)
  }

  return (
    <div
      className="flex items-center gap-6 p-4 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleVote(true)}
        disabled={!user || loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          color: userVote?.is_like ? '#10b981' : 'rgba(255,255,255,0.6)',
          background: userVote?.is_like ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <ThumbsUp className="w-4 h-4" fill={userVote?.is_like ? '#10b981' : 'transparent'} />
        <span>{formatViews(likeCount)}</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleVote(false)}
        disabled={!user || loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          color: userVote && !userVote.is_like ? '#ef4444' : 'rgba(255,255,255,0.6)',
          background: userVote && !userVote.is_like ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <ThumbsDown className="w-4 h-4" fill={userVote && !userVote.is_like ? '#ef4444' : 'transparent'} />
        <span>{formatViews(dislikeCount)}</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCommentClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <MessageCircle className="w-4 h-4" />
        <span>{formatViews(post.comment_count ?? 0)}</span>
      </motion.button>

      <div
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/40"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Eye className="w-4 h-4" />
        <span>{formatViews(post.unique_view_count ?? post.view_count ?? 0)}</span>
      </div>
    </div>
  )
}
