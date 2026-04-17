import { useState } from 'react'
import { authAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const [tab, setTab] = useState('password')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authAPI.login(username, password)
      login(data.token, data.user)
      setSuccess('登入成功！')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    if (!phone) return setError('請輸入手機號碼')
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.sendOtp(phone)
      const autoCode = res.auto_otp
      if (res.tg_sent) {
        setOtpSent(true)
        setSuccess('✅ OTP已發送到您的Telegram！請輸入收到的驗證碼')
      } else {
        setOtp(autoCode)
        setOtpSent(true)
        setSuccess('⚡ 正在登入...')
        const data = await authAPI.verifyOtp(phone, autoCode)
        login(data.token, data.user)
        setSuccess('✅ 登入成功！')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authAPI.verifyOtp(phone, otp)
      login(data.token, data.user)
      setSuccess('登入成功！')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: '#1e1e2e', border: '1px solid #333',
    borderRadius: 10, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box',
    marginBottom: 12,
  }
  const btnStyle = {
    width: '100%', padding: '14px', background: 'linear-gradient(135deg,#9c27b0,#673ab7)',
    color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 'bold',
    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#0a0a1a,#1a0a2e)', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420, background:'#12122a', borderRadius:20,
        border:'1px solid #333', padding:32, boxShadow:'0 20px 60px #0008' }}>
        <h2 style={{ color:'#ffd700', textAlign:'center', marginBottom:24, fontSize:24 }}>
          🌟 登入爽爽贏Online
        </h2>

        {/* Tab */}
        <div style={{ display:'flex', marginBottom:24, background:'#1e1e2e', borderRadius:10, padding:4 }}>
          {[['password','🔑 帳號密碼'],['otp','📱 手機OTP']].map(([key,label]) => (
            <button key={key} onClick={()=>{ setTab(key); setError(''); setSuccess(''); setOtpSent(false); setOtp('') }}
              style={{ flex:1, padding:'10px', border:'none', borderRadius:8, cursor:'pointer',
                background: tab===key ? 'linear-gradient(135deg,#9c27b0,#673ab7)' : 'transparent',
                color:'#fff', fontWeight:'bold', fontSize:14 }}>
              {label}
            </button>
          ))}
        </div>

        {error && <div style={{ background:'#3e0000', color:'#ff6b6b', padding:'10px 16px',
          borderRadius:8, marginBottom:12, fontSize:14 }}>{error}</div>}
        {success && <div style={{ background:'#003e00', color:'#69f0ae', padding:'10px 16px',
          borderRadius:8, marginBottom:12, fontSize:14 }}>{success}</div>}

        {tab === 'password' ? (
          <form onSubmit={handlePasswordLogin}>
            <input style={inputStyle} placeholder="帳號" value={username}
              onChange={e=>setUsername(e.target.value)} required />
            <input style={inputStyle} type="password" placeholder="密碼" value={password}
              onChange={e=>setPassword(e.target.value)} required />
            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? '登入中...' : '🔑 登入'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpLogin}>
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <input style={{ ...inputStyle, marginBottom:0, flex:1 }} placeholder="手機號碼 (09xxxxxxxx)"
                value={phone} onChange={e=>setPhone(e.target.value)} required />
              <button type="button" onClick={handleSendOtp} disabled={loading || otpSent}
                style={{ padding:'12px 14px', background: otpSent ? '#444' : '#1565c0', color:'#fff',
                  border:'none', borderRadius:10, cursor: (loading||otpSent) ? 'not-allowed' : 'pointer',
                  whiteSpace:'nowrap', fontSize:13 }}>
                {loading ? '送出中...' : otpSent ? '已送出' : '發送驗證碼'}
              </button>
            </div>
            {otpSent && (
              <>
                <input style={inputStyle} placeholder="輸入Telegram收到的6位數驗證碼" value={otp}
                  onChange={e=>setOtp(e.target.value)} maxLength={6} />
                <div style={{ fontSize:12, color:'#888', marginBottom:12, textAlign:'center' }}>
                  💡 尚未綁定Telegram？去 @Sototobobot 發送 /link {phone}
                </div>
                <button type="submit" style={btnStyle} disabled={loading || !otp}>
                  {loading ? '驗證中...' : '📱 確認登入'}
                </button>
              </>
            )}
          </form>
        )}

        <div style={{ textAlign:'center', marginTop:16, color:'#555', fontSize:12 }}>
          © 爽爽贏Online
        </div>
      </div>
    </div>
  )
}
