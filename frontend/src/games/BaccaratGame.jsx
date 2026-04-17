import { useState, useEffect, useCallback, useRef } from 'react'
import GameLayout from '../components/GameLayout'
import JackpotModal from '../components/JackpotModal'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'
import './CardGame.css'

function createParticle(x, y, color) {
  return {
    x, y,
    vx: (Math.random() - 0.5) * 10,
    vy: (Math.random() - 0.5) * 10 - 3,
    life: 1.0,
    decay: 0.02 + Math.random() * 0.02,
    size: 4 + Math.random() * 8,
    color,
  }
}

function AnimatedCard({ card, delay = 0, revealed = false }) {
  const [flipped, setFlipped] = useState(false)
  useEffect(() => {
    if (card) {
      const t = setTimeout(() => setFlipped(true), delay)
      return () => clearTimeout(t)
    } else {
      setFlipped(false)
    }
  }, [card, delay])

  if (!card) {
    return (
      <div style={{
        width: 56, height: 80, borderRadius: 10,
        background: 'linear-gradient(135deg, #1a237e, #283593)',
        border: '2px solid #3949ab',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>🂠</div>
    )
  }

  const [face, suit] = card
  const isRed = suit === '♥' || suit === '♦'

  return (
    <div style={{
      width: 56, height: 80,
      perspective: 600,
      transformStyle: 'preserve-3d',
    }}>
      <div style={{
        width: '100%', height: '100%',
        transition: `transform 0.5s ease ${delay}ms`,
        transformStyle: 'preserve-3d',
        transform: flipped ? 'rotateY(0deg)' : 'rotateY(90deg)',
      }}>
        <div style={{
          width: 56, height: 80, borderRadius: 10,
          background: '#fff',
          border: '2px solid #ddd',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '5px 4px',
          color: isRed ? '#c62828' : '#111',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          backfaceVisibility: 'hidden',
        }}>
          <div style={{ fontSize: 13, alignSelf: 'flex-start' }}>{face}</div>
          <div style={{ fontSize: 22 }}>{suit}</div>
          <div style={{ fontSize: 13, alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>{face}</div>
        </div>
      </div>
    </div>
  )
}

export default function BaccaratGame() {
  const [side, setSide] = useState('player')
  const apiFn = useCallback((bet, extra) => gameAPI.baccarat(bet, extra), [])
  const { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot, user } = useGame(apiFn)

  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)
  const frameRef = useRef(0)

  const doPlay = () => play({ side })

  const SIDES = [
    { key: 'player', label: '閒', mult: '×2.0',  color: '#00BCD4', glow: 'rgba(0,188,212,0.4)' },
    { key: 'banker', label: '莊', mult: '×1.95', color: '#F44336', glow: 'rgba(244,67,54,0.4)' },
    { key: 'tie',    label: '和', mult: '×8.0',  color: '#4CAF50', glow: 'rgba(76,175,80,0.4)' },
  ]

  // Spawn particles on win
  useEffect(() => {
    if (result?.win > 0) {
      const canvas = canvasRef.current
      if (!canvas) return
      const W = canvas.width, H = canvas.height
      const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4']
      for (let i = 0; i < 80; i++) {
        particlesRef.current.push(
          createParticle(
            W * 0.2 + Math.random() * W * 0.6,
            H * 0.3 + Math.random() * H * 0.3,
            colors[Math.floor(Math.random() * colors.length)]
          )
        )
      }
    }
  }, [result])

  // Canvas background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const animate = () => {
      frameRef.current++
      ctx.clearRect(0, 0, W, H)

      // Table felt background
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7)
      bg.addColorStop(0, '#0d4a2a')
      bg.addColorStop(1, '#071a10')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Table border
      ctx.strokeStyle = 'rgba(255,215,0,0.4)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(10, 10, W - 20, H - 20, 20)
      ctx.stroke()

      // Decorative inner border
      ctx.strokeStyle = 'rgba(255,215,0,0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(18, 18, W - 36, H - 36, 15)
      ctx.stroke()

      // Shimmer effect
      const shimmerX = ((frameRef.current * 2) % (W + 100)) - 50
      const shimmer = ctx.createLinearGradient(shimmerX, 0, shimmerX + 50, H)
      shimmer.addColorStop(0, 'rgba(255,255,255,0)')
      shimmer.addColorStop(0.5, 'rgba(255,255,255,0.04)')
      shimmer.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = shimmer
      ctx.fillRect(0, 0, W, H)

      // Particle update
      particlesRef.current = particlesRef.current.filter(p => p.life > 0)
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= p.decay
        ctx.save()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.shadowBlur = 8; ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const winnerLabel = result
    ? result.winner === 'tie' ? '🤝 和局' : result.winner === 'player' ? '👤 閒家勝' : '🏦 莊家勝'
    : null

  return (
    <GameLayout title="龍虎對決（百家樂）" emoji="🃏">
      {showJackpot && result?.win > 0 && <JackpotModal amount={result.win} onClose={() => setShowJackpot(false)} />}

      {/* Canvas felt table */}
      <div style={{ position: 'relative', margin: '8px 16px' }}>
        <canvas
          ref={canvasRef}
          width={380}
          height={180}
          style={{
            width: '100%', maxWidth: 480, borderRadius: 20,
            display: 'block',
          }}
        />

        {/* Cards overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '16px 24px',
        }}>
          {/* Player side */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#00BCD4', fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>閒 PLAYER</div>
            <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
              {result
                ? result.player_hand.map((c, i) => <AnimatedCard key={i} card={c} delay={i * 300} />)
                : [null, null].map((_, i) => <AnimatedCard key={i} card={null} />)
              }
            </div>
            {result && (
              <div style={{
                marginTop: 6, fontSize: 18, fontWeight: 900, color: '#fff',
                textShadow: '0 0 10px rgba(255,255,255,0.5)',
              }}>{result.player_score}</div>
            )}
          </div>

          {/* VS */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#FFD700', fontSize: 20, fontWeight: 900, textShadow: '0 0 15px rgba(255,215,0,0.6)' }}>VS</div>
            {result && (
              <div style={{
                marginTop: 8, fontSize: 13, fontWeight: 700,
                color: result.win > 0 ? '#4CAF50' : '#F44336',
              }}>
                {winnerLabel}
                {result.win > 0 && <div style={{ color: '#FFD700' }}>+{result.win.toFixed(2)}</div>}
              </div>
            )}
          </div>

          {/* Banker side */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#F44336', fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>莊 BANKER</div>
            <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
              {result
                ? result.banker_hand.map((c, i) => <AnimatedCard key={i} card={c} delay={i * 300 + 150} />)
                : [null, null].map((_, i) => <AnimatedCard key={i} card={null} />)
              }
            </div>
            {result && (
              <div style={{
                marginTop: 6, fontSize: 18, fontWeight: 900, color: '#fff',
                textShadow: '0 0 10px rgba(255,255,255,0.5)',
              }}>{result.banker_score}</div>
            )}
          </div>
        </div>
      </div>

      <div className="bet-panel">
        <h3>🃏 選擇押注</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {SIDES.map(s => (
            <button key={s.key} onClick={() => setSide(s.key)}
              className={`bet-chip ${side === s.key ? 'active' : ''}`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, padding: '14px 8px',
                boxShadow: side === s.key ? `0 0 16px ${s.glow}` : 'none',
              }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.label}</span>
              <span style={{ fontSize: 11, color: 'var(--gray)' }}>{s.mult}</span>
            </button>
          ))}
        </div>
        <div className="bet-amounts">
          {chips.map(c => (
            <button key={c} className={`bet-chip ${bet === c ? 'active' : ''}`} onClick={() => setBet(c)}>{c}</button>
          ))}
        </div>
        <div className="bet-input-row">
          <span style={{ color: 'var(--gray)', fontSize: 13 }}>餘額：{user?.balance?.toFixed(2) ?? '--'}</span>
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
