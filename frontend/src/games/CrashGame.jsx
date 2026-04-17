import { useState, useEffect, useCallback, useRef } from 'react'
import GameLayout from '../components/GameLayout'
import JackpotModal from '../components/JackpotModal'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'
import './CrashGame.css'

const HISTORY_MAX = 10

function createParticle(x, y, color) {
  return {
    x, y,
    vx: (Math.random() - 0.5) * 12,
    vy: (Math.random() - 0.5) * 12 - 4,
    life: 1.0,
    decay: 0.02 + Math.random() * 0.03,
    size: 4 + Math.random() * 8,
    color,
  }
}

export default function CrashGame() {
  const [cashOut, setCashOut] = useState(2.0)
  const [animMult, setAnimMult] = useState(1.0)
  const [history, setHistory] = useState([])
  const apiFn = useCallback((bet, extra) => gameAPI.crash(bet, extra), [])
  const { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot, user } = useGame(apiFn)

  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)
  const frameRef = useRef(0)
  const startTimeRef = useRef(null)
  const currentMultRef = useRef(1.0)
  const crashedRef = useRef(false)
  const wonRef = useRef(false)

  // Update history when result arrives
  useEffect(() => {
    if (result) {
      setHistory(h => [result.crash_point, ...h].slice(0, HISTORY_MAX))
      if (result.win > 0) {
        wonRef.current = true
        // Gold explosion
        const canvas = canvasRef.current
        if (canvas) {
          const W = canvas.width, H = canvas.height
          for (let i = 0; i < 60; i++) {
            particlesRef.current.push(createParticle(W / 2, H / 2, '#FFD700'))
            particlesRef.current.push(createParticle(W / 2, H / 2, '#FFA500'))
          }
        }
      } else {
        crashedRef.current = true
        // Red explosion
        const canvas = canvasRef.current
        if (canvas) {
          const W = canvas.width, H = canvas.height
          const cx = W * 0.8, cy = H * 0.2
          for (let i = 0; i < 50; i++) {
            particlesRef.current.push(createParticle(cx, cy, '#FF3B5C'))
            particlesRef.current.push(createParticle(cx, cy, '#FF8800'))
          }
        }
      }
    }
  }, [result])

  // Animation loop
  useEffect(() => {
    if (spinning) {
      startTimeRef.current = null
      currentMultRef.current = 1.0
      crashedRef.current = false
      wonRef.current = false
    } else {
      startTimeRef.current = null
    }
  }, [spinning])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const animate = (ts) => {
      frameRef.current++
      ctx.clearRect(0, 0, W, H)

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#0a0e2a')
      bg.addColorStop(1, '#050818')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // Stars
      for (let i = 0; i < 40; i++) {
        const sx = (i * 137 + frameRef.current * 0.1) % W
        const sy = (i * 89 + frameRef.current * 0.05) % H
        const alpha = 0.3 + 0.7 * Math.sin(frameRef.current * 0.05 + i)
        ctx.globalAlpha = alpha
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(sx, sy, 1, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Compute current multiplier
      let mult = currentMultRef.current
      if (spinning) {
        if (!startTimeRef.current) startTimeRef.current = ts
        const elapsed = (ts - startTimeRef.current) / 1000
        mult = Math.pow(1.07, elapsed * 10)
        currentMultRef.current = mult
        setAnimMult(mult)
      } else if (result) {
        mult = result.crash_point
      }

      // Draw curve
      const maxMult = Math.max(mult * 1.2, 2)
      const padL = 50, padB = 50
      const plotW = W - padL - 20
      const plotH = H - padB - 20

      // Axes
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(padL, 20); ctx.lineTo(padL, H - padB)
      ctx.lineTo(W - 20, H - padB)
      ctx.stroke()

      // Axis labels
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '11px monospace'
      ctx.textAlign = 'right'
      for (let m = 1; m <= Math.floor(maxMult); m++) {
        const y = (H - padB) - ((m - 1) / (maxMult - 1)) * plotH
        ctx.fillText(`${m}x`, padL - 4, y + 4)
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - 20, y); ctx.stroke()
      }

      // Curve path
      const crashed = crashedRef.current || (!spinning && result && result.win <= 0)
      const curveColor = crashed ? '#FF3B5C' : wonRef.current ? '#00FF88' : '#00F5FF'

      ctx.beginPath()
      ctx.strokeStyle = curveColor
      ctx.lineWidth = 3
      ctx.shadowBlur = 12
      ctx.shadowColor = curveColor

      const steps = 80
      let lastX = padL, lastY = H - padB
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const m = Math.pow(1.07, t * (mult - 1) * 10)
        const px = padL + t * plotW
        const py = (H - padB) - ((m - 1) / (maxMult - 1)) * plotH
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
        lastX = px; lastY = py
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Filled area under curve
      ctx.save()
      ctx.beginPath()
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const m = Math.pow(1.07, t * (mult - 1) * 10)
        const px = padL + t * plotW
        const py = (H - padB) - ((m - 1) / (maxMult - 1)) * plotH
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      ctx.lineTo(lastX, H - padB)
      ctx.lineTo(padL, H - padB)
      ctx.closePath()
      const fillGrad = ctx.createLinearGradient(0, 0, 0, H)
      fillGrad.addColorStop(0, `${curveColor}33`)
      fillGrad.addColorStop(1, `${curveColor}00`)
      ctx.fillStyle = fillGrad
      ctx.fill()
      ctx.restore()

      // Rocket / explosion at curve tip
      if (crashed) {
        ctx.font = '28px serif'
        ctx.textAlign = 'center'
        ctx.fillText('💥', lastX, lastY)
      } else {
        ctx.font = '24px serif'
        ctx.textAlign = 'center'
        const rocketBob = Math.sin(frameRef.current * 0.15) * 3
        ctx.fillText('🚀', lastX + 12, lastY - 12 + rocketBob)
      }

      // Big multiplier display
      ctx.textAlign = 'center'
      ctx.font = `bold ${clamp(Math.floor(W * 0.1), 32, 52)}px monospace`
      ctx.fillStyle = crashed ? '#FF3B5C' : wonRef.current ? '#00FF88' : '#FFD700'
      ctx.shadowBlur = 20
      ctx.shadowColor = ctx.fillStyle
      ctx.fillText(`${mult.toFixed(2)}x`, W / 2, H / 2 + 10)
      ctx.shadowBlur = 0

      // Particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0)
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life -= p.decay
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

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [spinning, result])

  const doPlay = () => play({ cash_out: cashOut })

  return (
    <GameLayout title="一飛沖天" emoji="🚀">
      {showJackpot && result?.win > 0 && <JackpotModal amount={result.win} onClose={() => setShowJackpot(false)} />}

      {/* History bar */}
      <div style={{ display: 'flex', gap: 6, padding: '4px 16px', overflowX: 'auto', marginBottom: 4 }}>
        {history.map((h, i) => (
          <div key={i} style={{
            flexShrink: 0, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: h >= 2 ? 'rgba(0,255,136,0.15)' : 'rgba(255,59,92,0.15)',
            color: h >= 2 ? '#00FF88' : '#FF3B5C',
            border: `1px solid ${h >= 2 ? 'rgba(0,255,136,0.3)' : 'rgba(255,59,92,0.3)'}`,
          }}>
            {h.toFixed(2)}x
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
        <canvas
          ref={canvasRef}
          width={380}
          height={260}
          style={{
            width: '100%', maxWidth: 480, borderRadius: 16,
            boxShadow: '0 0 30px rgba(0,245,255,0.25)',
            border: '2px solid rgba(0,245,255,0.2)',
          }}
        />
      </div>

      {result && !spinning && (
        <div style={{
          textAlign: 'center', margin: '4px 16px', padding: '10px',
          borderRadius: 12, fontWeight: 700, fontSize: 15,
          background: result.win > 0 ? 'rgba(0,255,136,0.1)' : 'rgba(255,59,92,0.1)',
          color: result.win > 0 ? '#00FF88' : '#FF3B5C',
          border: `1px solid ${result.win > 0 ? 'rgba(0,255,136,0.3)' : 'rgba(255,59,92,0.3)'}`,
        }}>
          {result.win > 0
            ? `✅ 成功出場！×${result.cash_out} → +${result.win.toFixed(2)}`
            : `💥 爆炸！@ ${result.crash_point.toFixed(2)}x — -${bet.toFixed(2)}`}
        </div>
      )}

      <div className="bet-panel">
        <h3>🎯 設定出場倍率</h3>
        <div className="bet-amounts">
          {[1.5, 2, 3, 5, 10, 20].map(v => (
            <button key={v} className={`bet-chip ${cashOut === v ? 'active' : ''}`} onClick={() => setCashOut(v)}>{v}x</button>
          ))}
        </div>
        <div className="bet-input-row">
          <input className="input" type="number" min="1.01" step="0.1" value={cashOut}
            onChange={e => setCashOut(Number(e.target.value))} />
          <span style={{ color: 'var(--cyan)', fontSize: 13 }}>目標倍率</span>
        </div>
        <h3>💰 下注金額</h3>
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
            {spinning ? `🚀 ${animMult.toFixed(2)}x 起飛中...` : `🚀 起飛！(出場@${cashOut}x)`}
          </button>
        </div>
      </div>
    </GameLayout>
  )
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }
