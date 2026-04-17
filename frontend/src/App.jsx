import React, { Suspense, lazy, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './hooks/useToast'

import Navbar    from './components/Navbar'
import BottomNav from './components/BottomNav'
import StarsBg   from './components/StarsBg'
import AuthModal from './components/AuthModal'

// 頁面 - 懶加載
const HomePage        = lazy(() => import('./pages/HomePage'))
const LobbyPage       = lazy(() => import('./pages/LobbyPage'))
const ProfilePage     = lazy(() => import('./pages/ProfilePage'))
const RechargePage    = lazy(() => import('./pages/RechargePage'))
const WithdrawPage    = lazy(() => import('./pages/WithdrawPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'))
const PromotionsPage  = lazy(() => import('./pages/PromotionsPage'))
const AdminPage       = lazy(() => import('./pages/AdminPage'))
const GameIntroPage   = lazy(() => import('./pages/GameIntroPage'))
const SupportPage     = lazy(() => import('./pages/SupportPage'))

// 遊戲頁面 - 懶加載
const SlotGame        = lazy(() => import('./games/SlotGame'))
const DiceGame        = lazy(() => import('./games/DiceGame'))
const CrashGame       = lazy(() => import('./games/CrashGame'))
const BaccaratGame    = lazy(() => import('./games/BaccaratGame'))
const RouletteGame    = lazy(() => import('./games/RouletteGame'))
const BlackjackGame   = lazy(() => import('./games/BlackjackGame'))
const SettGame        = lazy(() => import('./games/SettGame'))
const PokerGame       = lazy(() => import('./games/PokerGame'))
const FishingGame     = lazy(() => import('./games/FishingGame'))
const Fishing2Game    = lazy(() => import('./games/Fishing2Game'))
const MinesGame       = lazy(() => import('./games/MinesGame'))
const DragonTigerGame = lazy(() => import('./games/DragonTigerGame'))
const MahjongGame     = lazy(() => import('./games/MahjongGame'))
const SportsGame      = lazy(() => import('./games/SportsGame'))
const DartsGame       = lazy(() => import('./games/DartsGame'))
const CockfightGame   = lazy(() => import('./games/CockfightGame'))
const CrystalGame     = lazy(() => import('./games/CrystalGame'))
const RacingGame      = lazy(() => import('./games/RacingGame'))
const LuckyNumberGame = lazy(() => import('./games/LuckyNumberGame'))
const LotteryGame     = lazy(() => import('./games/LotteryGame'))
const SscGame         = lazy(() => import('./games/SscGame'))
const TrainGame       = lazy(() => import('./games/TrainGame'))
const VolcanoGame     = lazy(() => import('./games/VolcanoGame'))
const ThreeCardsGame  = lazy(() => import('./games/ThreeCardsGame'))
const PaigoGame       = lazy(() => import('./games/PaigoGame'))
const ZhajinhuaGame   = lazy(() => import('./games/ZhajinhuaGame'))
const WheelGame       = lazy(() => import('./games/WheelGame'))
const CarnivalGame    = lazy(() => import('./games/CarnivalGame'))
const LightningDiceGame = lazy(() => import('./games/LightningDiceGame'))
const Pk10Game        = lazy(() => import('./games/Pk10Game'))
const ArenaGame       = lazy(() => import('./games/ArenaGame'))
const FruitplateGame  = lazy(() => import('./games/FruitplateGame'))
const FishBossGame    = lazy(() => import('./games/FishBossGame'))

const LoadingFallback = (
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#080010',color:'#ffd700',fontSize:18}}>
    ⚡ 載入中...
  </div>
)

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

      <Suspense fallback={LoadingFallback}>
        <Routes>
          <Route path="/"            element={<HomePage onLogin={()=>setAuthMode('login')} onRegister={()=>setAuthMode('register')} />} />
          <Route path="/lobby"       element={<LobbyPage />} />
          <Route path="/profile"     element={user ? <ProfilePage /> : <Navigate to="/" />} />
          <Route path="/recharge"    element={user ? <RechargePage /> : <Navigate to="/" />} />
          <Route path="/withdraw"    element={user ? <WithdrawPage /> : <Navigate to="/" />} />
          <Route path="/transactions" element={user ? <TransactionsPage /> : <Navigate to="/" />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/promotions"  element={<PromotionsPage />} />
          <Route path="/jiawen"      element={user?.is_admin ? <AdminPage /> : <Navigate to="/" />} />
          <Route path="/game-intro"   element={<GameIntroPage />} />
          <Route path="/support"      element={<SupportPage />} />

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
      </Suspense>

      <BottomNav />

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
