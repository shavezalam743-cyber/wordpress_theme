import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase, type Post, type Category } from '@/lib/supabase'
import { ContentCard } from '@/components/ContentCard'
import { Header } from '@/components/Header'
import { useSEO } from '@/hooks/useSEO'

const categoryGradients: Record<string, string> = {
  lifestyle: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
  fashion: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  fitness: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  art: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  travel: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
}

export function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useSEO({
    title: category?.name,
    description: category?.description ?? `Browse ${category?.name ?? ''} collections.`,
  })

  useEffect(() => {
    if (!slug) return
    supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(async ({ data: cat, error }) => {
        if (error || !cat) {
          setNotFound(true)
          setLoading(false)
          return
        }
        setCategory(cat as Category)

        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('category_id', cat.id)
          .order('published_at', { ascending: false })

        // If no category-filtered posts, show all posts
        if (!postsData || postsData.length === 0) {
          const { data: allPosts } = await supabase
            .from('posts')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(12)
          setPosts((allPosts as Post[]) ?? [])
        } else {
          setPosts((postsData as Post[]) ?? [])
        }
        setLoading(false)
      })
  }, [slug])

  const gradient = slug ? (categoryGradients[slug] ?? 'linear-gradient(135deg, #ff5a3c, #ff784e)') : ''

  if (notFound) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center py-32 text-center px-5">
          <p className="text-xl font-bold text-white/50">Category not found</p>
          <Link to="/categories" className="mt-4 text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Categories
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="pb-12">
        {/* Hero banner */}
        <div
          className="relative px-4 md:px-5 py-10 mb-2"
          style={{ background: gradient ? `${gradient.replace(')', ', 0.15)').replace('linear-gradient(', 'linear-gradient(')}` : undefined }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: gradient }}
          />
          <div className="relative z-10">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              All Categories
            </Link>
            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
              {loading ? (
                <div className="h-10 w-48 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
              ) : (
                category?.name
              )}
            </h1>
            {category?.description && (
              <p className="mt-2 text-sm md:text-base max-w-xl" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {category.description}
              </p>
            )}
            <p className="mt-2 text-xs text-white/35">{posts.length} collections</p>
          </div>
        </div>

        <div className="px-4 md:px-5 pt-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl animate-pulse" style={{ aspectRatio: '4/5', background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-white/30">No collections in this category yet</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {posts.map((post, i) => <ContentCard key={post.id} post={post} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
