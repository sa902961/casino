import { useState } from 'react'
import { userAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

const METHODS = [
  { id:'bank', name:'銀行轉帳', icon:'🏦', desc:'2-4小時到帳', fee:'0%' },
  { id:'usdt', name:'USDT 提款', icon:'💎', desc:'1小時確認', fee:'1%' },
  { id:'crypto', name:'比特幣 BTC', icon:'₿', desc:'30分鐘確認', fee:'1%' },
]
const AMOUNTS = [100,300,500,1000,3000,5000]

export default function WithdrawPage() {
  const { user, updateBalance } = useAuth()
  const [method, setMethod] = useState('bank')
  const [amount, setAmount] = useState(500)
  const [custom, setCustom] = useState('')
  const [account, setAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const finalAmount = custom ? parseInt(custom) : amount
  const selectedMethod = METHODS.find(m => m.id === method)

  const submit = async () => {
    setError('')
    setSuccess('')
    if (!account.trim()) return setError('請填寫收款帳號')
    if (!finalAmount || finalAmount < 100) return setError('最低提款 100 元')
    if (user && finalAmount > user.balance) return setError('餘額不足')
    setLoading(true)
    try {
      const data = await userAPI.withdraw(finalAmount)
      updateBalance(data.balance)
      setSuccess(`提款申請成功！${finalAmount} 元將於 ${selectedMethod?.desc} 到帳`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width:'100%', padding:'12px 16px', background:'#1e1e2e', border:'1px solid #333',
    borderRadius:10, color:'#fff', fontSize:15, outline:'none', boxSizing:'border-box', marginBottom:12,
  }

  return (
    <div style={{ minHeight:'100vh', padding:'80px 16px 100px', background:'#0a0a1a', maxWidth:600, margin:'0 auto' }}>
      <h2 style={{ color:'#ffd700', textAlign:'center', marginBottom:24 }}>💸 提款中心</h2>

      {/* 餘額 */}
      <div style={{ background:'linear-gradient(135deg,#1a1040,#0d0d2b)', border:'1px solid #333',
        borderRadius:16, padding:20, marginBottom:20, textAlign:'center' }}>
        <div style={{ color:'#aaa', fontSize:13, marginBottom:4 }}>可提餘額</div>
        <div style={{ color:'#ffd700', fontSize:32, fontWeight:'bold' }}>
          💰 {user?.balance?.toFixed(2) || '0.00'}
        </div>
      </div>

      {/* 提款方式 */}
      <div style={{ marginBottom:20 }}>
        <div style={{ color:'#aaa', fontSize:13, marginBottom:10 }}>選擇提款方式</div>
        <div style={{ display:'flex', gap:10 }}>
          {METHODS.map(m => (
            <button key={m.id} onClick={()=>setMethod(m.id)}
              style={{ flex:1, background: method===m.id ? 'linear-gradient(135deg,#1565c0,#1976d2)' : '#1e1e2e',
                border: method===m.id ? '2px solid #1565c0' : '1px solid #333',
                borderRadius:12, padding:'12px 8px', cursor:'pointer', textAlign:'center' }}>
              <div style={{ fontSize:24 }}>{m.icon}</div>
              <div style={{ color:'#fff', fontSize:12, fontWeight:'bold', marginTop:4 }}>{m.name}</div>
              <div style={{ color:'#aaa', fontSize:10 }}>{m.desc}</div>
              <div style={{ color: m.fee==='0%' ? '#4caf50':'#ffd700', fontSize:11 }}>手續費 {m.fee}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 金額 */}
      <div style={{ marginBottom:16 }}>
        <div style={{ color:'#aaa', fontSize:13, marginBottom:10 }}>選擇提款金額</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
          {AMOUNTS.map(a => (
            <button key={a} onClick={()=>{ setAmount(a); setCustom('') }}
              style={{ background: amount===a&&!custom?'#ffd700':'#1e1e2e',
                color: amount===a&&!custom?'#000':'#fff',
                border:'1px solid #333', borderRadius:10, padding:'8px 18px', cursor:'pointer', fontWeight:'bold' }}>
              {a.toLocaleString()}
            </button>
          ))}
        </div>
        <input value={custom} onChange={e=>setCustom(e.target.value.replace(/\D/,''))}
          placeholder="自訂金額" type="number" style={inputStyle} />
      </div>

      {/* 帳號 */}
      <div style={{ marginBottom:16 }}>
        <div style={{ color:'#aaa', fontSize:13, marginBottom:8 }}>
          {method==='bank' ? '收款帳號 (銀行帳號)' : method==='usdt' ? 'USDT 錢包地址' : '比特幣地址'}
        </div>
        <input value={account} onChange={e=>setAccount(e.target.value)}
          placeholder={method==='bank' ? '請輸入銀行帳號' : '請輸入錢包地址'}
          style={inputStyle} />
      </div>

      {/* 訊息 */}
      {error && <div style={{ background:'#3e0000', color:'#ff6b6b', padding:'10px 16px', borderRadius:8, marginBottom:12, fontSize:14 }}>{error}</div>}
      {success && <div style={{ background:'#003e00', color:'#69f0ae', padding:'10px 16px', borderRadius:8, marginBottom:12, fontSize:14 }}>{success}</div>}

      {/* 明細 */}
      <div style={{ background:'#1e1e2e', borderRadius:12, padding:16, marginBottom:16, fontSize:14, color:'#aaa' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span>提款金額</span><span style={{ color:'#fff', fontWeight:'bold' }}>{finalAmount?.toLocaleString() || '-'}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span>手續費</span><span style={{ color:'#4caf50' }}>{selectedMethod?.fee === '0%' ? '免費' : `${Math.floor((finalAmount||0)*0.01)}`}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid #333', paddingTop:6, marginTop:6 }}>
          <span>預計到帳</span>
          <span style={{ color:'#ffd700', fontWeight:'bold' }}>
            {selectedMethod?.fee === '0%' ? finalAmount?.toLocaleString() : Math.floor((finalAmount||0)*0.99).toLocaleString()}
          </span>
        </div>
      </div>

      <button onClick={submit} disabled={loading}
        style={{ width:'100%', padding:16, background:'linear-gradient(135deg,#1565c0,#0d47a1)',
          color:'#fff', border:'none', borderRadius:14, fontSize:17, fontWeight:'bold',
          cursor: loading?'not-allowed':'pointer', opacity: loading?0.7:1,
          boxShadow:'0 4px 20px #1565c044' }}>
        {loading ? '處理中...' : `💸 申請提款 ${finalAmount?.toLocaleString() || 0} 元`}
      </button>

      <div style={{ textAlign:'center', color:'#666', fontSize:12, marginTop:16 }}>
        審核時間：工作日 09:00-21:00 · 提款上限 50,000/日
      </div>
    </div>
  )
}
