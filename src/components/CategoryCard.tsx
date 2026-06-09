import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { Category } from '@/lib/supabase'

const categoryGradients: Record<string, string> = {
  lifestyle: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
  fashion: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  fitness: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  art: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  travel: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
}

const categoryEmojis: Record<string, string> = {
  lifestyle: '✨',
  fashion: '👗',
  fitness: '💪',
  art: '🎨',
  travel: '✈️',
}

type Props = {
  category: Category
  postCount?: number
  index: number
}

export function CategoryCard({ category, postCount, index }: Props) {
  const [hovered, setHovered] = useState(false)
  const gradient = categoryGradients[category.slug] ?? 'linear-gradient(135deg, #ff5a3c, #ff784e)'
  const emoji = categoryEmojis[category.slug] ?? '📁'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.08, 0.5), ease: [0.23, 1, 0.32, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6, scale: 1.02 }}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: hovered
          ? `linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)`
          : `linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
        border: hovered ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
      }}
    >
      <Link to={`/category/${category.slug}`} className="block p-6">
        {/* Icon */}
        <div className="flex items-start justify-between mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: gradient, boxShadow: `0 8px 24px rgba(0,0,0,0.3)` }}
          >
            {emoji}
          </div>
          <motion.div
            animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.3 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </motion.div>
        </div>

        {/* Info */}
        <h3 className="text-white font-bold text-lg mb-1.5 tracking-tight">{category.name}</h3>
        {category.description && (
          <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {category.description}
          </p>
        )}

        {/* Gradient bar + post count */}
        <div className="flex items-center justify-between">
          <div className="flex-1 h-0.5 rounded-full mr-3 opacity-60" style={{ background: gradient }} />
          {postCount !== undefined && (
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {postCount} collections
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
