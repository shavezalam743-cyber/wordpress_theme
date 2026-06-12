import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Key, CreditCard, Gift, Shield, Bell, ChevronRight, Check, LogOut, Crown, Coins } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuth } from '@/lib/auth'
import { useSEO } from '@/hooks/useSEO'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden mb-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-semibold tracking-widest text-white/35 uppercase">{title}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}

function SettingRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: React.ElementType
  label: string
  value?: string
  onClick?: () => void
}) {
  return (
    <motion.button
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 transition-colors text-left"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      >
        <Icon className="w-4 h-4 text-white/50" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {value && <p className="text-xs text-white/35 mt-0.5 truncate">{value}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
    </motion.button>
  )
}

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['Browse all collections', 'Basic search', '3 keys / month'],
    gradient: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.1)',
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$9.99',
    period: 'per month',
    features: ['Unlimited keys', 'Priority access', 'Early releases', 'HD content'],
    gradient: 'linear-gradient(135deg, rgba(255,90,60,0.15), rgba(255,120,78,0.08))',
    border: 'rgba(255,90,60,0.3)',
    accent: true,
  },
  {
    id: 'pro_plus' as const,
    name: 'Pro+',
    price: '$24.99',
    period: 'per month',
    features: ['Everything in Pro', 'Exclusive content', 'Private collections', 'Discord access'],
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.08))',
    border: 'rgba(168,85,247,0.3)',
  },
]

export function AccountPage() {
  useSEO({ title: 'My Account', description: 'Manage your account and subscription' })

  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  const displayName = profile?.name ?? user?.email?.split('@')[0] ?? 'User'
  const displayEmail = profile?.email ?? user?.email ?? ''
  const tier = profile?.subscription_tier ?? 'free'
  const coins = profile?.coins ?? 0

  const tierLabel: Record<string, string> = {
    free: 'Free Plan',
    pro: 'Pro Member',
    pro_plus: 'Pro+ Member',
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    navigate('/')
  }

  return (
    <>
      <Header />
      <div className="px-4 md:px-5 pb-12 pt-6 max-w-2xl">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 8px 24px rgba(255,90,60,0.35)' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{displayName}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-sm text-white/40">{tierLabel[tier] ?? 'Free Plan'}</p>
              {tier !== 'free' && (
                <div className="flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
                  <span className="text-xs" style={{ color: '#f59e0b' }}>{tier === 'pro_plus' ? 'Pro+' : 'Pro'}</span>
                </div>
              )}
            </div>
            {displayEmail && (
              <p className="text-xs text-white/30 mt-0.5 truncate">{displayEmail}</p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </motion.button>
        </div>

        {/* Coins & Keys row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <Coins className="w-5 h-5 flex-shrink-0" style={{ color: '#f59e0b' }} />
            <div>
              <p className="text-sm font-bold text-white">{coins.toLocaleString()}</p>
              <p className="text-xs text-white/40">Coins</p>
            </div>
          </div>

          <div
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: 'rgba(255,90,60,0.08)', border: '1px solid rgba(255,90,60,0.2)' }}
          >
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 flex-shrink-0" style={{ color: '#ff5a3c' }} />
              <div>
                <p className="text-sm font-bold text-white">3</p>
                <p className="text-xs text-white/40">Keys</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}
            >
              + Get More
            </motion.button>
          </div>
        </div>

        {/* Settings sections */}
        <Section title="Profile">
          <SettingRow icon={User} label="Display Name" value={displayName} />
          <SettingRow icon={Bell} label="Notifications" value="Configure alerts" />
          <SettingRow icon={Shield} label="Privacy" value="Manage visibility" />
        </Section>

        {isAdmin && (
          <Section title="Admin">
            <SettingRow
              icon={Shield}
              label="Admin Dashboard"
              value="Manage the entire site"
              onClick={() => navigate('/admin')}
            />
          </Section>
        )}

        {/* Plans section */}
        <div id="plans" className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4 tracking-tight">Plans & Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map((plan) => {
              const isCurrent = tier === plan.id
              return (
                <div
                  key={plan.id}
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{ background: plan.gradient, border: `1px solid ${plan.border}` }}
                >
                  {isCurrent && (
                    <span
                      className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium text-white/60"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      Current
                    </span>
                  )}
                  <p className="text-base font-bold text-white mb-0.5">{plan.name}</p>
                  <p className="text-2xl font-extrabold text-white leading-tight">{plan.price}</p>
                  <p className="text-xs text-white/35 mb-4">{plan.period}</p>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-white/55">
                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: isCurrent ? 1 : 1.03 }}
                    whileTap={{ scale: isCurrent ? 1 : 0.97 }}
                    disabled={isCurrent}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:cursor-default"
                    style={
                      isCurrent
                        ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                        : plan.accent
                        ? { background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', color: '#fff', boxShadow: '0 4px 16px rgba(255,90,60,0.35)' }
                        : { background: 'rgba(255,255,255,0.1)', color: '#fff' }
                    }
                  >
                    {isCurrent ? 'Current Plan' : 'Upgrade'}
                  </motion.button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rewards */}
        <div id="rewards">
          <Section title="Rewards">
            <SettingRow icon={Gift} label="My Rewards" value="0 points earned" />
            <SettingRow icon={CreditCard} label="Referral Program" value="Earn keys by inviting friends" />
          </Section>
        </div>
      </div>
    </>
  )
}
