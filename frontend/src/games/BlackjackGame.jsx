import { useState, useCallback } from 'react'
import GameLayout from '../components/GameLayout'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'

const SUITS = ['♠','♥','♦','♣']
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

function makeCard(r, s) {
  const val = r==='A'?11:['J','Q','K'].includes(r)?10:parseInt(r)
  return { rank:r, suit:s, val, red: s==='♥'||s==='♦' }
}

function shuffleDeck() {
  const deck = []
  for (const s of SUITS) for (const r of RANKS) deck.push(makeCard(r,s))
  for (let i=deck.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]] }
  return deck
}

function handValue(cards) {
  let sum = cards.reduce((a,c)=>a+c.val,0)
  let aces = cards.filter(c=>c.rank==='A').length
  while (sum > 21 && aces > 0) { sum -= 10; aces-- }
  return sum
}

function CardUI({ card, hidden }) {
  if (hidden) return (
    <div style={{ width:44, height:64, background:'#1a237e', border:'2px solid #3949ab',
      borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🂠</div>
  )
  return (
    <div style={{ width:44, height:64, background:'#fff', border:'2px solid #ddd',
      borderRadius:8, display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'space-between', padding:'4px', color: card.red ? '#c62828':'#000', fontSize:13, fontWeight:'bold' }}>
      <div>{card.rank}</div>
      <div style={{ fontSize:18 }}>{card.suit}</div>
      <div style={{ transform:'rotate(180deg)' }}>{card.rank}</div>
    </div>
  )
}

export default function BlackjackGame() {
  const [deck, setDeck] = useState([])
  const [playerCards, setPlayerCards] = useState([])
  const [dealerCards, setDealerCards] = useState([])
  const [gameState, setGameState] = useState('idle') // idle, playing, done
  const [message, setMessage] = useState('')
  const [bet, setBet] = useState(10)
  const [balance, setBalance] = useState(1000)
  const [hideDealer, setHideDealer] = useState(true)

  const deal = () => {
    if (bet > balance) return setMessage('餘額不足')
    const d = shuffleDeck()
    const p = [d[0], d[2]]
    const dl = [d[1], d[3]]
    setDeck(d.slice(4))
    setPlayerCards(p)
    setDealerCards(dl)
    setHideDealer(true)
    setGameState('playing')
    setMessage('')
    setBalance(b => b - bet)
    if (handValue(p) === 21) {
      setTimeout(() => stand([d[1],d[3]], d.slice(4), p, true), 300)
    }
  }

  const hit = () => {
    if (gameState !== 'playing') return
    const newCard = deck[0]
    const newDeck = deck.slice(1)
    const newHand = [...playerCards, newCard]
    setPlayerCards(newHand)
    setDeck(newDeck)
    const v = handValue(newHand)
    if (v > 21) {
      setHideDealer(false)
      setGameState('done')
      setMessage('💥 爆牌！莊家獲勝')
    } else if (v === 21) {
      stand(dealerCards, newDeck, newHand)
    }
  }

  const stand = (dl = dealerCards, dk = deck, ph = playerCards, natural = false) => {
    setHideDealer(false)
    let dHand = [...dl]
    let dDeck = [...dk]
    while (handValue(dHand) < 17) {
      dHand.push(dDeck[0])
      dDeck = dDeck.slice(1)
    }
    setDealerCards(dHand)
    setGameState('done')

    const pv = handValue(ph)
    const dv = handValue(dHand)
    const blackjack = natural && pv === 21

    if (pv > 21) {
      setMessage('💥 爆牌！莊家獲勝')
    } else if (dv > 21 || pv > dv) {
      const win = blackjack ? Math.floor(bet * 2.5) : bet * 2
      setBalance(b => b + win)
      setMessage(blackjack ? `🃏 BlackJack！+${win}` : `🎉 你贏了！+${win}`)
    } else if (pv === dv) {
      setBalance(b => b + bet)
      setMessage('🤝 平局！退回下注')
    } else {
      setMessage('😔 莊家獲勝')
    }
  }

  const doubleDown = () => {
    if (playerCards.length !== 2 || gameState !== 'playing') return
    if (bet > balance) return setMessage('餘額不足加倍')
    setBalance(b => b - bet)
    setBet(b => b * 2)
    const newCard = deck[0]
    const newDeck = deck.slice(1)
    const newHand = [...playerCards, newCard]
    setPlayerCards(newHand)
    setDeck(newDeck)
    stand(dealerCards, newDeck, newHand)
  }

  const pv = handValue(playerCards)
  const dv = handValue(dealerCards)

  return (
    <GameLayout title="二十一爆破" emoji="🃏">
      <div style={{ padding:'0 16px' }}>
        {/* 餘額 */}
        <div style={{ display:'flex', gap:16, justifyContent:'center', marginBottom:12 }}>
          <div style={{ color:'#ffd700', fontWeight:'bold' }}>💰 餘額: {balance}</div>
          <div style={{ color:'#00e5ff', fontWeight:'bold' }}>🎯 下注: {bet}</div>
        </div>

        {/* 莊家 */}
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ color:'#aaa', fontSize:13, marginBottom:8 }}>
            🎩 莊家 {gameState==='done' ? `(${dv})` : ''}
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {dealerCards.map((c,i) => (
              <CardUI key={i} card={c} hidden={i===1 && hideDealer} />
            ))}
          </div>
        </div>

        {/* 分隔 */}
        <div style={{ border:'1px solid #333', margin:'12px 0' }} />

        {/* 玩家 */}
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ color:'#aaa', fontSize:13, marginBottom:8 }}>
            👤 你 {playerCards.length ? `(${pv})` : ''}
            {pv === 21 && playerCards.length === 2 && <span style={{ color:'#ffd700' }}> ⭐ BlackJack!</span>}
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {playerCards.map((c,i) => <CardUI key={i} card={c} />)}
          </div>
        </div>

        {/* 訊息 */}
        {message && (
          <div style={{ textAlign:'center', fontSize:18, fontWeight:'bold', marginBottom:12,
            color: message.includes('贏') || message.includes('Jack') ? '#4caf50' : message.includes('平') ? '#ffd700' : '#f44336' }}>
            {message}
          </div>
        )}

        {/* 下注選擇 */}
        {gameState === 'idle' && (
          <div style={{ marginBottom:12 }}>
            <div style={{ color:'#aaa', fontSize:12, marginBottom:6, textAlign:'center' }}>選擇下注</div>
            <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
              {[5,10,25,50,100,500].map(c => (
                <button key={c} onClick={()=>setBet(c)}
                  style={{ background: bet===c ? '#ffd700':'#1e1e2e', color: bet===c?'#000':'#fff',
                    border:'1px solid #333', borderRadius:8, padding:'6px 14px', cursor:'pointer' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          {gameState === 'idle' || gameState === 'done' ? (
            <button onClick={deal} style={{
              background:'linear-gradient(135deg,#1565c0,#1976d2)', color:'#fff',
              border:'none', borderRadius:12, padding:'12px 40px', fontSize:16, fontWeight:'bold', cursor:'pointer' }}>
              🃏 發牌
            </button>
          ) : (
            <>
              <button onClick={hit} style={{
                background:'linear-gradient(135deg,#2e7d32,#43a047)', color:'#fff',
                border:'none', borderRadius:12, padding:'12px 28px', fontSize:15, fontWeight:'bold', cursor:'pointer' }}>
                ➕ 要牌
              </button>
              <button onClick={()=>stand()} style={{
                background:'linear-gradient(135deg,#c62828,#e53935)', color:'#fff',
                border:'none', borderRadius:12, padding:'12px 28px', fontSize:15, fontWeight:'bold', cursor:'pointer' }}>
                ✋ 停牌
              </button>
              {playerCards.length === 2 && (
                <button onClick={doubleDown} style={{
                  background:'linear-gradient(135deg,#f57f17,#ffa000)', color:'#000',
                  border:'none', borderRadius:12, padding:'12px 28px', fontSize:15, fontWeight:'bold', cursor:'pointer' }}>
                  💥 加倍
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </GameLayout>
  )
}
