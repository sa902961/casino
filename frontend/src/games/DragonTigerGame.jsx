import { useState, useCallback } from 'react'
import GameLayout from '../components/GameLayout'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'

const DRAGON_TIGER_SUITS = ['♠','♥','♦','♣']
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
const RANK_VAL = { A:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:11,Q:12,K:13 }

function randCard() {
  const r = RANKS[Math.floor(Math.random()*RANKS.length)]
  const s = DRAGON_TIGER_SUITS[Math.floor(Math.random()*4)]
  const red = s==='♥'||s==='♦'
  return { rank:r, suit:s, val:RANK_VAL[r], red }
}

function CardUI({ card }) {
  if (!card) return <div style={{ width:52,height:72,background:'#1a237e',borderRadius:10,border:'2px solid #3949ab' }} />
  return (
    <div style={{ width:52,height:72,background:'#fff',borderRadius:10,border:'2px solid #ccc',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',
      padding:4,color:card.red?'#c62828':'#000',fontWeight:'bold',fontSize:14 }}>
      <div>{card.rank}</div>
      <div style={{fontSize:22}}>{card.suit}</div>
      <div style={{transform:'rotate(180deg)'}}>{card.rank}</div>
    </div>
  )
}

export default function DragonTigerGame() {
  const apiFn = useCallback((bet, extra) => gameAPI.dragontiger(bet, extra), [])
  const { bet, setBet, spinning, chips, user } = useGame(apiFn)

  const [dragon, setDragon] = useState(null)
  const [tiger, setTiger] = useState(null)
  const [choice, setChoice] = useState(null)
  const [result, setResult] = useState(null)
  const [balance, setBalance] = useState(1000)
  const [playing, setPlaying] = useState(false)

  const play = async () => {
    if (!choice) return alert('請選擇龍或虎！')
    setPlaying(true)
    setDragon(null)
    setTiger(null)
    setResult(null)
    await new Promise(r => setTimeout(r, 600))
    const d = randCard()
    const t = randCard()
    setDragon(d)
    await new Promise(r => setTimeout(r, 400))
    setTiger(t)
    await new Promise(r => setTimeout(r, 600))

    let outcome
    if (d.val === t.val) outcome = 'tie'
    else if (d.val > t.val) outcome = 'dragon'
    else outcome = 'tiger'

    const win = outcome === 'tie' ? (choice==='tie' ? bet*8 : -bet)
      : outcome === choice ? bet*2 : -bet

    setBalance(b => b + (win < 0 ? win : win - bet))
    setResult({ outcome, win, d, t })
    setPlaying(false)
  }

  return (
    <GameLayout title="龍虎鬥" emoji="🐉">
      <div style={{ padding:'0 16px' }}>
        <div style={{ display:'flex', gap:16, justifyContent:'center', marginBottom:16 }}>
          <div style={{ color:'#ffd700', fontWeight:'bold' }}>💰 餘額: {balance}</div>
          <div style={{ color:'#00e5ff', fontWeight:'bold' }}>🎯 下注: {bet}</div>
        </div>

        {/* 牌面 */}
        <div style={{ display:'flex', justifyContent:'space-around', alignItems:'center', marginBottom:20 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🐉</div>
            <div style={{ color:'#ff6b6b', fontSize:16, fontWeight:'bold', marginBottom:8 }}>龍</div>
            <CardUI card={dragon} />
            {dragon && <div style={{ color:'#aaa', fontSize:13, marginTop:4 }}>點數: {dragon.val}</div>}
          </div>
          <div style={{ textAlign:'center', padding:'0 20px' }}>
            <div style={{ fontSize:28, color:'#ffd700', fontWeight:'bold' }}>VS</div>
            {result && (
              <div style={{ marginTop:8, fontSize:15, fontWeight:'bold',
                color: result.win > 0 ? '#4caf50' : result.win === 0 ? '#ffd700' : '#f44336' }}>
                {result.outcome==='tie' ? '🤝 平局' : result.outcome==='dragon' ? '🐉 龍勝' : '🐯 虎勝'}
                <br/>
                <span>{result.win > 0 ? `+${result.win}` : result.win}</span>
              </div>
            )}
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🐯</div>
            <div style={{ color:'#64b5f6', fontSize:16, fontWeight:'bold', marginBottom:8 }}>虎</div>
            <CardUI card={tiger} />
            {tiger && <div style={{ color:'#aaa', fontSize:13, marginTop:4 }}>點數: {tiger.val}</div>}
          </div>
        </div>

        {/* 選擇 */}
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:16 }}>
          {[
            { key:'dragon', label:'🐉 龍 (1:1)', color:'#c62828' },
            { key:'tie',    label:'🤝 和 (1:8)', color:'#2e7d32' },
            { key:'tiger',  label:'🐯 虎 (1:1)', color:'#1565c0' },
          ].map(opt => (
            <button key={opt.key} onClick={()=>setChoice(opt.key)}
              style={{ background: choice===opt.key ? opt.color : '#1e1e2e', color:'#fff',
                border: choice===opt.key ? `2px solid ${opt.color}` : '1px solid #333',
                borderRadius:12, padding:'10px 20px', fontSize:14, fontWeight:'bold', cursor:'pointer',
                boxShadow: choice===opt.key ? `0 0 12px ${opt.color}88`:'' }}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* 下注額 */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:16, flexWrap:'wrap' }}>
          {chips.map(c => (
            <button key={c} onClick={()=>setBet(c)}
              style={{ background: bet===c?'#ffd700':'#1e1e2e', color: bet===c?'#000':'#fff',
                border:'1px solid #333', borderRadius:8, padding:'6px 14px', cursor:'pointer' }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', justifyContent:'center' }}>
          <button onClick={play} disabled={playing}
            style={{ background:'linear-gradient(135deg,#9c27b0,#7b1fa2)', color:'#fff',
              border:'none', borderRadius:12, padding:'12px 50px', fontSize:16, fontWeight:'bold',
              cursor: playing ? 'not-allowed':'pointer', opacity: playing ? 0.7:1 }}>
            {playing ? '⏳ 發牌中...' : '🎴 開始對決'}
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
