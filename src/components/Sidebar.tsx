import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, MessageCircle, User,
  BookMarked, CreditCard, Gift,
  MessageSquare, Key, ChevronDown, Flame, X,
  Search, Grid3X3, Settings, Users, TrendingUp, Star, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase, type Model } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

type NavItem = {
  icon: React.ElementType
  label: string
  to: string
  disabled?: boolean
}

const menuItems: NavItem[] = [
  { icon: LayoutGrid, label: 'Browse', to: '/' },
  { icon: Users, label: 'Models', to: '/models' },
  { icon: Grid3X3, label: 'Categories', to: '/categories' },
  { icon: Search, label: 'Search', to: '/search' },
  { icon: MessageCircle, label: 'Chat', to: '/chat', disabled: true },
  { icon: User, label: 'Account', to: '/account' },
]

const libraryItems: NavItem[] = [
  { icon: BookMarked, label: 'My Lists', to: '/mega' },
  { icon: CreditCard, label: 'Plans', to: '/account#plans', disabled: true },
  { icon: Gift, label: 'Rewards', to: '/account#rewards', disabled: true },
]

function SidebarItem({ item }: { item: NavItem }) {
  if (item.disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed opacity-35">
        <item.icon className="w-4 h-4 text-white/40" />
        <span className="text-white/45">{item.label}</span>
      </div>
    )
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
          isActive ? 'text-white' : 'text-white/60 hover:text-white'
        )
      }
      style={({ isActive }) =>
        isActive ? { background: 'rgba(255,255,255,0.08)' } : undefined
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute left-0 w-0.5 h-6 rounded-r-full"
              style={{ background: 'linear-gradient(180deg, #ff5a3c, #ff784e)' }}
            />
          )}
          <item.icon
            className={cn(
              'w-4 h-4 transition-colors',
              isActive ? 'text-white' : 'text-white/45 group-hover:text-white/80'
            )}
          />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

function ModelsMiniList() {
  const [models, setModels] = useState<Model[]>([])
  const [tab, setTab] = useState<'trending' | 'popular' | 'new'>('trending')

  useEffect(() => {
    let q = supabase.from('models').select('id, name, slug, stage_name, cover_image, is_trending, is_popular, created_at')
    if (tab === 'trending') q = q.eq('is_trending', true).order('created_at', { ascending: false })
    else if (tab === 'popular') q = q.eq('is_popular', true).order('created_at', { ascending: false })
    else q = q.order('created_at', { ascending: false })

    q.limit(5).then(({ data }) => {
      if (data) setModels(data as Model[])
    })
  }, [tab])

  const tabs = [
    { id: 'trending' as const, icon: TrendingUp },
    { id: 'popular' as const, icon: Star },
    { id: 'new' as const, icon: Sparkles },
  ]

  return (
    <div className="px-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[10px] font-semibold tracking-widest text-white/25 uppercase">Models</p>
        <div className="flex gap-0.5">
          {tabs.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'w-6 h-6 flex items-center justify-center rounded-lg transition-colors',
                tab === id ? 'text-white' : 'text-white/25 hover:text-white/50'
              )}
              style={tab === id ? { background: 'rgba(255,90,60,0.2)' } : undefined}
            >
              <Icon className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-0.5">
        {models.slice(0, 5).map(model => (
          <NavLink
            key={model.id}
            to={`/model/${model.slug}`}
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/[0.05] transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,90,60,0.2)' }}>
              {model.cover_image ? (
                <img src={model.cover_image} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{(model.stage_name || model.name)[0]}</span>
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors truncate">
              {model.stage_name || model.name}
            </span>
          </NavLink>
        ))}

        {models.length === 0 && (
          <p className="text-xs text-white/20 px-2 py-3 text-center">No models found</p>
        )}

        <NavLink
          to="/models"
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white/35 hover:text-white/60 transition-colors mt-1"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          View all models
        </NavLink>
      </div>
    </div>
  )
}

type Props = {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: Props) {
  const { isAdmin } = useAuth()

  return (
    <AnimatePresence>
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-[220px] z-40 flex flex-col overflow-hidden transition-transform duration-300',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '4px 0 40px rgba(255,90,60,0.06)',
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,90,60,0.18) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />

        {/* Logo + close on mobile */}
        <div className="flex items-center justify-between px-5 py-6">
          <NavLink to="/" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 16px rgba(255,90,60,0.4)' }}
            >
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-white font-bold text-lg tracking-tight">leaks</span>
              <span className="font-bold text-lg tracking-tight" style={{ color: '#ff5a3c' }}>haven</span>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-4 space-y-5">
          {/* Menu */}
          <div className="px-3">
            <p className="text-[10px] font-semibold tracking-widest text-white/25 uppercase px-1 mb-2">Menu</p>
            <nav className="space-y-0.5">
              {menuItems.map((item) => (
                <SidebarItem key={item.label} item={item} />
              ))}
            </nav>
          </div>

          {/* Library */}
          <div className="px-3">
            <p className="text-[10px] font-semibold tracking-widest text-white/25 uppercase px-1 mb-2">Library</p>
            <nav className="space-y-0.5">
              {libraryItems.map((item) => (
                <SidebarItem key={item.label} item={item} />
              ))}
            </nav>
          </div>

          {/* Models mini section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <ModelsMiniList />
          </div>
        </div>

        {/* Bottom section */}
        <div className="px-3 pb-5 space-y-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <MessageSquare className="w-4 h-4 text-green-400" />
            <span>Support-Chat</span>
          </motion.button>

          {isAdmin && (
            <NavLink
              to="/admin"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Settings className="w-4 h-4 text-white/35" />
              <span>Admin Dashboard</span>
            </NavLink>
          )}

          <div className="flex items-center gap-2 px-4 py-2">
            <div
              className="w-5 h-3 rounded-sm flex-shrink-0 overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #012169 33%, #fff 33%, #fff 66%, #C8102E 66%)' }}
            />
            <span className="text-sm text-white/55 flex-1">English</span>
            <ChevronDown className="w-3 h-3 text-white/30" />
          </div>

          <div
            className="flex items-center justify-between px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" style={{ color: '#ff5a3c' }} />
              <span className="text-sm font-bold text-white">3</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors text-sm font-bold"
              style={{ background: 'rgba(255,90,60,0.2)', border: '1px solid rgba(255,90,60,0.3)' }}
            >
              +
            </motion.button>
          </div>
        </div>
      </aside>
    </AnimatePresence>
  )
}
