import { useCallback } from 'react'
import GameLayout from '../components/GameLayout'
import JackpotModal from '../components/JackpotModal'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'
import './CardGame.css'

function Card({ card }) {
  if (!card) return null
  const [face, suit] = card
  const isRed = suit==='♥'||suit==='♦'
  return <div className={`playing-card ${isRed?'red':''}`}><div className="card-top">{face}</div><div className="card-suit">{suit}</div></div>
}

export default function PokerGame() {
  const apiFn = useCallback((bet) => gameAPI.poker(bet, {}), [])
  const { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot } = useGame(apiFn)
  const COLOR = { win:'var(--green)', draw:'var(--gold)', lose:'var(--red)' }
  const LABEL = { win:'🎉 你贏了！', draw:'🤝 平手', lose:'💥 輸了' }

  return (
    <GameLayout title="德州稱王（德州撲克）" emoji="♠️">
      {showJackpot && result?.win > 0 && <JackpotModal amount={result.win} onClose={()=>setShowJackpot(false)} />}
      <div className="game-display">
        {result ? (
          <>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:13,color:'var(--gray)',marginBottom:6}}>公共牌</div>
              <div style={{display:'flex',gap:5,justifyContent:'center',flexWrap:'wrap'}}>
                {result.community.map((c,i)=><Card key={i} card={c}/>)}
              </div>
            </div>
            <div style={{display:'flex',gap:20,justifyContent:'center',marginBottom:12}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:12,color:'var(--cyan)',marginBottom:4}}>你的手牌</div>
                <div style={{display:'flex',gap:5}}>{result.player.map((c,i)=><Card key={i} card={c}/>)}</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:12,color:'var(--red)',marginBottom:4}}>莊家手牌</div>
                <div style={{display:'flex',gap:5}}>{result.dealer.map((c,i)=><Card key={i} card={c}/>)}</div>
              </div>
            </div>
            <div style={{fontSize:20,fontWeight:800,color:COLOR[result.result]}}>
              {LABEL[result.result]}{result.win>0&&<span style={{marginLeft:10}}>+{result.win.toFixed(2)}</span>}
            </div>
          </>
        ) : <div style={{fontSize:72}}>♠️</div>}
      </div>
      <div className="bet-panel">
        <div className="bet-amounts">{chips.map(c=><button key={c} className={`bet-chip ${bet===c?'active':''}`} onClick={()=>setBet(c)}>{c}</button>)}</div>
        <div className="bet-actions">
          <button className="btn btn-gold btn-lg play-btn" onClick={()=>play()} disabled={spinning}>
            {spinning?'♠️ 發牌中...':'♠️ 開始德州撲克！'}
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
