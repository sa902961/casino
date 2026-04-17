import { useState, useEffect, useCallback, useRef } from 'react'
import GameLayout from '../components/GameLayout'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'

const GRID = 25

function createParticle(x, y, color) {
  return {
    x, y,
    vx: (Math.random() - 0.5) * 12,
    vy: (Math.random() - 0.5) * 12 - 4,
    life: 1.0,
    decay: 0.025 + Math.random() * 0.025,
    size: 4 + Math.random() * 8,
    color,
  }
}

export default function MinesGame() {
  const [mineCount, setMineCount] = useState(5)
  const [revealed, setRevealed] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [mines, setMines] = useState([])
  const [multiplier, setMultiplier] = useState(1)
  const [started, setStarted] = useState(false)
  const [profit, setProfit] = useState(0)
  const [bet, setBet] = useState(10)
  const [animatedCells, setAnimatedCells] = useState({}) // idx -> 'safe' | 'mine'
  const { user } = useGame(useCallback(() => {}, []))

  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)
  const frameRef = useRef(0)

  const startGame = () => {
    if (!user) return alert('請先登入')
    setRevealed([])
    setGameOver(false)
    setMines([])
    setMultiplier(1)
    setProfit(0)
    setStarted(true)
    setAnimatedCells({})
  }

  const calcMultiplier = (safe) => {
    const total = GRID, m = mineCount
    let mult = 1
    for (let i = 0; i < safe; i++) {
      mult *= (total - m - i) / (total - i)
    }
    return parseFloat((0.97 / mult).toFixed(2))
  }

  const reveal = (idx) => {
    if (!started || gameOver || revealed.includes(idx)) return
    let currentMines = mines
    if (!mines.length) {
      const pool = Array.from({ length: GRID }, (_, i) => i).filter(i => i !== idx)
      const m = []
      while (m.length < mineCount) {
        const r = pool[Math.floor(Math.random() * pool.length)]
        if (!m.includes(r)) m.push(r)
      }
      currentMines = m
      setMines(m)
    }

    if (currentMines.includes(idx)) {
      setRevealed(r => [...r, idx])
      setGameOver(true)
      setMines(currentMines)
      setProfit(-bet)
      setStarted(false)
      setAnimatedCells(prev => ({ ...prev, [idx]: 'mine' }))

      // Explode particle at cell position
      const canvas = canvasRef.current
      if (canvas) {
        const col = idx % 5, row = Math.floor(idx / 5)
        const cellW = canvas.width / 5, cellH = canvas.width / 5
        const cx = col * cellW + cellW / 2, cy = row * cellH + cellH / 2
        for (let i = 0; i < 50; i++) {
          particlesRef.current.push(createParticle(cx, cy, i % 2 === 0 ? '#FF3B5C' : '#FF8800'))
        }
      }
      return
    }

    const newRevealed = [...revealed, idx]
    setRevealed(newRevealed)
    const mult = calcMultiplier(newRevealed.length)
    setMultiplier(mult)
    setProfit(parseFloat(((mult - 1) * bet).toFixed(2)))
    setAnimatedCells(prev => ({ ...prev, [idx]: 'safe' }))

    // Gem sparkle
    const canvas = canvasRef.current
    if (canvas) {
      const col = idx % 5, row = Math.floor(idx / 5)
      const cellW = canvas.width / 5, cellH = canvas.width / 5
      const cx = col * cellW + cellW / 2, cy = row * cellH + cellH / 2
      for (let i = 0; i < 12; i++) {
        particlesRef.current.push(createParticle(cx, cy, '#4ECDC4'))
        particlesRef.current.push(createParticle(cx, cy, '#FFD700'))
      }
    }
  }

  const cashout = () => {
    if (!started || gameOver || !revealed.length) return
    // Jackpot particles
    const canvas = canvasRef.current
    if (canvas) {
      const W = canvas.width, H = canvas.height
      const colors = ['#FFD700', '#FFA500', '#4ECDC4', '#FF6B6B']
      for (let i = 0; i < 80; i++) {
        particlesRef.current.push(
          createParticle(W * 0.2 + Math.random() * W * 0.6, H * 0.2 + Math.random() * H * 0.4,
            colors[Math.floor(Math.random() * colors.length)])
        )
      }
    }
    setStarted(false)
    setGameOver(true)
  }

  // Canvas particle overlay
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const animate = () => {
      frameRef.current++
      ctx.clearRect(0, 0, W, H)

      // Only draw particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0)
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life -= p.decay
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

  const cellSize = `calc((min(100vw - 48px, 400px) - 32px) / 5)`

  return (
    <GameLayout title="地雷爆破" emoji="💣">
      <div style={{ padding: '0 16px' }}>
        {/* Status bar */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 12, justifyContent: 'center',
          flexWrap: 'wrap', padding: '10px 16px',
          background: 'rgba(255,255,255,0.05)', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ color: '#FFD700', fontWeight: 700, fontSize: 15 }}>💰 {bet}</div>
          <div style={{ color: '#00E5FF', fontWeight: 700, fontSize: 15 }}>✖ {multiplier}x</div>
          <div style={{
            fontWeight: 700, fontSize: 15,
            color: profit >= 0 ? '#4CAF50' : '#F44336',
          }}>
            {profit >= 0 ? '+' : ''}{profit} 利潤
          </div>
          <div style={{ color: '#CE93D8', fontSize: 14 }}>💣 {mineCount}顆</div>
        </div>

        {/* Canvas particle layer (absolute overlay) */}
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            style={{
              position: 'absolute', top: 0, left: '50%',
              transform: 'translateX(-50%)',
              width: '100%', maxWidth: 360,
              pointerEvents: 'none', zIndex: 10,
            }}
          />

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5,1fr)',
            gap: 6,
            marginBottom: 16,
            maxWidth: 360,
            margin: '0 auto 16px',
          }}>
            {Array.from({ length: GRID }, (_, i) => {
              const isRevealed = revealed.includes(i)
              const isMine = mines.includes(i) && (gameOver)
              const isSafe = isRevealed && !isMine
              const anim = animatedCells[i]

              return (
                <button
                  key={i}
                  onClick={() => reveal(i)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 10,
                    border: isSafe ? '1px solid rgba(78,205,196,0.5)'
                      : isMine ? '1px solid rgba(255,59,92,0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                    cursor: started && !gameOver && !isRevealed ? 'pointer' : 'default',
                    background: isMine
                      ? 'linear-gradient(135deg,#c62828,#e53935)'
                      : isSafe
                        ? 'linear-gradient(135deg,#1b5e20,#2e7d32)'
                        : started
                          ? 'linear-gradient(135deg,#1a1a2e,#16213e)'
                          : 'linear-gradient(135deg,#12122a,#0d0d20)',
                    fontSize: 22,
                    transition: 'transform 0.15s, background 0.2s',
                    transform: isRevealed ? 'scale(0.94)' : 'scale(1)',
                    boxShadow: isSafe
                      ? '0 0 12px rgba(78,205,196,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                      : isMine
                        ? '0 0 14px rgba(255,59,92,0.4)'
                        : started && !gameOver
                          ? '0 3px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
                          : '0 2px 4px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {isMine ? '💣' : isSafe ? '💎' : started ? '' : ''}
                </button>
              )
            })}
          </div>
        </div>

        {/* Settings (when not playing) */}
        {!started && (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#aaa', fontSize: 13, marginBottom: 8, textAlign: 'center' }}>地雷數量</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[3, 5, 8, 12, 16, 20].map(n => (
                  <button key={n} onClick={() => setMineCount(n)}
                    style={{
                      background: mineCount === n
                        ? 'linear-gradient(135deg,#e91e63,#c2185b)'
                        : 'rgba(255,255,255,0.06)',
                      color: '#fff', border: mineCount === n ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, padding: '7px 16px', cursor: 'pointer', fontWeight: 700,
                      boxShadow: mineCount === n ? '0 0 12px rgba(233,30,99,0.4)' : 'none',
                    }}>
                    {n}💣
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#aaa', fontSize: 13, marginBottom: 8, textAlign: 'center' }}>下注金額</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[5, 10, 25, 50, 100, 500].map(c => (
                  <button key={c} onClick={() => setBet(c)}
                    style={{
                      background: bet === c ? 'linear-gradient(135deg,#FFD700,#FFA000)' : 'rgba(255,255,255,0.06)',
                      color: bet === c ? '#000' : '#fff',
                      border: bet === c ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, padding: '7px 16px', cursor: 'pointer', fontWeight: 700,
                      boxShadow: bet === c ? '0 0 12px rgba(255,215,0,0.4)' : 'none',
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
          {!started ? (
            <button onClick={startGame} style={{
              background: 'linear-gradient(135deg,#e91e63,#c2185b)',
              color: '#fff', border: 'none', borderRadius: 14,
              padding: '14px 48px', fontSize: 17, fontWeight: 900,
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(233,30,99,0.5)',
              letterSpacing: 1,
            }}>🎮 開始遊戲</button>
          ) : (
            <button onClick={cashout} disabled={!revealed.length}
              style={{
                background: revealed.length
                  ? 'linear-gradient(135deg,#FFD700,#FF8F00)'
                  : 'rgba(255,255,255,0.1)',
                color: revealed.length ? '#000' : '#666',
                border: 'none', borderRadius: 14, padding: '14px 40px',
                fontSize: 16, fontWeight: 900, cursor: revealed.length ? 'pointer' : 'not-allowed',
                boxShadow: revealed.length ? '0 4px 20px rgba(255,215,0,0.5)' : 'none',
              }}>
              💰 提現 (+{profit})
            </button>
          )}
        </div>

        {/* Result message */}
        {gameOver && (
          <div style={{
            textAlign: 'center', padding: '12px 20px', borderRadius: 12,
            fontSize: 18, fontWeight: 900,
            background: profit > 0
              ? 'rgba(76,175,80,0.15)'
              : 'rgba(244,67,54,0.15)',
            color: profit > 0 ? '#4CAF50' : '#F44336',
            border: `1px solid ${profit > 0 ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)'}`,
          }}>
            {profit > 0 ? `🎉 提現成功！+${profit} 金幣` : '💥 踩到地雷！遊戲結束'}
          </div>
        )}
      </div>
    </GameLayout>
  )
}
