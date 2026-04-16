import { Link } from 'react-router-dom'
import StarsBg from '../components/StarsBg'
import './HomePage.css'

const PREVIEW_GAMES = [
  { emoji:'🍒', name:'幸運狂轉',   href:'/game/slot/fruit',  badge:'HOT' },
  { emoji:'🚀', name:'一飛沖天',   href:'/game/crash',       badge:'HOT' },
  { emoji:'🃏', name:'龍虎對決',   href:'/game/baccarat',    badge:'HOT' },
  { emoji:'🐠', name:'深海獵殺',   href:'/game/fishing',     badge:'HOT' },
  { emoji:'💣', name:'地雷爆破',   href:'/game/mines',       badge:'NEW' },
  { emoji:'🐉', name:'龍騰九霄',   href:'/game/slot/dragon', badge:'HOT' },
]

export default function HomePage({ onLogin, onRegister }) {
  return (
    <div className="home-page">
      <StarsBg />

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-logo float">
            <span className="hero-star">★</span>
          </div>
          <h1 className="hero-title">
            <span className="hero-title-main">城星</span>
            <span className="hero-title-sub">娛樂城</span>
          </h1>
          <p className="hero-desc">全球華人線上遊戲娛樂首選 · 40款精彩遊戲</p>
          <div className="hero-badges">
            <span className="badge badge-gold">🎰 老虎機</span>
            <span className="badge badge-cyan">🃏 桌遊</span>
            <span className="badge badge-red">🐠 捕魚</span>
            <span className="badge badge-purple">🎲 彩票</span>
          </div>
          <div className="hero-btns">
            <button className="btn btn-gold btn-lg glow-pulse" onClick={onRegister}>
              🎁 立即加入
            </button>
            <button className="btn btn-outline btn-lg" onClick={onLogin}>
              🔑 登入
            </button>
            <Link to="/lobby" className="btn btn-cyan btn-lg">
              🎮 免費試玩
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><div className="stat-num">40+</div><div className="stat-label">精彩遊戲</div></div>
            <div className="stat-div" />
            <div className="stat"><div className="stat-num">95%</div><div className="stat-label">高回報率</div></div>
            <div className="stat-div" />
            <div className="stat"><div className="stat-num">24H</div><div className="stat-label">線上客服</div></div>
            <div className="stat-div" />
            <div className="stat"><div className="stat-num">1000</div><div className="stat-label">新手禮幣</div></div>
          </div>
        </div>

        {/* 漂浮遊戲圖示 */}
        <div className="hero-floats">
          {['🎰','🃏','🐉','💰','⭐','🎲','🚀','💎'].map((e,i)=>(
            <span key={i} className="hero-float-item" style={{
              '--i':i,
              left:`${10+i*11}%`,
              animationDelay:`${i*0.4}s`,
              fontSize:`${20+Math.random()*20}px`,
              opacity:0.15+Math.random()*0.2
            }}>{e}</span>
          ))}
        </div>
      </section>

      {/* 遊戲預覽 */}
      <section className="home-section">
        <div className="home-section-inner">
          <h2 className="section-title">🔥 熱門遊戲</h2>
          <div className="preview-grid">
            {PREVIEW_GAMES.map(g => (
              <Link to={g.href} key={g.href} className="preview-card">
                <div className="preview-emoji">{g.emoji}</div>
                <div className="preview-name">{g.name}</div>
                {g.badge && <span className={`preview-badge badge-${g.badge==='HOT'?'hot':'new'}`}>{g.badge}</span>}
              </Link>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:24}}>
            <Link to="/lobby" className="btn btn-gold btn-lg">查看全部 40 款遊戲 →</Link>
          </div>
        </div>
      </section>

      {/* 特色 */}
      <section className="home-section home-features">
        <div className="home-section-inner">
          <h2 className="section-title">✨ 為什麼選擇城星</h2>
          <div className="features-grid">
            {[
              {icon:'🔒',title:'安全可靠',desc:'採用 SSL 加密，資金安全有保障'},
              {icon:'⚡',title:'即時到帳',desc:'快速入款出款，效率第一'},
              {icon:'🎁',title:'豐厚優惠',desc:'新人好禮、每日簽到、VIP專屬'},
              {icon:'📱',title:'手機友善',desc:'全平台相容，隨時隨地暢玩'},
              {icon:'💬',title:'24H客服',desc:'全天候專業客服，即時解決問題'},
              {icon:'🏆',title:'VIP系統',desc:'10級VIP，等級越高優惠越多'},
            ].map(f => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部 */}
      <footer className="home-footer">
        <div className="footer-logo">★ 城星娛樂城</div>
        <p>本平台遊戲僅供娛樂目的，遊戲幣不具任何現金價值。</p>
        <p>© 2024 城星娛樂城 All Rights Reserved</p>
      </footer>
    </div>
  )
}
