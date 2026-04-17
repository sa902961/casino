import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: API })

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})
api.interceptors.response.use(r => r.data, err => {
  const msg = err.response?.data?.detail || '網路錯誤，請稍後再試'
  return Promise.reject(new Error(msg))
})

export const authAPI = {
  register:   (u,p)    => api.post('/register',         { username:u, password:p }),
  login:      (u,p)    => api.post('/login',            { username:u, password:p }),
  sendOtp:    (phone)  => api.post('/auth/send-otp',    { phone }),
  verifyOtp:  (phone,otp) => api.post('/auth/verify-otp', { phone, otp }),
  me:         ()       => api.get('/me'),
  balance:    ()       => api.get('/balance'),
  checkin:    ()       => api.post('/daily-checkin'),
}

export const gameAPI = {
  slot:         (bet,e) => api.post('/game/slot',         { bet, extra:e }),
  fruitplate:   (bet,e) => api.post('/game/fruitplate',   { bet, extra:e }),
  dice:         (bet,e) => api.post('/game/dice',         { bet, extra:e }),
  crash:        (bet,e) => api.post('/game/crash',        { bet, extra:e }),
  baccarat:     (bet,e) => api.post('/game/baccarat',     { bet, extra:e }),
  roulette:     (bet,e) => api.post('/game/roulette',     { bet, extra:e }),
  blackjack:    (bet,e) => api.post('/game/blackjack',    { bet, extra:e }),
  poker:        (bet,e) => api.post('/game/poker',        { bet, extra:e }),
  fishing:      (bet,e) => api.post('/game/fishing',      { bet, extra:e }),
  fishing2:     (bet,e) => api.post('/game/fishing2',     { bet, extra:e }),
  mines:        (bet,e) => api.post('/game/mines',        { bet, extra:e }),
  dragontiger:  (bet,e) => api.post('/game/dragontiger',  { bet, extra:e }),
  mahjong:      (bet,e) => api.post('/game/mahjong',      { bet, extra:e }),
  sports:       (bet,e) => api.post('/game/sports',       { bet, extra:e }),
  darts:        (bet,e) => api.post('/game/darts',        { bet, extra:e }),
  cockfight:    (bet,e) => api.post('/game/cockfight',    { bet, extra:e }),
  crystal:      (bet,e) => api.post('/game/crystal',      { bet, extra:e }),
  racing:       (bet,e) => api.post('/game/racing',       { bet, extra:e }),
  luckynumber:  (bet,e) => api.post('/game/luckynumber',  { bet, extra:e }),
  lottery:      (bet,e) => api.post('/game/lottery',      { bet, extra:e }),
  ssc:          (bet,e) => api.post('/game/ssc',          { bet, extra:e }),
  train:        (bet,e) => api.post('/game/train',        { bet, extra:e }),
  volcano:      (bet,e) => api.post('/game/volcano',      { bet, extra:e }),
  threecards:   (bet,e) => api.post('/game/threecards',   { bet, extra:e }),
  paigo:        (bet,e) => api.post('/game/paigo',        { bet, extra:e }),
  zhajinhua:    (bet,e) => api.post('/game/zhajinhua',    { bet, extra:e }),
  wheel:        (bet,e) => api.post('/game/wheel',        { bet, extra:e }),
  carnival:     (bet,e) => api.post('/game/carnival',     { bet, extra:e }),
  lightningdice:(bet,e) => api.post('/game/lightningdice',{ bet, extra:e }),
  pk10:         (bet,e) => api.post('/game/pk10',         { bet, extra:e }),
  arena:        (bet,e) => api.post('/game/arena',        { bet, extra:e }),
}

export const userAPI = {
  recharge:      (amount,method) => api.post('/recharge', { amount, method }),
  withdraw:      (amount)        => api.post('/withdraw',  { amount }),
  transactions:  ()              => api.get('/transactions'),
  leaderboard:   ()              => api.get('/leaderboard'),
  announcements: ()              => api.get('/announcements'),
}

export const adminAPI = {
  // 舊有
  stats:          ()     => api.get('/admin/stats'),
  approve:        (id)   => api.post(`/admin/recharge_orders/${id}/approve`),
  reject:         (id)   => api.post(`/admin/recharge_orders/${id}/reject`),

  // 數據總覽
  dashboard:      ()     => api.get('/admin/dashboard'),

  // 用戶管理
  users:          (q)    => api.get('/admin/users', { params: q }),
  blockUser:      (id, block) => api.put(`/admin/users/${id}/block`, { block }),
  updateBalance:  (id, amount) => api.put(`/admin/users/${id}/balance`, { amount }),
  updateVip:      (id, vip_level) => api.put(`/admin/users/${id}/vip`, { vip_level }),

  // 儲值管理
  rechargeList:   ()     => api.get('/admin/recharge'),
  approveRecharge:(id)   => api.put(`/admin/recharge/${id}/approve`),
  rejectRecharge: (id)   => api.put(`/admin/recharge/${id}/reject`),

  // 提款管理
  withdrawList:   ()     => api.get('/admin/withdraw'),
  approveWithdraw:(id)   => api.put(`/admin/withdraw/${id}/approve`),
  rejectWithdraw: (id)   => api.put(`/admin/withdraw/${id}/reject`),

  // 遊戲設定
  gameSettings:         ()        => api.get('/admin/game-settings'),
  updateGameSetting:    (game, d) => api.put(`/admin/game-settings/${game}`, d),

  // 公告管理
  listAnnouncements: ()         => api.get('/admin/announcements-list'),
  createAnn:         (t,c,p,e)  => api.post('/admin/announcements', { title:t, content:c, pinned:p, expires:e }),
  updateAnn:         (id, d)    => api.put(`/admin/announcements/${id}`, d),
  deleteAnn:         (id)       => api.delete(`/admin/announcements/${id}`),

  // 活動設定
  activitySettings:       ()  => api.get('/admin/activity-settings'),
  updateActivitySettings: (d) => api.put('/admin/activity-settings', d),

  // 付款設定
  paymentSettings:       ()  => api.get('/admin/payment-settings'),
  updatePaymentSettings: (d) => api.put('/admin/payment-settings', d),

  // 安全管理
  otpList:            ()   => api.get('/admin/otp-list'),
  suspiciousAccounts: ()   => api.get('/admin/security'),
  blockIP:            (ip) => api.post('/admin/block-ip', { ip }),
  unblockIP:          (ip) => api.delete(`/admin/block-ip/${ip}`),

  // 系統設定
  systemSettings:       ()  => api.get('/admin/system-settings'),
  updateSystemSettings: (d) => api.put('/admin/system-settings', d),
}

export default api
