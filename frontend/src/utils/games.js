// 完整遊戲清單（40款）
export const ALL_GAMES = [
  // ── 老虎機 ──────────────────────────────────
  { id:'slot_fruit',   name:'幸運狂轉',   emoji:'🍒', cat:'slot',    tags:['熱門','老虎機'], badge:'hot',    desc:'水果機，最高50倍' },
  { id:'slot_god',     name:'財神降臨',   emoji:'🏮', cat:'slot',    tags:['熱門','老虎機'], badge:'jackpot',desc:'財神爺機，招財進寶' },
  { id:'slot_cat',     name:'招財天降',   emoji:'🐱', cat:'slot',    tags:['老虎機'],        badge:'new',    desc:'招財貓機，好運連連' },
  { id:'slot_sanguo',  name:'三國霸業',   emoji:'⚔️', cat:'slot',    tags:['老虎機'],        badge:'hot',    desc:'三國英雄機' },
  { id:'slot_dragon',  name:'龍騰九霄',   emoji:'🐉', cat:'slot',    tags:['老虎機'],        badge:'jackpot',desc:'神龍傳說機，最高100倍' },
  { id:'slot_egypt',   name:'法老密語',   emoji:'👸', cat:'slot',    tags:['老虎機'],        badge:'',       desc:'埃及豔后機' },
  { id:'slot_vegas',   name:'Vegas狂熱',  emoji:'🎰', cat:'slot',    tags:['熱門','老虎機'], badge:'hot',    desc:'Las Vegas經典機台' },
  { id:'slot_spring',  name:'鴻運爆發',   emoji:'🧧', cat:'slot',    tags:['老虎機'],        badge:'new',    desc:'過年發財機，喜氣洋洋' },
  { id:'slot_panda',   name:'熊貓秘境',   emoji:'🐼', cat:'slot',    tags:['老虎機'],        badge:'',       desc:'熊貓樂園機' },
  { id:'slot_ninja',   name:'武神傳說',   emoji:'🗡️', cat:'slot',    tags:['老虎機'],        badge:'new',    desc:'武士傳說機' },
  { id:'slot_moon',    name:'月亮傳說',   emoji:'🌙', cat:'slot',    tags:['老虎機'],        badge:'new',    desc:'神秘月夜，夢幻獎勵' },

  // ── 桌遊 ────────────────────────────────────
  { id:'baccarat',     name:'龍虎對決',   emoji:'🃏', cat:'table',   tags:['熱門','桌遊'],   badge:'hot',    desc:'百家樂，莊閒和' },
  { id:'blackjack',    name:'二十一爆破', emoji:'🂡', cat:'table',   tags:['桌遊'],          badge:'',       desc:'21點，超越莊家' },
  { id:'sett',         name:'戰神賽特',   emoji:'⚔️', cat:'table',   tags:['熱門','桌遊'],   badge:'hot',    desc:'埃及戰神老虎機，WILD+免費旋轉' },
  { id:'poker',        name:'德州稱王',   emoji:'♠️', cat:'table',   tags:['熱門','桌遊'],   badge:'hot',    desc:'德州撲克，稱霸牌局' },
  { id:'roulette',     name:'幸運女神輪', emoji:'🎡', cat:'table',   tags:['桌遊'],          badge:'',       desc:'歐式輪盤' },
  { id:'threecards',   name:'三公對決',   emoji:'🂠', cat:'table',   tags:['桌遊'],          badge:'new',    desc:'三張牌比大小' },
  { id:'paigo',        name:'牌九對碰',   emoji:'🎴', cat:'table',   tags:['桌遊'],          badge:'',       desc:'傳統牌九' },

  // ── 捕魚 ────────────────────────────────────
  { id:'fishing',      name:'深海獵殺',   emoji:'🐠', cat:'fish',    tags:['熱門','捕魚'],   badge:'hot',    desc:'捕魚機，射擊魚群' },
  { id:'fishing2',     name:'超級深海炮', emoji:'🦈', cat:'fish',    tags:['捕魚'],          badge:'new',    desc:'升級版捕魚，有BOSS魚' },

  // ── 骰子彩票 ────────────────────────────────
  { id:'dice',         name:'骰王爭霸',   emoji:'🎲', cat:'dice',    tags:['熱門','骰子'],   badge:'hot',    desc:'骰寶，押大小' },
  { id:'lightningdice',name:'閃電骰子',   emoji:'⚡', cat:'dice',    tags:['骰子'],          badge:'new',    desc:'閃電倍數，爆炸贏獎' },
  { id:'racing',       name:'極速賽車',   emoji:'🎱', cat:'dice',    tags:['彩票'],          badge:'hot',    desc:'1-10號車押注' },
  { id:'pk10',         name:'北京賽車',   emoji:'🏎️', cat:'dice',    tags:['彩票'],          badge:'',       desc:'PK10押注' },
  { id:'luckynumber',  name:'幸運數字',   emoji:'🔢', cat:'dice',    tags:['彩票'],          badge:'',       desc:'0-9猜數字' },
  { id:'lottery',      name:'超級彩球',   emoji:'🎳', cat:'dice',    tags:['彩票'],          badge:'',       desc:'樂透型押注' },
  { id:'ssc',          name:'秒速時時彩', emoji:'⏱️', cat:'dice',    tags:['彩票'],          badge:'hot',    desc:'三星/五星彩票' },

  // ── 街機 ────────────────────────────────────
  { id:'crash',        name:'一飛沖天',   emoji:'🚀', cat:'arcade',  tags:['熱門','街機'],   badge:'hot',    desc:'Crash，起飛倍數' },
  { id:'volcano',      name:'火山爆發',   emoji:'🌋', cat:'arcade',  tags:['街機'],          badge:'jackpot',desc:'累積爆炸彩金' },
  { id:'train',        name:'財富列車',   emoji:'🚂', cat:'arcade',  tags:['街機'],          badge:'',       desc:'連線贏獎' },
  { id:'arena',        name:'黃金競技場', emoji:'🏆', cat:'arcade',  tags:['街機'],          badge:'new',    desc:'多人對戰老虎機' },
  { id:'mines',        name:'地雷爆破',   emoji:'💣', cat:'arcade',  tags:['熱門','街機'],   badge:'hot',    desc:'Mines，踩地雷' },

  // ── 撲克 ────────────────────────────────────
  { id:'dragontiger',  name:'龍虎鬥',     emoji:'🃏', cat:'poker',   tags:['熱門','撲克'],   badge:'hot',    desc:'單張比大小' },
  { id:'zhajinhua',    name:'鑽石炸金花', emoji:'💎', cat:'poker',   tags:['撲克'],          badge:'new',    desc:'炸金花押注' },
  { id:'mahjong',      name:'麻將胡牌',   emoji:'🀄', cat:'poker',   tags:['撲克'],          badge:'hot',    desc:'台灣麻將押注' },
  { id:'cockfight',    name:'鬥雞爭霸',   emoji:'🐓', cat:'poker',   tags:['撲克'],          badge:'',       desc:'押注勝負' },

  // ── 特色 ────────────────────────────────────
  { id:'fruitplate',   name:'四葉轉盤',   emoji:'🍀', cat:'special', tags:['熱門','特色'],   badge:'hot',    desc:'水果盤3x3轉盤' },
  { id:'wheel',        name:'命運轉盤',   emoji:'🎤', cat:'special', tags:['特色'],          badge:'jackpot',desc:'大型轉盤LIVE風格' },
  { id:'carnival',     name:'嘉年華轉輪', emoji:'🎪', cat:'special', tags:['特色'],          badge:'',       desc:'多圈轉盤押注' },
  { id:'crystal',      name:'命運水晶球', emoji:'🔮', cat:'special', tags:['特色'],          badge:'new',    desc:'占卜押注遊戲' },
  { id:'darts',        name:'神射手',     emoji:'🎯', cat:'special', tags:['特色'],          badge:'',       desc:'射飛鏢押分數' },
  { id:'sports',       name:'冠軍猜球',   emoji:'🏀', cat:'special', tags:['特色'],          badge:'new',    desc:'猜運動比賽結果' },
]

export const CATEGORIES = [
  { key:'all',     label:'🔥 全部',     },
  { key:'hot',     label:'🔥 熱門',     },
  { key:'slot',    label:'🎰 老虎機',   },
  { key:'table',   label:'🃏 桌遊',     },
  { key:'fish',    label:'🎣 捕魚',     },
  { key:'dice',    label:'🎲 骰子彩票', },
  { key:'arcade',  label:'⚡ 街機',     },
  { key:'poker',   label:'♠️ 撲克',     },
  { key:'special', label:'🎡 特色',     },
]

export function filterGames(cat) {
  if (cat === 'all')  return ALL_GAMES
  if (cat === 'hot')  return ALL_GAMES.filter(g => g.tags.includes('熱門'))
  return ALL_GAMES.filter(g => g.cat === cat)
}

// 遊戲路由對應
export function gameRoute(id) {
  if (id.startsWith('slot_')) return `/game/slot/${id.replace('slot_','')}`
  return `/game/${id}`
}
