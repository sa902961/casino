import { useState, useEffect, useCallback, useRef } from 'react'
import GameLayout from '../components/GameLayout'
import JackpotModal from '../components/JackpotModal'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'
import './CrashGame.css'

export default function CrashGame() {
  const [cashOut, setCashOut] = useState(2.0)
  const [animMult, setAnimMult] = useState(1.0)
  const apiFn = useCallback((bet, extra) => gameAPI.crash(bet, extra), [])
  const { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot, user } = useGame(apiFn)
  const rafRef = useRef()

  // 起飛動畫
  useEffect(() => {
    if (!spinning) { setAnimMult(1.0); return }
    let start = null; let curr = 1.0
    const animate = (ts) => {
      if (!start) start = ts
      const elapsed = (ts - start) / 1000
      curr = Math.pow(1.07, elapsed * 10)
      setAnimMult(Math.min(curr, cashOut * 1.5))
      if (spinning) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [spinning, cashOut])

  const doPlay = () => play({ cash_out: cashOut })

  return (
    <GameLayout title="一飛沖天" emoji="🚀">
      {showJackpot && result?.win > 0 && <JackpotModal amount={result.win} onClose={()=>setShowJackpot(false)} />}

      <div className="crash-display">
        <div className="crash-bg">
          {Array.from({length:20}).map((_,i)=>(
            <div key={i} className="crash-star" style={{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,animationDelay:`${Math.random()*2}s`}}/>
          ))}
        </div>
        <div className={`crash-mult ${result?.win>0?'crash-win':result&&!spinning?'crash-crash':''}`}>
          {spinning ? `${animMult.toFixed(2)}x` :
           result    ? `${result.crash_point.toFixed(2)}x` : '1.00x'}
        </div>
        <div className="crash-rocket">{spinning ? '🚀' : result?.win > 0 ? '🎉' : result ? '💥' : '🚀'}</div>
        {result && !spinning && (
          <div className={`crash-verdict ${result.win>0?'crash-safe':'crash-boom'}`}>
            {result.win > 0 ? `✅ 成功出場！ Cash Out @ ${result.cash_out}x` : `💥 爆炸！@ ${result.crash_point}x`}
          </div>
        )}
      </div>

      {result && !spinning && (
        <div className={`result-box ${result.win>0?'result-win':'result-lose'}`}>
          <div className="result-amount" style={{color:result.win>0?'var(--green)':'var(--red)'}}>
            {result.win > 0 ? `+${result.win.toFixed(2)}` : `-${bet.toFixed(2)}`}
          </div>
        </div>
      )}

      <div className="bet-panel">
        <h3>🎯 設定出場倍率</h3>
        <div className="bet-amounts">
          {[1.5,2,3,5,10,20].map(v=>(
            <button key={v} className={`bet-chip ${cashOut===v?'active':''}`} onClick={()=>setCashOut(v)}>{v}x</button>
          ))}
        </div>
        <div className="bet-input-row">
          <input className="input" type="number" min="1.01" step="0.1" value={cashOut}
            onChange={e=>setCashOut(Number(e.target.value))} />
          <span style={{color:'var(--cyan)',fontSize:13,whiteSpace:'nowrap'}}>倍率</span>
        </div>
        <h3>💰 下注金額</h3>
        <div className="bet-amounts">
          {chips.map(c=><button key={c} className={`bet-chip ${bet===c?'active':''}`} onClick={()=>setBet(c)}>{c}</button>)}
        </div>
        <div className="bet-actions">
          <button className="btn btn-gold btn-lg play-btn" onClick={doPlay} disabled={spinning}>
            {spinning ? '🚀 起飛中...' : `🚀 起飛！(出場@${cashOut}x)`}
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
