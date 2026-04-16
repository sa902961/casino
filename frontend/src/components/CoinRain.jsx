import { useEffect, useRef } from 'react'

export function spawnCoins(x, y, count = 12) {
  for (let i = 0; i < count; i++) {
    const coin = document.createElement('div')
    coin.className = 'coin'
    coin.textContent = '🪙'
    const startX = x + (Math.random() - 0.5) * 200
    coin.style.cssText = `
      left: ${startX}px;
      top: ${y}px;
      font-size: ${16 + Math.random() * 16}px;
      animation-duration: ${0.8 + Math.random() * 1.2}s;
      animation-delay: ${Math.random() * 0.4}s;
    `
    document.body.appendChild(coin)
    const dur = (parseFloat(coin.style.animationDuration) + parseFloat(coin.style.animationDelay || 0) + 0.1) * 1000
    setTimeout(() => coin.remove(), dur)
  }
}

export default function CoinRain({ active, amount }) {
  const ref = useRef()
  useEffect(() => {
    if (!active) return
    const coins = Math.min(20, Math.floor(amount / 10) + 8)
    const rect = ref.current?.getBoundingClientRect()
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const cy = rect ? rect.top : window.innerHeight / 3
    spawnCoins(cx, cy, coins)
  }, [active, amount])
  return <span ref={ref} />
}
