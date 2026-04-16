import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Navbar.css'

export default function Navbar({ onLoginClick, onRegisterClick }) {
  const { user, logout } = useAuth()
  const loc = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-star">★</span>
          <span className="logo-text">城星<span>娛樂城</span></span>
        </Link>

        {/* 中間導覽（桌面） */}
        <div className="navbar-links">
          <Link to="/lobby" className={loc.pathname==='/lobby'?'active':''}>遊戲大廳</Link>
          <Link to="/promotions" className={loc.pathname==='/promotions'?'active':''}>優惠活動</Link>
          <Link to="/leaderboard" className={loc.pathname==='/leaderboard'?'active':''}>排行榜</Link>
        </div>

        {/* 右側 */}
        <div className="navbar-right">
          {user ? (
            <>
              <div className="nav-balance">
                <span className="balance-icon">💰</span>
                <span className="balance-num">{Number(user.balance).toLocaleString('zh-TW', {minimumFractionDigits:2,maximumFractionDigits:2})}</span>
              </div>
              <Link to="/profile" className="nav-user">
                <span className={`vip-badge vip-${Math.min(user.vip_level||0,10)}`}>
                  VIP{user.vip_level||0}
                </span>
                <span className="nav-username">{user.username}</span>
              </Link>
              <Link to="/recharge" className="btn btn-gold btn-sm">儲值</Link>
              <button onClick={logout} className="btn btn-outline btn-sm">登出</button>
            </>
          ) : (
            <>
              <button onClick={onLoginClick} className="btn btn-outline btn-sm">登入</button>
              <button onClick={onRegisterClick} className="btn btn-gold btn-sm">立即加入</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
