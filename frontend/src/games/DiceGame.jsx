import { useState, useCallback } from 'react'
import GameLayout from '../components/GameLayout'
import JackpotModal from '../components/JackpotModal'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'

export default function DiceGame() {
  const [betType, setBetType] = useState('big')
  const [numTarget, setNumTarget] = useState(10)
  const apiFn = useCallback((bet, extra) => gameAPI.dice(bet, extra), [])
  const { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot, user } = useGame(apiFn)

  const doPlay = () => play({ bet_type: betType, number: numTarget })

  return (
    <GameLayout title="骰王爭霸" emoji="🎲">
      {showJackpot && result?.win > 0 && <JackpotModal amount={result.win} onClose={()=>setShowJackpot(false)} />}

      <div className="game-display">
        {result ? (
          <div style={{display:'flex',gap:16,justifyContent:'center',fontSize:52,margin:'8px 0'}}>
            {result.dice.map((d,i) => (
              <div key={i} style={{background:'rgba(255,215,0,0.1)',borderRadius:12,padding:'8px 14px',border:'1px solid rgba(255,215,0,0.3)'}}>
                {['','⚀','⚁','⚂','⚃','⚄','⚅'][d]}
              </div>
            ))}
          </div>
        ) : (
          <div style={{fontSize:80,margin:'8px 0'}}>🎲🎲🎲</div>
        )}
        {result && (
          <>
            <div style={{fontSize:18,fontWeight:700,color:'var(--gold)',margin:'8px 0'}}>總點數：{result.total}</div>
            <div className={`result-amount ${result.win>0?'win-color':'lose-color'}`}>
              {result.win > 0 ? `+${result.win.toFixed(2)}` : '未中獎'}
            </div>
          </>
        )}
      </div>

      <div className="bet-panel">
        <h3>🎯 押注類型</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {[
            { key:'big',    label:'大（11-18）', mult:'×1' },
            { key:'small',  label:'小（3-10）',  mult:'×1' },
            { key:'triple', label:'豹子',         mult:'×30' },
            { key:'number', label:'指定點數',     mult:'×5' },
          ].map(o => (
            <button key={o.key} onClick={()=>setBetType(o.key)}
              className={`bet-chip ${betType===o.key?'active':''}`}
              style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px'}}>
              <span>{o.label}</span><span style={{color:'var(--cyan)',fontSize:12}}>{o.mult}</span>
            </button>
          ))}
        </div>
        {betType==='number' && (
          <div>
            <label style={{fontSize:13,color:'var(--gray-light)',display:'block',marginBottom:6}}>指定總點數（3-18）</label>
            <input className="input" type="number" min="3" max="18" value={numTarget}
              onChange={e=>setNumTarget(Number(e.target.value))} />
          </div>
        )}
        <h3 style={{marginTop:8}}>💰 下注金額</h3>
        <div className="bet-amounts">
          {chips.map(c => <button key={c} className={`bet-chip ${bet===c?'active':''}`} onClick={()=>setBet(c)}>{c}</button>)}
        </div>
        <div className="bet-actions">
          <button className="btn btn-gold btn-lg play-btn" onClick={doPlay} disabled={spinning}>
            {spinning ? '🎲 擲骰中...' : '🎲 擲骰！'}
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
