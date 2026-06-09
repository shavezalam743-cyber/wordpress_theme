import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'

function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 80% 10%, rgba(255,90,60,0.07) 0%, transparent 50%), radial-gradient(ellipse at 20% 90%, rgba(200,40,40,0.05) 0%, transparent 50%)',
        }}
      />
      <motion.div
        animate={{ y: [0, -28, 0], x: [0, 14, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-32 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,90,60,0.06) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ y: [0, 22, 0], x: [0, -12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-40 left-72 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(180,30,30,0.04) 0%, transparent 70%)' }}
      />
    </div>
  )
}

type Props = {
  children: React.ReactNode
}

export function Layout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <BackgroundEffects />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="relative z-10 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: undefined }}
      >
        {/* Desktop left offset via CSS class */}
        <div className="lg:ml-[220px] flex flex-col min-h-screen">
          <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />
          <main className="flex-1 pt-[62px]">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
