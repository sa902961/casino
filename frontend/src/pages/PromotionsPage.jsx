import { useState, useEffect } from 'react'
import { userAPI } from '../utils/api'

const PROMOS = [
  {
    id:1, badge:'🔥 限時', title:'新會員首儲100%加碼',
    desc:'首次儲值立享100%獎金加碼，最高贈送 $5000！',
    color:'#c62828', expiry:'長期有效', condition:'最低儲值 $100',
    detail:'首儲 $100 → 實拿 $200\n首儲 $500 → 實拿 $1000\n首儲 $1000 → 實拿 $2000',
  },
  {
    id:2, badge:'💎 VIP', title:'每日返水最高 1.5%',
    desc:'每日下注自動返水，金額越大返得越多！',
    color:'#1565c0', expiry:'每日自動發放', condition:'無需申請',
    detail:'一般會員: 0.5%\n銀牌VIP: 1.0%\n金牌以上: 1.5%',
  },
  {
    id:3, badge:'🎁 每日', title:'每日簽到最高 $200',
    desc:'連續簽到天數越多，獎勵越豐厚！',
    color:'#2e7d32', expiry:'每日 00:00 重置', condition:'登入後簽到',
    detail:'第1天: $5\n第7天: $50\n第30天: $200',
  },
  {
    id:4, badge:'👥 推薦', title:'推薦好友得 $500',
    desc:'每推薦一位好友首儲，即獲 $500 獎金！',
    color:'#f57f17', expiry:'無限制', condition:'好友首儲滿 $200',
    detail:'推薦獎金: $500/人\n無上限，推越多得越多',
  },
  {
    id:5, badge:'🎰 遊戲', title:'老虎機加碼 JACKPOT',
    desc:'每周五至周日，老虎機 JACKPOT 加碼 5 倍！',
    color:'#6a1b9a', expiry:'每週五-日', condition:'任意老虎機遊戲',
    detail:'JACKPOT 基本倍數 x5\n最高可得 $100,000',
  },
  {
    id:6, badge:'💰 存款', title:'每日再存 30% 紅利',
    desc:'每日第二筆及以上儲值，享 30% 獎金！',
    color:'#00695c', expiry:'每日限一次', condition:'最低儲值 $200',
    detail:'每日第二筆儲值\n$200 → 送 $60\n$500 → 送 $150',
  },
]

export default function PromotionsPage() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ minHeight:'100vh', padding:'80px 16px 100px', background:'#0a0a1a', maxWidth:700, margin:'0 auto' }}>
      <h2 style={{ color:'#ffd700', textAlign:'center', marginBottom:6 }}>🎁 優惠活動</h2>
      <p style={{ color:'#666', textAlign:'center', fontSize:13, marginBottom:24 }}>
        專屬優惠 · 天天驚喜 · 立即領取
      </p>

      <div style={{ display:'grid', gap:16 }}>
        {PROMOS.map(p => (
          <div key={p.id} onClick={()=>setSelected(selected===p.id ? null : p.id)}
            style={{ background:`linear-gradient(135deg,${p.color}22,#1e1e2e)`,
              border:`1px solid ${p.color}66`, borderRadius:16, padding:20, cursor:'pointer',
              transition:'transform 0.2s', boxShadow: selected===p.id ? `0 0 20px ${p.color}44` : '' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div>
                <span style={{ background: p.color, color:'#fff', fontSize:11, padding:'2px 8px',
                  borderRadius:20, fontWeight:'bold', marginRight:8 }}>{p.badge}</span>
                <span style={{ color:'#fff', fontSize:16, fontWeight:'bold' }}>{p.title}</span>
              </div>
              <div style={{ color:'#aaa', fontSize:20 }}>{selected===p.id ? '▲' : '▼'}</div>
            </div>
            <div style={{ color:'#aaa', fontSize:14 }}>{p.desc}</div>

            {selected === p.id && (
              <div style={{ marginTop:16, borderTop:`1px solid ${p.color}33`, paddingTop:16 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                  <div style={{ background:'#0a0a1a', borderRadius:8, padding:'8px 12px' }}>
                    <div style={{ color:'#666', fontSize:11 }}>有效期限</div>
                    <div style={{ color:'#fff', fontSize:13, fontWeight:'bold' }}>{p.expiry}</div>
                  </div>
                  <div style={{ background:'#0a0a1a', borderRadius:8, padding:'8px 12px' }}>
                    <div style={{ color:'#666', fontSize:11 }}>申請條件</div>
                    <div style={{ color:'#fff', fontSize:13, fontWeight:'bold' }}>{p.condition}</div>
                  </div>
                </div>
                <div style={{ background:'#0a0a1a', borderRadius:8, padding:'12px 16px', marginBottom:12 }}>
                  <div style={{ color:'#aaa', fontSize:12, marginBottom:6 }}>詳細說明</div>
                  {p.detail.split('\n').map((line,i) => (
                    <div key={i} style={{ color:'#fff', fontSize:13, padding:'3px 0' }}>• {line}</div>
                  ))}
                </div>
                <button onClick={e => { e.stopPropagation(); alert('優惠已申請！客服將盡快審核') }}
                  style={{ width:'100%', padding:12, background:`linear-gradient(135deg,${p.color},${p.color}cc)`,
                    color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:'bold', cursor:'pointer' }}>
                  🎁 立即申請
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign:'center', color:'#555', fontSize:12, marginTop:24 }}>
        優惠活動以客服公告為準 · 如有疑問請聯繫24小時線上客服
      </div>
    </div>
  )
}
