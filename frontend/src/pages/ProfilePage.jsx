import { useState, useEffect } from 'react'
import { authAPI, userAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

const VIP_LEVELS = [
  { level:0, name:'一般會員', color:'#9e9e9e', icon:'⭐', threshold:0 },
  { level:1, name:'銅牌會員', color:'#cd7f32', icon:'🥉', threshold:1000 },
  { level:2, name:'銀牌會員', color:'#c0c0c0', icon:'🥈', threshold:5000 },
  { level:3, name:'金牌會員', color:'#ffd700', icon:'🥇', threshold:20000 },
  { level:4, name:'白金會員', color:'#e5e4e2', icon:'💎', threshold:50000 },
  { level:5, name:'鑽石會員', color:'#b9f2ff', icon:'👑', threshold:100000 },
]

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [checkinDone, setCheckinDone] = useState(false)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState('info') // info | history
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const vip = VIP_LEVELS[Math.min(user?.vip_level || 0, 5)]
  const nextVip = VIP_LEVELS[Math.min((user?.vip_level || 0) + 1, 5)]

  const handleCheckin = async () => {
    try {
      const data = await authAPI.checkin()
      setCheckinDone(true)
      setMsg(`簽到成功！獲得 +${data.bonus} 金幣`)
    } catch (err) {
      setMsg(err.message)
    }
  }

  useEffect(() => {
    if (tab === 'history') {
      setLoadingHistory(true)
      userAPI.transactions()
        .then(data => setHistory(data.transactions || []))
        .catch(() => {})
        .finally(() => setLoadingHistory(false))
    }
  }, [tab])

  if (!user) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
      請先登入
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', padding:'80px 16px 100px', background:'#0a0a1a', maxWidth:600, margin:'0 auto' }}>
      {/* 個人卡片 */}
      <div style={{ background:`linear-gradient(135deg,${vip.color}22,#1a1040)`,
        border:`1px solid ${vip.color}66`, borderRadius:20, padding:24, marginBottom:20, textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:8 }}>{vip.icon}</div>
        <div style={{ color:'#fff', fontSize:22, fontWeight:'bold' }}>{user.username}</div>
        <div style={{ color: vip.color, fontSize:15, marginTop:4 }}>{vip.name}</div>
        {user.phone && <div style={{ color:'#aaa', fontSize:13, marginTop:4 }}>📱 {user.phone}</div>}
        <div style={{ color:'#ffd700', fontSize:28, fontWeight:'bold', marginTop:12 }}>
          💰 {user.balance?.toFixed(2)}
        </div>

        {/* VIP進度 */}
        {vip.level < 5 && (
          <div style={{ marginTop:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', color:'#aaa', fontSize:12, marginBottom:4 }}>
              <span>升級進度</span>
              <span>{nextVip.name}</span>
            </div>
            <div style={{ background:'#333', borderRadius:6, height:8, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:6,
                background:`linear-gradient(90deg,${vip.color},${nextVip.color})`,
                width:`${Math.min(100,(user.balance/nextVip.threshold)*100)}%`,
                transition:'width 0.5s' }} />
            </div>
            <div style={{ color:'#aaa', fontSize:11, marginTop:4 }}>
              還需 {Math.max(0, nextVip.threshold - (user.balance||0)).toLocaleString()} 升級
            </div>
          </div>
        )}
      </div>

      {/* Tab */}
      <div style={{ display:'flex', background:'#1e1e2e', borderRadius:12, padding:4, marginBottom:20 }}>
        {[['info','👤 個人資料'],['history','📋 交易記錄']].map(([key,label]) => (
          <button key={key} onClick={()=>setTab(key)}
            style={{ flex:1, padding:'10px', border:'none', borderRadius:10, cursor:'pointer',
              background: tab===key ? 'linear-gradient(135deg,#9c27b0,#673ab7)' : 'transparent',
              color:'#fff', fontWeight:'bold', fontSize:14 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <>
          {/* 簽到 */}
          <div style={{ background:'#1e1e2e', border:'1px solid #333', borderRadius:16, padding:20, marginBottom:16 }}>
            <div style={{ color:'#fff', fontWeight:'bold', marginBottom:12 }}>🎁 每日簽到</div>
            {msg && <div style={{ color:'#4caf50', fontSize:14, marginBottom:8 }}>{msg}</div>}
            <button onClick={handleCheckin} disabled={checkinDone}
              style={{ width:'100%', padding:12, background: checkinDone ? '#333' : 'linear-gradient(135deg,#4caf50,#2e7d32)',
                color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:'bold',
                cursor: checkinDone?'default':'pointer' }}>
              {checkinDone ? '✅ 今日已簽到' : '🎁 立即簽到'}
            </button>
          </div>

          {/* VIP福利 */}
          <div style={{ background:'#1e1e2e', border:'1px solid #333', borderRadius:16, padding:20, marginBottom:16 }}>
            <div style={{ color:'#fff', fontWeight:'bold', marginBottom:12 }}>👑 VIP等級福利</div>
            {VIP_LEVELS.map(v => (
              <div key={v.level} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0',
                borderBottom:'1px solid #2a2a3e', opacity: v.level <= (user.vip_level||0) ? 1 : 0.4 }}>
                <div style={{ fontSize:24 }}>{v.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ color: v.color, fontWeight:'bold', fontSize:14 }}>{v.name}</div>
                  <div style={{ color:'#aaa', fontSize:12 }}>累計儲值 {v.threshold.toLocaleString()}</div>
                </div>
                {v.level <= (user.vip_level||0) && <div style={{ color:'#4caf50', fontSize:20 }}>✅</div>}
              </div>
            ))}
          </div>

          {/* 登出 */}
          <button onClick={logout}
            style={{ width:'100%', padding:14, background:'linear-gradient(135deg,#c62828,#b71c1c)',
              color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:'bold', cursor:'pointer' }}>
            🚪 登出
          </button>
        </>
      )}

      {tab === 'history' && (
        <div>
          {loadingHistory ? (
            <div style={{ textAlign:'center', color:'#aaa', padding:40 }}>載入中...</div>
          ) : history.length === 0 ? (
            <div style={{ textAlign:'center', color:'#666', padding:40 }}>暫無交易記錄</div>
          ) : (
            history.slice(0,50).map((tx, i) => (
              <div key={i} style={{ background:'#1e1e2e', borderRadius:12, padding:'12px 16px',
                marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ color:'#fff', fontSize:14, fontWeight:'bold' }}>
                    {tx.type === 'bet' ? '🎮 下注' : tx.type === 'win' ? '🏆 獲獎' :
                     tx.type === 'recharge' ? '💳 儲值' : tx.type === 'withdraw' ? '💸 提款' :
                     tx.type === 'checkin' ? '🎁 簽到' : tx.type}
                  </div>
                  <div style={{ color:'#666', fontSize:12 }}>
                    {new Date(tx.created_at).toLocaleString('zh-TW')}
                  </div>
                </div>
                <div style={{ fontWeight:'bold', fontSize:15,
                  color: tx.amount > 0 ? '#4caf50' : '#f44336' }}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount?.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
