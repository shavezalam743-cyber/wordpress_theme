import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, Check, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { useSEO } from '@/hooks/useSEO'

export function ResetPasswordPage() {
  useSEO({ title: 'Reset Password', description: 'Set a new password for your account' })

  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  // Supabase sends the reset token as a hash fragment; the client picks it up automatically
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
    setTimeout(() => navigate('/login'), 3000)
  }

  if (hasSession === null) {
    return (
      <>
        <Header />
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#ff5a3c', borderTopColor: 'transparent' }} />
        </div>
      </>
    )
  }

  if (!hasSession) {
    return (
      <>
        <Header />
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(255,90,60,0.15)' }}
            >
              <AlertTriangle className="w-8 h-8" style={{ color: '#ff5a3c' }} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Link expired or invalid</h1>
            <p className="text-sm text-white/50 mb-8">
              This password reset link has expired. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}
            >
              Request new link
            </Link>
          </motion.div>
        </div>
      </>
    )
  }

  if (success) {
    return (
      <>
        <Header />
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}
            >
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Password updated!</h1>
            <p className="text-sm text-white/50 mb-2">
              Your password has been changed successfully.
            </p>
            <p className="text-xs text-white/30">Redirecting to login...</p>
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
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <div
            className="rounded-2xl p-6 md:p-8"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Set new password</h1>
            <p className="text-sm text-white/50 mb-8">Choose a strong password for your account</p>

            {error && (
              <div
                className="mb-6 p-4 rounded-xl text-sm"
                style={{ background: 'rgba(255,90,60,0.15)', border: '1px solid rgba(255,90,60,0.3)', color: '#ff784e' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-11 pr-11 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="Re-enter your password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: `1px solid ${confirm && confirm !== password ? 'rgba(255,90,60,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  />
                </div>
                {confirm && confirm !== password && (
                  <p className="text-xs mt-1.5" style={{ color: '#ff5a3c' }}>Passwords do not match</p>
                )}
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
                Update Password
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  )
}
