import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Globe } from 'lucide-react'
import type { Model } from '@/lib/supabase'

type Props = {
  model: Model
  index: number
}

export function ModelCard({ model, index }: Props) {
  const [hovered, setHovered] = useState(false)
  const displayName = model.stage_name || model.name

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5), ease: [0.23, 1, 0.32, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
        border: hovered ? '1px solid rgba(255,90,60,0.35)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: hovered
          ? '0 24px 60px rgba(0,0,0,0.55), 0 8px 32px rgba(255,90,60,0.1)'
          : '0 8px 32px rgba(0,0,0,0.3)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <Link to={`/model/${model.slug}`} className="block">
        {/* Cover image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
          {model.cover_image ? (
            <motion.img
              src={model.cover_image}
              alt={displayName}
              className="w-full h-full object-cover"
              animate={{ scale: hovered ? 1.07 : 1 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <span className="text-4xl font-bold text-white/20">{displayName[0]}</span>
            </div>
          )}

          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)' }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {model.is_trending && (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white tracking-wider"
                style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 2px 8px rgba(255,90,60,0.4)' }}
              >
                <TrendingUp className="w-2.5 h-2.5" />
                HOT
              </span>
            )}
          </div>

          {/* Bottom name */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-bold text-base leading-tight">{displayName}</p>
            {model.name !== displayName && (
              <p className="text-white/50 text-xs mt-0.5">{model.name}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              {model.country && (
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <Globe className="w-2.5 h-2.5" />
                  <span>{model.country}</span>
                </div>
              )}
              {model.age && (
                <span className="text-xs text-white/40">{model.age} yrs</span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, rgba(255,90,60,0.2), rgba(255,120,78,0.2))', border: '1px solid rgba(255,90,60,0.3)' }}
          >
            View Profile
          </div>
          {model.is_popular && (
            <span className="text-xs text-white/35 font-medium">Popular</span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
