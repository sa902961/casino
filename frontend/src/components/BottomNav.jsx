import { Link, useLocation } from 'react-router-dom'
import './BottomNav.css'

const TABS = [
  { to: '/lobby',      icon: '🏠', label: '首頁' },
  { to: '/game-intro', icon: '🎮', label: '遊戲介紹' },
  { to: '/recharge',   icon: '💰', label: '儲值' },
  { to: '/support',    icon: '🎧', label: '客服' },
  { to: '/profile',    icon: '👤', label: '會員中心' },
]

export default function BottomNav() {
  const loc = useLocation()
  const isActive = (to) => {
    if (to === '/lobby') return loc.pathname === '/lobby' || loc.pathname.startsWith('/game/')
    return loc.pathname.startsWith(to)
  }

  return (
    <nav className="bottom-nav">
      {TABS.map((t, i) => {
        const active = isActive(t.to)
        // Center "儲值" button gets a special raised style
        const isCenter = i === 2
        return (
          <Link
            key={t.to}
            to={t.to}
            className={`bn-item ${active ? 'active' : ''} ${isCenter ? 'bn-center' : ''}`}
          >
            {isCenter ? (
              <div className="bn-center-bubble">
                <span className="bn-icon">{t.icon}</span>
              </div>
            ) : (
              <span className="bn-icon">{t.icon}</span>
            )}
            <span className="bn-label">{t.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
