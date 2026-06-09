import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Link2, Check, Send, MessageCircle } from 'lucide-react'

type Platform = 'telegram' | 'whatsapp' | 'twitter' | 'facebook' | 'copy'

const platforms: { id: Platform; name: string; icon: React.ElementType; color: string }[] = [
  { id: 'telegram', name: 'Telegram', icon: Send, color: '#0088cc' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  { id: 'twitter', name: 'X (Twitter)', icon: Share2, color: '#000000' },
  { id: 'facebook', name: 'Facebook', icon: Share2, color: '#1877f2' },
  { id: 'copy', name: 'Copy Link', icon: Link2, color: '#ff5a3c' }
]

type ShareModalProps = {
  open: boolean
  onClose: () => void
  url: string
  title: string
}

export function ShareModal({ open, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = encodeURIComponent(url)
  const shareTitle = encodeURIComponent(title)

  const links: Record<Platform, string> = {
    telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    copy: '#'
  }

  function handleShare(platform: Platform) {
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    } else {
      window.open(links[platform], '_blank', 'width=600,height=400')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Share</h3>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {platforms.map(({ id, name, icon: Icon, color }) => (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare(id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: `${color}20` }}
                    >
                      {id === 'copy' && copied ? (
                        <Check className="w-5 h-5" style={{ color }} />
                      ) : (
                        <Icon className="w-5 h-5" style={{ color }} />
                      )}
                    </div>
                    <span className="text-xs text-white/70">
                      {id === 'copy' ? (copied ? 'Copied!' : 'Copy') : name}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Link2 className="w-4 h-4 text-white/30 flex-shrink-0" />
                <p className="text-xs text-white/50 truncate flex-1">{url}</p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Share2 className="w-4 h-4" />
        Share
      </motion.button>
      <ShareModal open={open} onClose={() => setOpen(false)} url={url} title={title} />
    </>
  )
}
