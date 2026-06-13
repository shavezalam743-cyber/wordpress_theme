import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, SlidersHorizontal, ChevronDown, Users,
  Grid3X3, Clock, TrendingUp, Eye, Shuffle,
  HardDrive, History, Menu, User, Settings, LogOut, Coins, Crown,
  LayoutGrid, MessageCircle, Bookmark, CreditCard, Gift, MessageSquare
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { NotificationBell } from '@/components/NotificationPanel'

export type SortOption = 'newest' | 'trending' | 'popular' | 'views' | 'random' | 'size' | 'history' | 'oldest'

type Props = {
  onMenuToggle?: () => void
  search?: string
  onSearch?: (val: string) => void
  sort?: SortOption
  onSort?: (val: SortOption) => void
  showSortFilter?: boolean
}

const sortOptions: { value: SortOption; label: string; icon: React.ElementType; note?: string }[] = [
  { value: 'newest', label: 'NEW', icon: Clock },
  { value: 'trending', label: 'HOT', icon: TrendingUp },
  { value: 'popular', label: 'MY FEED', icon: Users, note: 'with Account' },
  { value: 'views', label: 'VIEWS', icon: Eye },
  { value: 'random', label: 'RANDOM', icon: Shuffle },
  { value: 'size', label: 'SIZE', icon: HardDrive },
  { value: 'history', label: 'HISTORY', icon: History, note: 'with Account' },
  { value: 'oldest', label: 'OLDEST', icon: Clock },
]

export function Header({
  onMenuToggle,
  search = '',
  onSearch,
  sort = 'newest',
  onSort,
  showSortFilter = true, // Ise true rakha hai taaki filter hamesha dikhe
}: Props) {
  const [sortOpen, setSortOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false) 
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null) 
  const navigate = useNavigate()
  const { user, profile, signOut, isAdmin } = useAuth()

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false) 
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`)
    }
  }

  async function handleSignOut() {
    await signOut()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center gap-2 md:gap-3 px-3 md:px-5 py-3"
      style={{
        left: 0,
        background: 'rgba(8,8,8,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* MOBILE HAMBURGER MENU DROPDOWN */}
      <div className="relative lg:hidden" ref={mobileMenuRef}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-white/55 hover:text-white flex-shrink-0 transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Menu className="w-4 h-4" />
        </motion.button>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-3 left-0 rounded-2xl overflow-hidden z-50 py-4 w-[260px] max-h-[85vh] overflow-y-auto"
              style={{
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              }}
            >
              <div className="px-4 mb-4">
                <p className="text-xs font-bold text-white/30 tracking-widest uppercase mb-3 px-2">Menu</p>
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 mb-1">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#ff5a3c] rounded-r-md"></div>
                  <LayoutGrid className="w-4 h-4" />
                  Browse
                </Link>
                <Link to="/models" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors mb-1">
                  <Users className="w-4 h-4" />
                  Models
                </Link>
                <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors mb-1">
                  <Grid3X3 className="w-4 h-4" />
                  Categories
                </Link>
                <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors mb-1">
                  <Search className="w-4 h-4" />
                  Search
                </Link>
                <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors mb-1">
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </Link>
                <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                  <User className="w-4 h-4" />
                  Account
                </Link>
              </div>

              <div className="px-4 mb-4">
                <p className="text-xs font-bold text-white/30 tracking-widest uppercase mb-3 px-2">Library</p>
                <Link to="/lists" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors mb-1">
                  <Bookmark className="w-4 h-4" />
                  My Lists
                </Link>
                <Link to="/plans" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors mb-1">
                  <CreditCard className="w-4 h-4" />
                  Plans
                </Link>
                <Link to="/rewards" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                  <Gift className="w-4 h-4" />
                  Rewards
                </Link>
              </div>

              <div className="px-4 pt-2 pb-2 border-t border-white/5">
                <Link to="/support" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-sm font-medium text-white/80 border border-white/10 hover:bg-white/5 transition-colors">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                  Support-Chat
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden lg:block flex-shrink-0" style={{ width: '220px' }} />

      {/* SEARCH BAR */}
      <div
        className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl min-w-0"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        <Search className="w-4 h-4 text-white/35 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch?.(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search creators, collections..."
          className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none min-w-0"
        />
      </div>

      {/* 🟢 ORANGE FILTER BUTTON JISME AB DROPDOWN CHALEGA 🟢 */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortOpen(!sortOpen)} // Yeh line main issue thi! Ab click par khulega
          className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #ff5a3c, #ff784e)',
            boxShadow: '0 4px 20px rgba(255,90,60,0.4)',
          }}
        >
          <SlidersHorizontal className="w-4 h-4 text-white pointer-events-none" />
        </motion.button>

        {/* YE RAHI FILTER KI LIST JO AB MOBILE PAR BHI DIKHEGI */}
        <AnimatePresence>
          {sortOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-3 right-0 rounded-xl overflow-hidden z-50 py-1.5"
              style={{
                background: 'rgba(16,16,16,0.98)',
                backdropFilter: 'blur(32px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                minWidth: '210px',
              }}
            >
              {sortOptions.map((opt) => {
                const Icon = opt.icon
                const isActive = sort === opt.value
                return (
                  <motion.button
                    key={opt.value}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                    onClick={() => { onSort?.(opt.value); setSortOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                  >
                    <Icon className="w-4 h-4 text-white/35" />
                    <span
                      className="tracking-wider font-medium flex-1 text-left"
                      style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.55)' }}
                    >
                      {opt.label}
                    </span>
                    {opt.note && <span className="text-xs text-white/22">{opt.note}</span>}
                    {isActive && (
                      <svg className="w-3.5 h-3.5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop right nav buttons */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        <Link to="/models">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/65 hover:text-white transition-all cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Users className="w-4 h-4" />
            <span>Models</span>
          </motion.div>
        </Link>
        <Link to="/categories">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/65 hover:text-white transition-all cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Categories</span>
          </motion.div>
        </Link>
        {user && <NotificationBell />}
        
        {/* User Profile Menu (Desktop) */}
        {user ? (
          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
              style={{ background: userMenuOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-lg object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}>
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <ChevronDown
                className="w-3.5 h-3.5 text-white/40 transition-transform"
                style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </motion.button>
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="absolute top-full mt-2 right-0 rounded-xl overflow-hidden z-50 py-1.5 min-w-56"
                  style={{
                    background: 'rgba(16,16,16,0.98)',
                    backdropFilter: 'blur(32px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                  }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-sm font-medium text-white">{profile?.name ?? 'User'}</p>
                    <p className="text-xs text-white/50">{profile?.email}</p>
                  </div>
                  <Link to="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link to="/login">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 16px rgba(255,90,60,0.4)' }}
            >
              <User className="w-4 h-4" />
              Login
            </motion.div>
          </Link>
        )}
      </div>

      {/* Mobile User Avatar */}
      <div className="md:hidden">
        {user ? (
          <Link to="/account" className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-lg object-cover" />
            ) : (
              <User className="w-4 h-4 text-white/60" />
            )}
          </Link>
        ) : (
          <Link to="/login" className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}>
            <User className="w-4 h-4 text-white" />
          </Link>
        )}
      </div>
    </header>
  )
}