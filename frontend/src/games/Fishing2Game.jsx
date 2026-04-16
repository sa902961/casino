import { useState, useEffect, useRef } from 'react'
import GameLayout from '../components/GameLayout'
import useGame from '../hooks/useGame'
import { gameAPI } from '../utils/api'

const FISH = [
  { id:1, emoji:'🐟', name:'小魚', pts:2,  speed:3, size:30 },
  { id:2, emoji:'🐠', name:'熱帶魚', pts:5, speed:2.5, size:36 },
  { id:3, emoji:'🐡', name:'河豚', pts:8,  speed:2, size:40 },
  { id:4, emoji:'🦈', name:'鯊魚', pts:20, speed:1.5, size:50 },
  { id:5, emoji:'🐬', name:'海豚', pts:15, speed:2, size:46 },
  { id:6, emoji:'🦞', name:'龍蝦', pts:12, speed:1.8, size:42 },
  { id:7, emoji:'🦑', name:'魷魚', pts:10, speed:2.2, size:38 },
  { id:8, emoji:'🐙', name:'章魚', pts:25, speed:1, size:55 },
  { id:9, emoji:'🐋', name:'鯨魚', pts:50, speed:0.8, size:70 },
  { id:10,emoji:'🦐', name:'蝦子', pts:3,  speed:3.5, size:28 },
]

function randomFish(id) {
  const f = FISH[Math.floor(Math.random()*FISH.length)]
  return {
    ...f,
    uid: id,
    x: Math.random() > 0.5 ? -80 : window.innerWidth + 80,
    y: 80 + Math.random() * 300,
    dir: Math.random() > 0.5 ? 1 : -1,
    dead: false,
  }
}

export default function Fishing2Game() {
  const [fishList, setFishList] = useState([])
  const [bullets, setBullets] = useState([])
  const [score, setScore] = useState(0)
  const [coins, setCoins] = useState(100)
  const [cannon, setCannon] = useState(1)
  const [msgs, setMsgs] = useState([])
  const uidRef = useRef(0)
  const frameRef = useRef()

  useEffect(() => {
    // spawn fish
    const spawnTimer = setInterval(() => {
      setFishList(f => {
        if (f.length >= 12) return f
        return [...f, randomFish(++uidRef.current)]
      })
    }, 1200)

    // move fish
    const moveTimer = setInterval(() => {
      setFishList(f => f
        .map(fish => ({ ...fish, x: fish.x + fish.speed * fish.dir * 2 }))
        .filter(fish => fish.x > -150 && fish.x < (window.innerWidth || 800) + 150)
      )
      setBullets(b => b
        .map(bl => ({ ...bl, y: bl.y - 18 }))
        .filter(bl => bl.y > -20)
      )
    }, 50)

    // initial fish
    const init = Array.from({length:6}, (_, i) => randomFish(++uidRef.current))
    setFishList(init)

    return () => { clearInterval(spawnTimer); clearInterval(moveTimer) }
  }, [])

  // collision detection
  useEffect(() => {
    if (!bullets.length || !fishList.length) return
    let caught = false
    let newFish = [...fishList]
    let newBullets = [...bullets]
    let earnedScore = 0
    let earnedCoins = 0

    bullets.forEach(bl => {
      fishList.forEach(fish => {
        if (fish.dead) return
        const dx = bl.x - fish.x
        const dy = bl.y - fish.y
        if (Math.sqrt(dx*dx + dy*dy) < fish.size/2 + 12) {
          if (Math.random() < 0.4 + cannon * 0.1) {
            const idx = newFish.findIndex(f => f.uid === fish.uid)
            if (idx !== -1) newFish[idx] = { ...newFish[idx], dead: true }
            const blIdx = newBullets.findIndex(b => b.uid === bl.uid)
            if (blIdx !== -1) newBullets.splice(blIdx, 1)
            earnedScore += fish.pts
            earnedCoins += fish.pts * cannon
            caught = true
            setMsgs(m => [...m, { id: Date.now(), text: `+${fish.pts * cannon}💰 ${fish.name}！`, x: fish.x, y: fish.y }])
            setTimeout(() => setMsgs(m => m.slice(1)), 1500)
          }
        }
      })
    })

    if (caught) {
      setFishList(newFish.filter(f => !f.dead))
      setBullets(newBullets)
      setScore(s => s + earnedScore)
      setCoins(c => c + earnedCoins)
    }
  }, [bullets, fishList, cannon])

  const fire = (e) => {
    if (coins < cannon) return
    setCoins(c => c - cannon)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    setBullets(b => [...b, { uid: ++uidRef.current, x, y: rect.height - 40 }])
  }

  return (
    <GameLayout title="超級深海炮" emoji="🎣">
      <div style={{ padding:'0 16px', marginBottom:12 }}>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <div style={{ color:'#ffd700', fontWeight:'bold' }}>🏆 分數: {score}</div>
          <div style={{ color:'#00e5ff', fontWeight:'bold' }}>💰 金幣: {coins}</div>
          <div style={{ color:'#ff4081', fontWeight:'bold' }}>🔫 炮台: Lv{cannon}</div>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:8 }}>
          {[1,2,3,4,5].map(lv => (
            <button key={lv} onClick={()=>setCoins(c => { if(c>=lv*50){setCannon(lv);return c-lv*50}return c })}
              style={{ background: cannon===lv ? '#ffd700' : '#333', color: cannon===lv ? '#000' : '#fff',
                border:'none', borderRadius:8, padding:'4px 12px', cursor:'pointer', fontSize:12 }}>
              Lv{lv}
            </button>
          ))}
        </div>
      </div>

      <div onClick={fire} style={{
        position:'relative', width:'100%', height:420,
        background:'linear-gradient(180deg,#001a3a 0%,#002b5c 40%,#003d7a 100%)',
        cursor:'crosshair', overflow:'hidden', borderRadius:16, border:'2px solid #00e5ff'
      }}>
        {/* 海底裝飾 */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:50,
          background:'linear-gradient(180deg,transparent,#001529)', display:'flex',
          alignItems:'flex-end', justifyContent:'space-around', padding:'0 20px' }}>
          {['🪨','🌿','🪸','🌿','🪨'].map((d,i) => (
            <span key={i} style={{ fontSize:24, opacity:0.7 }}>{d}</span>
          ))}
        </div>

        {/* 魚 */}
        {fishList.map(fish => (
          <div key={fish.uid} style={{
            position:'absolute', left: fish.x, top: fish.y,
            fontSize: fish.size, transform: `scaleX(${fish.dir})`,
            transition:'none', userSelect:'none', cursor:'crosshair',
          }}>{fish.emoji}</div>
        ))}

        {/* 子彈 */}
        {bullets.map(bl => (
          <div key={bl.uid} style={{
            position:'absolute', left: bl.x - 6, top: bl.y - 6,
            width:12, height:12, borderRadius:'50%',
            background:'radial-gradient(circle,#fff,#ffd700)',
            boxShadow:'0 0 8px #ffd700',
          }} />
        ))}

        {/* 傷害提示 */}
        {msgs.map(m => (
          <div key={m.id} style={{
            position:'absolute', left: m.x, top: m.y - 20,
            color:'#ffd700', fontWeight:'bold', fontSize:14,
            animation:'none', pointerEvents:'none', textShadow:'0 0 4px #000',
          }}>{m.text}</div>
        ))}

        {/* 炮台 */}
        <div style={{
          position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)',
          fontSize:32, filter:'drop-shadow(0 0 8px #00e5ff)',
        }}>🔫</div>
      </div>

      <div style={{ textAlign:'center', color:'#888', fontSize:12, marginTop:8 }}>
        點擊畫面射擊！升級炮台獲取更多金幣
      </div>
    </GameLayout>
  )
}
