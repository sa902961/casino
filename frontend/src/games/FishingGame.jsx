import { useState, useCallback } from 'react'
import GameLayout from '../components/GameLayout'
import JackpotModal from '../components/JackpotModal'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'
import './FishingGame.css'

const FISH = [
  {name:'小魚',emoji:'🐟',odds:2},
  {name:'章魚',emoji:'🐙',odds:5},
  {name:'螃蟹',emoji:'🦀',odds:8},
  {name:'龍蝦',emoji:'🦞',odds:12},
  {name:'海龜',emoji:'🐢',odds:20},
  {name:'鯊魚',emoji:'🦈',odds:35},
  {name:'海豚',emoji:'🐬',odds:50},
  {name:'BOSS鯨魚',emoji:'🐳',odds:200},
]

export default function FishingGame() {
  const [target, setTarget] = useState(0)
  const apiFn = useCallback((bet, extra) => gameAPI.fishing(bet, extra), [])
  const { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot } = useGame(apiFn)

  const doPlay = () => play({ target })

  return (
    <GameLayout title="深海獵殺" emoji="🐠">
      {showJackpot && result?.win > 0 && <JackpotModal amount={result.win} onClose={()=>setShowJackpot(false)} />}

      <div className="ocean-display">
        <div className="ocean-bubbles">
          {Array.from({length:8}).map((_,i)=>(
            <div key={i} className="bubble" style={{left:`${10+i*12}%`,animationDelay:`${i*0.3}s`}}/>
          ))}
        </div>
        <div className="fish-scene">
          {(result?.scene || FISH.slice(0,5)).map((f,i)=>(
            <div key={i} className={`fish-item ${result?.fish===f&&result?.caught?'fish-caught':''}`}
              style={{left:`${5+i*20}%`,top:`${20+Math.sin(i)*30}%`,animationDelay:`${i*0.5}s`}}>
              {f.emoji||f}
            </div>
          ))}
        </div>
        {result && (
          <div className={`catch-result ${result.caught?'caught':'missed'}`}>
            {result.caught
              ? `🎣 抓到了！${result.fish.emoji} ${result.fish.name} × ${result.fish.odds} = +${result.win.toFixed(2)}`
              : `😔 沒抓到 ${result.fish.emoji}，繼續努力！`}
          </div>
        )}
      </div>

      <div className="bet-panel">
        <h3>🎯 選擇目標魚</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {FISH.map((f,i)=>(
            <button key={i} onClick={()=>setTarget(i)}
              className={`bet-chip ${target===i?'active':''}`}
              style={{display:'flex',justifyContent:'space-between',padding:'10px 12px'}}>
              <span>{f.emoji} {f.name}</span>
              <span style={{color:'var(--gold)',fontSize:12}}>×{f.odds}</span>
            </button>
          ))}
        </div>
        <div className="bet-amounts">
          {chips.map(c=><button key={c} className={`bet-chip ${bet===c?'active':''}`} onClick={()=>setBet(c)}>{c}</button>)}
        </div>
        <div className="bet-actions">
          <button className="btn btn-gold btn-lg play-btn" onClick={doPlay} disabled={spinning}>
            {spinning?'🎣 射擊中...':'🎣 射擊！'}
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
