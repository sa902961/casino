import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './HomePage.css'

/* ── Banner 資料 ── */
const BANNERS = [
  {
    id: 1,
    icon: '🎁',
    title: '新會員註冊送 1000 點',
    sub: '限時歡迎禮，立即領取，馬上開玩！',
    cta: '立即加入',
    ctaType: 'register',
    bg: 'linear-gradient(135deg, #6B0000 0%, #3d0000 40%, #8B4500 100%)',
    accent: '#FFD700',
  },
  {
    id: 2,
    icon: '💰',
    title: '每日儲值加碼 20%',
    sub: '今日限定優惠，儲500送100，活動至月底',
    cta: '立即儲值',
    ctaType: 'recharge',
    bg: 'linear-gradient(135deg, #004d00 0%, #002800 40%, #006600 100%)',
    accent: '#00FF88',
  },
  {
    id: 3,
    icon: '🏆',
    title: '本週排行榜冠軍獎金 10萬點',
    sub: '挑戰進行中！登上榜首，獨享巨額獎勵',
    cta: '查看排行',
    ctaType: 'leaderboard',
    bg: 'linear-gradient(135deg, #00004d 0%, #000033 40%, #1a0066 100%)',
    accent: '#00F5FF',
  },
  {
    id: 4,
    icon: '🎰',
    title: '戰神賽特新上線',
    sub: '首玩即送免費旋轉！最高 500倍 彩金等你拿',
    cta: '立即試玩',
    ctaType: 'sett',
    bg: 'linear-gradient(135deg, #4a0020 0%, #2d0010 40%, #7a1500 100%)',
    accent: '#FF6B6B',
  },
  {
    id: 5,
    icon: '🌙',
    title: '深夜場特別活動',
    sub: '23:00 — 06:00 積分加倍！夜貓族限定，越晚越爽',
    cta: '深夜開玩',
    ctaType: 'lobby',
    bg: 'linear-gradient(135deg, #0a0020 0%, #050010 40%, #200040 100%)',
    accent: '#CE93D8',
  },
]

/* ── 熱門遊戲 ── */
const HOT_GAMES = [
  { emoji:'⚔️', name:'戰神賽特',   href:'/game/sett',        badge:'HOT',  color:'#6B0000', mult:'最高500x' },
  { emoji:'🍒', name:'幸運狂轉',   href:'/game/slot/fruit',  badge:'HOT',  color:'#4a0028', mult:'最高50x' },
  { emoji:'🚀', name:'一飛沖天',   href:'/game/crash',       badge:'HOT',  color:'#001a4a', mult:'無限倍率' },
  { emoji:'🃏', name:'百家樂',     href:'/game/baccarat',    badge:'HOT',  color:'#004a00', mult:'×8 和局' },
  { emoji:'🐠', name:'深海獵殺',   href:'/game/fishing',     badge:'HOT',  color:'#001a40', mult:'最高×200' },
  { emoji:'💣', name:'地雷爆破',   href:'/game/mines',       badge:'NEW',  color:'#2d0040', mult:'隨機倍率' },
  { emoji:'🎡', name:'幸運輪盤',   href:'/game/roulette',    badge:'HOT',  color:'#4a1a00', mult:'×36 單號' },
  { emoji:'🐉', name:'龍騰九霄',   href:'/game/slot/dragon', badge:'HOT',  color:'#001a3a', mult:'最高×50' },
]

/* ── 玩家評論 ── */
const REVIEWS = [
  { avatar:'🧑', name:'阿宏520',  stars:5, text:'水果老虎機超好玩！一開始抱著試試看的心情，沒想到連續觸發免費旋轉，贏了不少點數！介面也很流暢。' },
  { avatar:'👩', name:'小美麗',   stars:5, text:'第一次玩線上遊戲就選到這個平台真的很幸運，百家樂的介面超漂亮，操作也很簡單上手。' },
  { avatar:'🧔', name:'大頭哥',   stars:5, text:'戰神賽特太刺激了！WILD 符號一出現就心跳加速，觸發免費旋轉那一刻超爽！強烈推薦！' },
  { avatar:'🤩', name:'Lucky88',  stars:5, text:'平台穩定不卡頓，客服也很有耐心，儲值點數馬上到帳，真的值得信賴，已經玩一個月了！' },
  { avatar:'💪', name:'發財王',   stars:5, text:'捕魚機超好玩，打到大魚的瞬間特效很棒！每天都會來玩一下，已經是我每日必玩的遊戲。' },
  { avatar:'🦁', name:'小虎哥',   stars:4, text:'遊戲種類很多，德州撲克和骰寶都很好玩，平台很穩定，希望以後多出新遊戲，期待！' },
]

/* ── 公告跑馬燈 ── */
const MARQUEE_ITEMS = [
  '🔔 【系統公告】本平台採用虛擬點數，純娛樂用途',
  '🎉 恭喜會員「幸運**88」在水果老虎機獲得 88,888 點大獎！',
  '🏆 本週排行榜活動進行中，前三名各獲得額外獎勵',
  '💰 儲值活動：儲值滿500點，加贈100點，活動至月底',
  '🎮 新遊戲「戰神賽特」正式上線，首玩免費體驗！',
  '🎁 每日簽到可獲得免費點數，連續簽到7天額外獎勵',
  '⚡ 週末限定：所有老虎機 RTP 提升至98%',
]

/* ── 粒子背景 ── */
function GoldParticles() {
  return (
    <div className="hp-particles" aria-hidden="true">
      {Array.from({ length: 30 }, (_, i) => (
        <div
          key={i}
          className="hp-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 8}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            opacity: 0.3 + Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  )
}

/* ── Banner 輪播 ── */
function BannerCarousel({ onRegister }) {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)

  const next = useCallback(() => setActive(a => (a + 1) % BANNERS.length), [])
  const prev = useCallback(() => setActive(a => (a - 1 + BANNERS.length) % BANNERS.length), [])

  useEffect(() => {
    timerRef.current = setInterval(next, 3500)
    return () => clearInterval(timerRef.current)
  }, [next])

  const resetTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(next, 3500)
  }

  const handleNav = (dir) => {
    dir === 'next' ? next() : prev()
    resetTimer()
  }

  const handleDot = (i) => {
    setActive(i)
    resetTimer()
  }

  const b = BANNERS[active]

  const handleCta = () => {
    if (b.ctaType === 'register') onRegister?.()
  }
  const ctaHref = {
    recharge: '/recharge',
    leaderboard: '/leaderboard',
    sett: '/game/sett',
    lobby: '/lobby',
  }[b.ctaType]

  return (
    <div className="hp-banner">
      {BANNERS.map((bn, i) => (
        <div
          key={bn.id}
          className={`hp-banner-slide ${i === active ? 'active' : ''}`}
          style={{ background: bn.bg }}
        >
          <div className="hp-banner-shine" />
          <div className="hp-banner-content">
            <div className="hp-banner-icon">{bn.icon}</div>
            <h2 className="hp-banner-title" style={{ color: bn.accent }}>{bn.title}</h2>
            <p className="hp-banner-sub">{bn.sub}</p>
            {b.ctaType === 'register' ? (
              <button className="hp-banner-btn" style={{ borderColor: bn.accent, color: bn.accent }}
                onClick={handleCta}>
                {bn.cta} →
              </button>
            ) : (
              <Link to={ctaHref} className="hp-banner-btn" style={{ borderColor: bn.accent, color: bn.accent }}>
                {bn.cta} →
              </Link>
            )}
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button className="hp-banner-arrow hp-arrow-l" onClick={() => handleNav('prev')}>‹</button>
      <button className="hp-banner-arrow hp-arrow-r" onClick={() => handleNav('next')}>›</button>

      {/* Dots */}
      <div className="hp-banner-dots">
        {BANNERS.map((_, i) => (
          <button key={i} className={`hp-dot ${i === active ? 'active' : ''}`} onClick={() => handleDot(i)} />
        ))}
      </div>
    </div>
  )
}

/* ── 跑馬燈 ── */
function MarqueeBanner() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="hp-marquee">
      <div className="hp-marquee-label">📢 公告</div>
      <div className="hp-marquee-track">
        <div className="hp-marquee-inner">
          {doubled.map((item, i) => (
            <span key={i} className="hp-marquee-item">
              <span className="hp-marquee-sep">✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── 星星評分 ── */
function Stars({ n }) {
  return (
    <span className="hp-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < n ? '#FFD700' : 'rgba(255,215,0,0.25)', fontSize: 14 }}>★</span>
      ))}
    </span>
  )
}

/* ── 主元件 ── */
export default function HomePage({ onLogin, onRegister }) {
  return (
    <div className="hp-page">
      <GoldParticles />

      {/* ─── HERO ─── */}
      <section className="hp-hero">
        <div className="hp-hero-bg" />
        <div className="hp-hero-pattern" aria-hidden="true" />

        <div className="hp-hero-content fade-up">
          <div className="hp-logo-wrap">
            <span className="hp-logo-icon">🎰</span>
            <div>
              <div className="hp-logo-title">爽爽贏Online</div>
              <div className="hp-logo-sub">全台最爽娛樂平台</div>
            </div>
          </div>

          <div className="hp-badges">
            <span className="hp-badge">🎰 老虎機</span>
            <span className="hp-badge">🃏 桌牌</span>
            <span className="hp-badge">🐠 捕魚</span>
            <span className="hp-badge">🎲 彩票</span>
            <span className="hp-badge">🚀 街機</span>
          </div>

          <div className="hp-hero-btns">
            <button className="hp-btn-primary" onClick={onRegister}>
              🎁 免費加入領好禮
            </button>
            <button className="hp-btn-secondary" onClick={onLogin}>
              🔑 登入
            </button>
          </div>

          <div className="hp-stats">
            {[
              { num: '40+', label: '精彩遊戲' },
              { num: '95%', label: '高回報率' },
              { num: '24H', label: '專業客服' },
              { num: '1000', label: '新手禮幣' },
            ].map((s, i) => (
              <div key={i} className="hp-stat">
                <div className="hp-stat-num">{s.num}</div>
                <div className="hp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BANNER 輪播 ─── */}
      <section className="hp-section fade-up">
        <BannerCarousel onRegister={onRegister} />
      </section>

      {/* ─── 跑馬燈 ─── */}
      <MarqueeBanner />

      {/* ─── 熱門遊戲 ─── */}
      <section className="hp-section fade-up">
        <div className="hp-section-inner">
          <div className="hp-section-header">
            <h2 className="hp-section-title">🔥 熱門遊戲</h2>
            <Link to="/lobby" className="hp-see-all">全部遊戲 →</Link>
          </div>
          <div className="hp-games-scroll">
            {HOT_GAMES.map(g => (
              <Link key={g.href} to={g.href} className="hp-game-card">
                <div className="hp-game-thumb" style={{ background: `linear-gradient(135deg, ${g.color}, #0a0000)` }}>
                  <span className="hp-game-emoji">{g.emoji}</span>
                  <div className="hp-game-glow" />
                </div>
                {g.badge && (
                  <span className={`hp-game-badge hp-badge-${g.badge === 'HOT' ? 'hot' : 'new'}`}>
                    {g.badge === 'HOT' ? '🔥' : '✨'} {g.badge}
                  </span>
                )}
                <div className="hp-game-info">
                  <div className="hp-game-name">{g.name}</div>
                  <div className="hp-game-mult">{g.mult}</div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/lobby" className="hp-btn-outline">查看全部 40+ 款遊戲 →</Link>
          </div>
        </div>
      </section>

      {/* ─── 特色亮點 ─── */}
      <section className="hp-section hp-features-section fade-up">
        <div className="hp-section-inner">
          <h2 className="hp-section-title">✨ 爽爽贏Online 五大優勢</h2>
          <div className="hp-features-grid">
            {[
              { icon: '🔒', title: '安全加密', desc: 'SSL全程加密，帳號資金安全無虞' },
              { icon: '⚡', title: '極速到帳', desc: '儲值出款超快速，效率業界第一' },
              { icon: '🎁', title: '豐厚優惠', desc: '新人好禮、每日簽到、VIP專屬回饋' },
              { icon: '📱', title: '手機暢玩', desc: '無需下載APP，手機瀏覽器即可玩' },
              { icon: '💬', title: '24H客服', desc: 'LINE客服全天候在線，問題秒解決' },
            ].map(f => (
              <div key={f.title} className="hp-feature-card">
                <div className="hp-feature-icon">{f.icon}</div>
                <div className="hp-feature-title">{f.title}</div>
                <div className="hp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 玩家評論 ─── */}
      <section className="hp-section fade-up">
        <div className="hp-section-inner">
          <h2 className="hp-section-title">🌟 玩家好評如潮</h2>
          <div className="hp-reviews-grid">
            {REVIEWS.map((r, i) => (
              <div key={i} className="hp-review-card">
                <div className="hp-review-top">
                  <div className="hp-review-avatar">{r.avatar}</div>
                  <div>
                    <div className="hp-review-name">{r.name}</div>
                    <Stars n={r.stars} />
                  </div>
                </div>
                <p className="hp-review-text">「{r.text}」</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="hp-section fade-up">
        <div className="hp-cta-banner">
          <div className="hp-cta-bg" />
          <div className="hp-cta-content">
            <div className="hp-cta-icon">🎁</div>
            <h3 className="hp-cta-title">立即加入，領取 1000 點新手禮</h3>
            <p className="hp-cta-sub">30秒完成註冊，馬上體驗40款精彩遊戲</p>
            <div className="hp-cta-btns">
              <button className="hp-btn-primary" onClick={onRegister}>免費加入 →</button>
              <Link to="/lobby" className="hp-btn-outline">先看看遊戲</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="hp-footer">
        <div className="hp-footer-logo">🎰 爽爽贏Online</div>
        <div className="hp-footer-links">
          <Link to="/game-intro">遊戲介紹</Link>
          <Link to="/promotions">優惠活動</Link>
          <Link to="/support">客服中心</Link>
          <Link to="/lobby">遊戲大廳</Link>
          <Link to="/leaderboard">排行榜</Link>
        </div>
        <div className="hp-footer-notice">
          <span className="hp-age-badge">18+</span>
          本平台遊戲僅供娛樂目的，遊戲幣不具任何現金價值。
        </div>
        <div className="hp-footer-copy">© 2026 爽爽贏Online 版權所有</div>
      </footer>
    </div>
  )
}
