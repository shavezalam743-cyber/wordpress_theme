import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Post = {
  id: string
  title: string
  slug: string
  cover_image: string | null
  preview_video: string | null
  file_size: string | null
  image_count: number
  video_count: number
  view_count: number
  is_trending: boolean
  is_featured: boolean
  is_upcoming: boolean
  open_link: string | null
  created_at: string
  published_at: string
  category_id: string | null
}

export type Model = {
  id: string
  name: string
  slug: string
  stage_name: string | null
  bio: string | null
  cover_image: string | null
  profile_image: string | null
  is_trending: boolean
  is_popular: boolean
  country: string | null
  nationality: string | null
  age: number | null
  height: string | null
  weight: string | null
  hair_color: string | null
  eye_color: string | null
  website: string | null
  social_links: Record<string, string> | null
  tags: string[] | null
  created_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}
