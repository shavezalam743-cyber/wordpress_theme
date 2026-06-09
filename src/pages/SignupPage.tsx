import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Header } from '@/components/Header'
import { useSEO } from '@/hooks/useSEO'

export function SignupPage() {
  useSEO({ title: 'Create Account', description: 'Sign up for a free account' })

  const { signUp } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password, name)

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
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Check your inbox</h1>
            <p className="text-sm text-white/50 mb-8">
              We've sent a confirmation link to <strong className="text-white">{email}</strong>. Click the link to verify your email and activate your account.
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
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Link>

          <div className="rounded-2xl p-6 md:p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Create account</h1>
            <p className="text-sm text-white/50 mb-8">Join to access exclusive content and features</p>

            {error && (
              <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(255,90,60,0.15)', border: '1px solid rgba(255,90,60,0.3)', color: '#ff784e' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full pl-11 pr-11 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2"
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="w-4 h-4 mt-0.5 rounded" style={{ accentColor: '#ff5a3c' }} />
                <span className="text-xs text-white/50 leading-relaxed">
                  I agree to the <Link to="/terms" className="hover:underline" style={{ color: '#ff5a3c' }}>Terms of Service</Link> and{' '}
                  <Link to="/privacy" className="hover:underline" style={{ color: '#ff5a3c' }}>Privacy Policy</Link>
                </span>
              </label>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 8px 28px rgba(255,90,60,0.4)' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Account
              </motion.button>
            </form>

            <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-center text-sm text-white/50">
                Already have an account?{' '}
                <Link to="/login" className="text-white hover:underline" style={{ color: '#ff5a3c' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
