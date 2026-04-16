import { useState, useCallback } from 'react'
import GameLayout from '../components/GameLayout'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'

const GRID = 25

export default function MinesGame() {
  const [mineCount, setMineCount] = useState(5)
  const [revealed, setRevealed] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [mines, setMines] = useState([])
  const [multiplier, setMultiplier] = useState(1)
  const [started, setStarted] = useState(false)
  const [profit, setProfit] = useState(0)
  const [bet, setBet] = useState(10)
  const { user } = useGame(useCallback(() => {}, []))
  const { chips } = { chips: [5,10,25,50,100,500] }

  const startGame = () => {
    if (!user) return alert('請先登入')
    setRevealed([])
    setGameOver(false)
    setMines([])
    setMultiplier(1)
    setProfit(0)
    setStarted(true)
  }

  const calcMultiplier = (safe) => {
    const total = GRID
    const m = mineCount
    let mult = 1
    for (let i = 0; i < safe; i++) {
      mult *= (total - m - i) / (total - i)
    }
    return parseFloat((0.97 / mult).toFixed(2))
  }

  const reveal = (idx) => {
    if (!started || gameOver || revealed.includes(idx)) return
    // place mines on first click avoiding idx
    let currentMines = mines
    if (!mines.length) {
      const pool = Array.from({length:GRID},(_,i)=>i).filter(i=>i!==idx)
      const m = []
      while (m.length < mineCount) {
        const r = pool[Math.floor(Math.random()*pool.length)]
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
      return
    }

    const newRevealed = [...revealed, idx]
    setRevealed(newRevealed)
    const mult = calcMultiplier(newRevealed.length)
    setMultiplier(mult)
    setProfit(parseFloat(((mult - 1) * bet).toFixed(2)))
  }

  const cashout = () => {
    if (!started || gameOver || !revealed.length) return
    alert(`🎉 提現成功！獲得 +${profit} 金幣`)
    setStarted(false)
    setGameOver(true)
  }

  return (
    <GameLayout title="地雷爆破" emoji="💣">
      <div style={{ padding:'0 16px' }}>
        {/* 設定區 */}
        {!started && (
          <div style={{ marginBottom:16 }}>
            <div style={{ color:'#aaa', fontSize:13, marginBottom:6 }}>地雷數量</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[3,5,8,12,16,20].map(n => (
                <button key={n} onClick={()=>setMineCount(n)}
                  style={{ background: mineCount===n ? '#e91e63' : '#1e1e2e', color:'#fff',
                    border:'1px solid #333', borderRadius:8, padding:'6px 16px', cursor:'pointer' }}>
                  {n}💣
                </button>
              ))}
            </div>
            <div style={{ color:'#aaa', fontSize:13, marginTop:12, marginBottom:6 }}>下注金額</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[5,10,25,50,100,500].map(c => (
                <button key={c} onClick={()=>setBet(c)}
                  style={{ background: bet===c ? '#ffd700' : '#1e1e2e', color: bet===c ? '#000' : '#fff',
                    border:'1px solid #333', borderRadius:8, padding:'6px 14px', cursor:'pointer' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 狀態 */}
        <div style={{ display:'flex', gap:16, marginBottom:12, justifyContent:'center', flexWrap:'wrap' }}>
          <div style={{ color:'#ffd700' }}>💰 下注: {bet}</div>
          <div style={{ color:'#00e5ff' }}>✖️ 倍數: {multiplier}x</div>
          <div style={{ color: profit >= 0 ? '#4caf50' : '#f44336' }}>
            {profit >= 0 ? '+' : ''}{profit} 利潤
          </div>
        </div>

        {/* 網格 */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, marginBottom:16 }}>
          {Array.from({length:GRID},(_,i) => {
            const isRevealed = revealed.includes(i)
            const isMine = mines.includes(i) && (gameOver || !started)
            const isSafe = isRevealed && !isMine
            return (
              <button key={i} onClick={() => reveal(i)}
                style={{
                  height: 52, borderRadius: 10, border: 'none', cursor: started && !gameOver ? 'pointer' : 'default',
                  background: isMine ? 'linear-gradient(135deg,#c62828,#e53935)'
                    : isSafe ? 'linear-gradient(135deg,#1b5e20,#4caf50)'
                    : 'linear-gradient(135deg,#1a1a2e,#16213e)',
                  fontSize: 22, transition: 'transform 0.1s',
                  transform: isRevealed ? 'scale(0.95)' : 'scale(1)',
                  boxShadow: isSafe ? '0 0 8px #4caf5088' : isMine ? '0 0 8px #e5393588' : '0 2px 4px #0004',
                }}>
                {isMine ? '💣' : isSafe ? '💎' : ''}
              </button>
            )
          })}
        </div>

        {/* 按鈕 */}
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          {!started ? (
            <button onClick={startGame} style={{
              background:'linear-gradient(135deg,#e91e63,#c2185b)', color:'#fff',
              border:'none', borderRadius:12, padding:'12px 40px', fontSize:16,
              fontWeight:'bold', cursor:'pointer', boxShadow:'0 4px 15px #e91e6344'
            }}>🎮 開始遊戲</button>
          ) : (
            <>
              <button onClick={cashout} disabled={!revealed.length}
                style={{ background:'linear-gradient(135deg,#ffd700,#ff8f00)', color:'#000',
                  border:'none', borderRadius:12, padding:'12px 32px', fontSize:15,
                  fontWeight:'bold', cursor:'pointer', opacity: revealed.length ? 1 : 0.5 }}>
                💰 提現 (+{profit})
              </button>
            </>
          )}
        </div>

        {gameOver && (
          <div style={{ textAlign:'center', marginTop:12, fontSize:18, fontWeight:'bold',
            color: profit > 0 ? '#4caf50' : '#f44336' }}>
            {profit > 0 ? `🎉 提現 +${profit}！` : '💥 踩到地雷！'}
          </div>
        )}
      </div>
    </GameLayout>
  )
}
