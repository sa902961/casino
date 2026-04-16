import { useState } from 'react'
import { userAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

const METHODS = [
  { id:'usdt', name:'USDT 泰達幣', icon:'💎', desc:'TRC20 / ERC20', min:100 },
  { id:'bank', name:'銀行轉帳', icon:'🏦', desc:'即時到帳', min:500 },
  { id:'crypto', name:'比特幣 BTC', icon:'₿', desc:'30分鐘確認', min:200 },
  { id:'ecpay', name:'超商代碼', icon:'🏪', desc:'7-11 / 全家', min:100 },
]
const AMOUNTS = [100,200,500,1000,3000,5000,10000]

export default function RechargePage() {
  const { user, updateBalance } = useAuth()
  const [method, setMethod] = useState('usdt')
  const [amount, setAmount] = useState(500)
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const finalAmount = custom ? parseInt(custom) : amount
  const selectedMethod = METHODS.find(m => m.id === method)

  const submit = async () => {
    setError('')
    setSuccess('')
    if (!finalAmount || finalAmount < (selectedMethod?.min || 100)) {
      return setError(`最低儲值 ${selectedMethod?.min || 100} 元`)
    }
    setLoading(true)
    try {
      const data = await userAPI.recharge(finalAmount, method)
      setSuccess(`儲值申請成功！訂單已提交，請依指示完成付款。`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', padding:'80px 16px 100px', background:'#0a0a1a', maxWidth:600, margin:'0 auto' }}>
      <h2 style={{ color:'#ffd700', textAlign:'center', marginBottom:24 }}>💳 儲值中心</h2>

      {/* 餘額 */}
      <div style={{ background:'linear-gradient(135deg,#1a1040,#0d0d2b)', border:'1px solid #333',
        borderRadius:16, padding:20, marginBottom:20, textAlign:'center' }}>
        <div style={{ color:'#aaa', fontSize:13, marginBottom:4 }}>當前餘額</div>
        <div style={{ color:'#ffd700', fontSize:32, fontWeight:'bold' }}>
          💰 {user?.balance?.toFixed(2) || '0.00'}
        </div>
      </div>

      {/* 選擇方式 */}
      <div style={{ marginBottom:20 }}>
        <div style={{ color:'#aaa', fontSize:13, marginBottom:10 }}>選擇儲值方式</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {METHODS.map(m => (
            <button key={m.id} onClick={()=>setMethod(m.id)}
              style={{ background: method===m.id ? 'linear-gradient(135deg,#9c27b0,#673ab7)' : '#1e1e2e',
                border: method===m.id ? '2px solid #9c27b0' : '1px solid #333',
                borderRadius:12, padding:'14px 10px', cursor:'pointer', textAlign:'center',
                boxShadow: method===m.id ? '0 0 15px #9c27b044' : '' }}>
              <div style={{ fontSize:28 }}>{m.icon}</div>
              <div style={{ color:'#fff', fontWeight:'bold', fontSize:13, marginTop:4 }}>{m.name}</div>
              <div style={{ color:'#aaa', fontSize:11 }}>{m.desc}</div>
              <div style={{ color:'#ffd700', fontSize:11, marginTop:2 }}>最低 {m.min}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 選擇金額 */}
      <div style={{ marginBottom:20 }}>
        <div style={{ color:'#aaa', fontSize:13, marginBottom:10 }}>選擇金額</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
          {AMOUNTS.map(a => (
            <button key={a} onClick={()=>{ setAmount(a); setCustom('') }}
              style={{ background: amount===a && !custom ? '#ffd700' : '#1e1e2e',
                color: amount===a && !custom ? '#000' : '#fff',
                border:'1px solid #333', borderRadius:10, padding:'8px 18px', cursor:'pointer', fontWeight:'bold' }}>
              {a.toLocaleString()}
            </button>
          ))}
        </div>
        <input value={custom} onChange={e=>setCustom(e.target.value.replace(/\D/,''))}
          placeholder="自訂金額" type="number"
          style={{ width:'100%', padding:'12px 16px', background:'#1e1e2e', border:'1px solid #333',
            borderRadius:10, color:'#fff', fontSize:15, outline:'none', boxSizing:'border-box' }} />
      </div>

      {/* 訊息 */}
      {error && <div style={{ background:'#3e0000', color:'#ff6b6b', padding:'10px 16px', borderRadius:8, marginBottom:12, fontSize:14 }}>{error}</div>}
      {success && <div style={{ background:'#003e00', color:'#69f0ae', padding:'10px 16px', borderRadius:8, marginBottom:12, fontSize:14 }}>{success}</div>}

      {/* 確認 */}
      <div style={{ background:'#1e1e2e', borderRadius:12, padding:16, marginBottom:16, fontSize:14, color:'#aaa' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span>儲值方式</span><span style={{ color:'#fff' }}>{selectedMethod?.name}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span>儲值金額</span><span style={{ color:'#ffd700', fontWeight:'bold' }}>{finalAmount?.toLocaleString() || '-'}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span>預計到帳</span><span style={{ color:'#4caf50' }}>{finalAmount?.toLocaleString() || '-'}</span>
        </div>
      </div>

      <button onClick={submit} disabled={loading}
        style={{ width:'100%', padding:16, background:'linear-gradient(135deg,#ffd700,#ff8f00)',
          color:'#000', border:'none', borderRadius:14, fontSize:17, fontWeight:'bold',
          cursor: loading ? 'not-allowed':'pointer', opacity: loading ? 0.7:1,
          boxShadow:'0 4px 20px #ffd70044' }}>
        {loading ? '處理中...' : `💳 立即儲值 ${finalAmount?.toLocaleString() || 0} 元`}
      </button>

      <div style={{ textAlign:'center', color:'#666', fontSize:12, marginTop:16 }}>
        24小時客服 · 安全加密 · 秒速到帳
      </div>
    </div>
  )
}
