import { useState, useEffect } from 'react'
import { userAPI } from '../utils/api'

export default function Marquee() {
  const [items, setItems] = useState([
    '🎉 城星娛樂城盛大開業！新會員註冊送1000遊戲幣',
    '🏆 本週大獎得主：lucky888 贏得 99,999 幣！',
    '🎰 老虎機全新登場，最高100倍彩金！',
    '💰 VIP會員專屬優惠，儲值即享雙倍紅利！',
    '🎁 每日登入簽到，累積獎勵豐厚！',
  ])

  useEffect(() => {
    userAPI.announcements().then(data => {
      if (data?.length) setItems(data.map(a => `📢 ${a.title}：${a.content}`))
    }).catch(() => {})
  }, [])

  const doubled = [...items, ...items]

  return (
    <div className="marquee-wrap">
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            <span>⭐</span>
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
