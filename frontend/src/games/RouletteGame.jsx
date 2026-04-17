import { useState, useEffect, useCallback, useRef } from 'react'
import GameLayout from '../components/GameLayout'
import JackpotModal from '../components/JackpotModal'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'
import './RouletteGame.css'

const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])
const NUM_SLOTS = 37

// Layout: European roulette wheel order
const WHEEL_ORDER = [
  0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26
]

function getNumColor(n) {
  if (n === 0) return '#1b8a1b'
  return RED_NUMS.has(n) ? '#c62828' : '#1a1a1a'
}

function createParticle(x, y, color) {
  return {
    x, y,
    vx: (Math.random() - 0.5) * 10,
    vy: (Math.random() - 0.5) * 10 - 4,
    life: 1.0,
    decay: 0.02 + Math.random() * 0.025,
    size: 5 + Math.random() * 8,
    color,
  }
}

export default function RouletteGame() {
  const [betType, setBetType] = useState('red')
  const [numTarget, setNumTarget] = useState(7)
  const apiFn = useCallback((bet, extra) => gameAPI.roulette(bet, extra), [])
  const { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot } = useGame(apiFn)

  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)
  const frameRef = useRef(0)
  const wheelAngleRef = useRef(0)
  const ballAngleRef = useRef(0)
  const ballRadiusRef = useRef(0)
  const spinVelRef = useRef(0)
  const ballVelRef = useRef(0)
  const spinningRef = useRef(false)
  const targetSlotRef = useRef(0)
  const resultDisplayRef = useRef(null)

  useEffect(() => {
    if (spinning) {
      spinningRef.current = true
      spinVelRef.current = 0.18 + Math.random() * 0.08
      ballVelRef.current = -(0.22 + Math.random() * 0.1)
      ballRadiusRef.current = 0.88
      resultDisplayRef.current = null
    } else if (!spinning && spinningRef.current) {
      spinningRef.current = false
      // Find target slot
      if (result) {
        const slotIdx = WHEEL_ORDER.indexOf(result.spin)
        targetSlotRef.current = slotIdx >= 0 ? slotIdx : 0
        resultDisplayRef.current = result
        // Win particles
        if (result.win > 0) {
          const canvas = canvasRef.current
          if (canvas) {
            const cx = canvas.width / 2, cy = canvas.height / 2
            const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#ffffff']
            for (let i = 0; i < 80; i++) {
              particlesRef.current.push(
                createParticle(cx + (Math.random() - 0.5) * 60, cy + (Math.random() - 0.5) * 60,
                  colors[Math.floor(Math.random() * colors.length)])
              )
            }
          }
        }
      }
    }
  }, [spinning, result])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2
    const outerR = Math.min(W, H) * 0.46
    const innerR = outerR * 0.55
    const ballTrackR = outerR * 0.82
    const pocketR = outerR * 0.65

    const animate = () => {
      frameRef.current++
      ctx.clearRect(0, 0, W, H)

      // Background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.6)
      bg.addColorStop(0, '#1a0a00')
      bg.addColorStop(1, '#0a0500')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Spin deceleration
      if (spinningRef.current) {
        spinVelRef.current *= 0.9992
        ballVelRef.current *= 0.9988
        wheelAngleRef.current += spinVelRef.current
        ballAngleRef.current += ballVelRef.current
        // Ball spiral inward
        if (Math.abs(ballVelRef.current) < 0.04) {
          ballRadiusRef.current = Math.max(pocketR / outerR, ballRadiusRef.current - 0.002)
        }
      } else {
        // Gentle idle drift
        wheelAngleRef.current += 0.002
        ballAngleRef.current -= 0.003
      }

      // Outer rim
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, outerR + 8, 0, Math.PI * 2)
      const rimGrad = ctx.createRadialGradient(cx, cy, outerR - 4, cx, cy, outerR + 12)
      rimGrad.addColorStop(0, '#8B6914')
      rimGrad.addColorStop(0.5, '#FFD700')
      rimGrad.addColorStop(1, '#8B6914')
      ctx.fillStyle = rimGrad
      ctx.fill()
      ctx.restore()

      // Draw wheel slots
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(wheelAngleRef.current)
      const sliceAngle = (Math.PI * 2) / NUM_SLOTS

      for (let i = 0; i < NUM_SLOTS; i++) {
        const startA = i * sliceAngle - sliceAngle / 2
        const endA = startA + sliceAngle
        const num = WHEEL_ORDER[i]

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, outerR, startA, endA)
        ctx.closePath()
        ctx.fillStyle = getNumColor(num)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,215,0,0.3)'
        ctx.lineWidth = 0.5
        ctx.stroke()

        // Number label
        ctx.save()
        ctx.rotate(i * sliceAngle)
        ctx.fillStyle = '#ffffff'
        ctx.font = `bold ${Math.max(7, outerR * 0.06)}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(num), 0, -(outerR * 0.82))
        ctx.restore()
      }

      ctx.restore()

      // Inner hub
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
      const hubGrad = ctx.createRadialGradient(cx - innerR * 0.2, cy - innerR * 0.2, 0, cx, cy, innerR)
      hubGrad.addColorStop(0, '#2a1505')
      hubGrad.addColorStop(0.6, '#1a0a00')
      hubGrad.addColorStop(1, '#0d0500')
      ctx.fillStyle = hubGrad
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,215,0,0.5)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()

      // Diamond separators
      ctx.save()
      ctx.translate(cx, cy)
      for (let i = 0; i < 8; i++) {
        ctx.save()
        ctx.rotate((i / 8) * Math.PI * 2)
        ctx.fillStyle = '#FFD700'
        ctx.beginPath()
        ctx.moveTo(0, -outerR + 2)
        ctx.lineTo(-5, -outerR + 12)
        ctx.lineTo(0, -outerR + 16)
        ctx.lineTo(5, -outerR + 12)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      ctx.restore()

      // Spinning ball
      const ballR = outerR * ballRadiusRef.current
      const bx = cx + Math.cos(ballAngleRef.current) * ballR
      const by = cy + Math.sin(ballAngleRef.current) * ballR

      ctx.save()
      const ballGrad = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 7)
      ballGrad.addColorStop(0, '#ffffff')
      ballGrad.addColorStop(0.4, '#dddddd')
      ballGrad.addColorStop(1, '#999999')
      ctx.fillStyle = ballGrad
      ctx.shadowBlur = 12
      ctx.shadowColor = '#ffffff'
      ctx.beginPath()
      ctx.arc(bx, by, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Center decoration
      ctx.save()
      ctx.rotate(wheelAngleRef.current * 0.5)
      ctx.translate(cx, cy)
      for (let i = 0; i < 8; i++) {
        ctx.save()
        ctx.rotate((i / 8) * Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,215,0,0.4)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -(innerR - 10))
        ctx.stroke()
        ctx.restore()
      }
      ctx.restore()

      // Center dot
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, 10, 0, Math.PI * 2)
      ctx.fillStyle = '#FFD700'
      ctx.shadowBlur = 15
      ctx.shadowColor = '#FFD700'
      ctx.fill()
      ctx.restore()

      // Result number overlay when stopped
      if (resultDisplayRef.current && !spinningRef.current) {
        const r = resultDisplayRef.current
        ctx.save()
        ctx.fillStyle = getNumColor(r.spin)
        ctx.beginPath()
        ctx.arc(cx, cy, 28, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 22px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(r.spin), cx, cy)
        ctx.restore()
      }

      // Particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0)
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= p.decay
        ctx.save()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.shadowBlur = 6; ctx.shadowColor = p.color
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

  const doPlay = () => play({ bet_type: betType, number: numTarget })

  const BET_TYPES = [
    { key: 'red',    label: '🔴 紅色',    mult: '×2',  color: 'var(--red)' },
    { key: 'black',  label: '⚫ 黑色',    mult: '×2',  color: 'var(--white)' },
    { key: 'green',  label: '🟢 綠色(0)', mult: '×14', color: 'var(--green)' },
    { key: 'even',   label: '偶數',        mult: '×2',  color: 'var(--cyan)' },
    { key: 'odd',    label: '奇數',        mult: '×2',  color: 'var(--purple)' },
    { key: 'number', label: '指定號碼',    mult: '×36', color: 'var(--gold)' },
  ]

  return (
    <GameLayout title="幸運女神輪" emoji="🎡">
      {showJackpot && result?.win > 0 && <JackpotModal amount={result.win} onClose={() => setShowJackpot(false)} />}

      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          style={{
            width: '100%', maxWidth: 360,
            borderRadius: '50%',
            boxShadow: '0 0 40px rgba(255,215,0,0.35)',
          }}
        />
      </div>

      {result && !spinning && (
        <div style={{
          textAlign: 'center', margin: '4px 16px', padding: '10px',
          borderRadius: 12, fontWeight: 700, fontSize: 15,
          background: result.win > 0 ? 'rgba(0,255,136,0.1)' : 'rgba(255,59,92,0.1)',
          color: result.win > 0 ? '#4CAF50' : '#F44336',
          border: `1px solid ${result.win > 0 ? 'rgba(0,255,136,0.3)' : 'rgba(255,59,92,0.3)'}`,
        }}>
          {`${result.spin} — ${result.color === 'red' ? '🔴紅色' : result.color === 'black' ? '⚫黑色' : '🟢綠色'}`}
          {result.win > 0 ? ` → +${result.win.toFixed(2)}` : ' — 未中獎'}
        </div>
      )}

      <div className="bet-panel">
        <h3>🎯 押注類型</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {BET_TYPES.map(b => (
            <button key={b.key} onClick={() => setBetType(b.key)}
              className={`bet-chip ${betType === b.key ? 'active' : ''}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 6px' }}>
              <span style={{ fontSize: 13, color: b.color }}>{b.label}</span>
              <span style={{ fontSize: 11, color: 'var(--cyan)' }}>{b.mult}</span>
            </button>
          ))}
        </div>
        {betType === 'number' && (
          <input className="input" type="number" min="0" max="36" value={numTarget}
            onChange={e => setNumTarget(Number(e.target.value))} placeholder="0-36" />
        )}
        <div className="bet-amounts">
          {chips.map(c => (
            <button key={c} className={`bet-chip ${bet === c ? 'active' : ''}`} onClick={() => setBet(c)}>{c}</button>
          ))}
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
