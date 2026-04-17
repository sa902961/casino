import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import GameLayout from '../components/GameLayout'
import JackpotModal from '../components/JackpotModal'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'
import './SlotGame.css'

const THEME_INFO = {
  fruit:  { name:'幸運狂轉',  emoji:'🍒', symbols:['🍒','🍋','🍊','🍇','🍉','⭐','7️⃣'], bg:'#1a0830' },
  god:    { name:'財神降臨',  emoji:'🏮', symbols:['🐉','💎','🪙','🎴','🎋','🧧','💰'], bg:'#1a1000' },
  cat:    { name:'招財天降',  emoji:'🐱', symbols:['🐱','🎏','🌸','🎐','🌊','🍀','👛'], bg:'#0a1a10' },
  sanguo: { name:'三國霸業',  emoji:'⚔️', symbols:['⚔️','🛡️','🏹','👑','🔥','🌟','💥'], bg:'#1a0a00' },
  dragon: { name:'龍騰九霄',  emoji:'🐉', symbols:['🐉','🔱','💎','🌊','⚡','🔥','🌙'], bg:'#0a0a1a' },
  egypt:  { name:'法老密語',  emoji:'👸', symbols:['👸','🦅','🐍','🏺','📜','💎','⚡'], bg:'#1a1000' },
  vegas:  { name:'Vegas狂熱', emoji:'🎰', symbols:['💎','🃏','🎰','🍸','💰','⭐','🎲'], bg:'#1a0000' },
  spring: { name:'鴻運爆發',  emoji:'🧧', symbols:['🧧','🎆','🏮','🌸','💴','🎊','🍊'], bg:'#1a0505' },
  panda:  { name:'熊貓秘境',  emoji:'🐼', symbols:['🐼','🎋','🌸','🍃','🦋','⭐','💚'], bg:'#051a0a' },
  ninja:  { name:'武神傳說',  emoji:'🗡️', symbols:['🗡️','⚔️','🥷','🌙','💫','🔥','🎯'], bg:'#0a0a1a' },
  moon:   { name:'月亮傳說',  emoji:'🌙', symbols:['🌙','⭐','🔮','💫','🌟','🌌','✨'], bg:'#05051a' },
}

// Particle system
function createParticle(x, y, color) {
  return {
    x, y,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 0.5) * 8 - 3,
    life: 1.0,
    decay: 0.02 + Math.random() * 0.02,
    size: 4 + Math.random() * 8,
    color,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.2,
  }
}

const COIN_COLORS = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']

export default function SlotGame() {
  const { theme } = useParams()
  const info = THEME_INFO[theme] || THEME_INFO.fruit
  const apiFn = useCallback((bet, extra) => gameAPI.slot(bet, { ...extra, theme }), [theme])
  const { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot, user } = useGame(apiFn)

  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)
  const reelOffsetsRef = useRef([0, 0, 0])
  const reelSpeedsRef = useRef([0, 0, 0])
  const reelStoppedRef = useRef([false, false, false])
  const finalReelsRef = useRef(null)
  const spinningRef = useRef(false)
  const frameRef = useRef(0)
  const flashRef = useRef(0) // win flash timer
  const winLinesRef = useRef([]) // winning rows

  // Canvas dimensions
  const COL_COUNT = 3
  const ROW_COUNT = 3
  const CELL_W = 110
  const CELL_H = 90
  const CANVAS_W = COL_COUNT * CELL_W + 40
  const CANVAS_H = ROW_COUNT * CELL_H + 60

  // Symbol tape per column (extended for scroll)
  const tapeRef = useRef(
    Array.from({ length: COL_COUNT }, () =>
      Array.from({ length: 24 }, () => info.symbols[Math.floor(Math.random() * info.symbols.length)])
    )
  )

  useEffect(() => {
    tapeRef.current = Array.from({ length: COL_COUNT }, () =>
      Array.from({ length: 24 }, () => info.symbols[Math.floor(Math.random() * info.symbols.length)])
    )
  }, [theme, info.symbols])

  // Start spin
  useEffect(() => {
    if (spinning) {
      spinningRef.current = true
      reelStoppedRef.current = [false, false, false]
      reelSpeedsRef.current = [18, 18, 18]
      finalReelsRef.current = null
      flashRef.current = 0
      winLinesRef.current = []
      // Rebuild tapes
      tapeRef.current = Array.from({ length: COL_COUNT }, () =>
        Array.from({ length: 24 }, () => info.symbols[Math.floor(Math.random() * info.symbols.length)])
      )
    } else if (!spinning && spinningRef.current) {
      // Stop spin - set final values
      spinningRef.current = false
      if (result?.reels) {
        finalReelsRef.current = result.reels
        // Stop reels sequentially
        const stopReel = (col, delay) => {
          setTimeout(() => {
            reelStoppedRef.current[col] = true
            reelSpeedsRef.current[col] = 0
            // Snap tape to show result
            if (result.reels[col]) {
              for (let row = 0; row < ROW_COUNT; row++) {
                const tapeLen = tapeRef.current[col].length
                const snapIdx = (tapeLen - ROW_COUNT + row) % tapeLen
                tapeRef.current[col][snapIdx] = result.reels[col][row]
              }
              reelOffsetsRef.current[col] = 0
            }
            if (col === COL_COUNT - 1) {
              // Check win lines
              if (result.win > 0) {
                flashRef.current = 60
                winLinesRef.current = [1] // middle row
                // Spawn jackpot particles
                for (let i = 0; i < 80; i++) {
                  particlesRef.current.push(
                    createParticle(
                      20 + Math.random() * CANVAS_W,
                      20 + Math.random() * CANVAS_H,
                      COIN_COLORS[Math.floor(Math.random() * COIN_COLORS.length)]
                    )
                  )
                }
              }
            }
          }, delay)
        }
        stopReel(0, 300)
        stopReel(1, 700)
        stopReel(2, 1100)
      }
    }
  }, [spinning, result, CANVAS_W, CANVAS_H])

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const drawSymbol = (sym, cx, cy, size = 44) => {
      ctx.font = `${size}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(sym, cx, cy)
    }

    let lastTime = 0
    const animate = (timestamp) => {
      if (timestamp - lastTime < 33) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }
      lastTime = timestamp
      frameRef.current++
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H)
      bgGrad.addColorStop(0, '#0a0e1a')
      bgGrad.addColorStop(1, info.bg)
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      const offsetX = 20
      const offsetY = 30

      // Draw each column
      for (let col = 0; col < COL_COUNT; col++) {
        const x = offsetX + col * CELL_W

        // Reel background
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(x, offsetY, CELL_W - 8, ROW_COUNT * CELL_H, 12)
        ctx.fillStyle = 'rgba(255,255,255,0.04)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,215,0,0.3)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.restore()

        // Clip to reel area
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(x, offsetY, CELL_W - 8, ROW_COUNT * CELL_H, 12)
        ctx.clip()

        const tape = tapeRef.current[col]
        const speed = reelSpeedsRef.current[col]
        const stopped = reelStoppedRef.current[col]

        if (!stopped && spinningRef.current) {
          reelOffsetsRef.current[col] = (reelOffsetsRef.current[col] + speed) % CELL_H
          // Decelerate after result is ready
          if (reelSpeedsRef.current[col] > 0) {
            reelSpeedsRef.current[col] = Math.max(4, reelSpeedsRef.current[col] * 0.998)
          }
        }

        const offset = reelOffsetsRef.current[col]
        const startIdx = Math.floor(offset / CELL_H)

        for (let row = -1; row < ROW_COUNT + 1; row++) {
          const tapeIdx = ((startIdx + row) % tape.length + tape.length) % tape.length
          const sym = tape[tapeIdx]
          const cy = offsetY + row * CELL_H + (offset % CELL_H) + CELL_H / 2
          drawSymbol(sym, x + (CELL_W - 8) / 2, cy)
        }

        ctx.restore()

        // Row separator lines
        for (let row = 1; row < ROW_COUNT; row++) {
          ctx.beginPath()
          ctx.moveTo(x, offsetY + row * CELL_H)
          ctx.lineTo(x + CELL_W - 8, offsetY + row * CELL_H)
          ctx.strokeStyle = 'rgba(255,255,255,0.08)'
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      // Win line highlight
      if (winLinesRef.current.length > 0 && flashRef.current > 0) {
        const alpha = 0.4 + 0.4 * Math.sin(frameRef.current * 0.2)
        const winRow = 1 // middle row
        const y = offsetY + winRow * CELL_H
        const grad = ctx.createLinearGradient(offsetX, y, offsetX + COL_COUNT * CELL_W, y)
        grad.addColorStop(0, `rgba(255,215,0,0)`)
        grad.addColorStop(0.5, `rgba(255,215,0,${alpha})`)
        grad.addColorStop(1, `rgba(255,215,0,0)`)
        ctx.fillStyle = grad
        ctx.fillRect(offsetX, offsetY + winRow * CELL_H, COL_COUNT * (CELL_W - 8) + 8, CELL_H)

        // Draw line indicator
        ctx.strokeStyle = `rgba(255,215,0,${alpha * 1.5})`
        ctx.lineWidth = 3
        ctx.setLineDash([8, 4])
        ctx.beginPath()
        ctx.moveTo(offsetX, offsetY + winRow * CELL_H + CELL_H / 2)
        ctx.lineTo(offsetX + COL_COUNT * (CELL_W - 8), offsetY + winRow * CELL_H + CELL_H / 2)
        ctx.stroke()
        ctx.setLineDash([])

        flashRef.current--
      }

      // Pay line markers
      const midY = offsetY + 1 * CELL_H + CELL_H / 2
      ctx.fillStyle = 'rgba(255,215,0,0.6)'
      ctx.beginPath(); ctx.arc(offsetX - 6, midY, 5, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(offsetX + COL_COUNT * (CELL_W - 8) + 6, midY, 5, 0, Math.PI * 2); ctx.fill()

      // Update & draw particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0)
      particlesRef.current.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.15 // gravity
        p.life -= p.decay
        p.rotation += p.rotSpeed

        ctx.save()
        ctx.globalAlpha = p.life
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.shadowBlur = 6
        ctx.shadowColor = p.color
        // Draw coin shape
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size / 2, p.size / 3, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [info.bg, CANVAS_W, CANVAS_H])

  return (
    <GameLayout title={info.name} emoji={info.emoji}>
      {showJackpot && result?.win > 0 && (
        <JackpotModal amount={result.win} onClose={() => setShowJackpot(false)} />
      )}

      {/* H5 Canvas Slot Machine */}
      <div className="slot-machine h5-slot" style={{ background: info.bg }}>
        <div className="slot-title">{info.emoji} {info.name}</div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{
              borderRadius: 16,
              boxShadow: '0 0 30px rgba(255,215,0,0.3)',
              border: '2px solid rgba(255,215,0,0.4)',
              touchAction: 'none',
            }}
          />
        </div>

        {result && (
          <div className={`slot-result ${result.win > 0 ? 'slot-win' : ''}`}>
            {result.win > 0
              ? `🎉 贏得 +${result.win.toFixed(2)} (${result.multiplier}x)`
              : '未中獎 — 再試一次！'}
          </div>
        )}
      </div>

      {/* Bet panel */}
      <div className="bet-panel">
        <h3>💰 選擇籌碼</h3>
        <div className="bet-amounts">
          {chips.map(c => (
            <button key={c} className={`bet-chip ${bet === c ? 'active' : ''}`} onClick={() => setBet(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="bet-input-row">
          <input className="input" type="number" min="1" value={bet}
            onChange={e => setBet(Number(e.target.value))} />
          <span style={{ color: 'var(--gray)', fontSize: 13, whiteSpace: 'nowrap' }}>
            餘額：{user?.balance?.toFixed(2) ?? '--'}
          </span>
        </div>
        <div className="bet-actions">
          <button className="btn btn-gold btn-lg play-btn" onClick={() => play()} disabled={spinning}>
            {spinning ? '🎰 旋轉中...' : '🎰 旋轉！'}
          </button>
          <button className="btn btn-outline" onClick={() => setBet(Math.min(bet * 2, user?.balance || bet))}>2x</button>
          <button className="btn btn-outline" onClick={() => setBet(Math.max(1, Math.floor(bet / 2)))}>½</button>
        </div>
      </div>

      {/* Paytable */}
      <div className="slot-paytable card">
        <div className="paytable-title">📊 賠率表</div>
        <div className="paytable-rows">
          <div className="pay-row"><span>三個相同（高級符號）</span><span className="pay-mult">×20~50</span></div>
          <div className="pay-row"><span>三個相同（普通符號）</span><span className="pay-mult">×2~12</span></div>
          <div className="pay-row"><span>兩個相同</span><span className="pay-mult">×1.5</span></div>
          <div className="pay-row"><span>未中獎</span><span style={{ color: 'var(--red)' }}>×0</span></div>
        </div>
      </div>
    </GameLayout>
  )
}
