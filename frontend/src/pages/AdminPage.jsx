import { useState, useEffect } from 'react'
import { adminAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

export default function AdminPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [annTitle, setAnnTitle] = useState('')
  const [annContent, setAnnContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (tab === 'stats') {
      adminAPI.stats().then(setStats).catch(() => {})
    } else if (tab === 'users') {
      adminAPI.users().then(d => setUsers(d.users || [])).catch(() => {})
    } else if (tab === 'orders') {
      adminAPI.orders().then(d => setOrders(d.orders || [])).catch(() => {})
    }
  }, [tab])

  const handleApprove = async (id) => {
    try {
      await adminAPI.approve(id)
      setMsg('已批准')
      setOrders(o => o.map(ord => ord.id===id ? {...ord, status:'approved'} : ord))
    } catch (e) { setMsg(e.message) }
  }

  const handleReject = async (id) => {
    try {
      await adminAPI.reject(id)
      setMsg('已拒絕')
      setOrders(o => o.map(ord => ord.id===id ? {...ord, status:'rejected'} : ord))
    } catch (e) { setMsg(e.message) }
  }

  const handleAnn = async () => {
    if (!annTitle || !annContent) return setMsg('請填寫標題和內容')
    setLoading(true)
    try {
      await adminAPI.createAnn(annTitle, annContent)
      setMsg('公告已發布')
      setAnnTitle('')
      setAnnContent('')
    } catch (e) { setMsg(e.message) }
    setLoading(false)
  }

  const tabStyle = (key) => ({
    flex:1, padding:'10px 6px', border:'none', borderRadius:8, cursor:'pointer', fontSize:12,
    background: tab===key ? 'linear-gradient(135deg,#9c27b0,#673ab7)' : 'transparent', color:'#fff', fontWeight:'bold'
  })

  return (
    <div style={{ minHeight:'100vh', padding:'80px 16px 100px', background:'#0a0a1a', maxWidth:800, margin:'0 auto' }}>
      <h2 style={{ color:'#ffd700', textAlign:'center', marginBottom:8 }}>⚙️ 後台管理</h2>
      <p style={{ color:'#666', textAlign:'center', fontSize:13, marginBottom:20 }}>
        管理員: {user?.username}
      </p>

      {msg && (
        <div style={{ background:'#1a3a1a', color:'#69f0ae', padding:'10px 16px', borderRadius:8, marginBottom:12, fontSize:14, textAlign:'center' }}>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', background:'#1e1e2e', borderRadius:12, padding:4, marginBottom:20, gap:4 }}>
        {[['stats','📊 統計'],['users','👥 用戶'],['orders','💳 儲值'],['announce','📢 公告']].map(([k,l]) => (
          <button key={k} style={tabStyle(k)} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {/* 統計 */}
      {tab === 'stats' && stats && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:20 }}>
            {[
              { label:'總用戶', value: stats.total_users, icon:'👥', color:'#2196f3' },
              { label:'今日活躍', value: stats.active_today || '-', icon:'🔥', color:'#ff5722' },
              { label:'總儲值', value: `$${(stats.total_recharge||0).toFixed(0)}`, icon:'💳', color:'#4caf50' },
              { label:'總遊戲局', value: stats.total_games || 0, icon:'🎮', color:'#9c27b0' },
              { label:'平台盈利', value: `$${(stats.platform_profit||0).toFixed(0)}`, icon:'💰', color:'#ffd700' },
              { label:'待處理訂單', value: stats.pending_orders || 0, icon:'⏳', color:'#ff9800' },
            ].map((s,i) => (
              <div key={i} style={{ background:'#1e1e2e', borderRadius:14, padding:'16px 20px',
                border:`1px solid ${s.color}44` }}>
                <div style={{ fontSize:28 }}>{s.icon}</div>
                <div style={{ color:'#aaa', fontSize:13, marginTop:4 }}>{s.label}</div>
                <div style={{ color: s.color, fontSize:22, fontWeight:'bold' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 用戶 */}
      {tab === 'users' && (
        <div>
          <div style={{ color:'#aaa', fontSize:13, marginBottom:12 }}>共 {users.length} 位用戶</div>
          {users.map(u => (
            <div key={u.id} style={{ background:'#1e1e2e', borderRadius:12, padding:'12px 16px',
              marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ color:'#fff', fontWeight:'bold', display:'flex', alignItems:'center', gap:8 }}>
                  {u.username}
                  {u.is_admin ? <span style={{ background:'#ffd700', color:'#000', fontSize:11, padding:'2px 6px', borderRadius:4 }}>ADMIN</span> : null}
                </div>
                <div style={{ color:'#666', fontSize:12 }}>
                  {u.phone || '未綁定手機'} · VIP {u.vip_level}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ color:'#ffd700', fontWeight:'bold' }}>💰 {u.balance?.toFixed(2)}</div>
                <div style={{ color:'#666', fontSize:12 }}>{new Date(u.created_at).toLocaleDateString('zh-TW')}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 儲值訂單 */}
      {tab === 'orders' && (
        <div>
          {orders.map(ord => (
            <div key={ord.id} style={{ background:'#1e1e2e', borderRadius:12, padding:'14px 16px', marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <div>
                  <div style={{ color:'#fff', fontWeight:'bold' }}>訂單 #{ord.id}</div>
                  <div style={{ color:'#aaa', fontSize:13 }}>用戶 ID: {ord.user_id} · {ord.method}</div>
                  <div style={{ color:'#666', fontSize:12 }}>{new Date(ord.created_at).toLocaleString('zh-TW')}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ color:'#ffd700', fontSize:18, fontWeight:'bold' }}>
                    ${ord.amount?.toLocaleString()}
                  </div>
                  <div style={{ fontSize:12, padding:'2px 8px', borderRadius:4, marginTop:4,
                    background: ord.status==='approved' ? '#1b5e20' : ord.status==='rejected' ? '#3e0000' : '#1a1a3e',
                    color: ord.status==='approved' ? '#4caf50' : ord.status==='rejected' ? '#f44336' : '#ffd700' }}>
                    {ord.status==='approved' ? '✅ 已批准' : ord.status==='rejected' ? '❌ 已拒絕' : '⏳ 待審核'}
                  </div>
                </div>
              </div>
              {ord.status === 'pending' && (
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>handleApprove(ord.id)}
                    style={{ flex:1, padding:'8px', background:'#2e7d32', color:'#fff',
                      border:'none', borderRadius:8, cursor:'pointer', fontWeight:'bold' }}>
                    ✅ 批准
                  </button>
                  <button onClick={()=>handleReject(ord.id)}
                    style={{ flex:1, padding:'8px', background:'#c62828', color:'#fff',
                      border:'none', borderRadius:8, cursor:'pointer', fontWeight:'bold' }}>
                    ❌ 拒絕
                  </button>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && <div style={{ textAlign:'center', color:'#666', padding:40 }}>無訂單記錄</div>}
        </div>
      )}

      {/* 公告 */}
      {tab === 'announce' && (
        <div>
          <div style={{ background:'#1e1e2e', borderRadius:16, padding:20 }}>
            <div style={{ color:'#fff', fontWeight:'bold', marginBottom:16 }}>📢 發布公告</div>
            <input value={annTitle} onChange={e=>setAnnTitle(e.target.value)}
              placeholder="公告標題" style={{ width:'100%', padding:'12px 16px', background:'#2a2a3e',
                border:'1px solid #333', borderRadius:10, color:'#fff', fontSize:15, outline:'none',
                boxSizing:'border-box', marginBottom:12 }} />
            <textarea value={annContent} onChange={e=>setAnnContent(e.target.value)}
              placeholder="公告內容" rows={4} style={{ width:'100%', padding:'12px 16px', background:'#2a2a3e',
                border:'1px solid #333', borderRadius:10, color:'#fff', fontSize:14, outline:'none',
                boxSizing:'border-box', marginBottom:12, resize:'vertical' }} />
            <button onClick={handleAnn} disabled={loading}
              style={{ width:'100%', padding:12, background:'linear-gradient(135deg,#9c27b0,#673ab7)',
                color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:'bold', cursor:'pointer' }}>
              {loading ? '發布中...' : '📢 發布公告'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
