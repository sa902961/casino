// 完整遊戲清單
export const ALL_GAMES = [
  // ── 老虎機 ──────────────────────────────────
  { id:'slot_fruit',   name:'水果老虎機',  emoji:'🍒', cat:'slot',    tags:['熱門','老虎機'], badge:'hot',    desc:'經典水果機，最高50倍' },
  { id:'slot_god',     name:'財神爺',      emoji:'🏮', cat:'slot',    tags:['熱門','老虎機'], badge:'jackpot',desc:'財神降臨，招財進寶' },
  { id:'slot_cat',     name:'招財貓',      emoji:'🐱', cat:'slot',    tags:['老虎機'],        badge:'new',    desc:'招財貓老虎機，好運連連' },
  { id:'slot_sanguo',  name:'三國英雄',    emoji:'⚔️', cat:'slot',    tags:['老虎機'],        badge:'hot',    desc:'三國主題老虎機' },
  { id:'slot_dragon',  name:'神龍傳說',    emoji:'🐉', cat:'slot',    tags:['老虎機'],        badge:'jackpot',desc:'神龍老虎機，最高100倍' },
  { id:'slot_egypt',   name:'埃及豔后',    emoji:'👸', cat:'slot',    tags:['老虎機'],        badge:'',       desc:'埃及主題老虎機' },
  { id:'slot_vegas',   name:'拉斯維加斯',  emoji:'🎰', cat:'slot',    tags:['熱門','老虎機'], badge:'hot',    desc:'Las Vegas 經典老虎機' },
  { id:'slot_spring',  name:'過年發財',    emoji:'🧧', cat:'slot',    tags:['老虎機'],        badge:'new',    desc:'新年主題老虎機' },
  { id:'slot_panda',   name:'熊貓樂園',    emoji:'🐼', cat:'slot',    tags:['老虎機'],        badge:'',       desc:'熊貓主題老虎機' },
  { id:'slot_ninja',   name:'武士傳說',    emoji:'🗡️', cat:'slot',    tags:['老虎機'],        badge:'new',    desc:'武士主題老虎機' },
  { id:'slot_moon',    name:'月亮女神',    emoji:'🌙', cat:'slot',    tags:['老虎機'],        badge:'new',    desc:'月亮主題老虎機' },

  // ── 桌遊 ────────────────────────────────────
  { id:'baccarat',     name:'百家樂',      emoji:'🃏', cat:'table',   tags:['熱門','桌遊'],   badge:'hot',    desc:'經典百家樂，莊閒和' },
  { id:'blackjack',    name:'21點',        emoji:'🂡', cat:'table',   tags:['桌遊'],          badge:'',       desc:'21點，超越莊家' },
  { id:'sett',         name:'戰神賽特',    emoji:'⚔️', cat:'table',   tags:['熱門','桌遊'],   badge:'hot',    desc:'埃及戰神老虎機，WILD+免費旋轉' },
  { id:'poker',        name:'德州撲克',    emoji:'♠️', cat:'table',   tags:['熱門','桌遊'],   badge:'hot',    desc:'德州撲克，稱霸牌局' },
  { id:'roulette',     name:'輪盤',        emoji:'🎡', cat:'table',   tags:['桌遊'],          badge:'',       desc:'歐式輪盤' },
  { id:'threecards',   name:'三公',        emoji:'🂠', cat:'table',   tags:['桌遊'],          badge:'new',    desc:'三張牌比大小' },
  { id:'paigo',        name:'牌九',        emoji:'🎴', cat:'table',   tags:['桌遊'],          badge:'',       desc:'傳統牌九' },

  // ── 捕魚 ────────────────────────────────────
  { id:'fishing',      name:'捕魚機',      emoji:'🐠', cat:'fish',    tags:['熱門','捕魚'],   badge:'hot',    desc:'捕魚機，射擊魚群得分' },
  { id:'fishing2',     name:'超級捕魚',    emoji:'🦈', cat:'fish',    tags:['捕魚'],          badge:'new',    desc:'升級版捕魚，有BOSS大魚' },

  // ── 骰子彩票 ────────────────────────────────
  { id:'dice',         name:'骰寶',        emoji:'🎲', cat:'dice',    tags:['熱門','骰子'],   badge:'hot',    desc:'骰寶，押大小/點數' },
  { id:'lightningdice',name:'閃電骰子',    emoji:'⚡', cat:'dice',    tags:['骰子'],          badge:'new',    desc:'隨機閃電倍數加成' },
  { id:'racing',       name:'極速賽車',    emoji:'🏎️', cat:'dice',    tags:['彩票'],          badge:'hot',    desc:'1-10號賽車押注' },
  { id:'pk10',         name:'賽車彩票',    emoji:'🚗', cat:'dice',    tags:['彩票'],          badge:'',       desc:'PK10賽車彩票' },
  { id:'luckynumber',  name:'幸運數字',    emoji:'🔢', cat:'dice',    tags:['彩票'],          badge:'',       desc:'猜0-9數字' },
  { id:'lottery',      name:'樂透彩',      emoji:'🎳', cat:'dice',    tags:['彩票'],          badge:'',       desc:'樂透型彩票押注' },
  { id:'ssc',          name:'時時彩',      emoji:'⏱️', cat:'dice',    tags:['彩票'],          badge:'hot',    desc:'三星/五星時時彩' },

  // ── 街機 ────────────────────────────────────
  { id:'crash',        name:'起飛遊戲',    emoji:'🚀', cat:'arcade',  tags:['熱門','街機'],   badge:'hot',    desc:'倍數不斷上漲，適時停止' },
  { id:'volcano',      name:'火山爆發',    emoji:'🌋', cat:'arcade',  tags:['街機'],          badge:'jackpot',desc:'累積彩金爆發遊戲' },
  { id:'train',        name:'財富列車',    emoji:'🚂', cat:'arcade',  tags:['街機'],          badge:'',       desc:'連線贏獎街機' },
  { id:'arena',        name:'競技場',      emoji:'🏆', cat:'arcade',  tags:['街機'],          badge:'new',    desc:'多人競技老虎機' },
  { id:'mines',        name:'掃地雷',      emoji:'💣', cat:'arcade',  tags:['熱門','街機'],   badge:'hot',    desc:'踩地雷冒險遊戲' },

  // ── 撲克 ────────────────────────────────────
  { id:'dragontiger',  name:'龍虎',        emoji:'🐯', cat:'poker',   tags:['熱門','撲克'],   badge:'hot',    desc:'單張比大小，龍虎對決' },
  { id:'zhajinhua',    name:'炸金花',      emoji:'💎', cat:'poker',   tags:['撲克'],          badge:'new',    desc:'三張牌炸金花' },
  { id:'mahjong',      name:'麻將',        emoji:'🀄', cat:'poker',   tags:['撲克'],          badge:'hot',    desc:'台灣麻將押注' },
  { id:'cockfight',    name:'鬥雞',        emoji:'🐓', cat:'poker',   tags:['撲克'],          badge:'',       desc:'鬥雞押注勝負' },

  // ── 特色 ────────────────────────────────────
  { id:'fruitplate',   name:'水果盤',      emoji:'🍀', cat:'special', tags:['熱門','特色'],   badge:'hot',    desc:'3x3水果轉盤' },
  { id:'wheel',        name:'幸運轉盤',    emoji:'🎡', cat:'special', tags:['特色'],          badge:'jackpot',desc:'大型幸運轉盤' },
  { id:'carnival',     name:'嘉年華',      emoji:'🎪', cat:'special', tags:['特色'],          badge:'',       desc:'嘉年華多圈轉盤' },
  { id:'crystal',      name:'水晶球',      emoji:'🔮', cat:'special', tags:['特色'],          badge:'new',    desc:'神秘水晶球占卜' },
  { id:'darts',        name:'射飛鏢',      emoji:'🎯', cat:'special', tags:['特色'],          badge:'',       desc:'射飛鏢押分數' },
  { id:'sports',       name:'競猜',        emoji:'🏀', cat:'special', tags:['特色'],          badge:'new',    desc:'猜運動比賽結果' },
]

export const CATEGORIES = [
  { key:'all',     label:'🔥 全部',     },
  { key:'slot',    label:'🎰 老虎機',   },
  { key:'table',   label:'🃏 桌遊',     },
  { key:'fish',    label:'🐠 捕魚',     },
  { key:'dice',    label:'🎲 骰子彩票', },
  { key:'arcade',  label:'🕹️ 街機',    },
  { key:'poker',   label:'♠️ 撲克',    },
  { key:'special', label:'✨ 特色',     },
]

export const THEME_COLORS = {
  slot:    'linear-gradient(135deg,#7c3aed,#4f46e5)',
  table:   'linear-gradient(135deg,#065f46,#047857)',
  fish:    'linear-gradient(135deg,#0369a1,#0284c7)',
  dice:    'linear-gradient(135deg,#92400e,#b45309)',
  arcade:  'linear-gradient(135deg,#831843,#be185d)',
  poker:   'linear-gradient(135deg,#1e1b4b,#3730a3)',
  special: 'linear-gradient(135deg,#713f12,#a16207)',
}

export function filterGames(cat) {
  if (cat === 'all') return ALL_GAMES
  return ALL_GAMES.filter(g => g.cat === cat)
}

export function gameRoute(id) {
  if (id.startsWith('slot_')) return `/game/slot/${id.replace('slot_','')}`
  return `/game/${id}`
}
