import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import { spawnCoins } from '../components/CoinRain'

export default function useGame(apiFn) {
  const { user, updateBalance } = useAuth()
  const toast = useToast()
  const [bet, setBet] = useState(10)
  const [result, setResult] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [showJackpot, setShowJackpot] = useState(false)

  const play = useCallback(async (extra = {}) => {
    if (!user) return toast('請先登入', 'error')
    if (bet <= 0 || bet > user.balance) return toast('下注金額無效', 'error')
    setSpinning(true)
    setResult(null)
    try {
      const data = await apiFn(bet, extra)
      setResult(data)
      updateBalance(data.balance)
      if (data.win > 0) {
        spawnCoins(window.innerWidth / 2, window.innerHeight / 3, Math.min(25, Math.floor(data.win / bet) + 6))
        if (data.win >= bet * 10) {
          setShowJackpot(true)
        } else {
          toast(`🎉 贏得 +${data.win.toFixed(2)}`, 'win')
        }
      } else {
        toast('未中獎，再接再厲！', 'info')
      }
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSpinning(false)
    }
  }, [apiFn, bet, user, updateBalance, toast])

  const chips = [5, 10, 25, 50, 100, 500]

  return { bet, setBet, result, spinning, play, chips, showJackpot, setShowJackpot, user }
}
