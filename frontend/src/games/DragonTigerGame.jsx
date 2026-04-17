import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from '../components/GameLayout'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'

const SUITS = ['♠','♥','♦','♣']
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
const RANK_VAL = { A:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:11,Q:12,K:13 }

function randCard() {
  const r = RANKS[Math.floor(Math.random()*RANKS.length)]
  const s = SUITS[Math.floor(Math.random()*4)]
  return { rank:r, suit:s, val:RANK_VAL[r], red: s==='♥'||s==='♦' }
}

function createParticle(x, y, color) {
  return {
    x, y, vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*12-4,
    life: 1.0, decay: 0.02+Math.random()*0.02, size: 5+Math.random()*9, color,
  }
}

function AnimCard({ card, delay=0 }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    setShow(false)
    if (card) { const t = setTimeout(()=>setShow(true), delay); return ()=>clearTimeout(t) }
  }, [card, delay])

  if (!card) return (
    <div style={{ width:60, height:86, borderRadius:12, background:'linear-gradient(135deg,#1a237e,#283593)',
      border:'2px solid #5c6bc0', boxShadow:'0 4px 14px rgba(0,0,0,0.6)' }} />
  )
  return (
    <div style={{ perspective:700, width:60, height:86 }}>
      <div style={{
        width:'100%', height:'100%', transformStyle:'preserve-3d',
        transition:`transform 0.5s ease ${delay}ms`,
        transform: show ? 'rotateY(0deg)' : 'rotateY(90deg)',
      }}>
        <div style={{
          width:60, height:86, borderRadius:12, background:'#fff',
          border:'2px solid #ddd', display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'space-between', padding:'6px 5px',
          color: card.red ? '#c62828' : '#111', fontWeight:'bold',
          boxShadow:'0 6px 20px rgba(0,0,0,0.6)',
        }}>
          <div style={{ fontSize:15, alignSelf:'flex-start' }}>{card.rank}</div>
          <div style={{ fontSize:26 }}>{card.suit}</div>
          <div style={{ fontSize:15, alignSelf:'flex-end', transform:'rotate(180deg)' }}>{card.rank}</div>
        </div>
      </div>
    </div>
  )
}

export default function DragonTigerGame() {
  const apiFn = useCallback((bet, extra) => gameAPI.dragontiger(bet, extra), [])
  const { bet, setBet, chips } = useGame(apiFn)

  const [dragon, setDragon] = useState(null)
  const [tiger, setTiger] = useState(null)
  const [choice, setChoice] = useState(null)
  const [result, setResult] = useState(null)
  const [balance, setBalance] = useState(1000)
  const [playing, setPlaying] = useState(false)

  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)
  const frameRef = useRef(0)

  // Canvas background
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const animate = () => {
      frameRef.current++
      ctx.clearRect(0, 0, W, H)

      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#1a0020')
      bg.addColorStop(0.5, '#0a0a1a')
      bg.addColorStop(1, '#200010')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Animated glow orbs
      const t = frameRef.current * 0.02
      // Dragon side glow (red)
      const dgx = W*0.25, dgy = H*0.5
      const drg = ctx.createRadialGradient(dgx, dgy, 0, dgx, dgy, 90)
      drg.addColorStop(0, `rgba(220,50,50,${0.15+0.08*Math.sin(t)})`)
      drg.addColorStop(1, 'rgba(220,50,50,0)')
      ctx.fillStyle = drg; ctx.fillRect(0, 0, W, H)

      // Tiger side glow (blue)
      const tgx = W*0.75, tgy = H*0.5
      const trg = ctx.createRadialGradient(tgx, tgy, 0, tgx, tgy, 90)
      trg.addColorStop(0, `rgba(50,100,220,${0.15+0.08*Math.sin(t+Math.PI)})`)
      trg.addColorStop(1, 'rgba(50,100,220,0)')
      ctx.fillStyle = trg; ctx.fillRect(0, 0, W, H)

      // Border
      ctx.strokeStyle = 'rgba(255,215,0,0.3)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.roundRect(8, 8, W-16, H-16, 16); ctx.stroke()

      // Center divider
      ctx.strokeStyle = 'rgba(255,215,0,0.2)'
      ctx.lineWidth = 1
      ctx.setLineDash([6, 4])
      ctx.beginPath(); ctx.moveTo(W/2, 20); ctx.lineTo(W/2, H-20); ctx.stroke()
      ctx.setLineDash([])

      particlesRef.current = particlesRef.current.filter(p => p.life > 0)
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= p.decay
        ctx.save(); ctx.globalAlpha = p.life
        ctx.fillStyle = p.color; ctx.shadowBlur = 8; ctx.shadowColor = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size/2, 0, Math.PI*2); ctx.fill()
        ctx.restore()
      })

      rafRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const playGame = async () => {
    if (!choice) return alert('請選擇龍或虎！')
    setPlaying(true); setDragon(null); setTiger(null); setResult(null)
    await new Promise(r => setTimeout(r, 400))
    const d = randCard(); setDragon(d)
    await new Promise(r => setTimeout(r, 600))
    const t = randCard(); setTiger(t)
    await new Promise(r => setTimeout(r, 700))

    let outcome
    if (d.val === t.val) outcome = 'tie'
    else if (d.val > t.val) outcome = 'dragon'
    else outcome = 'tiger'

    const winAmt = outcome === 'tie' ? (choice==='tie' ? bet*8 : 0)
      : outcome === choice ? bet*2 : 0

    const netChange = winAmt > 0 ? winAmt - bet : -bet
    setBalance(b => b + netChange)
    setResult({ outcome, win: winAmt, d, t })

    if (winAmt > 0) {
      const canvas = canvasRef.current; if (canvas) {
        const W = canvas.width, H = canvas.height
        const cx = outcome === 'dragon' ? W*0.25 : outcome === 'tiger' ? W*0.75 : W/2
        const colors = ['#FFD700','#FFA500','#FF6B6B','#4ECDC4']
        for (let i = 0; i < 70; i++) {
          particlesRef.current.push(
            createParticle(cx+(Math.random()-0.5)*60, H/2+(Math.random()-0.5)*40,
              colors[Math.floor(Math.random()*colors.length)])
          )
        }
      }
    }
    setPlaying(false)
  }

  const resultColor = result
    ? result.win > 0 ? '#4CAF50' : '#F44336'
    : null

  return (
    <GameLayout title="龍虎鬥" emoji="🐉">
      {/* Canvas background */}
      <div style={{ position: 'relative', margin: '8px 16px' }}>
        <canvas ref={canvasRef} width={380} height={200}
          style={{ width:'100%', maxWidth:480, borderRadius:18, display:'block' }} />

        {/* Cards overlay */}
        <div style={{
          position:'absolute', inset:0,
          display:'flex', alignItems:'center', justifyContent:'space-around',
          padding:'16px',
        }}>
          {/* Dragon */}
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:6 }}>🐉</div>
            <div style={{ color:'#FF6B6B', fontSize:13, fontWeight:700, marginBottom:8, letterSpacing:1 }}>DRAGON</div>
            <AnimCard card={dragon} delay={0} />
            {dragon && <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13, marginTop:6 }}>點數 {dragon.val}</div>}
          </div>

          {/* VS center */}
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#FFD700', fontSize:22, fontWeight:900, textShadow:'0 0 15px rgba(255,215,0,0.6)' }}>VS</div>
            {result && (
              <div style={{
                marginTop:8, fontSize:13, fontWeight:700,
                color: resultColor, lineHeight: 1.6,
              }}>
                <div>{result.outcome==='tie' ? '🤝 平局' : result.outcome==='dragon' ? '🐉 龍勝' : '🐯 虎勝'}</div>
                <div style={{ color:'#FFD700', fontSize:16 }}>
                  {result.win > 0 ? `+${result.win}` : `-${bet}`}
                </div>
              </div>
            )}
          </div>

          {/* Tiger */}
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:6 }}>🐯</div>
            <div style={{ color:'#64B5F6', fontSize:13, fontWeight:700, marginBottom:8, letterSpacing:1 }}>TIGER</div>
            <AnimCard card={tiger} delay={400} />
            {tiger && <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13, marginTop:6 }}>點數 {tiger.val}</div>}
          </div>
        </div>
      </div>

      <div style={{ padding:'0 16px' }}>
        {/* Balance */}
        <div style={{
          display:'flex', gap:16, justifyContent:'center', marginBottom:12,
          background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'8px 16px',
        }}>
          <div style={{ color:'#FFD700', fontWeight:700 }}>💰 {balance}</div>
          <div style={{ color:'#00E5FF', fontWeight:700 }}>下注: {bet}</div>
        </div>

        {/* Choice buttons */}
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:12 }}>
          {[
            { key:'dragon', label:'🐉 龍', sub:'賠率 1:1', color:'#F44336', glow:'rgba(244,67,54,0.4)' },
            { key:'tie',    label:'🤝 和', sub:'賠率 1:8', color:'#4CAF50', glow:'rgba(76,175,80,0.4)' },
            { key:'tiger',  label:'🐯 虎', sub:'賠率 1:1', color:'#2196F3', glow:'rgba(33,150,243,0.4)' },
          ].map(opt => (
            <button key={opt.key} onClick={() => setChoice(opt.key)}
              style={{
                flex:1, background: choice===opt.key ? opt.color : 'rgba(255,255,255,0.06)',
                color:'#fff', border: choice===opt.key ? 'none' : '1px solid rgba(255,255,255,0.12)',
                borderRadius:14, padding:'12px 8px', fontSize:15, fontWeight:900, cursor:'pointer',
                boxShadow: choice===opt.key ? `0 0 20px ${opt.glow}` : 'none',
                transition:'all 0.2s',
              }}>
              <div>{opt.label}</div>
              <div style={{ fontSize:11, opacity:0.8, marginTop:3 }}>{opt.sub}</div>
            </button>
          ))}
        </div>

        {/* Chips */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:14, flexWrap:'wrap' }}>
          {chips.map(c => (
            <button key={c} onClick={()=>setBet(c)}
              style={{
                background: bet===c ? 'linear-gradient(135deg,#FFD700,#FFA000)' : 'rgba(255,255,255,0.06)',
                color: bet===c ? '#000' : '#fff',
                border: bet===c ? 'none' : '1px solid rgba(255,255,255,0.12)',
                borderRadius:10, padding:'7px 16px', cursor:'pointer', fontWeight:700,
                boxShadow: bet===c ? '0 0 12px rgba(255,215,0,0.4)' : 'none',
              }}>{c}</button>
          ))}
        </div>

        <div style={{ display:'flex', justifyContent:'center' }}>
          <button onClick={playGame} disabled={playing}
            style={{
              background: playing ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#9c27b0,#7b1fa2)',
              color:'#fff', border:'none', borderRadius:14, padding:'13px 52px',
              fontSize:16, fontWeight:900, cursor: playing ? 'not-allowed':'pointer',
              opacity: playing ? 0.7 : 1,
              boxShadow: playing ? 'none' : '0 4px 20px rgba(156,39,176,0.5)',
            }}>
            {playing ? '⏳ 發牌中...' : '🎴 開始對決'}
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
