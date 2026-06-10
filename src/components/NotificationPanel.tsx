import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Trash2, Loader2 } from 'lucide-react'
import { supabase, type Notification } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { formatTime } from '@/lib/supabase'

const typeColors: Record<string, string> = {
  system: '#ff5a3c',
  content: '#3b82f6',
  promo: '#10b981',
  subscription: '#f59e0b',
  coins: '#8b5cf6'
}

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!user) return

    fetchNotifications()

    const channelName = `notifications_${user.id}`
    const channel = supabase.channel(channelName)

    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    }, (payload) => {
      setNotifications(prev => [payload.new as Notification, ...prev])
    })

    channel.subscribe()

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [user])

  async function fetchNotifications() {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) setNotifications(data as Notification[])
    setLoading(false)
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user!.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (!user) return null

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
        style={{ background: open ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)' }}
      >
        <Bell className="w-5 h-5 text-white/70" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: '#ff5a3c', padding: '0 6px' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 md:w-96 rounded-2xl overflow-hidden z-50"
              style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="font-bold text-white">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                      style={{ color: '#ff5a3c' }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                    <X className="w-4 h-4 text-white/50" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-white/30" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 text-center text-white/40 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                      style={{
                        background: n.read ? 'transparent' : 'rgba(255,90,60,0.05)',
                        borderLeft: `3px solid ${n.read ? 'transparent' : typeColors[n.type] ?? '#ff5a3c'}`
                      }}
                      onClick={() => !n.read && markAsRead(n.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: typeColors[n.type] ?? '#ff5a3c' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{n.title}</p>
                          <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-white/30 mt-1">{formatTime(n.created_at)}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white/30" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
