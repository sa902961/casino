import { useState } from 'react'
import GameLayout from '../components/GameLayout'
import useGame from '../hooks/useGame'

const SYMBOLS = [
  { id: 'sette', icon: '⚔️', name: '戰神賽特', val: 10, color: '#FFD700' },
  { id: 'anubis', icon: '🐺', name: '阿努比斯', val: 8, color: '#FF6B35' },
  { id: 'eye', icon: '👁️', name: '荷魯斯之眼', val: 6, color: '#00F5FF' },
  { id: 'scarab', icon: '🪲', name: '聖甲蟲', val: 5, color: '#9C27B0' },
  { id: 'pyramid', icon: '🔺', name: '金字塔', val: 4, color: '#FF9800' },
  { id: 'ankh', icon: '☥', name: '生命之符', val: 3, color: '#4CAF50' },
  { id: 'snake', icon: '🐍', name: '聖蛇', val: 2, color: '#F44336' },
  { id: 'gem', icon: '💎', name: '寶石', val: 1, color: '#2196F3' },
]

const WILD = { id: 'wild', icon: '🌟', name: 'WILD', val: 15, color: '#FFD700' }
const SCATTER = { id: 'scatter', icon: '✨', name: 'SCATTER', val: 0, color: '#FF00FF' }
const ALL_SYMBOLS = [...SYMBOLS, WILD, SCATTER]

const ROWS = 3
const COLS = 5

function randomSymbol() {
  const r = Math.random()
  if (r < 0.03) return WILD
  if (r < 0.06) return SCATTER
  const idx = Math.floor(Math.random() * SYMBOLS.length)
  return SYMBOLS[idx]
}

function checkWin(grid, bet) {
  let totalWin = 0
  const winLines = []

  // 橫線3條
  for (let row = 0; row < ROWS; row++) {
    const line = grid[row]
    const first = line[0].id === 'wild' ? line[1] : line[0]
    let count = 0
    for (let col = 0; col < COLS; col++) {
      if (line[col].id === first.id || line[col].id === 'wild') count++
      else break
    }
    if (count >= 3) {
      const win = Math.floor(bet * first.val * (count - 2))
      totalWin += win
      winLines.push({ row, count, win, symbol: first })
    }
  }

  // scatter 計算
  let scatterCount = 0
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c].id === 'scatter') scatterCount++
  if (scatterCount >= 3) {
    const win = bet * scatterCount * 5
    totalWin += win
    winLines.push({ scatter: true, count: scatterCount, win })
  }

  return { totalWin, winLines }
}

export default function SettGame() {
  const { balance, bet, setBet, addBalance, loading } = useGame()
  const [grid, setGrid] = useState(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(randomSymbol))
  )
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [winLines, setWinLines] = useState([])
  const [freeSpins, setFreeSpins] = useState(0)
  const [jackpot] = useState(Math.floor(Math.random() * 50000) + 100000)

  const spin = async () => {
    if (spinning) return
    if (freeSpins <= 0 && balance < bet) {
      setResult({ msg: '點數不足！', win: 0 })
      return
    }

    setSpinning(true)
    setResult(null)
    setWinLines([])

    if (freeSpins <= 0) addBalance(-bet)

    // 旋轉動畫
    let frame = 0
    const animate = setInterval(() => {
      setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(randomSymbol)))
      frame++
      if (frame > 8) {
        clearInterval(animate)
        const finalGrid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(randomSymbol))
        setGrid(finalGrid)

        const { totalWin, winLines: wl } = checkWin(finalGrid, bet)

        // 免費旋轉觸發
        let newFreeSpins = freeSpins > 0 ? freeSpins - 1 : 0
        let scatterCount = 0
        for (let r = 0; r < ROWS; r++)
          for (let c = 0; c < COLS; c++)
            if (finalGrid[r][c].id === 'scatter') scatterCount++
        if (scatterCount >= 3) newFreeSpins += scatterCount * 3

        setFreeSpins(newFreeSpins)
        setWinLines(wl)

        if (totalWin > 0) {
          addBalance(totalWin)
          setResult({
            msg: totalWin >= bet * 20 ? '🎉 MEGA WIN！！！' :
                 totalWin >= bet * 10 ? '🌟 BIG WIN！' :
                 totalWin >= bet * 5  ? '✨ WIN！' : '獲得獎勵！',
            win: totalWin
          })
        } else {
          setResult({ msg: '再試一次！', win: 0 })
        }

        setSpinning(false)
      }
    }, 80)
  }

  return (
    <GameLayout title="⚔️ 戰神賽特" subtitle="埃及戰神降臨 — 榮耀之戰">
      {/* Jackpot */}
      <div style={{
        textAlign: 'center', marginBottom: 16,
        background: 'linear-gradient(135deg, #1a0a00, #3d1a00)',
        border: '2px solid #FFD700', borderRadius: 12, padding: '12px 24px'
      }}>
        <div style={{ color: '#FF6B35', fontSize: 12, letterSpacing: 3 }}>✨ JACKPOT ✨</div>
        <div style={{ color: '#FFD700', fontSize: 28, fontWeight: 'bold',
          textShadow: '0 0 20px #FFD700' }}>
          {jackpot.toLocaleString()} 點
        </div>
      </div>

      {/* 轉輪 */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0514, #1a0a2e)',
        border: '3px solid #4a0080', borderRadius: 16, padding: 16, marginBottom: 16,
        boxShadow: '0 0 30px rgba(255,215,0,0.2)'
      }}>
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: rowIdx < 2 ? 8 : 0 }}>
            {row.map((sym, colIdx) => {
              const isWin = winLines.some(wl => !wl.scatter && wl.row === rowIdx)
              return (
                <div key={colIdx} style={{
                  width: 60, height: 60,
                  background: isWin ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${isWin ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 10,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.1s',
                  boxShadow: isWin ? `0 0 15px ${sym.color}` : 'none',
                  animation: spinning ? 'spin 0.1s linear' : 'none'
                }}>
                  <div style={{ fontSize: 24 }}>{sym.icon}</div>
                  <div style={{ fontSize: 8, color: sym.color, marginTop: 2 }}>{sym.name}</div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* 結果訊息 */}
      {result && (
        <div style={{
          textAlign: 'center', marginBottom: 12, padding: '10px 20px',
          background: result.win > 0 ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${result.win > 0 ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 10
        }}>
          <div style={{ color: result.win > 0 ? '#FFD700' : '#aaa', fontSize: 16, fontWeight: 'bold' }}>
            {result.msg}
          </div>
          {result.win > 0 && (
            <div style={{ color: '#FF6B35', fontSize: 20, fontWeight: 'bold' }}>
              +{result.win} 點
            </div>
          )}
        </div>
      )}

      {/* 免費旋轉提示 */}
      {freeSpins > 0 && (
        <div style={{
          textAlign: 'center', marginBottom: 12, padding: '8px',
          background: 'rgba(0,245,255,0.1)', border: '1px solid #00F5FF', borderRadius: 8
        }}>
          <span style={{ color: '#00F5FF', fontWeight: 'bold' }}>⚡ 免費旋轉剩餘：{freeSpins} 次</span>
        </div>
      )}

      {/* 控制區 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#aaa', fontSize: 13 }}>下注：</span>
          {[5, 10, 25, 50, 100].map(v => (
            <button key={v} onClick={() => setBet(v)} style={{
              padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: bet === v ? '#FFD700' : 'rgba(255,255,255,0.1)',
              color: bet === v ? '#000' : '#fff', fontWeight: 'bold', fontSize: 12
            }}>{v}</button>
          ))}
        </div>
        <button onClick={spin} disabled={spinning || loading} style={{
          padding: '12px 32px', fontSize: 16, fontWeight: 'bold',
          background: spinning ? '#333' : 'linear-gradient(135deg, #FFD700, #FF6B35)',
          color: spinning ? '#666' : '#000', border: 'none', borderRadius: 10,
          cursor: spinning ? 'not-allowed' : 'pointer',
          boxShadow: spinning ? 'none' : '0 0 20px rgba(255,215,0,0.5)',
          transition: 'all 0.3s'
        }}>
          {spinning ? '⚔️ 旋轉中...' : freeSpins > 0 ? `🎁 免費旋轉` : '⚔️ 旋轉'}
        </button>
      </div>

      {/* 符號說明 */}
      <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
        <div style={{ color: '#FFD700', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>符號賠率（x下注）</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          {[...SYMBOLS.slice(0, 4), WILD].map(sym => (
            <div key={sym.id} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6
            }}>
              <span>{sym.icon}</span>
              <span style={{ color: sym.color, fontSize: 11 }}>x{sym.val}</span>
            </div>
          ))}
        </div>
        <div style={{ color: '#aaa', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
          🌟 WILD 可替換任意符號 | ✨ 3個以上SCATTER觸發免費旋轉
        </div>
      </div>
    </GameLayout>
  )
}
