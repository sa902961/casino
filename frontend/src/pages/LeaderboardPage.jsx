import { useState, useEffect } from 'react'
import { userAPI } from '../utils/api'

export default function LeaderboardPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('balance') // balance | wins

  useEffect(() => {
    userAPI.leaderboard()
      .then(d => setData(d.leaderboard || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  const MEDALS = ['🥇','🥈','🥉']

  const sorted = [...data].sort((a,b) => {
    if (tab === 'balance') return b.balance - a.balance
    return b.total_wins - a.total_wins
  })

  return (
    <div style={{ minHeight:'100vh', padding:'80px 16px 100px', background:'#0a0a1a', maxWidth:600, margin:'0 auto' }}>
      <h2 style={{ color:'#ffd700', textAlign:'center', marginBottom:8 }}>🏆 排行榜</h2>
      <p style={{ color:'#666', textAlign:'center', fontSize:13, marginBottom:20 }}>
        每日更新 · 頂尖玩家榜
      </p>

      {/* Tab */}
      <div style={{ display:'flex', background:'#1e1e2e', borderRadius:12, padding:4, marginBottom:20 }}>
        {[['balance','💰 餘額排行'],['wins','🏆 累積獎金']].map(([key,label]) => (
          <button key={key} onClick={()=>setTab(key)}
            style={{ flex:1, padding:'10px', border:'none', borderRadius:10, cursor:'pointer',
              background: tab===key ? 'linear-gradient(135deg,#ffa000,#ff6f00)' : 'transparent',
              color:'#fff', fontWeight:'bold', fontSize:14 }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', color:'#aaa', padding:60 }}>載入中...</div>
      ) : (
        <div>
          {/* Top 3 podium */}
          {sorted.length >= 3 && (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-end', gap:12, marginBottom:24 }}>
              {[sorted[1], sorted[0], sorted[2]].map((player, idx) => {
                const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
                const heights = [100, 130, 80]
                return (
                  <div key={player.username} style={{ textAlign:'center', width:100 }}>
                    <div style={{ fontSize: rank===1 ? 36 : 28 }}>{MEDALS[rank-1]}</div>
                    <div style={{ color:'#fff', fontSize:13, fontWeight:'bold', marginBottom:4 }}>
                      {player.username}
                    </div>
                    <div style={{ color:'#ffd700', fontSize:12 }}>
                      {tab==='balance' ? player.balance?.toFixed(0) : player.total_wins?.toFixed(0)}
                    </div>
                    <div style={{
                      height: heights[idx], marginTop:8,
                      background: rank===1 ? 'linear-gradient(180deg,#ffd700,#ff8f00)' :
                        rank===2 ? 'linear-gradient(180deg,#c0c0c0,#9e9e9e)' : 'linear-gradient(180deg,#cd7f32,#8d6e63)',
                      borderRadius:'8px 8px 0 0', display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <span style={{ color:'#fff', fontWeight:'bold', fontSize:18 }}>#{rank}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* List */}
          {sorted.map((player, i) => (
            <div key={player.username} style={{
              background: i < 3 ? `linear-gradient(135deg,${['#ffd70022','#c0c0c022','#cd7f3222'][i]},#1e1e2e)` : '#1e1e2e',
              border: i < 3 ? `1px solid ${['#ffd70066','#c0c0c066','#cd7f3266'][i]}` : '1px solid #2a2a3e',
              borderRadius:12, padding:'12px 16px', marginBottom:8,
              display:'flex', alignItems:'center', gap:12
            }}>
              <div style={{ fontSize:i < 3 ? 28 : 20, width:36, textAlign:'center' }}>
                {i < 3 ? MEDALS[i] : `#${i+1}`}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'#fff', fontWeight:'bold' }}>{player.username}</div>
                <div style={{ color:'#888', fontSize:12 }}>
                  VIP {player.vip_level || 0} · {player.total_games || 0} 局遊戲
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ color:'#ffd700', fontWeight:'bold', fontSize:16 }}>
                  💰 {(tab==='balance' ? player.balance : player.total_wins)?.toFixed(0)}
                </div>
                <div style={{ color:'#666', fontSize:11 }}>
                  {tab==='balance' ? '當前餘額' : '累積獎金'}
                </div>
              </div>
            </div>
          ))}

          {sorted.length === 0 && (
            <div style={{ textAlign:'center', color:'#666', padding:40 }}>
              暫無排行資料
            </div>
          )}
        </div>
      )}
    </div>
  )
}
