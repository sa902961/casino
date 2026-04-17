import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Navbar.css'

const DRAWER_ITEMS = [
  { icon: '🏠', label: '首頁',     to: '/' },
  { icon: '🎮', label: '遊戲介紹', to: '/game-intro' },
  { icon: '🎰', label: '遊戲大廳', to: '/lobby' },
  { icon: '🎁', label: '優惠活動', to: '/promotions' },
  { icon: '💰', label: '儲值購點', to: '/recharge' },
  { icon: '🎧', label: '客服中心', to: '/support' },
  { icon: '👤', label: '會員中心', to: '/profile' },
  { icon: '🏆', label: '排行榜',   to: '/leaderboard' },
]

export default function Navbar({ onLoginClick, onRegisterClick }) {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const nav = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef(null)

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [loc.pathname])

  // Close on outside click
  useEffect(() => {
    if (!drawerOpen) return
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [drawerOpen])

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* ☰ Hamburger — left */}
          <button
            className="navbar-hamburger"
            onClick={() => setDrawerOpen(v => !v)}
            aria-label="選單"
          >
            <span className={`ham-line ${drawerOpen ? 'open' : ''}`} />
            <span className={`ham-line ${drawerOpen ? 'open' : ''}`} />
            <span className={`ham-line ${drawerOpen ? 'open' : ''}`} />
          </button>

          {/* Logo — center on mobile, left-ish on desktop */}
          <Link to="/" className="navbar-logo">
            <img
              src="/logo.svg"
              alt="爽爽贏Online"
              className="logo-img"
              onError={e => { e.target.style.display = 'none' }}
            />
            <span className="logo-text">
              爽爽贏<span>Online</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="navbar-links">
            <Link to="/lobby"       className={loc.pathname === '/lobby'       ? 'active' : ''}>遊戲大廳</Link>
            <Link to="/game-intro"  className={loc.pathname === '/game-intro'  ? 'active' : ''}>遊戲介紹</Link>
            <Link to="/promotions"  className={loc.pathname === '/promotions'  ? 'active' : ''}>優惠活動</Link>
            <Link to="/support"     className={loc.pathname === '/support'     ? 'active' : ''}>客服中心</Link>
            <Link to="/leaderboard" className={loc.pathname === '/leaderboard' ? 'active' : ''}>排行榜</Link>
          </div>

          {/* Right side */}
          <div className="navbar-right">
            {user ? (
              <>
                <div className="nav-balance">
                  <span className="balance-icon">💰</span>
                  <span className="balance-num">
                    {Number(user.balance).toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <Link to="/profile" className="nav-user">
                  <span className={`vip-badge vip-${Math.min(user.vip_level || 0, 10)}`}>
                    VIP{user.vip_level || 0}
                  </span>
                  <span className="nav-username">{user.username}</span>
                </Link>
                <Link to="/recharge" className="btn btn-gold btn-sm">儲值</Link>
                <button onClick={logout} className="btn btn-outline btn-sm">登出</button>
              </>
            ) : (
              <>
                <button onClick={onLoginClick} className="btn btn-outline btn-sm">登入</button>
                <button onClick={onRegisterClick} className="btn btn-gold btn-sm">加入</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Side Drawer */}
      <aside ref={drawerRef} className={`side-drawer ${drawerOpen ? 'open' : ''}`}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <img src="/logo.svg" alt="logo" className="drawer-logo-img"
              onError={e => { e.target.style.display = 'none' }} />
            <div>
              <div className="drawer-brand-name">爽爽贏Online</div>
              <div className="drawer-brand-sub">娛樂平台</div>
            </div>
          </div>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>

        {/* User card inside drawer */}
        <div className="drawer-user-card">
          {user ? (
            <>
              <div className="drawer-avatar">
                <span className={`vip-badge vip-${Math.min(user.vip_level || 0, 10)}`} style={{ fontSize: 13 }}>
                  VIP{user.vip_level || 0}
                </span>
              </div>
              <div className="drawer-user-info">
                <div className="drawer-username">{user.username}</div>
                <div className="drawer-balance">
                  💰 {Number(user.balance).toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <Link to="/recharge" className="btn btn-gold btn-sm">儲值</Link>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'center' }}>
              <button onClick={() => { setDrawerOpen(false); onLoginClick?.() }}
                className="btn btn-outline" style={{ flex: 1 }}>登入</button>
              <button onClick={() => { setDrawerOpen(false); onRegisterClick?.() }}
                className="btn btn-gold" style={{ flex: 1 }}>立即加入</button>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="drawer-nav">
          {DRAWER_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`drawer-nav-item ${loc.pathname === item.to ? 'active' : ''}`}
              onClick={() => setDrawerOpen(false)}
            >
              <span className="drawer-nav-icon">{item.icon}</span>
              <span className="drawer-nav-label">{item.label}</span>
              <span className="drawer-nav-arrow">›</span>
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        {user && (
          <div className="drawer-footer">
            <button onClick={() => { logout(); setDrawerOpen(false) }}
              className="btn btn-outline" style={{ width: '100%' }}>
              🚪 登出
            </button>
          </div>
        )}

        <div className="drawer-copyright">© 2024 爽爽贏Online</div>
      </aside>
    </>
  )
}
