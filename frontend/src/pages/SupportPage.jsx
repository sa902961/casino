import { useState } from 'react'
import './SupportPage.css'

const FAQ_LIST = [
  {
    q: '如何註冊帳號？',
    a: '點擊右上角「立即加入」按鈕，填寫手機號碼後輸入收到的6位數驗證碼，即可完成註冊。整個流程不超過1分鐘，新會員還可立即獲得1,000遊戲幣歡迎禮！',
  },
  {
    q: '如何儲值購點？',
    a: '登入後前往「儲值購點」頁面，目前支援銀行轉帳、超商代碼繳費等方式。最低儲值金額為100元，儲值完成後點數即時入帳（銀行轉帳約5-15分鐘）。',
  },
  {
    q: '如何提現？',
    a: '前往「會員中心 → 提現申請」，填寫銀行帳號後提交申請。提現審核時間通常為1-3個工作日。提現最低金額為200元，VIP會員享有更快的提現速度。',
  },
  {
    q: '遊戲幣可以換現金嗎？',
    a: '本平台遊戲幣為娛樂用途，所有儲值均為購買遊戲服務。提現功能是指將帳戶餘額提出，非指遊戲幣兌現。',
  },
  {
    q: '忘記密碼怎麼辦？',
    a: '在登入頁面點擊「忘記密碼」，輸入您的手機號碼後，系統將發送驗證碼供您重設密碼。若手機號碼也無法使用，請聯繫客服協助處理。',
  },
  {
    q: '帳號被封鎖了怎麼辦？',
    a: '帳號封鎖通常因為多次輸入錯誤密碼或違反使用條款。請透過LINE客服提供帳號資訊，客服人員將協助您解鎖。',
  },
  {
    q: '遊戲中遇到連線問題怎麼辦？',
    a: '請先確認網路連線是否正常，並嘗試重新整理頁面。若問題持續，請清除瀏覽器快取後重試，或換用其他瀏覽器。仍有問題請聯繫客服。',
  },
  {
    q: 'VIP等級如何升級？',
    a: 'VIP等級依據帳號累積儲值金額自動升級，共分10個等級。VIP等級越高享有的優惠越豐厚，包括儲值加碼、提現加速、專屬活動等。',
  },
  {
    q: '優惠活動如何參與？',
    a: '前往「優惠活動」頁面查看所有進行中的活動，點擊「立即參與」按鈕即可加入。部分活動需要手動申請領取，請注意活動說明。',
  },
  {
    q: '手機可以玩嗎？',
    a: '本平台完全支援手機瀏覽器，無需下載APP！使用Safari（iOS）或Chrome（Android）開啟網站即可流暢遊玩，支援觸控操作，所有遊戲均已針對行動裝置優化。',
  },
]

const CONTACT_METHODS = [
  {
    icon: '💬',
    title: 'LINE 線上客服',
    desc: '最快速的聯繫方式，平均回覆時間 < 5分鐘',
    action: '加入 LINE',
    link: 'https://line.me/R/ti/p/@爽爽贏',
    color: '#06C755',
    glow: 'rgba(6,199,85,0.3)',
    available: '24小時在線',
  },
  {
    icon: '📱',
    title: 'Telegram 客服',
    desc: '快速回覆，支援圖片截圖問題回報',
    action: '加入 Telegram',
    link: 'https://t.me/爽爽贏',
    color: '#229ED9',
    glow: 'rgba(34,158,217,0.3)',
    available: '24小時在線',
  },
  {
    icon: '📧',
    title: '電子郵件',
    desc: '適合詳細問題說明，1-4小時內回覆',
    action: '發送郵件',
    link: 'mailto:support@爽爽贏.com',
    color: '#FF8C00',
    glow: 'rgba(255,140,0,0.3)',
    available: '工作時間',
  },
]

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null)
  const [form, setForm] = useState({ name: '', contact: '', category: 'general', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.contact || !form.message) return alert('請填寫聯繫方式和問題說明')
    setSubmitted(true)
  }

  return (
    <div className="support-page page">
      {/* Hero */}
      <div className="sp-hero">
        <div className="sp-hero-bg" />
        <div className="sp-hero-content">
          <div className="sp-hero-icon">🎧</div>
          <h1 className="sp-hero-title">客服中心</h1>
          <p className="sp-hero-sub">全天候 24H 專業客服，隨時為您服務</p>
          <div className="sp-online-badge">
            <span className="sp-online-dot" />
            客服在線中
          </div>
        </div>
      </div>

      <div className="sp-container">
        {/* Contact methods */}
        <section className="sp-section">
          <h2 className="sp-section-title">📞 聯繫我們</h2>
          <div className="sp-contact-grid">
            {CONTACT_METHODS.map(m => (
              <a
                key={m.title}
                href={m.link}
                target="_blank"
                rel="noopener noreferrer"
                className="sp-contact-card"
                style={{ '--card-glow': m.glow, '--card-color': m.color }}
              >
                <div className="sp-contact-icon" style={{ color: m.color, fontSize: 36 }}>{m.icon}</div>
                <div className="sp-contact-info">
                  <div className="sp-contact-title">{m.title}</div>
                  <div className="sp-contact-desc">{m.desc}</div>
                  <div className="sp-contact-avail">
                    <span className="sp-avail-dot" style={{ background: m.color }} />
                    {m.available}
                  </div>
                </div>
                <div className="sp-contact-btn" style={{ background: m.color }}>{m.action} →</div>
              </a>
            ))}
          </div>
        </section>

        {/* Service Hours */}
        <section className="sp-section">
          <h2 className="sp-section-title">⏰ 服務時間</h2>
          <div className="sp-hours-grid">
            {[
              { label: 'LINE / Telegram 客服', hours: '24小時 / 全年無休', icon: '💬', color: '#06C755' },
              { label: '郵件客服',             hours: '週一至週五 9:00-22:00', icon: '📧', color: '#FF8C00' },
              { label: '儲值處理',             hours: '即時自動處理', icon: '💰', color: '#FFD700' },
              { label: '提現審核',             hours: '1-3 個工作日', icon: '🏦', color: '#00F5FF' },
            ].map(s => (
              <div key={s.label} className="sp-hours-item">
                <div className="sp-hours-icon" style={{ color: s.color }}>{s.icon}</div>
                <div>
                  <div className="sp-hours-label">{s.label}</div>
                  <div className="sp-hours-val" style={{ color: s.color }}>{s.hours}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="sp-section">
          <h2 className="sp-section-title">❓ 常見問題 FAQ</h2>
          <div className="sp-faq-list">
            {FAQ_LIST.map((item, i) => (
              <div key={i} className={`sp-faq-item ${openFaq === i ? 'open' : ''}`}>
                <button
                  className="sp-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="sp-faq-q-text">{item.q}</span>
                  <span className="sp-faq-arrow">{openFaq === i ? '▲' : '▼'}</span>
                </button>
                {openFaq === i && (
                  <div className="sp-faq-a">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact form */}
        <section className="sp-section">
          <h2 className="sp-section-title">✉️ 問題回報</h2>
          {submitted ? (
            <div className="sp-submitted">
              <div className="sp-submitted-icon">✅</div>
              <div className="sp-submitted-title">已收到您的訊息！</div>
              <div className="sp-submitted-desc">我們將在24小時內回覆您，感謝您的耐心等待。</div>
              <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => setSubmitted(false)}>
                再次提交
              </button>
            </div>
          ) : (
            <form className="sp-form" onSubmit={handleSubmit}>
              <div className="sp-form-row">
                <div className="sp-form-field">
                  <label className="sp-form-label">姓名（選填）</label>
                  <input
                    className="input"
                    placeholder="您的稱呼"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="sp-form-field">
                  <label className="sp-form-label">聯繫方式 *</label>
                  <input
                    className="input"
                    placeholder="手機號碼 / LINE ID / Email"
                    value={form.contact}
                    onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="sp-form-field">
                <label className="sp-form-label">問題類別</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="general">一般問題</option>
                  <option value="account">帳號問題</option>
                  <option value="payment">儲值/提現</option>
                  <option value="game">遊戲問題</option>
                  <option value="promo">優惠活動</option>
                  <option value="technical">技術問題</option>
                </select>
              </div>
              <div className="sp-form-field">
                <label className="sp-form-label">問題說明 *</label>
                <textarea
                  className="input sp-textarea"
                  placeholder="請詳細描述您遇到的問題，包含發生時間、遊戲名稱等相關資訊..."
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%' }}>
                🚀 送出問題
              </button>
            </form>
          )}
        </section>

        {/* Notice */}
        <div className="sp-notice">
          <div className="sp-notice-icon">⚠️</div>
          <div className="sp-notice-text">
            本平台遊戲僅供娛樂，遊戲幣不具任何現金價值。如有成癮問題，請尋求專業協助。
          </div>
        </div>
      </div>
    </div>
  )
}
