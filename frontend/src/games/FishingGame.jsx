import { useState, useEffect, useCallback, useRef } from 'react'
import GameLayout from '../components/GameLayout'
import JackpotModal from '../components/JackpotModal'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'
import './FishingGame.css'

const FISH_TYPES = [
  { name:'小魚',    emoji:'🐟', odds:2,   speed:2.5, size:28, color:'#4FC3F7' },
  { name:'章魚',    emoji:'🐙', odds:5,   speed:1.8, size:38, color:'#CE93D8' },
  { name:'螃蟹',    emoji:'🦀', odds:8,   speed:1.5, size:36, color:'#EF9A9A' },
  { name:'龍蝦',    emoji:'🦞', odds:12,  speed:1.2, size:40, color:'#FF8A65' },
  { name:'海龜',    emoji:'🐢', odds:20,  speed:1.0, size:46, color:'#A5D6A7' },
  { name:'鯊魚',    emoji:'🦈', odds:35,  speed:2.0, size:52, color:'#90CAF9' },
  { name:'海豚',    emoji:'🐬', odds:50,  speed:2.2, size:50, color:'#80DEEA' },
  { name:'BOSS鯨魚',emoji:'🐳', odds:200, speed:0.8, size:70, color:'#FFD700' },
]

function createParticles(x, y, color, count = 20) {
  return Array.from({ length: count }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 10,
    vy: (Math.random() - 0.5) * 10 - 2,
    life: 1.0,
    decay: 0.025 + Math.random() * 0.025,
    size: 3 + Math.random() * 7,
    color,
    rotation: Math.random() * Math.PI * 2,
  }))
}

function spawnFish(id, canvasW, canvasH) {
  const type = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)]
  const fromLeft = Math.random() > 0.5
  return {
    ...type,
    uid: id,
    x: fromLeft ? -type.size - 10 : canvasW + type.size + 10,
    y: 40 + Math.random() * (canvasH - 100),
    dir: fromLeft ? 1 : -1,
    wobble: Math.random() * Math.PI * 2,
    dead: false,
    exploding: false,
    explodeTimer: 0,
  }
}

export default function FishingGame() {
  const [target, setTarget] = useState(0)
  const apiFn = useCallback((bet, extra) => gameAPI.fishing(bet, extra), [])
  const { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot } = useGame(apiFn)

  const canvasRef = useRef(null)
  const fishRef = useRef([])
  const particlesRef = useRef([])
  const bulletsRef = useRef([])
  const rafRef = useRef(null)
  const frameRef = useRef(0)
  const uidRef = useRef(0)
  const canvasW = useRef(380)
  const canvasH = useRef(300)

  const doPlay = () => play({ target })

  // Spawn fish periodically
  useEffect(() => {
    const W = canvasW.current, H = canvasH.current
    // Initial fish
    fishRef.current = Array.from({ length: 6 }, () => spawnFish(uidRef.current++, W, H))

    const spawnTimer = setInterval(() => {
      if (fishRef.current.filter(f => !f.dead).length < 10) {
        fishRef.current.push(spawnFish(uidRef.current++, W, H))
      }
    }, 1500)
    return () => clearInterval(spawnTimer)
  }, [])

  // Show catch result
  useEffect(() => {
    if (!result) return
    const caughtType = FISH_TYPES[target]
    // Find a matching fish or any fish to explode
    const fish = fishRef.current.find(f => !f.dead && !f.exploding)
    if (fish) {
      fish.exploding = true
      fish.explodeTimer = 30
      fish.emoji = caughtType.emoji
    }
    if (result.caught) {
      particlesRef.current.push(...createParticles(
        canvasW.current / 2, canvasH.current / 2, '#FFD700', 40
      ))
    }
  }, [result, target])

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    canvasW.current = W
    canvasH.current = H

    const animate = () => {
      frameRef.current++
      ctx.clearRect(0, 0, W, H)

      // Ocean background
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#001a3a')
      bg.addColorStop(0.5, '#002855')
      bg.addColorStop(1, '#001020')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Caustic light rays
      ctx.save()
      ctx.globalAlpha = 0.04
      for (let i = 0; i < 8; i++) {
        const x = (i / 8) * W + Math.sin(frameRef.current * 0.01 + i) * 20
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + 30, H)
        ctx.lineTo(x + 60, H)
        ctx.lineTo(x + 20, 0)
        ctx.closePath()
        ctx.fill()
      }
      ctx.restore()

      // Bubbles
      ctx.save()
      ctx.globalAlpha = 0.3
      for (let i = 0; i < 12; i++) {
        const bx = ((i * 67 + frameRef.current * 0.3) % W)
        const by = H - ((frameRef.current * (0.5 + i * 0.1) + i * 30) % H)
        ctx.strokeStyle = '#4FC3F7'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(bx, by, 2 + (i % 3), 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()

      // Seabed
      ctx.fillStyle = '#0a1520'
      ctx.beginPath()
      for (let x = 0; x <= W; x += 20) {
        const y = H - 15 + Math.sin(x * 0.05 + frameRef.current * 0.01) * 5
        ctx.lineTo(x, y)
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill()

      // Update & draw fish
      fishRef.current = fishRef.current.filter(f => !f.dead || f.explodeTimer > 0)
      fishRef.current.forEach(fish => {
        if (fish.dead) {
          fish.explodeTimer--
          return
        }
        fish.x += fish.speed * fish.dir * (spinning ? 0.5 : 1)
        fish.wobble += 0.05
        const wobbleY = Math.sin(fish.wobble) * 4

        // Remove off-screen
        if (fish.x < -fish.size * 2 || fish.x > W + fish.size * 2) {
          fish.dead = true
          return
        }

        if (fish.exploding) {
          fish.explodeTimer--
          if (fish.explodeTimer <= 0) {
            fish.dead = true
            particlesRef.current.push(...createParticles(fish.x, fish.y + wobbleY, fish.color, 15))
          }
          // Shake effect
          ctx.save()
          ctx.font = `${fish.size}px serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.globalAlpha = fish.explodeTimer / 30
          ctx.shadowBlur = 20
          ctx.shadowColor = '#FFD700'
          const shakeX = (Math.random() - 0.5) * 6
          ctx.fillText(fish.emoji, fish.x + shakeX, fish.y + wobbleY)
          ctx.restore()
          return
        }

        // Draw fish with flip
        ctx.save()
        ctx.font = `${fish.size}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        if (fish.dir < 0) {
          ctx.scale(-1, 1)
          ctx.fillText(fish.emoji, -fish.x, fish.y + wobbleY)
        } else {
          ctx.fillText(fish.emoji, fish.x, fish.y + wobbleY)
        }
        ctx.restore()

        // Health bar for BOSS
        if (fish.odds >= 50) {
          ctx.fillStyle = 'rgba(0,0,0,0.5)'
          ctx.fillRect(fish.x - 20, fish.y - fish.size / 2 - 10, 40, 5)
          ctx.fillStyle = fish.odds >= 100 ? '#FFD700' : '#F44336'
          ctx.fillRect(fish.x - 20, fish.y - fish.size / 2 - 10, 40, 5)
        }
      })

      // Draw bullets
      bulletsRef.current = bulletsRef.current.filter(b => b.y > -10)
      bulletsRef.current.forEach(b => {
        b.y -= 12
        ctx.save()
        ctx.shadowBlur = 8
        ctx.shadowColor = '#FFD700'
        ctx.fillStyle = '#FFD700'
        ctx.beginPath()
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Cannon at bottom center
      const cannonX = W / 2
      const cannonY = H - 18
      ctx.save()
      ctx.fillStyle = '#FFD700'
      ctx.shadowBlur = 12
      ctx.shadowColor = '#FFD700'
      ctx.beginPath()
      ctx.arc(cannonX, cannonY, 12, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#FFA000'
      ctx.fillRect(cannonX - 4, cannonY - 22, 8, 22)
      ctx.restore()

      // Update & draw particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0)
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.2
        p.life -= p.decay; p.rotation += 0.1
        ctx.save()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.shadowBlur = 6; ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.ellipse(p.x, p.y, p.size / 2, p.size / 3, p.rotation, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [spinning])

  // Shoot on canvas tap
  const handleCanvasTap = useCallback((e) => {
    if (!spinning) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const x = ((e.touches?.[0]?.clientX ?? e.clientX) - rect.left) * scaleX
      bulletsRef.current.push({ x, y: canvasH.current - 30 })
    }
  }, [spinning])

  return (
    <GameLayout title="深海獵殺" emoji="🐠">
      {showJackpot && result?.win > 0 && <JackpotModal amount={result.win} onClose={() => setShowJackpot(false)} />}

      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
        <canvas
          ref={canvasRef}
          width={380}
          height={300}
          style={{
            width: '100%', maxWidth: 480, borderRadius: 16,
            boxShadow: '0 0 30px rgba(0,150,255,0.4)',
            border: '2px solid rgba(0,150,255,0.3)',
            cursor: 'crosshair', touchAction: 'none',
          }}
          onClick={handleCanvasTap}
          onTouchStart={handleCanvasTap}
        />
      </div>

      {result && (
        <div style={{
          textAlign: 'center', padding: '10px 16px', margin: '0 16px 8px',
          borderRadius: 12, fontWeight: 700, fontSize: 16,
          background: result.caught ? 'rgba(0,255,100,0.1)' : 'rgba(255,50,50,0.1)',
          color: result.caught ? '#4CAF50' : '#FF5252',
          border: `1px solid ${result.caught ? 'rgba(0,255,100,0.3)' : 'rgba(255,50,50,0.3)'}`,
        }}>
          {result.caught
            ? `🎣 抓到了！${result.fish?.emoji ?? FISH_TYPES[target].emoji} ${result.fish?.name ?? FISH_TYPES[target].name} × ${result.fish?.odds ?? FISH_TYPES[target].odds} = +${result.win?.toFixed(2)}`
            : `😔 沒抓到 ${FISH_TYPES[target].emoji}，繼續努力！`}
        </div>
      )}

      <div className="bet-panel">
        <h3>🎯 選擇目標魚</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {FISH_TYPES.map((f, i) => (
            <button key={i} onClick={() => setTarget(i)}
              className={`bet-chip ${target === i ? 'active' : ''}`}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px' }}>
              <span>{f.emoji} {f.name}</span>
              <span style={{ color: 'var(--gold)', fontSize: 12 }}>×{f.odds}</span>
            </button>
          ))}
        </div>
        <div className="bet-amounts">
          {chips.map(c => (
            <button key={c} className={`bet-chip ${bet === c ? 'active' : ''}`} onClick={() => setBet(c)}>{c}</button>
          ))}
        </div>
        <div className="bet-actions">
          <button className="btn btn-gold btn-lg play-btn" onClick={doPlay} disabled={spinning}>
            {spinning ? '🎣 射擊中...' : '🎣 射擊！'}
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
