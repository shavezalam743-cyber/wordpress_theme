import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { useSEO } from '@/hooks/useSEO'

export function ForgotPasswordPage() {
  useSEO({ title: 'Forgot Password', description: 'Reset your password' })

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <>
        <Header />
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}>
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Check your email</h1>
            <p className="text-sm text-white/50 mb-8">
              We've sent a password reset link to <strong className="text-white">{email}</strong>
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 text-sm hover:underline" style={{ color: '#ff5a3c' }}>
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <div className="rounded-2xl p-6 md:p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Forgot password?</h1>
            <p className="text-sm text-white/50 mb-8">Enter your email and we'll send you a reset link</p>

            {error && (
              <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(255,90,60,0.15)', border: '1px solid rgba(255,90,60,0.3)', color: '#ff784e' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 8px 28px rgba(255,90,60,0.4)' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Send Reset Link
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  )
}
