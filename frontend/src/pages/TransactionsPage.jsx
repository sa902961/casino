import { useState, useEffect } from 'react'
import { userAPI } from '../utils/api'

export default function TransactionsPage() {
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    userAPI.transactions()
      .then(d => setTxs(d.transactions || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const TX_TYPES = {
    bet:      { label:'下注', icon:'🎮', color:'#f44336' },
    win:      { label:'獲獎', icon:'🏆', color:'#4caf50' },
    recharge: { label:'儲值', icon:'💳', color:'#2196f3' },
    withdraw: { label:'提款', icon:'💸', color:'#ff9800' },
    checkin:  { label:'簽到', icon:'🎁', color:'#9c27b0' },
  }

  const filtered = filter === 'all' ? txs : txs.filter(t => t.type === filter)

  return (
    <div style={{ minHeight:'100vh', padding:'80px 16px 100px', background:'#0a0a1a', maxWidth:600, margin:'0 auto' }}>
      <h2 style={{ color:'#ffd700', textAlign:'center', marginBottom:20 }}>📋 交易記錄</h2>

      {/* 過濾 */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20, justifyContent:'center' }}>
        {[['all','全部'],['bet','下注'],['win','獲獎'],['recharge','儲值'],['withdraw','提款'],['checkin','簽到']].map(([key,label]) => (
          <button key={key} onClick={()=>setFilter(key)}
            style={{ background: filter===key ? '#ffd700':'#1e1e2e', color: filter===key?'#000':'#fff',
              border:'1px solid #333', borderRadius:20, padding:'6px 16px', cursor:'pointer', fontSize:13 }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', color:'#aaa', padding:60 }}>載入中...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', color:'#666', padding:60 }}>暫無記錄</div>
      ) : (
        filtered.map((tx, i) => {
          const info = TX_TYPES[tx.type] || { label:tx.type, icon:'📝', color:'#aaa' }
          return (
            <div key={i} style={{ background:'#1e1e2e', borderRadius:12, padding:'14px 16px',
              marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontSize:28 }}>{info.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ color:'#fff', fontWeight:'bold', fontSize:14 }}>{info.label}</div>
                <div style={{ color:'#666', fontSize:12 }}>
                  {new Date(tx.created_at).toLocaleString('zh-TW')}
                </div>
                {tx.before_balance !== undefined && (
                  <div style={{ color:'#555', fontSize:11 }}>
                    {tx.before_balance?.toFixed(2)} → {tx.after_balance?.toFixed(2)}
                  </div>
                )}
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:'bold', fontSize:16, color: tx.amount > 0 ? '#4caf50' : '#f44336' }}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount?.toFixed(2)}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
