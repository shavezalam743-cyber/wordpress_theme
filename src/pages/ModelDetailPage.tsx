import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Globe, TrendingUp, Star, Heart } from 'lucide-react'
import { supabase, type Model, type Post } from '@/lib/supabase'
import { ContentCard } from '@/components/ContentCard'
import { Header } from '@/components/Header'

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="px-4 py-3 rounded-xl text-center"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
    </div>
  )
}

export function ModelDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [model, setModel] = useState<Model | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      supabase.from('models').select('*').eq('slug', slug).single(),
      supabase
        .from('post_models')
        .select('post_id')
        .then(async ({ data: pm }) => {
          // fallback: get posts that match this model by querying all and filtering
          return { data: pm }
        }),
    ]).then(async ([{ data: modelData, error }]) => {
      if (error || !modelData) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setModel(modelData as Model)

      // Get posts linked to this model through post_models
      const { data: pmData } = await supabase
        .from('post_models')
        .select('post_id')
        .eq('model_id', modelData.id)

      if (pmData && pmData.length > 0) {
        const postIds = pmData.map((pm: { post_id: string }) => pm.post_id)
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .in('id', postIds)
          .order('published_at', { ascending: false })
        setPosts((postsData as Post[]) ?? [])
      } else {
        // Show a few sample posts if no linked posts
        const { data: samplePosts } = await supabase
          .from('posts')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(4)
        setPosts((samplePosts as Post[]) ?? [])
      }

      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <>
        <Header />
        <div className="px-4 md:px-5 pb-12 pt-6">
          <div className="animate-pulse space-y-6">
            <div className="h-64 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="h-8 rounded-xl w-48" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </div>
      </>
    )
  }

  if (notFound || !model) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center py-32 text-center px-5">
          <p className="text-xl font-bold text-white/50">Model not found</p>
          <Link to="/models" className="mt-4 text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Models
          </Link>
        </div>
      </>
    )
  }

  const displayName = model.stage_name || model.name

  return (
    <>
      <Header />
      <div className="pb-12">
        {/* Hero section */}
        <div className="relative">
          {/* Cover */}
          <div className="relative overflow-hidden" style={{ height: '320px' }}>
            {model.cover_image ? (
              <img
                src={model.cover_image}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: 'linear-gradient(135deg, rgba(255,90,60,0.2), rgba(180,30,30,0.1))' }}
              />
            )}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, rgba(8,8,8,0) 30%, rgba(8,8,8,0.98) 100%)' }}
            />
          </div>

          {/* Profile info */}
          <div className="px-4 md:px-5 -mt-20 relative z-10">
            <Link
              to="/models"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              All Models
            </Link>

            <div className="flex items-end gap-5 mb-6">
              {/* Profile image */}
              <div
                className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden flex-shrink-0"
                style={{ border: '3px solid rgba(255,90,60,0.5)', boxShadow: '0 8px 32px rgba(255,90,60,0.25)' }}
              >
                {model.cover_image ? (
                  <img src={model.cover_image} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}
                  >
                    <span className="text-3xl font-bold text-white">{displayName[0]}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">{displayName}</h1>
                  {model.is_trending && (
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}
                    >
                      <TrendingUp className="w-2.5 h-2.5" /> HOT
                    </span>
                  )}
                  {model.is_popular && (
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                    >
                      <Star className="w-2.5 h-2.5" /> Popular
                    </span>
                  )}
                </div>
                {model.name !== displayName && (
                  <p className="text-sm text-white/45">{model.name}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {model.country && (
                    <div className="flex items-center gap-1 text-xs text-white/40">
                      <Globe className="w-3 h-3" />
                      {model.country}
                    </div>
                  )}
                  {model.age && <span className="text-xs text-white/40">{model.age} years old</span>}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 16px rgba(255,90,60,0.4)' }}
              >
                <Heart className="w-4 h-4" />
                Follow
              </motion.button>
            </div>

            {/* Bio */}
            {model.bio && (
              <p className="text-sm leading-relaxed mb-6 max-w-2xl" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {model.bio}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {model.height && <StatBadge label="Height" value={model.height} />}
              {model.hair_color && <StatBadge label="Hair" value={model.hair_color} />}
              {model.eye_color && <StatBadge label="Eyes" value={model.eye_color} />}
              {model.nationality && <StatBadge label="Nationality" value={model.nationality} />}
            </div>
          </div>
        </div>

        {/* Posts section */}
        <div className="px-4 md:px-5">
          <h2 className="text-lg font-bold text-white mb-5 tracking-tight">
            Collections ({posts.length})
          </h2>
          {posts.length === 0 ? (
            <div className="py-16 text-center text-white/30">No collections yet</div>
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
