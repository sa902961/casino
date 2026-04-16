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
  stats:          ()     => api.get('/admin/stats'),
  users:          ()     => api.get('/admin/users'),
  orders:         ()     => api.get('/admin/recharge_orders'),
  approve:        (id)   => api.post(`/admin/recharge_orders/${id}/approve`),
  reject:         (id)   => api.post(`/admin/recharge_orders/${id}/reject`),
  createAnn:      (t,c)  => api.post('/admin/announcements', { title:t, content:c }),
  deleteAnn:      (id)   => api.delete(`/admin/announcements/${id}`),
}

export default api
