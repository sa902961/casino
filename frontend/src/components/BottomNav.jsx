import { Link, useLocation } from 'react-router-dom'
import './BottomNav.css'

const TABS = [
  { to: '/lobby',       icon: '🏠', label: '大廳' },
  { to: '/promotions',  icon: '🎁', label: '優惠' },
  { to: '/recharge',    icon: '💳', label: '儲值' },
  { to: '/leaderboard', icon: '🏆', label: '排行' },
  { to: '/profile',     icon: '👤', label: '我的' },
]

export default function BottomNav() {
  const loc = useLocation()
  return (
    <nav className="bottom-nav">
      {TABS.map(t => (
        <Link key={t.to} to={t.to} className={`bn-item ${loc.pathname.startsWith(t.to)?'active':''}`}>
          <span className="bn-icon">{t.icon}</span>
          <span className="bn-label">{t.label}</span>
        </Link>
      ))}
    </nav>
  )
}
