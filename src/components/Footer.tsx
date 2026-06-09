import { Link } from 'react-router-dom'
import { Flame, Send, AtSign, MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer
      className="mt-auto py-10 px-5"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 12px rgba(255,90,60,0.35)' }}
              >
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-white">leaks<span style={{ color: '#ff5a3c' }}>haven</span></span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Premium content directory. Browse exclusive creator collections.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[
                { icon: Send, href: '#' },
                { icon: AtSign, href: '#' },
                { icon: MessageCircle, href: '#' },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                </a>
              ))}
            </div>
          </div>

          {/* Browse */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Browse</p>
            <ul className="space-y-2.5">
              {[
                { label: 'All Collections', to: '/' },
                { label: 'Trending', to: '/?sort=trending' },
                { label: 'Most Viewed', to: '/?sort=views' },
                { label: 'Newest', to: '/?sort=newest' },
                { label: 'Mega Collections', to: '/mega' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Discover</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Models', to: '/models' },
                { label: 'Categories', to: '/categories' },
                { label: 'Search', to: '/search' },
                { label: 'Lifestyle', to: '/category/lifestyle' },
                { label: 'Fashion', to: '/category/fashion' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Account</p>
            <ul className="space-y-2.5">
              {[
                { label: 'My Account', to: '/account' },
                { label: 'My Lists', to: '/mega' },
                { label: 'Plans & Pricing', to: '/account#plans' },
                { label: 'Rewards', to: '/account#rewards' },
                { label: 'Support', to: '#' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            &copy; {new Date().getFullYear()} LeaksHaven. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy Policy', 'Terms of Service', 'DMCA'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs transition-colors hover:text-white"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
