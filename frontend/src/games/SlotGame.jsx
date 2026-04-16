import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import GameLayout from '../components/GameLayout'
import JackpotModal from '../components/JackpotModal'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'
import './SlotGame.css'

const THEME_INFO = {
  fruit:  { name:'幸運狂轉',  emoji:'🍒', symbols:['🍒','🍋','🍊','🍇','🍉','⭐','7️⃣'], bg:'#1a0830' },
  god:    { name:'財神降臨',  emoji:'🏮', symbols:['🐉','💎','🪙','🎴','🎋','🧧','💰'], bg:'#1a1000' },
  cat:    { name:'招財天降',  emoji:'🐱', symbols:['🐱','🎏','🌸','🎐','🌊','🍀','👛'], bg:'#0a1a10' },
  sanguo: { name:'三國霸業',  emoji:'⚔️', symbols:['⚔️','🛡️','🏹','👑','🔥','🌟','💥'], bg:'#1a0a00' },
  dragon: { name:'龍騰九霄',  emoji:'🐉', symbols:['🐉','🔱','💎','🌊','⚡','🔥','🌙'], bg:'#0a0a1a' },
  egypt:  { name:'法老密語',  emoji:'👸', symbols:['👸','🦅','🐍','🏺','📜','💎','⚡'], bg:'#1a1000' },
  vegas:  { name:'Vegas狂熱', emoji:'🎰', symbols:['💎','🃏','🎰','🍸','💰','⭐','🎲'], bg:'#1a0000' },
  spring: { name:'鴻運爆發',  emoji:'🧧', symbols:['🧧','🎆','🏮','🌸','💴','🎊','🍊'], bg:'#1a0505' },
  panda:  { name:'熊貓秘境',  emoji:'🐼', symbols:['🐼','🎋','🌸','🍃','🦋','⭐','💚'], bg:'#051a0a' },
  ninja:  { name:'武神傳說',  emoji:'🗡️', symbols:['🗡️','⚔️','🥷','🌙','💫','🔥','🎯'], bg:'#0a0a1a' },
  moon:   { name:'月亮傳說',  emoji:'🌙', symbols:['🌙','⭐','🔮','💫','🌟','🌌','✨'], bg:'#05051a' },
}

function SpinReel({ symbols, spinning, finalVal }) {
  const [display, setDisplay] = useState(finalVal || symbols[0])
  useEffect(() => {
    if (!spinning) { setDisplay(finalVal); return }
    const iv = setInterval(() => setDisplay(symbols[Math.floor(Math.random()*symbols.length)]), 80)
    return () => clearInterval(iv)
  }, [spinning, finalVal, symbols])
  return <div className={`reel-cell ${spinning?'reel-spin':''}`}>{display}</div>
}

export default function SlotGame() {
  const { theme } = useParams()
  const info = THEME_INFO[theme] || THEME_INFO.fruit
  const apiFn = useCallback((bet, extra) => gameAPI.slot(bet, { ...extra, theme }), [theme])
  const { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot, user } = useGame(apiFn)

  const reels = result?.reels || null

  return (
    <GameLayout title={info.name} emoji={info.emoji}>
      {showJackpot && result?.win > 0 && (
        <JackpotModal amount={result.win} onClose={()=>setShowJackpot(false)} />
      )}

      {/* 機台 */}
      <div className="slot-machine" style={{background:info.bg}}>
        <div className="slot-title">{info.emoji} {info.name}</div>
        <div className="slot-reels">
          {[0,1,2].map(col => (
            <div key={col} className="reel-col">
              {[0,1,2].map(row => (
                <SpinReel
                  key={row}
                  symbols={info.symbols}
                  spinning={spinning}
                  finalVal={reels ? reels[col][row] : info.symbols[Math.floor(Math.random()*info.symbols.length)]}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="slot-payline" />
        {result && (
          <div className={`slot-result ${result.win>0?'slot-win':''}`}>
            {result.win > 0
              ? `🎉 贏得 +${result.win.toFixed(2)} (${result.multiplier}x)`
              : '未中獎 — 再試一次！'}
          </div>
        )}
      </div>

      {/* 下注面板 */}
      <div className="bet-panel">
        <h3>💰 選擇籌碼</h3>
        <div className="bet-amounts">
          {chips.map(c => (
            <button key={c} className={`bet-chip ${bet===c?'active':''}`} onClick={()=>setBet(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="bet-input-row">
          <input className="input" type="number" min="1" value={bet}
            onChange={e=>setBet(Number(e.target.value))} />
          <span style={{color:'var(--gray)',fontSize:13,whiteSpace:'nowrap'}}>
            餘額：{user?.balance?.toFixed(2) ?? '--'}
          </span>
        </div>
        <div className="bet-actions">
          <button className="btn btn-gold btn-lg play-btn" onClick={()=>play()} disabled={spinning}>
            {spinning ? '🎰 旋轉中...' : '🎰 旋轉！'}
          </button>
          <button className="btn btn-outline" onClick={()=>setBet(Math.min(bet*2,user?.balance||bet))}>2x</button>
          <button className="btn btn-outline" onClick={()=>setBet(Math.max(1,Math.floor(bet/2)))}>½</button>
        </div>
      </div>

      {/* 賠率表 */}
      <div className="slot-paytable card">
        <div className="paytable-title">📊 賠率表</div>
        <div className="paytable-rows">
          <div className="pay-row"><span>三個相同（高級符號）</span><span className="pay-mult">×20~50</span></div>
          <div className="pay-row"><span>三個相同（普通符號）</span><span className="pay-mult">×2~12</span></div>
          <div className="pay-row"><span>兩個相同</span><span className="pay-mult">×1.5</span></div>
          <div className="pay-row"><span>未中獎</span><span style={{color:'var(--red)'}}>×0</span></div>
        </div>
      </div>
    </GameLayout>
  )
}
