import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Marquee from '../components/Marquee'
import { ALL_GAMES, CATEGORIES, filterGames, gameRoute } from '../utils/games'
import './LobbyPage.css'

export default function LobbyPage() {
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')
  const nav = useNavigate()
  const games = filterGames(cat).filter(g =>
    !search || g.name.includes(search) || g.tags.some(t => t.includes(search))
  )

  return (
    <div className="lobby-page page">
      <Marquee />

      {/* 搜尋 */}
      <div className="lobby-search">
        <input className="input" placeholder="🔍 搜尋遊戲名稱..." value={search}
          onChange={e=>setSearch(e.target.value)} />
      </div>

      {/* 分類 Tab */}
      <div className="tab-bar" style={{marginBottom:20}}>
        {CATEGORIES.map(c => (
          <button key={c.key} className={`tab-btn ${cat===c.key?'active':''}`}
            onClick={()=>setCat(c.key)}>
            {c.label}
          </button>
        ))}
      </div>

      {/* 遊戲數量 */}
      <div className="lobby-count">{games.length} 款遊戲</div>

      {/* 遊戲格線 */}
      <div className="lobby-grid">
        {games.map(g => (
          <div key={g.id} className="game-card" onClick={()=>nav(gameRoute(g.id))}>
            <div className="game-card-thumb" style={{background:THEME_COLORS[g.cat]}}>
              <span style={{fontSize:52,zIndex:1}}>{g.emoji}</span>
              <div className="game-card-glow" />
            </div>
            {g.badge && (
              <span className={`game-card-badge badge-${g.badge}`}>
                {g.badge==='hot'?'🔥 熱門':g.badge==='new'?'✨ 新上線':'🎰 大獎'}
              </span>
            )}
            <div className="game-card-info">
              <div className="game-card-name">{g.name}</div>
              <div className="game-card-meta">{g.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div className="lobby-empty">
          <div style={{fontSize:48}}>🔍</div>
          <div style={{color:'var(--gray)',marginTop:8}}>找不到符合的遊戲</div>
        </div>
      )}
    </div>
  )
}

const THEME_COLORS = {
  slot:    'linear-gradient(135deg,#1a1030,#2d1060)',
  table:   'linear-gradient(135deg,#0d2040,#0d3060)',
  fish:    'linear-gradient(135deg,#0d2030,#0d4050)',
  dice:    'linear-gradient(135deg,#201010,#401020)',
  arcade:  'linear-gradient(135deg,#102020,#104030)',
  poker:   'linear-gradient(135deg,#201020,#401040)',
  special: 'linear-gradient(135deg,#102010,#204010)',
}
