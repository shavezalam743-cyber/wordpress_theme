import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Trash2, Reply } from 'lucide-react'
import { supabase, formatTime } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import type { Comment } from '@/lib/types'

type Props = {
  postId: string
}

export function Comments({ postId }: Props) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [postId])

  async function fetchComments() {
    setLoading(true)
    const { data } = await supabase
      .from('comments')
      .select('*, user:user_profiles!user_id(*)')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (data) {
      const commentsWithReplies = data as Comment[]
      for (const comment of commentsWithReplies) {
        const { data: replies } = await supabase
          .from('comments')
          .select('*, user:user_profiles!user_id(*)')
          .eq('parent_id', comment.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: true })
        comment.replies = (replies as Comment[]) ?? []
      }
      setComments(commentsWithReplies)
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !newComment.trim() || submitting) return

    setSubmitting(true)
    const { data } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
      })
      .select('*, user:user_profiles!user_id(*)')
      .single()

    if (data) {
      setComments(prev => [data as Comment, ...prev])
      setNewComment('')
    }
    setSubmitting(false)
  }

  async function handleReply(commentId: string) {
    if (!user || !replyContent.trim() || submitting) return

    setSubmitting(true)
    const { data } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        parent_id: commentId,
        content: replyContent.trim(),
      })
      .select('*, user:user_profiles!user_id(*)')
      .single()

    if (data) {
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return { ...c, replies: [...(c.replies ?? []), data as Comment] }
        }
        return c
      }))
      setReplyContent('')
      setReplyingTo(null)
    }
    setSubmitting(false)
  }

  async function deleteComment(commentId: string, parentId?: string) {
    await supabase.from('comments').delete().eq('id', commentId)
    if (parentId) {
      setComments(prev => prev.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: c.replies?.filter((r: Comment) => r.id !== commentId) ?? [] }
        }
        return c
      }))
    } else {
      setComments(prev => prev.filter(c => c.id !== commentId))
    }
  }

  function CommentItem({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) {
    const commentUser = comment.user
    const isOwner = user?.id === comment.user_id

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={isReply ? 'ml-10' : ''}
      >
        <div
          className="p-4 rounded-xl mb-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}
            >
              {commentUser?.avatar_url ? (
                <img src={commentUser.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">
                  {(commentUser?.name ?? 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{commentUser?.name ?? 'User'}</p>
                <span className="text-xs text-white/30">{formatTime(comment.created_at)}</span>
              </div>
              <p className="text-sm text-white/70 mt-1 leading-relaxed">{comment.content}</p>
              <div className="flex items-center gap-3 mt-2">
                {!isReply && user && (
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Reply className="w-3 h-3" />
                    Reply
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => deleteComment(comment.id, isReply ? comment.parent_id ?? undefined : undefined)}
                    className="text-xs text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </div>

              {replyingTo === comment.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReply(comment.id)}
                      disabled={!replyContent.trim() || submitting}
                      className="px-3 py-2 rounded-lg disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {comment.replies?.map((reply: Comment) => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">
        Comments ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/30 outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!newComment.trim() || submitting}
            className="px-5 py-3 rounded-xl disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
          </motion.button>
        </form>
      ) : (
        <p className="text-sm text-white/40 py-4">
          Please <a href="/login" className="text-orange-400 hover:underline">sign in</a> to comment.
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-white/40 text-center py-8">No comments yet. Be the first!</p>
      ) : (
        <AnimatePresence>
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
