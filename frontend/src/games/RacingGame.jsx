import { useState, useCallback } from 'react'
import GameLayout from '../components/GameLayout'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'

export default function RacingGame() {
  const apiFn = useCallback((bet, extra) => gameAPI.racing(bet, extra), [])
  const { bet, setBet, result, spinning, play, chips, user } = useGame(apiFn)

  return (
    <GameLayout title="極速賽車" emoji="🏎️">
      <div style={{ padding:'0 16px' }}>
        <div style={{ marginBottom:16 }}>
          <div style={{ color:'#aaa', fontSize:13, marginBottom:8, textAlign:'center' }}>選擇下注金額</div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {chips.map(c => (
              <button key={c} onClick={()=>setBet(c)}
                style={{ background: bet===c?'#ffd700':'#1e1e2e', color: bet===c?'#000':'#fff',
                  border:'1px solid #333', borderRadius:8, padding:'6px 14px', cursor:'pointer' }}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div style={{ textAlign:'center', padding:'30px 0' }}>
          <div style={{ fontSize:80, marginBottom:16 }}>🏎️</div>
          <div style={{ color:'#fff', fontSize:20, fontWeight:'bold', marginBottom:8 }}>極速賽車</div>
          {result && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:28, fontWeight:'bold',
                color: result.win > 0 ? '#4caf50' : '#f44336' }}>
                {result.win > 0 ? `🎉 +${result.win.toFixed(2)}` : `😔 -${bet}`}
              </div>
              {result.balance !== undefined && (
                <div style={{ color:'#ffd700', marginTop:4 }}>餘額: {result.balance.toFixed(2)}</div>
              )}
            </div>
          )}
        </div>
        <div style={{ display:'flex', justifyContent:'center' }}>
          <button onClick={play} disabled={spinning || !user}
            style={{ background:'linear-gradient(135deg,#9c27b0,#673ab7)', color:'#fff',
              border:'none', borderRadius:12, padding:'14px 48px', fontSize:16, fontWeight:'bold',
              cursor: spinning||!user ? 'not-allowed':'pointer', opacity: spinning||!user ? 0.6:1 }}>
            {spinning ? '⏳ 進行中...' : !user ? '請先登入' : '🏎️ 開始遊戲'}
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
