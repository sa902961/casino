import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { authAPI } from '../utils/api'
import './AuthModal.css'

export default function AuthModal({ mode, onClose, onSwitch }) {
  const [tab, setTab] = useState('phone')   // 'phone' | 'account'
  const [phone, setPhone]   = useState('')
  const [otp, setOtp]       = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register, refreshUser } = useAuth()
  const toast = useToast()
  const isLogin = mode === 'login'

  // 倒數計時
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSendOtp = async () => {
    if (!phone.match(/^09\d{8}$/)) return toast('請輸入正確的手機號碼（09xxxxxxxx）', 'error')
    setLoading(true)
    try {
      await authAPI.sendOtp(phone)
      setOtpSent(true)
      setCountdown(60)
      toast('驗證碼已發送！請向客服詢問驗證碼', 'info')
    } catch(e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return toast('請輸入6位驗證碼', 'error')
    setLoading(true)
    try {
      const data = await authAPI.verifyOtp(phone, otp)
      localStorage.setItem('token', data.token)
      await refreshUser()
      toast('登入成功！歡迎回來 🎉', 'win')
      onClose()
    } catch(e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  const handleAccount = async e => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return toast('請填寫完整資料', 'error')
    setLoading(true)
    try {
      if (isLogin) {
        await login(username, password)
        toast('登入成功！歡迎回來 🎉', 'win')
      } else {
        await register(username, password)
        toast('🎁 註冊成功！已獲得 1000 遊戲幣！', 'win')
      }
      onClose()
    } catch(e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box auth-modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-star">★</span>
          <div>
            <div className="auth-logo-title">爽爽贏Online</div>
            <div className="auth-logo-sub">{isLogin?'歡迎回來！':'加入我們，立享好禮'}</div>
          </div>
        </div>

        {!isLogin && (
          <div className="auth-bonus-banner">🎁 新會員立送 <strong>1,000</strong> 遊戲幣！</div>
        )}

        {/* Tab 切換 */}
        <div className="auth-tabs">
          <button className={tab==='phone'?'active':''} onClick={()=>setTab('phone')}>📱 手機登入</button>
          <button className={tab==='account'?'active':''} onClick={()=>setTab('account')}>🔑 帳號登入</button>
        </div>

        {/* 手機登入 */}
        {tab==='phone' && (
          <div className="auth-form">
            <div className="form-group">
              <label>手機號碼</label>
              <input className="input" placeholder="09xxxxxxxx" value={phone}
                onChange={e=>setPhone(e.target.value)} maxLength={10} />
            </div>
            {!otpSent ? (
              <button className="btn btn-gold btn-full" onClick={handleSendOtp} disabled={loading}>
                {loading ? '發送中...' : '📨 發送驗證碼'}
              </button>
            ) : (
              <>
                <div className="form-group">
                  <label>驗證碼 <span className="otp-hint">（請向客服詢問6位數驗證碼）</span></label>
                  <input className="input otp-input" placeholder="000000" value={otp}
                    onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} maxLength={6} />
                </div>
                <button className="btn btn-gold btn-full btn-lg" onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? '驗證中...' : '✅ 確認登入'}
                </button>
                <button className="btn btn-outline btn-full btn-sm"
                  onClick={handleSendOtp}
                  disabled={countdown > 0 || loading}>
                  {countdown > 0 ? `重新發送 (${countdown}s)` : '重新發送驗證碼'}
                </button>
              </>
            )}
            <div className="auth-otp-note">
              ℹ️ 驗證碼由客服人員手動告知，有效期 5 分鐘
            </div>
          </div>
        )}

        {/* 帳號登入 */}
        {tab==='account' && (
          <form onSubmit={handleAccount} className="auth-form">
            <div className="form-group">
              <label>帳號</label>
              <input className="input" placeholder="3-20字元" value={username}
                onChange={e=>setUsername(e.target.value)} autoComplete="username" />
            </div>
            <div className="form-group">
              <label>密碼</label>
              <input className="input" type="password" placeholder="至少6字元" value={password}
                onChange={e=>setPassword(e.target.value)}
                autoComplete={isLogin?'current-password':'new-password'} />
            </div>
            <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading}>
              {loading ? '處理中...' : isLogin ? '🔑 登入' : '🚀 立即註冊'}
            </button>
          </form>
        )}

        {tab==='account' && (
          <div className="auth-switch">
            {isLogin?'還沒有帳號？':'已有帳號？'}
            <button onClick={onSwitch} className="switch-btn">
              {isLogin?'立即註冊':'前往登入'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
