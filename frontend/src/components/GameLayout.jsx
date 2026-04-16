import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './GameLayout.css'

export default function GameLayout({ title, emoji, children }) {
  const { user } = useAuth()
  return (
    <div className="game-layout">
      <div className="game-topbar">
        <Link to="/lobby" className="game-back">← 大廳</Link>
        <div className="game-title">{emoji} {title}</div>
        {user && (
          <div className="game-balance">
            💰 <span>{Number(user.balance).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
          </div>
        )}
      </div>
      <div className="game-body">
        {children}
      </div>
    </div>
  )
}
