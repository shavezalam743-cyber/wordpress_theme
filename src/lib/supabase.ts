import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Post = {
  id: string
  title: string
  slug: string
  description: string | null
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
  category_id: string | null
  tags: string[] | null
  created_at: string
  published_at: string
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
  figure_size: string | null
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

export type Tag = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type FooterAd = {
  id: string
  title: string
  type: 'banner' | 'text' | 'html' | 'button' | 'image' | 'video'
  content: string | null
  image_url: string | null
  destination_url: string | null
  open_new_tab: boolean
  is_active: boolean
  position: number
  click_count: number
  created_at: string
}

export type SiteSettings = {
  site_name: string
  site_description: string
  primary_color: string
  secondary_color: string
  posts_per_page: number
  show_featured: boolean
  show_trending: boolean
  show_popular: boolean
  card_style: string
  font_family: string
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const { data } = await supabase.from('settings').select('value').eq('key', key).single()
  if (!data) return fallback
  return data.value as T
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}
