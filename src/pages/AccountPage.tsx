import { motion } from 'framer-motion'
import { User, Key, CreditCard, Gift, Shield, Bell, ChevronRight, Check } from 'lucide-react'
import { Header } from '@/components/Header'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden mb-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
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
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['Browse all collections', 'Basic search', '3 keys / month'],
    current: true,
    gradient: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.1)',
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: 'per month',
    features: ['Unlimited keys', 'Priority access', 'Early releases', 'HD content'],
    gradient: 'linear-gradient(135deg, rgba(255,90,60,0.15), rgba(255,120,78,0.08))',
    border: 'rgba(255,90,60,0.3)',
    accent: true,
  },
  {
    name: 'Elite',
    price: '$24.99',
    period: 'per month',
    features: ['Everything in Pro', 'Exclusive content', 'Private collections', 'Discord access'],
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.08))',
    border: 'rgba(168,85,247,0.3)',
  },
]

export function AccountPage() {
  return (
    <>
      <Header />
      <div className="px-4 md:px-5 pb-12 pt-6 max-w-2xl">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 8px 24px rgba(255,90,60,0.35)' }}
          >
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Guest User</h1>
            <p className="text-sm text-white/40 mt-0.5">Free Plan · 3 keys remaining</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 16px rgba(255,90,60,0.35)' }}
          >
            Sign In
          </motion.button>
        </div>

        {/* Keys */}
        <div
          className="flex items-center justify-between p-5 rounded-2xl mb-6"
          style={{ background: 'rgba(255,90,60,0.08)', border: '1px solid rgba(255,90,60,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5" style={{ color: '#ff5a3c' }} />
            <div>
              <p className="text-sm font-bold text-white">3 Keys Available</p>
              <p className="text-xs text-white/40 mt-0.5">Resets monthly</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}
          >
            Get More Keys
          </motion.button>
        </div>

        {/* Settings sections */}
        <Section title="Profile">
          <SettingRow icon={User} label="Display Name" value="Set your username" />
          <SettingRow icon={Bell} label="Notifications" value="Configure alerts" />
          <SettingRow icon={Shield} label="Privacy" value="Manage visibility" />
        </Section>

        {/* Plans section */}
        <div id="plans" className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4 tracking-tight">Plans & Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: plan.gradient, border: `1px solid ${plan.border}` }}
              >
                {plan.current && (
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
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={
                    plan.current
                      ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                      : plan.accent
                      ? { background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', color: '#fff', boxShadow: '0 4px 16px rgba(255,90,60,0.35)' }
                      : { background: 'rgba(255,255,255,0.1)', color: '#fff' }
                  }
                >
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </motion.button>
              </div>
            ))}
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
