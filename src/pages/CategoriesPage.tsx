import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { CategoryCard } from '@/components/CategoryCard'
import { supabase, type Category } from '@/lib/supabase'
import { useSEO } from '@/hooks/useSEO'

export function CategoriesPage() {
  useSEO({ title: 'Categories', description: 'Browse content by category. Discover lifestyle, fashion, fitness and more creator collections.' })
  const [categories, setCategories] = useState<Category[]>([])
  const [postCounts, setPostCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: posts }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('posts').select('category_id').not('category_id', 'is', null),
      ])
      if (cats) setCategories(cats as Category[])
      if (posts) {
        const counts: Record<string, number> = {}
        for (const p of posts as { category_id: string }[]) {
          counts[p.category_id] = (counts[p.category_id] ?? 0) + 1
        }
        setPostCounts(counts)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <Header />
      <div className="px-4 md:px-5 pb-12 pt-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Categories</h1>
          <p className="text-sm mt-1 text-white/40">Browse content by category</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl animate-pulse"
                style={{ height: '180px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                postCount={postCounts[cat.id] ?? 0}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
