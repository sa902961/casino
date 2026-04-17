import { useState, useEffect, useRef } from 'react'
import GameLayout from '../components/GameLayout'
import useGame from '../hooks/useGame'

const SUITS = ['♠','♥','♦','♣']
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

function makeCard(r, s) {
  const val = r==='A'?11:['J','Q','K'].includes(r)?10:parseInt(r)
  return { rank:r, suit:s, val, red: s==='♥'||s==='♦' }
}
function shuffleDeck() {
  const deck = []
  for (const s of SUITS) for (const r of RANKS) deck.push(makeCard(r,s))
  for (let i=deck.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]
  }
  return deck
}
function handValue(cards) {
  let sum = cards.reduce((a,c)=>a+c.val,0)
  let aces = cards.filter(c=>c.rank==='A').length
  while (sum > 21 && aces > 0) { sum -= 10; aces-- }
  return sum
}

function createParticle(x, y, color) {
  return {
    x, y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10-4,
    life: 1.0, decay: 0.02+Math.random()*0.025, size: 4+Math.random()*8, color,
  }
}

function AnimatedCard({ card, hidden, dealDelay = 0 }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    setShow(false)
    if (card !== undefined) {
      const t = setTimeout(() => setShow(true), dealDelay)
      return () => clearTimeout(t)
    }
  }, [card, dealDelay])

  return (
    <div style={{ perspective: 600, width: 52, height: 74 }}>
      <div style={{
        width: '100%', height: '100%',
        transition: `transform 0.45s ease ${dealDelay}ms`,
        transformStyle: 'preserve-3d',
        transform: show ? 'rotateY(0deg)' : 'rotateY(90deg)',
      }}>
        {hidden ? (
          <div style={{
            width: 52, height: 74, borderRadius: 10,
            background: 'linear-gradient(135deg,#1a237e,#283593)',
            border: '2px solid #5c6bc0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}>🂠</div>
        ) : card ? (
          <div style={{
            width: 52, height: 74, borderRadius: 10, background: '#fff',
            border: '2px solid #ddd', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between', padding: '5px 4px',
            color: card.red ? '#c62828' : '#111', fontWeight: 'bold',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 13, alignSelf: 'flex-start' }}>{card.rank}</div>
            <div style={{ fontSize: 22 }}>{card.suit}</div>
            <div style={{ fontSize: 13, alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>{card.rank}</div>
          </div>
        ) : (
          <div style={{ width: 52, height: 74, borderRadius: 10, background: 'rgba(255,255,255,0.05)',
            border: '2px dashed rgba(255,255,255,0.15)' }} />
        )}
      </div>
    </div>
  )
}

export default function BlackjackGame() {
  const [deck, setDeck] = useState([])
  const [playerCards, setPlayerCards] = useState([])
  const [dealerCards, setDealerCards] = useState([])
  const [gameState, setGameState] = useState('idle')
  const [message, setMessage] = useState('')
  const [bet, setBet] = useState(10)
  const [balance, setBalance] = useState(1000)
  const [hideDealer, setHideDealer] = useState(true)

  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)
  const frameRef = useRef(0)

  // Canvas background & particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const animate = () => {
      frameRef.current++
      ctx.clearRect(0, 0, W, H)

      const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7)
      bg.addColorStop(0, '#0d4a2a')
      bg.addColorStop(1, '#071a10')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      ctx.strokeStyle = 'rgba(255,215,0,0.35)'
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.roundRect(10, 10, W-20, H-20, 18); ctx.stroke()
      ctx.strokeStyle = 'rgba(255,215,0,0.12)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.roundRect(18, 18, W-36, H-36, 12); ctx.stroke()

      // shimmer
      const sx = ((frameRef.current * 1.5) % (W + 60)) - 30
      const sh = ctx.createLinearGradient(sx, 0, sx+50, H)
      sh.addColorStop(0, 'rgba(255,255,255,0)')
      sh.addColorStop(0.5, 'rgba(255,255,255,0.04)')
      sh.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H)

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

  const spawnWinParticles = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const W = canvas.width, H = canvas.height
    const colors = ['#FFD700','#FFA500','#FF6B6B','#4ECDC4','#ffffff']
    for (let i = 0; i < 70; i++) {
      particlesRef.current.push(
        createParticle(W*0.2+Math.random()*W*0.6, H*0.2+Math.random()*H*0.5,
          colors[Math.floor(Math.random()*colors.length)])
      )
    }
  }

  const deal = () => {
    if (bet > balance) return setMessage('餘額不足')
    const d = shuffleDeck()
    const p = [d[0], d[2]]
    const dl = [d[1], d[3]]
    setDeck(d.slice(4)); setPlayerCards(p); setDealerCards(dl)
    setHideDealer(true); setGameState('playing'); setMessage('')
    setBalance(b => b - bet)
    if (handValue(p) === 21) setTimeout(() => stand([d[1],d[3]], d.slice(4), p, true), 500)
  }

  const hit = () => {
    if (gameState !== 'playing') return
    const newCard = deck[0], newDeck = deck.slice(1)
    const newHand = [...playerCards, newCard]
    setPlayerCards(newHand); setDeck(newDeck)
    const v = handValue(newHand)
    if (v > 21) {
      setHideDealer(false); setGameState('done'); setMessage('💥 爆牌！莊家獲勝')
    } else if (v === 21) {
      stand(dealerCards, newDeck, newHand)
    }
  }

  const stand = (dl=dealerCards, dk=deck, ph=playerCards, natural=false) => {
    setHideDealer(false)
    let dHand = [...dl], dDeck = [...dk]
    while (handValue(dHand) < 17) { dHand.push(dDeck[0]); dDeck = dDeck.slice(1) }
    setDealerCards(dHand); setGameState('done')
    const pv = handValue(ph), dv = handValue(dHand)
    const blackjack = natural && pv === 21
    if (pv > 21) {
      setMessage('💥 爆牌！莊家獲勝')
    } else if (dv > 21 || pv > dv) {
      const win = blackjack ? Math.floor(bet*2.5) : bet*2
      setBalance(b => b+win)
      setMessage(blackjack ? `🃏 BlackJack！+${win}` : `🎉 你贏了！+${win}`)
      spawnWinParticles()
    } else if (pv === dv) {
      setBalance(b => b+bet)
      setMessage('🤝 平局！退回下注')
    } else {
      setMessage('😔 莊家獲勝')
    }
  }

  const doubleDown = () => {
    if (playerCards.length !== 2 || gameState !== 'playing') return
    if (bet > balance) return setMessage('餘額不足加倍')
    setBalance(b => b - bet); setBet(b => b*2)
    const newCard = deck[0], newDeck = deck.slice(1)
    const newHand = [...playerCards, newCard]
    setPlayerCards(newHand); setDeck(newDeck)
    stand(dealerCards, newDeck, newHand)
  }

  const pv = handValue(playerCards)
  const dv = handValue(dealerCards)
  const msgColor = message.includes('贏')||message.includes('Jack') ? '#4CAF50'
    : message.includes('平') ? '#FFD700' : '#F44336'

  return (
    <GameLayout title="二十一爆破" emoji="🃏">
      <div style={{ padding: '0 16px' }}>

        {/* Info bar */}
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 10,
          background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '8px 16px',
        }}>
          <div style={{ color: '#FFD700', fontWeight: 700 }}>💰 {balance}</div>
          <div style={{ color: '#00E5FF', fontWeight: 700 }}>下注: {bet}</div>
        </div>

        {/* Canvas felt table */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <canvas ref={canvasRef} width={380} height={200}
            style={{ width: '100%', maxWidth: 480, borderRadius: 18, display: 'block' }} />

          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', padding: '16px 20px',
          }}>
            {/* Dealer */}
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 6, textAlign: 'center', letterSpacing: 1 }}>
                🎩 DEALER {gameState==='done' ? `(${dv})` : ''}
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                {dealerCards.map((c,i) => (
                  <AnimatedCard key={i} card={c} hidden={i===1&&hideDealer} dealDelay={i*300} />
                ))}
                {!dealerCards.length && [0,1].map(i => <AnimatedCard key={i} card={undefined} />)}
              </div>
            </div>

            {/* Player */}
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 6, textAlign: 'center', letterSpacing: 1 }}>
                👤 YOU {playerCards.length ? `(${pv})` : ''}
                {pv===21&&playerCards.length===2&&<span style={{color:'#FFD700'}}> ⭐ BJ!</span>}
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                {playerCards.map((c,i) => (
                  <AnimatedCard key={i} card={c} dealDelay={i*300+150} />
                ))}
                {!playerCards.length && [0,1].map(i => <AnimatedCard key={i} card={undefined} />)}
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            textAlign: 'center', fontSize: 18, fontWeight: 900, marginBottom: 10,
            padding: '10px 16px', borderRadius: 12,
            background: msgColor + '22', color: msgColor,
            border: `1px solid ${msgColor}44`,
          }}>{message}</div>
        )}

        {/* Bet chips (idle/done) */}
        {(gameState === 'idle' || gameState === 'done') && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#aaa', fontSize: 12, marginBottom: 6, textAlign: 'center' }}>選擇下注</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[5,10,25,50,100,500].map(c => (
                <button key={c} onClick={()=>setBet(c)}
                  style={{
                    background: bet===c ? 'linear-gradient(135deg,#FFD700,#FFA000)' : 'rgba(255,255,255,0.07)',
                    color: bet===c ? '#000' : '#fff',
                    border: bet===c ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10, padding: '7px 16px', cursor: 'pointer', fontWeight: 700,
                    boxShadow: bet===c ? '0 0 12px rgba(255,215,0,0.4)' : 'none',
                  }}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {gameState === 'idle' || gameState === 'done' ? (
            <button onClick={deal} style={{
              background: 'linear-gradient(135deg,#1565c0,#1976d2)',
              color: '#fff', border: 'none', borderRadius: 14, padding: '13px 44px',
              fontSize: 16, fontWeight: 900, cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(21,101,192,0.5)',
            }}>🃏 發牌</button>
          ) : (
            <>
              <button onClick={hit} style={{
                background: 'linear-gradient(135deg,#2e7d32,#43a047)',
                color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px',
                fontSize: 15, fontWeight: 900, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(46,125,50,0.4)',
              }}>➕ 要牌</button>
              <button onClick={()=>stand()} style={{
                background: 'linear-gradient(135deg,#c62828,#e53935)',
                color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px',
                fontSize: 15, fontWeight: 900, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(198,40,40,0.4)',
              }}>✋ 停牌</button>
              {playerCards.length === 2 && (
                <button onClick={doubleDown} style={{
                  background: 'linear-gradient(135deg,#f57f17,#ffa000)',
                  color: '#000', border: 'none', borderRadius: 12, padding: '12px 22px',
                  fontSize: 15, fontWeight: 900, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(245,127,23,0.4)',
                }}>💥 加倍</button>
              )}
            </>
          )}
        </div>
      </div>
    </GameLayout>
  )
}
