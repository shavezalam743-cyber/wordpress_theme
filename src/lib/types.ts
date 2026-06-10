import type { Post as BasePost, UserProfile } from '@/lib/supabase'

// Extended Post type with engagement fields
export type ExtendedPost = BasePost & {
  unique_view_count?: number
  like_count?: number
  dislike_count?: number
  comment_count?: number
}

// Post Like type for voting
export type PostLike = {
  id: string
  post_id: string
  user_id: string
  is_like: boolean
  created_at: string
}

// Comment type with nested replies
export type Comment = {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  content: string
  is_approved: boolean
  created_at: string
  updated_at: string
  user?: UserProfile
  replies?: Comment[]
}
