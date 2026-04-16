import { useState, useCallback } from 'react'
import GameLayout from '../components/GameLayout'
import JackpotModal from '../components/JackpotModal'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'
import './RouletteGame.css'

const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])

export default function RouletteGame() {
  const [betType, setBetType] = useState('red')
  const [numTarget, setNumTarget] = useState(7)
  const [spinning2, setSpinning2] = useState(false)
  const [wheelAngle, setWheelAngle] = useState(0)
  const apiFn = useCallback((bet, extra) => gameAPI.roulette(bet, extra), [])
  const { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot } = useGame(apiFn)

  const doPlay = async () => {
    setSpinning2(true)
    setWheelAngle(a => a + 720 + Math.random() * 360)
    await play({ bet_type: betType, number: numTarget })
    setSpinning2(false)
  }

  const BET_TYPES = [
    { key:'red',    label:'🔴 紅色',    mult:'×2',  color:'var(--red)' },
    { key:'black',  label:'⚫ 黑色',    mult:'×2',  color:'var(--white)' },
    { key:'green',  label:'🟢 綠色(0)', mult:'×14', color:'var(--green)' },
    { key:'even',   label:'偶數',       mult:'×2',  color:'var(--cyan)' },
    { key:'odd',    label:'奇數',       mult:'×2',  color:'var(--purple)' },
    { key:'number', label:'指定號碼',   mult:'×36', color:'var(--gold)' },
  ]

  return (
    <GameLayout title="幸運女神輪" emoji="🎡">
      {showJackpot && result?.win > 0 && <JackpotModal amount={result.win} onClose={()=>setShowJackpot(false)} />}

      <div className="roulette-display">
        <div className="roulette-wheel" style={{transform:`rotate(${wheelAngle}deg)`,transition:spinning?'transform 2s cubic-bezier(0.2,0.8,0.3,1)':'none'}}>
          {Array.from({length:37}).map((_,n)=>(
            <div key={n} className={`wheel-num ${n===0?'green':RED_NUMS.has(n)?'red':'black'}`}
              style={{transform:`rotate(${n*9.73}deg) translateY(-80px)`}}>
              {n}
            </div>
          ))}
        </div>
        {result && !spinning && (
          <div className={`roulette-result roulette-${result.color}`}>
            <span className="spin-num">{result.spin}</span>
            <span className="spin-color">{result.color==='red'?'🔴紅色':result.color==='black'?'⚫黑色':'🟢綠色'}</span>
            {result.win>0 && <span style={{color:'var(--green)'}}>+{result.win.toFixed(2)}</span>}
          </div>
        )}
      </div>

      <div className="bet-panel">
        <h3>🎯 押注類型</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {BET_TYPES.map(b=>(
            <button key={b.key} onClick={()=>setBetType(b.key)}
              className={`bet-chip ${betType===b.key?'active':''}`}
              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'10px 6px'}}>
              <span style={{fontSize:13,color:b.color}}>{b.label}</span>
              <span style={{fontSize:11,color:'var(--cyan)'}}>{b.mult}</span>
            </button>
          ))}
        </div>
        {betType==='number' && (
          <input className="input" type="number" min="0" max="36" value={numTarget}
            onChange={e=>setNumTarget(Number(e.target.value))} placeholder="0-36" />
        )}
        <div className="bet-amounts">
          {chips.map(c=><button key={c} className={`bet-chip ${bet===c?'active':''}`} onClick={()=>setBet(c)}>{c}</button>)}
        </div>
        <div className="bet-actions">
          <button className="btn btn-gold btn-lg play-btn" onClick={doPlay} disabled={spinning}>
            {spinning ? '🎡 旋轉中...' : '🎡 旋轉！'}
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
