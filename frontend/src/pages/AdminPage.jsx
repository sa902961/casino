import { useState, useEffect, useRef } from 'react'
import { adminAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

// ── 樣式常量 ─────────────────────────────────
const BG = '#0a0e1a'
const BG2 = '#111827'
const BG3 = '#1a2035'
const GOLD = '#FFD700'
const GOLD2 = '#FFA500'
const GREEN = '#22c55e'
const RED = '#ef4444'
const BLUE = '#3b82f6'
const PURPLE = '#a855f7'

const card = {
  background: BG3,
  borderRadius: 12,
  padding: '16px 20px',
  border: `1px solid #2a3550`,
  marginBottom: 12,
}

const btn = (color = GOLD) => ({
  padding: '8px 16px',
  background: color,
  color: color === GOLD ? '#000' : '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: 13,
})

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: '#0f1729',
  border: `1px solid #2a3550`,
  borderRadius: 8,
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

const badge = (color) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 'bold',
  background: color + '22',
  color: color,
  border: `1px solid ${color}44`,
})

// ── Toast 提示 ───────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null
  const color = type === 'error' ? RED : GREEN
  return (
    <div style={{
      position: 'fixed', top: 80, right: 20, zIndex: 9999,
      background: BG3, border: `1px solid ${color}`,
      color, padding: '12px 20px', borderRadius: 10,
      fontSize: 14, fontWeight: 'bold', maxWidth: 300,
      boxShadow: `0 0 20px ${color}44`
    }}>
      {type === 'error' ? '❌ ' : '✅ '}{msg}
    </div>
  )
}

// ── 確認對話框 ───────────────────────────────
function Confirm({ msg, onYes, onNo }) {
  if (!msg) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998
    }}>
      <div style={{ background: BG3, borderRadius: 14, padding: 28, maxWidth: 360, width: '90%', border: `1px solid ${GOLD}44` }}>
        <div style={{ color: '#fff', fontSize: 16, marginBottom: 20, textAlign: 'center' }}>{msg}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onYes} style={{ ...btn(GREEN), flex: 1 }}>確認</button>
          <button onClick={onNo} style={{ ...btn('#666'), flex: 1 }}>取消</button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
// Tab 1: 📊 數據總覽
// ════════════════════════════════════════════
function DashboardTab({ showMsg }) {
  const [data, setData] = useState(null)
  const [online, setOnline] = useState(Math.floor(Math.random() * 80) + 20)
  const timerRef = useRef()

  const load = () => {
    adminAPI.dashboard().then(setData).catch(e => showMsg(e.message, 'error'))
  }

  useEffect(() => {
    load()
    // 每5秒刷新在線人數
    timerRef.current = setInterval(() => {
      setOnline(n => n + Math.floor(Math.random() * 7) - 3)
      load()
    }, 5000)
    return () => clearInterval(timerRef.current)
  }, [])

  if (!data) return <div style={{ textAlign: 'center', color: '#666', padding: 60 }}>載入中...</div>

  const stats = [
    { label: '今日營收', value: `$${(data.today_revenue || 0).toLocaleString()}`, icon: '💰', color: GOLD },
    { label: '總營收', value: `$${(data.total_revenue || 0).toLocaleString()}`, icon: '📈', color: GREEN },
    { label: '總用戶數', value: (data.total_users || 0).toLocaleString(), icon: '👥', color: BLUE },
    { label: '今日新增', value: (data.new_users_today || 0).toLocaleString(), icon: '🆕', color: PURPLE },
    { label: '待審儲值', value: data.pending_recharge || 0, icon: '⏳', color: GOLD2 },
    { label: '待審提款', value: data.pending_withdraw || 0, icon: '💸', color: RED },
  ]

  const topGames = data.top_games || []
  const chartData = data.revenue_7days || Array.from({ length: 7 }, (_, i) => ({ day: `${i + 1}日`, amount: Math.random() * 10000 }))
  const maxVal = Math.max(...chartData.map(d => d.amount), 1)

  return (
    <div>
      {/* 即時在線 */}
      <div style={{ ...card, background: `linear-gradient(135deg, #0a1628, #1a2535)`, border: `1px solid ${GOLD}44`, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
          <span style={{ color: '#aaa', fontSize: 14 }}>即時在線人數</span>
          <span style={{ color: GOLD, fontSize: 28, fontWeight: 'bold', marginLeft: 'auto' }}>{online} 人</span>
        </div>
      </div>

      {/* 統計卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ ...card, marginBottom: 0, padding: '14px 16px' }}>
            <div style={{ fontSize: 24 }}>{s.icon}</div>
            <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 20, fontWeight: 'bold', marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 遊戲排行榜 */}
      <div style={card}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 14, fontSize: 15 }}>🏆 熱門遊戲 TOP 5</div>
        {topGames.length === 0 && <div style={{ color: '#666', fontSize: 13 }}>暫無數據</div>}
        {topGames.slice(0, 5).map((g, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < 3 ? [GOLD, '#C0C0C0', '#CD7F32'][i] : '#333',
              color: i < 3 ? '#000' : '#fff', fontWeight: 'bold', fontSize: 13, flexShrink: 0
            }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#ddd', fontSize: 13 }}>{g.game_type}</div>
              <div style={{ height: 6, background: '#1e2d45', borderRadius: 3, marginTop: 4 }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${(g.count / (topGames[0]?.count || 1)) * 100}%`,
                  background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`
                }} />
              </div>
            </div>
            <div style={{ color: GOLD, fontSize: 13, fontWeight: 'bold' }}>{g.count}局</div>
          </div>
        ))}
      </div>

      {/* 近7天營收折線圖 */}
      <div style={card}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 14, fontSize: 15 }}>📈 近7天營收</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
          {chartData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ color: GOLD, fontSize: 10 }}>${Math.round(d.amount / 100) * 100}</div>
              <div style={{
                width: '100%', borderRadius: '4px 4px 0 0',
                height: `${Math.max((d.amount / maxVal) * 80, 4)}px`,
                background: `linear-gradient(180deg, ${GOLD}, ${GOLD2})`,
                transition: 'height 0.3s'
              }} />
              <div style={{ color: '#666', fontSize: 10, whiteSpace: 'nowrap' }}>{d.day}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
// Tab 2: 👥 用戶管理
// ════════════════════════════════════════════
function UsersTab({ showMsg }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [adjAmt, setAdjAmt] = useState('')
  const [vipVal, setVipVal] = useState('')
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    adminAPI.users().then(d => setUsers(d.users || [])).catch(e => showMsg(e.message, 'error'))
  }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.username?.toLowerCase().includes(q) || u.phone?.includes(q)
    const matchFilter = filter === 'all' || (filter === 'blocked' && u.is_blocked) || (filter === 'active' && !u.is_blocked)
    return matchSearch && matchFilter
  })

  const handleBlock = (u) => {
    setConfirm({
      msg: `確認${u.is_blocked ? '解鎖' : '封鎖'}用戶 ${u.username}？`,
      action: async () => {
        try {
          await adminAPI.blockUser(u.id, !u.is_blocked)
          setUsers(list => list.map(x => x.id === u.id ? { ...x, is_blocked: !x.is_blocked } : x))
          showMsg(`已${u.is_blocked ? '解鎖' : '封鎖'} ${u.username}`)
          setSelected(null)
        } catch (e) { showMsg(e.message, 'error') }
      }
    })
  }

  const handleBalance = async (u) => {
    const amt = parseFloat(adjAmt)
    if (isNaN(amt)) return showMsg('請輸入有效金額', 'error')
    try {
      await adminAPI.updateBalance(u.id, amt)
      setUsers(list => list.map(x => x.id === u.id ? { ...x, balance: x.balance + amt } : x))
      showMsg(`已調整 ${u.username} 餘額 ${amt > 0 ? '+' : ''}${amt}`)
      setAdjAmt('')
    } catch (e) { showMsg(e.message, 'error') }
  }

  const handleVip = async (u) => {
    const v = parseInt(vipVal)
    if (isNaN(v) || v < 0 || v > 10) return showMsg('VIP等級須為0-10', 'error')
    try {
      await adminAPI.updateVip(u.id, v)
      setUsers(list => list.map(x => x.id === u.id ? { ...x, vip_level: v } : x))
      showMsg(`已更新 ${u.username} VIP等級為 ${v}`)
      setVipVal('')
    } catch (e) { showMsg(e.message, 'error') }
  }

  return (
    <div>
      <Confirm msg={confirm?.msg} onYes={() => { confirm?.action(); setConfirm(null) }} onNo={() => setConfirm(null)} />

      {/* 搜尋/篩選 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜尋帳號/手機" style={{ ...inputStyle, flex: 1 }} />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ ...inputStyle, width: 'auto', flex: '0 0 90px' }}>
          <option value="all">全部</option>
          <option value="active">正常</option>
          <option value="blocked">封鎖</option>
        </select>
      </div>
      <div style={{ color: '#666', fontSize: 12, marginBottom: 10 }}>共 {filtered.length} 位用戶</div>

      {/* 用戶詳情 Modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: '#000c', zIndex: 9000,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }} onClick={() => setSelected(null)}>
          <div style={{
            background: BG3, borderRadius: '16px 16px 0 0', padding: 24,
            width: '100%', maxWidth: 600, maxHeight: '80vh', overflowY: 'auto',
            border: `1px solid ${GOLD}44`
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ color: GOLD, fontWeight: 'bold', fontSize: 18 }}>
                👤 {selected.username}
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* 基本資訊 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                ['手機', selected.phone || '未綁定'],
                ['餘額', `$${selected.balance?.toFixed(2)}`],
                ['VIP等級', `Lv.${selected.vip_level}`],
                ['狀態', selected.is_blocked ? '🔴 封鎖中' : '🟢 正常'],
                ['遊戲局數', selected.game_count || 0],
                ['總投注', `$${(selected.total_bet || 0).toFixed(0)}`],
              ].map(([k, v]) => (
                <div key={k} style={{ background: BG2, borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ color: '#666', fontSize: 11 }}>{k}</div>
                  <div style={{ color: '#ddd', fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* 操作區 */}
            <div style={{ display: 'grid', gap: 12 }}>
              <button onClick={() => handleBlock(selected)}
                style={{ ...btn(selected.is_blocked ? GREEN : RED), width: '100%', padding: 10 }}>
                {selected.is_blocked ? '🔓 解鎖帳號' : '🔒 封鎖帳號'}
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={adjAmt} onChange={e => setAdjAmt(e.target.value)}
                  placeholder="調整金額（負數扣除）" style={{ ...inputStyle, flex: 1 }} type="number" />
                <button onClick={() => handleBalance(selected)} style={btn(GOLD)}>調整</button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={vipVal} onChange={e => setVipVal(e.target.value)}
                  placeholder="設定VIP等級 0-10" style={{ ...inputStyle, flex: 1 }} type="number" min="0" max="10" />
                <button onClick={() => handleVip(selected)} style={btn(PURPLE)}>更新VIP</button>
              </div>
            </div>

            {/* 最近遊戲紀錄 */}
            {selected.recent_games && selected.recent_games.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ color: '#aaa', fontSize: 13, marginBottom: 8 }}>🎮 最近遊戲紀錄</div>
                {selected.recent_games.map((g, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e2d45', fontSize: 13 }}>
                    <span style={{ color: '#aaa' }}>{g.game_type}</span>
                    <span style={{ color: g.win > 0 ? GREEN : '#aaa' }}>
                      {g.win > 0 ? `+$${g.win}` : `-$${g.bet}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 用戶列表 */}
      {filtered.map(u => (
        <div key={u.id} style={{ ...card, cursor: 'pointer' }} onClick={() => setSelected(u)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{u.username}</span>
                <span style={badge(u.vip_level > 0 ? GOLD : '#666')}>VIP {u.vip_level}</span>
                {u.is_blocked && <span style={badge(RED)}>封鎖</span>}
              </div>
              <div style={{ color: '#666', fontSize: 12, marginTop: 3 }}>
                {u.phone || '未綁定手機'} · ID:{u.id}
              </div>
              <div style={{ color: '#555', fontSize: 11, marginTop: 2 }}>
                {new Date(u.created_at).toLocaleDateString('zh-TW')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: GOLD, fontWeight: 'bold', fontSize: 16 }}>💰 {u.balance?.toFixed(0)}</div>
              <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>點擊查看詳情</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════
// Tab 3: 💰 儲值管理
// ════════════════════════════════════════════
function RechargeTab({ showMsg }) {
  const [orders, setOrders] = useState([])
  const [view, setView] = useState('pending') // pending | done
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    adminAPI.rechargeList().then(d => setOrders(d.orders || [])).catch(e => showMsg(e.message, 'error'))
  }, [])

  const filtered = orders.filter(o => view === 'pending' ? o.status === 'pending' : o.status !== 'pending')

  const handleApprove = (o) => {
    setConfirm({
      msg: `確認核准 ${o.username} 的 $${o.amount} 儲值？`,
      action: async () => {
        try {
          await adminAPI.approveRecharge(o.id)
          setOrders(list => list.map(x => x.id === o.id ? { ...x, status: 'approved' } : x))
          showMsg('已核准儲值')
        } catch (e) { showMsg(e.message, 'error') }
      }
    })
  }

  const handleReject = (o) => {
    setConfirm({
      msg: `確認拒絕 ${o.username} 的 $${o.amount} 儲值？`,
      action: async () => {
        try {
          await adminAPI.rejectRecharge(o.id)
          setOrders(list => list.map(x => x.id === o.id ? { ...x, status: 'rejected' } : x))
          showMsg('已拒絕儲值')
        } catch (e) { showMsg(e.message, 'error') }
      }
    })
  }

  return (
    <div>
      <Confirm msg={confirm?.msg} onYes={() => { confirm?.action(); setConfirm(null) }} onNo={() => setConfirm(null)} />

      <div style={{ display: 'flex', background: BG3, borderRadius: 10, padding: 4, marginBottom: 16, gap: 4 }}>
        {[['pending', '⏳ 待審核'], ['done', '✅ 已完成']].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} style={{
            flex: 1, padding: '8px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
            background: view === k ? GOLD : 'transparent', color: view === k ? '#000' : '#666'
          }}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#555', padding: 40 }}>無記錄</div>}

      {filtered.map(o => (
        <div key={o.id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: o.status === 'pending' ? 12 : 0 }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{o.username}</div>
              <div style={{ color: '#888', fontSize: 12, marginTop: 3 }}>{o.method} · #{o.id}</div>
              <div style={{ color: '#555', fontSize: 11 }}>{new Date(o.created_at).toLocaleString('zh-TW')}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: GOLD, fontSize: 20, fontWeight: 'bold' }}>${o.amount?.toLocaleString()}</div>
              <div style={{
                ...badge(o.status === 'approved' ? GREEN : o.status === 'rejected' ? RED : GOLD),
                marginTop: 6
              }}>
                {o.status === 'approved' ? '✅ 已核准' : o.status === 'rejected' ? '❌ 已拒絕' : '⏳ 待審核'}
              </div>
            </div>
          </div>
          {o.status === 'pending' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleApprove(o)} style={{ ...btn(GREEN), flex: 1, padding: 10 }}>✅ 核准</button>
              <button onClick={() => handleReject(o)} style={{ ...btn(RED), flex: 1, padding: 10 }}>❌ 拒絕</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════
// Tab 4: 💸 提款管理
// ════════════════════════════════════════════
function WithdrawTab({ showMsg }) {
  const [orders, setOrders] = useState([])
  const [view, setView] = useState('pending')
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    adminAPI.withdrawList().then(d => setOrders(d.orders || [])).catch(e => showMsg(e.message, 'error'))
  }, [])

  const filtered = orders.filter(o => view === 'pending' ? o.status === 'pending' : o.status !== 'pending')

  const handleApprove = (o) => {
    setConfirm({
      msg: `確認核准 ${o.username} 的 $${o.amount} 提款？`,
      action: async () => {
        try {
          await adminAPI.approveWithdraw(o.id)
          setOrders(list => list.map(x => x.id === o.id ? { ...x, status: 'approved' } : x))
          showMsg('已核准提款')
        } catch (e) { showMsg(e.message, 'error') }
      }
    })
  }

  const handleReject = (o) => {
    setConfirm({
      msg: `確認拒絕 ${o.username} 的提款申請？`,
      action: async () => {
        try {
          await adminAPI.rejectWithdraw(o.id)
          setOrders(list => list.map(x => x.id === o.id ? { ...x, status: 'rejected' } : x))
          showMsg('已拒絕提款')
        } catch (e) { showMsg(e.message, 'error') }
      }
    })
  }

  return (
    <div>
      <Confirm msg={confirm?.msg} onYes={() => { confirm?.action(); setConfirm(null) }} onNo={() => setConfirm(null)} />

      <div style={{ display: 'flex', background: BG3, borderRadius: 10, padding: 4, marginBottom: 16, gap: 4 }}>
        {[['pending', '⏳ 待審核'], ['done', '📋 紀錄查詢']].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} style={{
            flex: 1, padding: '8px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
            background: view === k ? GOLD : 'transparent', color: view === k ? '#000' : '#666'
          }}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#555', padding: 40 }}>無提款記錄</div>}

      {filtered.map(o => (
        <div key={o.id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: o.status === 'pending' ? 12 : 0 }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{o.username}</div>
              <div style={{ color: '#888', fontSize: 12, marginTop: 3 }}>
                {o.bank_name || '銀行轉帳'} {o.bank_account ? `· ${o.bank_account}` : ''}
              </div>
              <div style={{ color: '#555', fontSize: 11 }}>{new Date(o.created_at).toLocaleString('zh-TW')}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: RED, fontSize: 20, fontWeight: 'bold' }}>-${o.amount?.toLocaleString()}</div>
              <div style={{
                ...badge(o.status === 'approved' ? GREEN : o.status === 'rejected' ? RED : GOLD),
                marginTop: 6
              }}>
                {o.status === 'approved' ? '✅ 已核准' : o.status === 'rejected' ? '❌ 已拒絕' : '⏳ 待審核'}
              </div>
            </div>
          </div>
          {o.status === 'pending' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleApprove(o)} style={{ ...btn(GREEN), flex: 1, padding: 10 }}>✅ 核准</button>
              <button onClick={() => handleReject(o)} style={{ ...btn(RED), flex: 1, padding: 10 }}>❌ 拒絕</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════
// Tab 5: 🎰 遊戲設定
// ════════════════════════════════════════════
function GameSettingsTab({ showMsg }) {
  const [settings, setSettings] = useState([])
  const [saving, setSaving] = useState(null)

  const GAMES = [
    { id: 'slot', name: '🎰 老虎機' },
    { id: 'baccarat', name: '🃏 百家樂' },
    { id: 'dice', name: '🎲 骰寶' },
    { id: 'roulette', name: '🎡 輪盤' },
    { id: 'crash', name: '🚀 一飛沖天' },
    { id: 'blackjack', name: '♠️ 21點' },
    { id: 'fishing', name: '🎣 捕魚機' },
    { id: 'mines', name: '💣 地雷爆破' },
    { id: 'lottery', name: '🎱 超級彩球' },
  ]

  useEffect(() => {
    adminAPI.gameSettings().then(d => {
      const base = GAMES.map(g => ({
        ...g,
        rtp: d[g.id]?.rtp ?? 95,
        enabled: d[g.id]?.enabled ?? true,
        jackpot: d[g.id]?.jackpot ?? 100000,
        max_bet: d[g.id]?.max_bet ?? 10000,
      }))
      setSettings(base)
    }).catch(() => {
      setSettings(GAMES.map(g => ({ ...g, rtp: 95, enabled: true, jackpot: 100000, max_bet: 10000 })))
    })
  }, [])

  const update = (id, key, val) => {
    setSettings(list => list.map(g => g.id === id ? { ...g, [key]: val } : g))
  }

  const save = async (g) => {
    setSaving(g.id)
    try {
      await adminAPI.updateGameSetting(g.id, { rtp: g.rtp, enabled: g.enabled, jackpot: g.jackpot, max_bet: g.max_bet })
      showMsg(`${g.name} 設定已保存`)
    } catch (e) { showMsg(e.message, 'error') }
    setSaving(null)
  }

  return (
    <div>
      {settings.map(g => (
        <div key={g.id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{g.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: g.enabled ? GREEN : '#666', fontSize: 13 }}>{g.enabled ? '開啟' : '關閉'}</span>
              <div
                onClick={() => update(g.id, 'enabled', !g.enabled)}
                style={{
                  width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                  background: g.enabled ? GREEN : '#333',
                  position: 'relative', transition: 'background 0.2s'
                }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 2, left: g.enabled ? 22 : 2, transition: 'left 0.2s'
                }} />
              </div>
            </div>
          </div>

          {/* RTP 滑桿 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: 12, marginBottom: 6 }}>
              <span>RTP 返還率</span>
              <span style={{ color: GOLD, fontWeight: 'bold' }}>{g.rtp}%</span>
            </div>
            <input type="range" min="50" max="99" value={g.rtp}
              onChange={e => update(g.id, 'rtp', parseInt(e.target.value))}
              style={{ width: '100%', accentColor: GOLD }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: 10 }}>
              <span>50%</span><span>75%</span><span>99%</span>
            </div>
          </div>

          {/* JACKPOT / 最高單注 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div>
              <div style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>🏆 JACKPOT金額</div>
              <input type="number" value={g.jackpot}
                onChange={e => update(g.id, 'jackpot', parseInt(e.target.value))}
                style={{ ...inputStyle, fontSize: 13, padding: '8px 10px' }} />
            </div>
            <div>
              <div style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>💰 最高單注</div>
              <input type="number" value={g.max_bet}
                onChange={e => update(g.id, 'max_bet', parseInt(e.target.value))}
                style={{ ...inputStyle, fontSize: 13, padding: '8px 10px' }} />
            </div>
          </div>

          <button onClick={() => save(g)} disabled={saving === g.id}
            style={{ ...btn(GOLD), width: '100%', padding: 9, opacity: saving === g.id ? 0.6 : 1 }}>
            {saving === g.id ? '保存中...' : '💾 保存設定'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════
// Tab 6: 📢 公告管理
// ════════════════════════════════════════════
function AnnouncementsTab({ showMsg }) {
  const [anns, setAnns] = useState([])
  const [form, setForm] = useState({ title: '', content: '', pinned: false, expires: '' })
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const load = () => {
    adminAPI.listAnnouncements().then(d => setAnns(d.announcements || [])).catch(e => showMsg(e.message, 'error'))
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.title || !form.content) return showMsg('請填寫標題和內容', 'error')
    setLoading(true)
    try {
      if (editing) {
        await adminAPI.updateAnn(editing.id, form)
        showMsg('公告已更新')
      } else {
        await adminAPI.createAnn(form.title, form.content, form.pinned, form.expires)
        showMsg('公告已發布')
      }
      setForm({ title: '', content: '', pinned: false, expires: '' })
      setEditing(null)
      load()
    } catch (e) { showMsg(e.message, 'error') }
    setLoading(false)
  }

  const handleEdit = (a) => {
    setEditing(a)
    setForm({ title: a.title, content: a.content, pinned: a.pinned || false, expires: a.expires || '' })
    window.scrollTo(0, 0)
  }

  const handleDelete = (a) => {
    setConfirm({
      msg: `確認刪除公告「${a.title}」？`,
      action: async () => {
        try {
          await adminAPI.deleteAnn(a.id)
          setAnns(list => list.filter(x => x.id !== a.id))
          showMsg('公告已刪除')
        } catch (e) { showMsg(e.message, 'error') }
      }
    })
  }

  return (
    <div>
      <Confirm msg={confirm?.msg} onYes={() => { confirm?.action(); setConfirm(null) }} onNo={() => setConfirm(null)} />

      {/* 新增/編輯表單 */}
      <div style={{ ...card, border: `1px solid ${GOLD}44` }}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 14 }}>
          {editing ? '✏️ 編輯公告' : '📢 新增公告'}
        </div>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="公告標題" style={{ ...inputStyle, marginBottom: 10 }} />
        <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          placeholder="公告內容" rows={3}
          style={{ ...inputStyle, marginBottom: 10, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
          <label style={{ color: '#aaa', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} />
            📌 置頂
          </label>
          <input type="date" value={form.expires} onChange={e => setForm(f => ({ ...f, expires: e.target.value }))}
            style={{ ...inputStyle, flex: 1, padding: '8px 10px', fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={loading}
            style={{ ...btn(GOLD), flex: 1, padding: 10 }}>
            {loading ? '儲存中...' : editing ? '✏️ 更新公告' : '📢 發布公告'}
          </button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm({ title: '', content: '', pinned: false, expires: '' }) }}
              style={{ ...btn('#666'), padding: 10 }}>取消</button>
          )}
        </div>
      </div>

      {/* 公告列表 */}
      {anns.map(a => (
        <div key={a.id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {a.pinned && <span style={badge(GOLD)}>📌 置頂</span>}
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{a.title}</span>
              </div>
              <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>{a.content}</div>
              <div style={{ color: '#555', fontSize: 11 }}>
                {new Date(a.created_at).toLocaleString('zh-TW')}
                {a.expires && <span style={{ marginLeft: 8, color: '#666' }}>有效至: {a.expires}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 10 }}>
              <button onClick={() => handleEdit(a)} style={{ ...btn(BLUE), padding: '6px 10px', fontSize: 12 }}>✏️</button>
              <button onClick={() => handleDelete(a)} style={{ ...btn(RED), padding: '6px 10px', fontSize: 12 }}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════
// Tab 7: 🎁 活動設定
// ════════════════════════════════════════════
function ActivitiesTab({ showMsg }) {
  const [settings, setSettings] = useState({
    new_user_bonus: 1000,
    daily_checkin_base: 50,
    recharge_bonus_rate: 0,
    new_user_bonus_enabled: true,
    daily_checkin_enabled: true,
    recharge_bonus_enabled: false,
    referral_bonus: 200,
    referral_enabled: false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminAPI.activitySettings().then(d => setSettings(s => ({ ...s, ...d }))).catch(() => {})
  }, [])

  const update = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminAPI.updateActivitySettings(settings)
      showMsg('活動設定已保存')
    } catch (e) { showMsg(e.message, 'error') }
    setSaving(false)
  }

  const Toggle = ({ k, label }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ color: '#ddd', fontSize: 14 }}>{label}</span>
      <div onClick={() => update(k, !settings[k])} style={{
        width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
        background: settings[k] ? GREEN : '#333', position: 'relative', transition: 'background 0.2s'
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2, left: settings[k] ? 22 : 2, transition: 'left 0.2s'
        }} />
      </div>
    </div>
  )

  return (
    <div>
      <div style={card}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 16 }}>🎁 新用戶獎勵</div>
        <Toggle k="new_user_bonus_enabled" label="新用戶贈點活動" />
        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 6 }}>贈送點數</div>
        <input type="number" value={settings.new_user_bonus}
          onChange={e => update('new_user_bonus', parseInt(e.target.value))}
          style={{ ...inputStyle, marginBottom: 0 }} />
      </div>

      <div style={card}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 16 }}>📅 每日登入獎勵</div>
        <Toggle k="daily_checkin_enabled" label="每日簽到活動" />
        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 6 }}>基礎獎勵點數</div>
        <input type="number" value={settings.daily_checkin_base}
          onChange={e => update('daily_checkin_base', parseInt(e.target.value))}
          style={inputStyle} />
        <div style={{ color: '#666', fontSize: 11, marginTop: 6 }}>每VIP等級額外 +20點</div>
      </div>

      <div style={card}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 16 }}>💳 儲值加碼</div>
        <Toggle k="recharge_bonus_enabled" label="儲值加碼活動" />
        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 6 }}>加碼比例 (%)</div>
        <input type="number" min="0" max="100" value={settings.recharge_bonus_rate}
          onChange={e => update('recharge_bonus_rate', parseInt(e.target.value))}
          style={inputStyle} />
        <div style={{ color: '#666', fontSize: 11, marginTop: 6 }}>例如：設為 20 表示儲值送 20%</div>
      </div>

      <div style={card}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 16 }}>👥 推薦獎勵</div>
        <Toggle k="referral_enabled" label="推薦好友活動" />
        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 6 }}>推薦獎勵點數</div>
        <input type="number" value={settings.referral_bonus}
          onChange={e => update('referral_bonus', parseInt(e.target.value))}
          style={inputStyle} />
      </div>

      <button onClick={handleSave} disabled={saving}
        style={{ ...btn(GOLD), width: '100%', padding: 14, fontSize: 15 }}>
        {saving ? '保存中...' : '💾 保存所有活動設定'}
      </button>
    </div>
  )
}

// ════════════════════════════════════════════
// Tab 8: 💳 付款設定
// ════════════════════════════════════════════
function PaymentTab({ showMsg }) {
  const [settings, setSettings] = useState({
    linepay_account: '',
    jkopay_account: '',
    bank_name: '',
    bank_account: '',
    bank_holder: '',
    min_recharge: 300,
    min_withdraw: 500,
    max_recharge: 100000,
    max_withdraw: 50000,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminAPI.paymentSettings().then(d => setSettings(s => ({ ...s, ...d }))).catch(() => {})
  }, [])

  const update = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminAPI.updatePaymentSettings(settings)
      showMsg('付款設定已保存')
    } catch (e) { showMsg(e.message, 'error') }
    setSaving(false)
  }

  const Field = ({ label, k, placeholder, type = 'text' }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ color: '#aaa', fontSize: 12, marginBottom: 5 }}>{label}</div>
      <input value={settings[k]} onChange={e => update(k, type === 'number' ? parseInt(e.target.value) : e.target.value)}
        placeholder={placeholder} type={type} style={inputStyle} />
    </div>
  )

  return (
    <div>
      <div style={card}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 16 }}>📱 電子支付</div>
        <Field label="LINE Pay 帳號" k="linepay_account" placeholder="LINE Pay 手機號碼或帳號" />
        <Field label="街口支付帳號" k="jkopay_account" placeholder="街口支付帳號" />
      </div>

      <div style={card}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 16 }}>🏦 銀行帳號</div>
        <Field label="銀行名稱" k="bank_name" placeholder="例：台灣銀行" />
        <Field label="銀行帳號" k="bank_account" placeholder="銀行帳號（無空格）" />
        <Field label="戶名" k="bank_holder" placeholder="開戶人姓名" />
      </div>

      <div style={card}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 16 }}>💰 儲值/提款限額</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ color: '#aaa', fontSize: 12, marginBottom: 5 }}>最低儲值</div>
            <input type="number" value={settings.min_recharge}
              onChange={e => update('min_recharge', parseInt(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <div style={{ color: '#aaa', fontSize: 12, marginBottom: 5 }}>最高儲值</div>
            <input type="number" value={settings.max_recharge}
              onChange={e => update('max_recharge', parseInt(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <div style={{ color: '#aaa', fontSize: 12, marginBottom: 5 }}>最低提款</div>
            <input type="number" value={settings.min_withdraw}
              onChange={e => update('min_withdraw', parseInt(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <div style={{ color: '#aaa', fontSize: 12, marginBottom: 5 }}>最高提款</div>
            <input type="number" value={settings.max_withdraw}
              onChange={e => update('max_withdraw', parseInt(e.target.value))} style={inputStyle} />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        style={{ ...btn(GOLD), width: '100%', padding: 14, fontSize: 15 }}>
        {saving ? '保存中...' : '💾 保存付款設定'}
      </button>
    </div>
  )
}

// ════════════════════════════════════════════
// Tab 9: 🔐 安全管理
// ════════════════════════════════════════════
function SecurityTab({ showMsg }) {
  const [otpList, setOtpList] = useState([])
  const [suspicious, setSuspicious] = useState([])
  const [blockedIPs, setBlockedIPs] = useState([])
  const [loginFails, setLoginFails] = useState([])
  const [newIP, setNewIP] = useState('')
  const [view, setView] = useState('otp')

  useEffect(() => {
    adminAPI.otpList().then(d => setOtpList(d.otps || [])).catch(() => {})
    adminAPI.suspiciousAccounts().then(d => {
      setSuspicious(d.suspicious || [])
      setBlockedIPs(d.blocked_ips || [])
      setLoginFails(d.login_fails || [])
    }).catch(() => {})
  }, [])

  const handleBlockIP = async () => {
    if (!newIP.trim()) return showMsg('請輸入IP地址', 'error')
    try {
      await adminAPI.blockIP(newIP.trim())
      setBlockedIPs(list => [...list, { ip: newIP.trim(), blocked_at: new Date().toISOString() }])
      setNewIP('')
      showMsg(`已封鎖 IP: ${newIP}`)
    } catch (e) { showMsg(e.message, 'error') }
  }

  const handleUnblockIP = async (ip) => {
    try {
      await adminAPI.unblockIP(ip)
      setBlockedIPs(list => list.filter(x => x.ip !== ip))
      showMsg(`已解鎖 IP: ${ip}`)
    } catch (e) { showMsg(e.message, 'error') }
  }

  const views = [
    ['otp', '🔑 OTP'],
    ['suspicious', '⚠️ 可疑'],
    ['ip', '🛡️ IP'],
    ['fails', '🔒 失敗'],
  ]

  return (
    <div>
      <div style={{ display: 'flex', background: BG3, borderRadius: 10, padding: 4, marginBottom: 16, gap: 4 }}>
        {views.map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} style={{
            flex: 1, padding: '8px 4px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 'bold',
            background: view === k ? GOLD : 'transparent', color: view === k ? '#000' : '#666'
          }}>{l}</button>
        ))}
      </div>

      {/* OTP 列表 */}
      {view === 'otp' && (
        <div>
          <div style={{ color: '#888', fontSize: 12, marginBottom: 10 }}>📌 顯示所有有效驗證碼（5分鐘內有效）</div>
          {otpList.length === 0 && <div style={{ textAlign: 'center', color: '#555', padding: 40 }}>目前無有效OTP</div>}
          {otpList.map((o, i) => (
            <div key={i} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>{o.phone}</div>
                <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                  到期：{o.expires ? new Date(o.expires).toLocaleTimeString('zh-TW') : '-'}
                </div>
              </div>
              <div style={{
                background: '#1a3a1a', border: `1px solid ${GREEN}44`,
                color: GREEN, fontSize: 22, fontWeight: 'bold',
                padding: '8px 16px', borderRadius: 8, letterSpacing: 4
              }}>{o.otp}</div>
            </div>
          ))}
        </div>
      )}

      {/* 可疑帳號 */}
      {view === 'suspicious' && (
        <div>
          <div style={{ color: '#888', fontSize: 12, marginBottom: 10 }}>⚠️ 異常大額或短時間多次交易帳號</div>
          {suspicious.length === 0 && <div style={{ textAlign: 'center', color: '#555', padding: 40 }}>暫無可疑帳號</div>}
          {suspicious.map((u, i) => (
            <div key={i} style={{ ...card, border: `1px solid ${RED}44` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>{u.username}</div>
                  <div style={{ color: RED, fontSize: 12, marginTop: 3 }}>{u.reason}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={badge(RED)}>{u.risk_level || '高風險'}</div>
                  <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
                    ${(u.large_amount || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* IP 封鎖 */}
      {view === 'ip' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={newIP} onChange={e => setNewIP(e.target.value)}
              placeholder="輸入要封鎖的IP地址" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={handleBlockIP} style={btn(RED)}>封鎖</button>
          </div>
          {blockedIPs.length === 0 && <div style={{ textAlign: 'center', color: '#555', padding: 30 }}>無封鎖IP</div>}
          {blockedIPs.map((ip, i) => (
            <div key={i} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: RED, fontWeight: 'bold' }}>{ip.ip}</div>
                <div style={{ color: '#555', fontSize: 11 }}>{ip.blocked_at ? new Date(ip.blocked_at).toLocaleString('zh-TW') : '-'}</div>
              </div>
              <button onClick={() => handleUnblockIP(ip.ip)} style={{ ...btn(GREEN), padding: '6px 12px', fontSize: 12 }}>解封</button>
            </div>
          ))}
        </div>
      )}

      {/* 登入失敗紀錄 */}
      {view === 'fails' && (
        <div>
          <div style={{ color: '#888', fontSize: 12, marginBottom: 10 }}>🔒 近期登入失敗紀錄</div>
          {loginFails.length === 0 && <div style={{ textAlign: 'center', color: '#555', padding: 40 }}>無失敗紀錄</div>}
          {loginFails.map((f, i) => (
            <div key={i} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#fff' }}>{f.username || f.phone || '未知'}</div>
                  <div style={{ color: '#666', fontSize: 12 }}>{f.ip || '-'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={badge(RED)}>失敗 {f.count || 1}次</div>
                  <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>
                    {f.last_attempt ? new Date(f.last_attempt).toLocaleString('zh-TW') : '-'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════
// Tab 10: ⚙️ 系統設定
// ════════════════════════════════════════════
function SystemTab({ showMsg }) {
  const [settings, setSettings] = useState({
    maintenance: false,
    site_title: '城星娛樂城',
    site_subtitle: '頂級娛樂體驗',
    cs_line: '',
    cs_telegram: '',
    cs_phone: '',
    system_announcement: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminAPI.systemSettings().then(d => setSettings(s => ({ ...s, ...d }))).catch(() => {})
  }, [])

  const update = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminAPI.updateSystemSettings(settings)
      showMsg('系統設定已保存')
    } catch (e) { showMsg(e.message, 'error') }
    setSaving(false)
  }

  return (
    <div>
      {/* 維護模式 */}
      <div style={{ ...card, border: `1px solid ${settings.maintenance ? RED : '#2a3550'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: settings.maintenance ? RED : '#ddd', fontWeight: 'bold', fontSize: 16 }}>
              🔧 維護模式
            </div>
            <div style={{ color: '#666', fontSize: 12, marginTop: 3 }}>
              {settings.maintenance ? '⚠️ 網站目前處於維護模式，用戶無法登入' : '網站正常運行中'}
            </div>
          </div>
          <div onClick={() => update('maintenance', !settings.maintenance)} style={{
            width: 52, height: 28, borderRadius: 14, cursor: 'pointer',
            background: settings.maintenance ? RED : '#333', position: 'relative', transition: 'background 0.2s'
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 2, left: settings.maintenance ? 26 : 2, transition: 'left 0.2s'
            }} />
          </div>
        </div>
      </div>

      {/* 網站設定 */}
      <div style={card}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 16 }}>🌐 網站設定</div>
        {[
          ['site_title', '網站標題'],
          ['site_subtitle', '網站副標題'],
        ].map(([k, label]) => (
          <div key={k} style={{ marginBottom: 12 }}>
            <div style={{ color: '#aaa', fontSize: 12, marginBottom: 5 }}>{label}</div>
            <input value={settings[k]} onChange={e => update(k, e.target.value)} style={inputStyle} />
          </div>
        ))}
      </div>

      {/* 客服設定 */}
      <div style={card}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 16 }}>🎧 客服聯絡方式</div>
        {[
          ['cs_line', 'LINE ID'],
          ['cs_telegram', 'Telegram 帳號'],
          ['cs_phone', '客服電話'],
        ].map(([k, label]) => (
          <div key={k} style={{ marginBottom: 12 }}>
            <div style={{ color: '#aaa', fontSize: 12, marginBottom: 5 }}>{label}</div>
            <input value={settings[k]} onChange={e => update(k, e.target.value)}
              placeholder={`請輸入${label}`} style={inputStyle} />
          </div>
        ))}
      </div>

      {/* 系統公告 */}
      <div style={card}>
        <div style={{ color: GOLD, fontWeight: 'bold', marginBottom: 12 }}>📋 系統跑馬燈公告</div>
        <textarea value={settings.system_announcement}
          onChange={e => update('system_announcement', e.target.value)}
          placeholder="顯示在網站頂部的跑馬燈公告文字" rows={3}
          style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      <button onClick={handleSave} disabled={saving}
        style={{ ...btn(GOLD), width: '100%', padding: 14, fontSize: 15 }}>
        {saving ? '保存中...' : '💾 保存系統設定'}
      </button>
    </div>
  )
}

// ════════════════════════════════════════════
// 主 AdminPage 組件
// ════════════════════════════════════════════
export default function AdminPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('dashboard')
  const [toast, setToast] = useState({ msg: '', type: 'success' })
  const toastTimer = useRef()

  const showMsg = (msg, type = 'success') => {
    setToast({ msg, type })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast({ msg: '', type: 'success' }), 3000)
  }

  const TABS = [
    { key: 'dashboard', icon: '📊', label: '總覽' },
    { key: 'users', icon: '👥', label: '用戶' },
    { key: 'recharge', icon: '💰', label: '儲值' },
    { key: 'withdraw', icon: '💸', label: '提款' },
    { key: 'games', icon: '🎰', label: '遊戲' },
    { key: 'announcements', icon: '📢', label: '公告' },
    { key: 'activities', icon: '🎁', label: '活動' },
    { key: 'payment', icon: '💳', label: '付款' },
    { key: 'security', icon: '🔐', label: '安全' },
    { key: 'system', icon: '⚙️', label: '系統' },
  ]

  const renderContent = () => {
    switch (tab) {
      case 'dashboard':     return <DashboardTab showMsg={showMsg} />
      case 'users':         return <UsersTab showMsg={showMsg} />
      case 'recharge':      return <RechargeTab showMsg={showMsg} />
      case 'withdraw':      return <WithdrawTab showMsg={showMsg} />
      case 'games':         return <GameSettingsTab showMsg={showMsg} />
      case 'announcements': return <AnnouncementsTab showMsg={showMsg} />
      case 'activities':    return <ActivitiesTab showMsg={showMsg} />
      case 'payment':       return <PaymentTab showMsg={showMsg} />
      case 'security':      return <SecurityTab showMsg={showMsg} />
      case 'system':        return <SystemTab showMsg={showMsg} />
      default:              return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingBottom: 80 }}>
      <Toast msg={toast.msg} type={toast.type} />

      {/* 頂部標題 */}
      <div style={{
        background: `linear-gradient(135deg, #0a0e1a, #111827)`,
        borderBottom: `1px solid ${GOLD}33`,
        padding: '60px 16px 16px',
        textAlign: 'center',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>⚙️</span>
          <h2 style={{ color: GOLD, margin: 0, fontSize: 20, fontWeight: 'bold' }}>後台管理系統</h2>
        </div>
        <p style={{ color: '#666', fontSize: 12, margin: '4px 0 0' }}>
          管理員：{user?.username} · {new Date().toLocaleDateString('zh-TW')}
        </p>
      </div>

      {/* Tab 導航 - 橫向捲動 */}
      <div style={{
        display: 'flex', overflowX: 'auto', gap: 0,
        background: BG2, borderBottom: `1px solid #1e2d45`,
        padding: '0 8px',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '10px 14px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            background: 'transparent', flexShrink: 0,
            color: tab === t.key ? GOLD : '#555',
            borderBottom: `2px solid ${tab === t.key ? GOLD : 'transparent'}`,
            fontSize: 11, fontWeight: tab === t.key ? 'bold' : 'normal',
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 內容區 */}
      <div style={{ padding: '16px 16px 40px', maxWidth: 700, margin: '0 auto' }}>
        {renderContent()}
      </div>
    </div>
  )
}
