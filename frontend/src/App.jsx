import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './hooks/useToast'

import Navbar    from './components/Navbar'
import BottomNav from './components/BottomNav'
import StarsBg   from './components/StarsBg'
import AuthModal from './components/AuthModal'

import HomePage        from './pages/HomePage'
import LobbyPage       from './pages/LobbyPage'
import ProfilePage     from './pages/ProfilePage'
import RechargePage    from './pages/RechargePage'
import WithdrawPage    from './pages/WithdrawPage'
import LeaderboardPage from './pages/LeaderboardPage'
import TransactionsPage from './pages/TransactionsPage'
import PromotionsPage  from './pages/PromotionsPage'
import AdminPage       from './pages/AdminPage'

// 遊戲頁面
import SlotGame        from './games/SlotGame'
import DiceGame        from './games/DiceGame'
import CrashGame       from './games/CrashGame'
import BaccaratGame    from './games/BaccaratGame'
import RouletteGame    from './games/RouletteGame'
import BlackjackGame   from './games/BlackjackGame'
import SettGame        from './games/SettGame'
import PokerGame       from './games/PokerGame'
import FishingGame     from './games/FishingGame'
import Fishing2Game    from './games/Fishing2Game'
import MinesGame       from './games/MinesGame'
import DragonTigerGame from './games/DragonTigerGame'
import MahjongGame     from './games/MahjongGame'
import SportsGame      from './games/SportsGame'
import DartsGame       from './games/DartsGame'
import CockfightGame   from './games/CockfightGame'
import CrystalGame     from './games/CrystalGame'
import RacingGame      from './games/RacingGame'
import LuckyNumberGame from './games/LuckyNumberGame'
import LotteryGame     from './games/LotteryGame'
import SscGame         from './games/SscGame'
import TrainGame       from './games/TrainGame'
import VolcanoGame     from './games/VolcanoGame'
import ThreeCardsGame  from './games/ThreeCardsGame'
import PaigoGame       from './games/PaigoGame'
import ZhajinhuaGame   from './games/ZhajinhuaGame'
import WheelGame       from './games/WheelGame'
import CarnivalGame    from './games/CarnivalGame'
import LightningDiceGame from './games/LightningDiceGame'
import Pk10Game        from './games/Pk10Game'
import ArenaGame       from './games/ArenaGame'
import FruitplateGame  from './games/FruitplateGame'
import FishBossGame    from './games/FishBossGame'

function AppInner() {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState(null) // 'login' | 'register'

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <div style={{color:'var(--gold)',fontSize:14}}>載入中...</div>
    </div>
  )

  return (
    <BrowserRouter>
      <StarsBg />
      <Navbar
        onLoginClick={()=>setAuthMode('login')}
        onRegisterClick={()=>setAuthMode('register')}
      />

      <Routes>
        <Route path="/"            element={<HomePage onLogin={()=>setAuthMode('login')} onRegister={()=>setAuthMode('register')} />} />
        <Route path="/lobby"       element={<LobbyPage />} />
        <Route path="/profile"     element={user ? <ProfilePage /> : <Navigate to="/" />} />
        <Route path="/recharge"    element={user ? <RechargePage /> : <Navigate to="/" />} />
        <Route path="/withdraw"    element={user ? <WithdrawPage /> : <Navigate to="/" />} />
        <Route path="/transactions" element={user ? <TransactionsPage /> : <Navigate to="/" />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/promotions"  element={<PromotionsPage />} />
        <Route path="/admin"       element={user?.is_admin ? <AdminPage /> : <Navigate to="/" />} />

        {/* 遊戲路由 */}
        <Route path="/game/slot/:theme"  element={<SlotGame />} />
        <Route path="/game/dice"         element={<DiceGame />} />
        <Route path="/game/crash"        element={<CrashGame />} />
        <Route path="/game/baccarat"     element={<BaccaratGame />} />
        <Route path="/game/roulette"     element={<RouletteGame />} />
        <Route path="/game/blackjack"    element={<BlackjackGame />} />
        <Route path="/game/sett"          element={<SettGame />} />
        <Route path="/game/poker"        element={<PokerGame />} />
        <Route path="/game/fishing"      element={<FishingGame />} />
        <Route path="/game/fishing2"     element={<Fishing2Game />} />
        <Route path="/game/mines"        element={<MinesGame />} />
        <Route path="/game/dragontiger"  element={<DragonTigerGame />} />
        <Route path="/game/mahjong"      element={<MahjongGame />} />
        <Route path="/game/sports"       element={<SportsGame />} />
        <Route path="/game/darts"        element={<DartsGame />} />
        <Route path="/game/cockfight"    element={<CockfightGame />} />
        <Route path="/game/crystal"      element={<CrystalGame />} />
        <Route path="/game/racing"       element={<RacingGame />} />
        <Route path="/game/luckynumber"  element={<LuckyNumberGame />} />
        <Route path="/game/lottery"      element={<LotteryGame />} />
        <Route path="/game/ssc"          element={<SscGame />} />
        <Route path="/game/train"        element={<TrainGame />} />
        <Route path="/game/volcano"      element={<VolcanoGame />} />
        <Route path="/game/threecards"   element={<ThreeCardsGame />} />
        <Route path="/game/paigo"        element={<PaigoGame />} />
        <Route path="/game/zhajinhua"    element={<ZhajinhuaGame />} />
        <Route path="/game/wheel"        element={<WheelGame />} />
        <Route path="/game/carnival"     element={<CarnivalGame />} />
        <Route path="/game/lightningdice" element={<LightningDiceGame />} />
        <Route path="/game/pk10"         element={<Pk10Game />} />
        <Route path="/game/arena"        element={<ArenaGame />} />
        <Route path="/game/fruitplate"   element={<FruitplateGame />} />
        <Route path="/game/fishboss"      element={<FishBossGame />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {user && <BottomNav />}

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={() => setAuthMode(authMode==='login'?'register':'login')}
        />
      )}
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  )
}
