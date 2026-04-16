import { useState, useCallback } from 'react'
import GameLayout from '../components/GameLayout'
import JackpotModal from '../components/JackpotModal'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'
import './CardGame.css'

function Card({ card }) {
  if (!card) return null
  const [face, suit] = card
  const isRed = suit==='♥'||suit==='♦'
  return (
    <div className={`playing-card ${isRed?'red':''}`}>
      <div className="card-top">{face}</div>
      <div className="card-suit">{suit}</div>
    </div>
  )
}

export default function BaccaratGame() {
  const [side, setSide] = useState('player')
  const apiFn = useCallback((bet, extra) => gameAPI.baccarat(bet, extra), [])
  const { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot, user } = useGame(apiFn)

  const doPlay = () => play({ side })
  const SIDES = [
    { key:'player', label:'閒', mult:'×2.0',   color:'var(--cyan)' },
    { key:'banker', label:'莊', mult:'×1.95',  color:'var(--red)' },
    { key:'tie',    label:'和', mult:'×8.0',   color:'var(--green)' },
  ]

  return (
    <GameLayout title="龍虎對決（百家樂）" emoji="🃏">
      {showJackpot && result?.win > 0 && <JackpotModal amount={result.win} onClose={()=>setShowJackpot(false)} />}

      <div className="game-display">
        {result ? (
          <div className="bac-table">
            <div className="bac-side">
              <div className="bac-label">閒</div>
              <div className="bac-cards">
                {result.player_hand.map((c,i)=><Card key={i} card={c}/>)}
              </div>
              <div className="bac-score">{result.player_score}</div>
            </div>
            <div className="bac-vs">VS</div>
            <div className="bac-side">
              <div className="bac-label">莊</div>
              <div className="bac-cards">
                {result.banker_hand.map((c,i)=><Card key={i} card={c}/>)}
              </div>
              <div className="bac-score">{result.banker_score}</div>
            </div>
          </div>
        ) : (
          <div style={{fontSize:72,textAlign:'center'}}>🃏</div>
        )}
        {result && (
          <div className={`bac-winner ${result.winner===side?'bac-win':'bac-lose'}`}>
            {result.winner==='tie'?'和局 🤝':result.winner==='player'?'閒家勝 🎉':'莊家勝 🏆'}
            {result.win>0&&<span style={{marginLeft:12}}>+{result.win.toFixed(2)}</span>}
          </div>
        )}
      </div>

      <div className="bet-panel">
        <h3>🃏 選擇押注</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {SIDES.map(s=>(
            <button key={s.key} onClick={()=>setSide(s.key)}
              className={`bet-chip ${side===s.key?'active':''}`}
              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'14px 8px'}}>
              <span style={{fontSize:22,fontWeight:900,color:s.color}}>{s.label}</span>
              <span style={{fontSize:11,color:'var(--gray)'}}>{s.mult}</span>
            </button>
          ))}
        </div>
        <div className="bet-amounts">
          {chips.map(c=><button key={c} className={`bet-chip ${bet===c?'active':''}`} onClick={()=>setBet(c)}>{c}</button>)}
        </div>
        <div className="bet-actions">
          <button className="btn btn-gold btn-lg play-btn" onClick={doPlay} disabled={spinning}>
            {spinning ? '🃏 發牌中...' : '🃏 開始！'}
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
