import { useEffect } from 'react'
import { spawnCoins } from './CoinRain'

export default function JackpotModal({ amount, onClose }) {
  useEffect(() => {
    spawnCoins(window.innerWidth / 2, window.innerHeight / 4, 30)
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="jackpot-overlay" onClick={onClose}>
      <div className="jackpot-text">🎰 JACKPOT! 🎰</div>
      <div className="jackpot-amount">+{amount.toFixed(2)}</div>
      <div style={{ color: '#FFD700', fontSize: 18, opacity: 0.8 }}>點擊任意處繼續</div>
    </div>
  )
}
