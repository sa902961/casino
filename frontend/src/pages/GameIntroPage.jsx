import { useState } from 'react'
import { Link } from 'react-router-dom'
import './GameIntroPage.css'

const GAME_CATEGORIES = [
  {
    key: 'slot',
    icon: '🎰',
    title: '老虎機',
    color: 'linear-gradient(135deg,#6B21A8,#9333EA)',
    glow: 'rgba(147,51,234,0.4)',
    games: [
      { emoji:'🍒', name:'幸運狂轉',   route:'/game/slot/fruit',  tag:'HOT', desc:'3×3 水果老虎機，最高50倍彩金' },
      { emoji:'🏮', name:'財神降臨',   route:'/game/slot/god',    tag:'HOT', desc:'招財神明主題，豐厚好運隨時來' },
      { emoji:'🐱', name:'招財天降',   route:'/game/slot/cat',    tag:'',    desc:'可愛招財貓，幸運符文滿天飛' },
      { emoji:'⚔️', name:'三國霸業',   route:'/game/slot/sanguo', tag:'NEW', desc:'三國英雄對決，策略與好運並重' },
      { emoji:'🐉', name:'龍騰九霄',   route:'/game/slot/dragon', tag:'HOT', desc:'神龍降臨，帶來極致財富震撼' },
      { emoji:'👸', name:'法老密語',   route:'/game/slot/egypt',  tag:'',    desc:'古埃及神秘寶藏，探索未知財富' },
      { emoji:'💎', name:'Vegas狂熱',  route:'/game/slot/vegas',  tag:'HOT', desc:'拉斯維加斯夜未眠，經典賭城風情' },
      { emoji:'🧧', name:'鴻運爆發',   route:'/game/slot/spring', tag:'',    desc:'新春喜氣，紅包彩金噴發不停' },
      { emoji:'🐼', name:'熊貓秘境',   route:'/game/slot/panda',  tag:'NEW', desc:'可愛熊貓帶你探索竹林秘境' },
      { emoji:'🥷', name:'武神傳說',   route:'/game/slot/ninja',  tag:'',    desc:'忍者武神決鬥，斬出超高倍率' },
    ],
    rules: [
      '轉動3列轉輪，中間列為中獎線',
      '三個相同符號連線即可獲獎',
      '高級符號（如7、鑽石）中獎倍率 ×20~50',
      '普通符號中獎倍率 ×2~12',
      '兩個相同符號可獲 ×1.5 小獎',
      'WILD 符號可替代任意符號',
      'SCATTER 出現 3 個以上可觸發免費旋轉',
    ],
  },
  {
    key: 'table',
    icon: '🃏',
    title: '桌牌遊戲',
    color: 'linear-gradient(135deg,#065F46,#059669)',
    glow: 'rgba(5,150,105,0.4)',
    games: [
      { emoji:'🃏', name:'百家樂',     route:'/game/baccarat',   tag:'HOT', desc:'莊閒和三選一，賠率最高8倍' },
      { emoji:'🃏', name:'21點',       route:'/game/blackjack',  tag:'HOT', desc:'挑戰莊家，BlackJack賠2.5倍' },
      { emoji:'♠️', name:'德州撲克',   route:'/game/poker',      tag:'HOT', desc:'最強5張牌型，勝者通吃' },
      { emoji:'🐉', name:'龍虎鬥',     route:'/game/dragontiger',tag:'HOT', desc:'一張定勝負，龍虎直接對決' },
      { emoji:'🀄', name:'麻將胡牌',   route:'/game/mahjong',    tag:'NEW', desc:'台灣麻將規則，摸牌胡牌致富' },
      { emoji:'🎴', name:'三公',       route:'/game/threecards', tag:'',    desc:'三張牌比大小，閒家vs莊家' },
      { emoji:'🎲', name:'牌九',       route:'/game/paigo',      tag:'',    desc:'傳統牌九，四張牌分兩副比大小' },
      { emoji:'💰', name:'炸金花',     route:'/game/zhajinhua',  tag:'',    desc:'三張牌比牌型，豹子最大' },
    ],
    rules: [
      '百家樂：閒/莊/和三種下注，和局賠8倍',
      '21點：點數最接近21但不超過為勝，BlackJack賠2.5倍',
      '德州撲克：5張公牌+2張手牌組成最佳牌型',
      '龍虎：比較單張牌點數大小，一對一對決',
      '所有桌牌遊戲均支援多種籌碼下注',
    ],
  },
  {
    key: 'fish',
    icon: '🐠',
    title: '捕魚遊戲',
    color: 'linear-gradient(135deg,#0C4A6E,#0284C7)',
    glow: 'rgba(2,132,199,0.4)',
    games: [
      { emoji:'🐠', name:'深海獵殺',   route:'/game/fishing',    tag:'HOT', desc:'選定目標魚開炮，BOSS鯨魚賠200倍' },
      { emoji:'🐋', name:'超級捕魚',   route:'/game/fishing2',   tag:'NEW', desc:'Canvas海底世界，多魚種同時游動' },
      { emoji:'🐟', name:'捕魚達人',   route:'/game/fishboss',   tag:'',    desc:'連發炮彈，一網打盡大豐收' },
    ],
    rules: [
      '選擇目標魚種並下注後開炮射擊',
      '命中目標魚獲得對應倍率獎勵',
      '小魚賠率低（×2），BOSS鯨魚最高賠率×200',
      '點擊/觸碰畫面可發射炮彈',
      '未命中目標則下注金額不退還',
    ],
  },
  {
    key: 'dice',
    icon: '🎲',
    title: '骰寶彩票',
    color: 'linear-gradient(135deg,#7C2D12,#DC2626)',
    glow: 'rgba(220,38,38,0.4)',
    games: [
      { emoji:'🎲', name:'骰王爭霸',   route:'/game/dice',         tag:'HOT', desc:'三顆骰子大小/豹子，豹子賠30倍' },
      { emoji:'⚡', name:'閃電骰子',   route:'/game/lightningdice',tag:'NEW', desc:'閃電隨機倍率，最高500倍驚喜' },
      { emoji:'🎟️', name:'彩票樂透',   route:'/game/lottery',      tag:'',    desc:'選號下注，六球開獎彩票玩法' },
      { emoji:'🎲', name:'時時彩',     route:'/game/ssc',           tag:'',    desc:'五球號碼開獎，大小單雙多種玩法' },
      { emoji:'🏁', name:'PK10賽車',   route:'/game/pk10',          tag:'',    desc:'十輛賽車名次預測，賠率最高9.89' },
    ],
    rules: [
      '骰寶：三顆骰子點數合計，大（11-18）/小（3-10）賠1倍',
      '豹子（三顆相同）賠30倍，機率極低',
      '時時彩：五個號碼0-9，多種下注方式',
      'PK10：預測賽車名次，第一名賠率最高',
      '所有彩票遊戲都有即時開獎結果顯示',
    ],
  },
  {
    key: 'arcade',
    icon: '🚀',
    title: '街機特色',
    color: 'linear-gradient(135deg,#1E3A5F,#1D4ED8)',
    glow: 'rgba(29,78,216,0.4)',
    games: [
      { emoji:'🚀', name:'一飛沖天',   route:'/game/crash',      tag:'HOT', desc:'設定出場倍率，倍率越高風險越大' },
      { emoji:'💣', name:'地雷爆破',   route:'/game/mines',      tag:'HOT', desc:'5×5地雷盤，隨時提現鎖定獲利' },
      { emoji:'🎡', name:'幸運輪盤',   route:'/game/roulette',   tag:'HOT', desc:'歐式輪盤37個號碼，指定號碼賠36倍' },
      { emoji:'🎡', name:'幸運轉盤',   route:'/game/wheel',      tag:'',    desc:'大轉盤隨機停止，多倍率區域' },
      { emoji:'🔮', name:'水晶球',     route:'/game/crystal',    tag:'NEW', desc:'神秘水晶球預言，多種預測方式' },
    ],
    rules: [
      '起飛遊戲：飛機起飛後倍率持續增長，設定目標倍率自動出場',
      '若飛機在達到目標前墜毀，本金全失',
      '地雷爆破：翻開方格累積倍率，隨時可提現',
      '踩到地雷立即結束，提現則獲得當前倍率獎勵',
      '輪盤：押注紅/黑/單/雙/指定號碼，各有不同賠率',
    ],
  },
  {
    key: 'racing',
    icon: '🏎️',
    title: '競技賽事',
    color: 'linear-gradient(135deg,#3F1F00,#92400E)',
    glow: 'rgba(146,64,14,0.4)',
    games: [
      { emoji:'🏎️', name:'極速賽車',   route:'/game/racing',     tag:'HOT', desc:'即時賽車競技，預測冠軍車號' },
      { emoji:'🏎️', name:'速度賽車',   route:'/game/speedracing',tag:'',    desc:'更多賽車數量，賠率更豐富' },
      { emoji:'⚔️', name:'競技場',     route:'/game/arena',       tag:'NEW', desc:'鬥士對決競技，多種押注選項' },
      { emoji:'🐓', name:'鬥雞',       route:'/game/cockfight',   tag:'',    desc:'傳統鬥雞賭注，東南亞熱門玩法' },
    ],
    rules: [
      '極速賽車：選擇冠軍車號（1-10），命中賠9倍',
      '也可押注大/小號（1-5小號，6-10大號）賠1.9倍',
      '鬥雞：紅方/藍方/平局三種下注，平局賠8倍',
      '所有競技賽事都有動態比賽動畫呈現',
    ],
  },
]

const HOW_TO_PLAY = [
  { step: '01', icon: '👤', title: '註冊帳號',    desc: '填寫手機號碼，收取簡訊驗證碼，30秒完成註冊' },
  { step: '02', icon: '💰', title: '儲值點數',    desc: '多種儲值方式，即時到帳，最低100元起儲' },
  { step: '03', icon: '🎮', title: '選擇遊戲',    desc: '40款精彩遊戲任選，每款都有詳細玩法說明' },
  { step: '04', icon: '🎯', title: '下注競技',    desc: '選擇籌碼金額，點擊下注，享受競技樂趣' },
  { step: '05', icon: '🏆', title: '贏得獎勵',    desc: '即時結算，獎金秒速入帳，隨時可提現' },
]

export default function GameIntroPage() {
  const [activeCat, setActiveCat] = useState('slot')
  const [expandedGame, setExpandedGame] = useState(null)

  const currentCat = GAME_CATEGORIES.find(c => c.key === activeCat) || GAME_CATEGORIES[0]

  return (
    <div className="game-intro-page page">
      {/* Hero Banner */}
      <div className="gi-hero">
        <div className="gi-hero-bg" />
        <div className="gi-hero-content">
          <div className="gi-hero-badge">40+ 款精彩遊戲</div>
          <h1 className="gi-hero-title">遊戲介紹</h1>
          <p className="gi-hero-sub">完整玩法說明 · 賠率一覽 · 立即上手</p>
        </div>
      </div>

      {/* How to Play */}
      <section className="gi-section">
        <h2 className="gi-section-title">🚀 如何開始遊玩</h2>
        <div className="gi-steps">
          {HOW_TO_PLAY.map(s => (
            <div key={s.step} className="gi-step">
              <div className="gi-step-num">{s.step}</div>
              <div className="gi-step-icon">{s.icon}</div>
              <div className="gi-step-title">{s.title}</div>
              <div className="gi-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Category tabs */}
      <section className="gi-section">
        <h2 className="gi-section-title">🎮 遊戲分類</h2>
        <div className="gi-cat-tabs">
          {GAME_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`gi-cat-tab ${activeCat === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCat(cat.key)}
              style={activeCat === cat.key ? { background: cat.color, boxShadow: `0 4px 20px ${cat.glow}` } : {}}
            >
              <span className="gi-cat-icon">{cat.icon}</span>
              <span className="gi-cat-label">{cat.title}</span>
            </button>
          ))}
        </div>

        {/* Category content */}
        <div className="gi-cat-content">
          {/* Game grid */}
          <div className="gi-games-grid">
            {currentCat.games.map(game => (
              <Link key={game.route} to={game.route} className="gi-game-card">
                <div className="gi-game-emoji" style={{ background: currentCat.color }}>{game.emoji}</div>
                {game.tag && (
                  <span className={`gi-game-tag gi-tag-${game.tag === 'HOT' ? 'hot' : 'new'}`}>
                    {game.tag === 'HOT' ? '🔥 熱門' : '✨ 新'}
                  </span>
                )}
                <div className="gi-game-name">{game.name}</div>
                <div className="gi-game-desc">{game.desc}</div>
                <div className="gi-game-play">立即遊玩 →</div>
              </Link>
            ))}
          </div>

          {/* Rules */}
          <div className="gi-rules-box">
            <div className="gi-rules-title">
              <span>{currentCat.icon}</span>
              <span>{currentCat.title} — 玩法規則</span>
            </div>
            <ul className="gi-rules-list">
              {currentCat.rules.map((rule, i) => (
                <li key={i} className="gi-rule-item">
                  <span className="gi-rule-dot" style={{ background: currentCat.color }} />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gi-cta">
        <div className="gi-cta-inner">
          <div className="gi-cta-title">🎁 新會員專屬好禮</div>
          <div className="gi-cta-desc">立即註冊即送 1,000 遊戲幣，讓你盡情體驗所有遊戲！</div>
          <div className="gi-cta-btns">
            <Link to="/lobby" className="btn btn-gold btn-lg">🎮 前往遊戲大廳</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
