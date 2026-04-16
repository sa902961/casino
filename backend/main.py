# 城星娛樂城 — FastAPI 後端 v2（含 OTP 手機登入）
import os, random, math, json, string
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker, relationship

from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel

# ── 設定 ──────────────────────────────────────
DATABASE_URL  = "sqlite:///./casino.db"
SECRET_KEY    = "casino_secret_key_2024_xK9mP3nQ"
ALGORITHM     = "HS256"
TOKEN_EXPIRE  = 60 * 24          # 24 小時
OTP_EXPIRE    = 5                # 分鐘
ADMIN_USER    = "admin"
ADMIN_PASS    = "admin888"
RTP           = 0.95

engine       = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
pwd_ctx      = CryptContext(schemes=["bcrypt"], deprecated="auto")
security     = HTTPBearer(auto_error=False)

app = FastAPI(title="城星娛樂城 API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# ── 資料模型 ───────────────────────────────────
class Base(DeclarativeBase): pass

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String,  unique=True, index=True)
    password_hash = Column(String,  nullable=True)
    phone         = Column(String,  unique=True, nullable=True, index=True)
    otp_code      = Column(String,  nullable=True)
    otp_expires   = Column(DateTime, nullable=True)
    balance       = Column(Float,   default=1000.0)
    vip_level     = Column(Integer, default=0)
    is_admin      = Column(Integer, default=0)
    created_at    = Column(DateTime, default=datetime.utcnow)
    transactions    = relationship("Transaction",   back_populates="user")
    game_records    = relationship("GameRecord",    back_populates="user")
    recharge_orders = relationship("RechargeOrder", back_populates="user")

class Transaction(Base):
    __tablename__   = "transactions"
    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"))
    type           = Column(String)
    amount         = Column(Float)
    before_balance = Column(Float)
    after_balance  = Column(Float)
    created_at     = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="transactions")

class GameRecord(Base):
    __tablename__ = "game_records"
    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"))
    game_type   = Column(String)
    bet         = Column(Float)
    win         = Column(Float)
    result_data = Column(Text)
    created_at  = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="game_records")

class Announcement(Base):
    __tablename__ = "announcements"
    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String)
    content    = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class RechargeOrder(Base):
    __tablename__ = "recharge_orders"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    amount     = Column(Float)
    method     = Column(String)
    status     = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="recharge_orders")

Base.metadata.create_all(bind=engine)

# ── Pydantic Schemas ───────────────────────────
class RegisterReq(BaseModel):
    username: str
    password: str

class LoginReq(BaseModel):
    username: str
    password: str

class SendOtpReq(BaseModel):
    phone: str

class VerifyOtpReq(BaseModel):
    phone: str
    otp:   str

class BetReq(BaseModel):
    bet:   float
    extra: Optional[dict] = None

class RechargeReq(BaseModel):
    amount: float
    method: str

class WithdrawReq(BaseModel):
    amount: float

class AnnouncementCreate(BaseModel):
    title:   str
    content: str

# ── 工具函式 ───────────────────────────────────
def get_db():
    db = SessionLocal()
    try:    yield db
    finally: db.close()

def hash_pw(pw):   return pwd_ctx.hash(pw)
def verify_pw(p,h): return pwd_ctx.verify(p, h)

def make_token(data: dict) -> str:
    d = data.copy()
    d["exp"] = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE)
    return jwt.encode(d, SECRET_KEY, algorithm=ALGORITHM)

def get_user(
    cred: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db:   Session = Depends(get_db)
) -> User:
    if not cred:
        raise HTTPException(401, "未授權")
    try:
        payload  = jwt.decode(cred.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
    except JWTError:
        raise HTTPException(401, "Token 無效")
    u = db.query(User).filter(User.username == username).first()
    if not u: raise HTTPException(401, "用戶不存在")
    return u

def require_admin(u: User = Depends(get_user)) -> User:
    if not u.is_admin: raise HTTPException(403, "需要管理員權限")
    return u

def record_tx(db, user, type_, amount, before, after):
    db.add(Transaction(user_id=user.id, type=type_,
                       amount=amount, before_balance=before, after_balance=after))

def update_vip(user: User):
    b = user.balance
    if   b >= 100000: user.vip_level = 10
    elif b >= 50000:  user.vip_level = 8
    elif b >= 20000:  user.vip_level = 6
    elif b >= 10000:  user.vip_level = 5
    elif b >= 5000:   user.vip_level = 4
    elif b >= 2000:   user.vip_level = 3
    elif b >= 1000:   user.vip_level = 2
    elif b >= 500:    user.vip_level = 1
    else:             user.vip_level = 0

def gen_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

def phone_to_username(phone: str) -> str:
    return f"p_{phone[-4:]}"   # 用末四碼做預設用戶名

# ── 初始化資料 ────────────────────────────────
def init_data():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == ADMIN_USER).first():
            db.add(User(username=ADMIN_USER, password_hash=hash_pw(ADMIN_PASS),
                        balance=999999.0, vip_level=10, is_admin=1))
        if db.query(Announcement).count() == 0:
            db.add_all([
                Announcement(title="🎉 城星娛樂城盛大開業！",      content="新會員註冊即送 1000 遊戲幣！"),
                Announcement(title="💰 每日簽到活動",             content="每日登入即可領取簽到獎勵，連續簽到獎勵更豐厚！"),
                Announcement(title="🎰 40款遊戲全新上線",         content="老虎機、桌遊、捕魚、彩票… 應有盡有！"),
                Announcement(title="🏆 VIP 會員專屬優惠",         content="VIP會員享有專屬存款紅利、生日禮金！"),
                Announcement(title="📱 手機驗證碼登入上線",        content="支援手機號碼快速登入，安全又方便！"),
            ])
        db.commit()
    finally:
        db.close()

init_data()

# ════════════════════════════════════════════════
# 認證端點
# ════════════════════════════════════════════════

@app.post("/register")
def register(req: RegisterReq, db: Session = Depends(get_db)):
    if len(req.username) < 3 or len(req.username) > 20:
        raise HTTPException(400, "用戶名長度須在 3-20 字元")
    if len(req.password) < 6:
        raise HTTPException(400, "密碼至少 6 字元")
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(400, "用戶名已存在")
    u = User(username=req.username, password_hash=hash_pw(req.password), balance=1000.0)
    db.add(u); db.commit(); db.refresh(u)
    return {"token": make_token({"sub": u.username}),
            "username": u.username, "balance": u.balance, "vip_level": 0}

@app.post("/login")
def login(req: LoginReq, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.username == req.username).first()
    if not u or not u.password_hash or not verify_pw(req.password, u.password_hash):
        raise HTTPException(401, "帳號或密碼錯誤")
    return {"token": make_token({"sub": u.username}),
            "username": u.username, "balance": u.balance,
            "vip_level": u.vip_level, "is_admin": u.is_admin}

# ── OTP 端點 ───────────────────────────────────
@app.post("/auth/send-otp")
def send_otp(req: SendOtpReq, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    if not (phone.startswith("09") and len(phone) == 10 and phone.isdigit()):
        raise HTTPException(400, "請輸入正確的台灣手機號碼（09xxxxxxxx）")
    code    = gen_otp()
    expires = datetime.utcnow() + timedelta(minutes=OTP_EXPIRE)
    u = db.query(User).filter(User.phone == phone).first()
    if not u:
        # 自動建立帳號
        base = phone_to_username(phone)
        uname = base
        cnt = 1
        while db.query(User).filter(User.username == uname).first():
            uname = f"{base}_{cnt}"; cnt += 1
        u = User(username=uname, phone=phone, balance=1000.0)
        db.add(u)
    u.otp_code    = code
    u.otp_expires = expires
    db.commit()
    # 實際環境應發 SMS；這裡只存 DB，管理員後台可查看
    return {"message": f"驗證碼已發送至 {phone[:4]}****{phone[-3:]}",
            "expires_in": OTP_EXPIRE * 60}

@app.post("/auth/verify-otp")
def verify_otp(req: VerifyOtpReq, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    u = db.query(User).filter(User.phone == phone).first()
    if not u or not u.otp_code:
        raise HTTPException(400, "尚未發送驗證碼")
    if datetime.utcnow() > u.otp_expires:
        raise HTTPException(400, "驗證碼已過期，請重新發送")
    if u.otp_code != req.otp.strip():
        raise HTTPException(400, "驗證碼錯誤")
    u.otp_code = None; u.otp_expires = None
    db.commit()
    return {"token":     make_token({"sub": u.username}),
            "username":  u.username,
            "balance":   u.balance,
            "vip_level": u.vip_level,
            "is_admin":  u.is_admin,
            "is_new":    False}

# ════════════════════════════════════════════════
# 用戶端點
# ════════════════════════════════════════════════

@app.get("/me")
def get_me(u: User = Depends(get_user)):
    return {"id": u.id, "username": u.username, "phone": u.phone,
            "balance": u.balance, "vip_level": u.vip_level,
            "created_at": u.created_at.isoformat(), "is_admin": u.is_admin}

@app.get("/balance")
def get_balance(u: User = Depends(get_user)):
    return {"balance": u.balance, "vip_level": u.vip_level}

# ── 每日簽到 ───────────────────────────────────
@app.post("/daily-checkin")
def daily_checkin(u: User = Depends(get_user), db: Session = Depends(get_db)):
    today = datetime.utcnow().date().isoformat()
    last  = db.query(Transaction).filter(
        Transaction.user_id == u.id,
        Transaction.type    == f"checkin_{today}"
    ).first()
    if last: raise HTTPException(400, "今日已簽到")
    reward = 50 + (u.vip_level * 20)
    before = u.balance
    u.balance = round(u.balance + reward, 2)
    record_tx(db, u, f"checkin_{today}", reward, before, u.balance)
    update_vip(u); db.commit()
    return {"reward": reward, "balance": u.balance, "message": f"簽到成功！獲得 {reward} 遊戲幣"}

# ════════════════════════════════════════════════
# 遊戲端點（所有遊戲共用下注前置檢查）
# ════════════════════════════════════════════════

def deduct_bet(user: User, db: Session, bet: float):
    if bet <= 0 or bet > user.balance:
        raise HTTPException(400, "下注金額無效")

def settle(user: User, db: Session, bet: float, win: float,
           game_type: str, result: dict):
    before = user.balance
    user.balance = round(user.balance - bet + win, 2)
    record_tx(db, user, "bet",  -bet,  before,           user.balance)
    if win > 0:
        record_tx(db, user, "win",  win, user.balance - win, user.balance)
    db.add(GameRecord(user_id=user.id, game_type=game_type,
                      bet=bet, win=win,
                      result_data=json.dumps(result, ensure_ascii=False)))
    update_vip(user); db.commit()

# ── 老虎機 ─────────────────────────────────────
THEMES = {
    "fruit":  ["🍒","🍋","🍊","🍇","🍉","⭐","7️⃣"],
    "god":    ["🐉","💎","🪙","🎴","🎋","🧧","💰"],
    "cat":    ["🐱","🎏","🌸","🎐","🌊","🍀","👛"],
    "sanguo": ["⚔️","🛡️","🏹","👑","🔥","🌟","💥"],
    "dragon": ["🐉","🔱","💎","🌊","⚡","🔥","🌙"],
    "egypt":  ["👸","🦅","🐍","🏺","📜","💎","⚡"],
    "vegas":  ["💎","🃏","🎰","🍸","💰","⭐","🎲"],
    "spring": ["🧧","🎆","🏮","🌸","💴","🎊","🍊"],
    "panda":  ["🐼","🎋","🌸","🍃","🦋","⭐","💚"],
    "ninja":  ["🗡️","⚔️","🥷","🌙","💫","🔥","🎯"],
    "moon":   ["🌙","⭐","🔮","💫","🌟","🌌","✨"],
}

@app.post("/game/slot")
def game_slot(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    theme   = (req.extra or {}).get("theme", "fruit")
    symbols = THEMES.get(theme, THEMES["fruit"])
    reels   = [[random.choice(symbols) for _ in range(3)] for _ in range(3)]
    mid     = [reels[r][1] for r in range(3)]
    mult    = 0.0
    if   mid[0]==mid[1]==mid[2]:
        idx  = symbols.index(mid[0]) if mid[0] in symbols else 0
        mult = [0,2,3,5,8,12,20,50][min(idx,7)]
    elif mid[0]==mid[1] or mid[1]==mid[2]: mult = 1.5
    win = round(req.bet * mult, 2) if mult > 0 and random.random() < RTP else 0.0
    r = {"reels": reels, "middle": mid, "multiplier": mult, "win": win, "theme": theme}
    settle(u, db, req.bet, win, "slot", r)
    return {**r, "balance": u.balance}

# ── 水果盤（3x3 轉盤，特殊規則）──────────────
@app.post("/game/fruitplate")
def game_fruitplate(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    syms  = ["🍒","🍋","🍊","🍇","🍉","⭐","🔔","💎"]
    grid  = [random.choice(syms) for _ in range(9)]
    from collections import Counter
    cnt   = Counter(grid)
    best  = cnt.most_common(1)[0]
    mults = {3:2, 4:5, 5:10, 6:20, 7:50, 8:100, 9:500}
    mult  = mults.get(best[1], 0)
    win   = round(req.bet * mult, 2) if mult > 0 and random.random() < RTP else 0.0
    r = {"grid": grid, "best_symbol": best[0], "count": best[1], "multiplier": mult, "win": win}
    settle(u, db, req.bet, win, "fruitplate", r)
    return {**r, "balance": u.balance}

# ── 骰子（骰寶）──────────────────────────────
@app.post("/game/dice")
def game_dice(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    extra    = req.extra or {}
    bet_type = extra.get("bet_type", "big")
    dice     = [random.randint(1,6) for _ in range(3)]
    total    = sum(dice)
    is_win   = False
    if   bet_type=="big"    and total>=11:                                 is_win=True
    elif bet_type=="small"  and total<=10:                                 is_win=True
    elif bet_type=="number" and total==int(extra.get("number",7)):         is_win=True
    elif bet_type=="triple" and dice[0]==dice[1]==dice[2]:                 is_win=True
    mult = {"big":1.0,"small":1.0,"number":5.0,"triple":30.0}.get(bet_type,1.0)
    win  = round(req.bet*mult,2) if is_win and random.random()<RTP else 0.0
    r = {"dice": dice, "total": total, "bet_type": bet_type, "win": win}
    settle(u, db, req.bet, win, "dice", r)
    return {**r, "balance": u.balance}

# ── Crash（一飛沖天）─────────────────────────
@app.post("/game/crash")
def game_crash(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    cash_out    = float((req.extra or {}).get("cash_out", 2.0))
    rv          = random.random()
    crash_point = round(max(1.0, 1/(1-rv*0.96)), 2) if rv < 0.99 else round(random.uniform(1.0, 200.0), 2)
    win = round(req.bet*cash_out,2) if cash_out<=crash_point and random.random()<RTP else 0.0
    r = {"crash_point": crash_point, "cash_out": cash_out, "win": win}
    settle(u, db, req.bet, win, "crash", r)
    return {**r, "balance": u.balance}

# ── 百家樂 ────────────────────────────────────
CARD_VALS = {"A":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":0,"J":0,"Q":0,"K":0}
CARD_FACES= list(CARD_VALS.keys())

def bac_hand():
    cards = [(random.choice(CARD_FACES), random.choice(["♠","♥","♦","♣"])) for _ in range(2)]
    score = sum(CARD_VALS[c[0]] for c in cards) % 10
    return cards, score

@app.post("/game/baccarat")
def game_baccarat(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    side = (req.extra or {}).get("side","player")
    ph,ps = bac_hand(); bh,bs = bac_hand()
    winner = "player" if ps>bs else ("banker" if bs>ps else "tie")
    mults  = {"player":2.0,"banker":1.95,"tie":8.0}
    win    = round(req.bet*mults[side],2) if winner==side and random.random()<RTP else 0.0
    r = {"player_hand":ph,"player_score":ps,"banker_hand":bh,"banker_score":bs,
         "winner":winner,"side":side,"win":win}
    settle(u, db, req.bet, win, "baccarat", r)
    return {**r, "balance": u.balance}

# ── 輪盤 ──────────────────────────────────────
RED_NUMS = {1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36}

@app.post("/game/roulette")
def game_roulette(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    extra    = req.extra or {}
    bet_type = extra.get("bet_type","red")
    spin     = random.randint(0,36)
    is_red   = spin in RED_NUMS
    is_black = spin!=0 and not is_red
    is_win   = False; mult=1.0
    if   bet_type=="red"    and is_red:                                    is_win=True; mult=2.0
    elif bet_type=="black"  and is_black:                                  is_win=True; mult=2.0
    elif bet_type=="green"  and spin==0:                                   is_win=True; mult=14.0
    elif bet_type=="number" and spin==int(extra.get("number",7)):          is_win=True; mult=36.0
    elif bet_type=="even"   and spin>0 and spin%2==0:                     is_win=True; mult=2.0
    elif bet_type=="odd"    and spin%2==1:                                 is_win=True; mult=2.0
    color = "red" if is_red else ("black" if is_black else "green")
    win   = round(req.bet*mult,2) if is_win and random.random()<RTP else 0.0
    r = {"spin":spin,"color":color,"bet_type":bet_type,"win":win}
    settle(u, db, req.bet, win, "roulette", r)
    return {**r, "balance": u.balance}

# ── 21 點（賽特）─────────────────────────────
def bj_val(cards):
    total = 0; aces = 0
    for c,_ in cards:
        v = CARD_VALS[c]
        if c=="A": aces+=1; total+=11
        else:      total+=v
    while total>21 and aces: total-=10; aces-=1
    return total

@app.post("/game/blackjack")
def game_blackjack(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    deck   = [(f,s) for f in CARD_FACES for s in ["♠","♥","♦","♣"]] * 2
    random.shuffle(deck)
    player = [deck.pop(), deck.pop()]
    dealer = [deck.pop(), deck.pop()]
    # 玩家策略：<17 繼續叫牌
    while bj_val(player) < 17: player.append(deck.pop())
    while bj_val(dealer)  < 17: dealer.append(deck.pop())
    pv, dv = bj_val(player), bj_val(dealer)
    bust_p = pv>21; bust_d = dv>21
    if bust_p:                      result="lose"
    elif bust_d:                    result="win"
    elif pv>dv:                     result="win"
    elif pv==dv:                    result="draw"
    else:                           result="lose"
    mult = 2.0 if result=="win" else (1.0 if result=="draw" else 0.0)
    win  = round(req.bet*mult,2) if result!="lose" and random.random()<(RTP if result=="win" else 1.0) else 0.0
    r = {"player":player,"dealer":dealer,"player_val":pv,"dealer_val":dv,"result":result,"win":win}
    settle(u, db, req.bet, win, "blackjack", r)
    return {**r, "balance": u.balance}

# ── 德州撲克（簡化版：玩家 vs 莊家） ─────────
RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"]
def rank_idx(c): return RANKS.index(c[0]) if c[0] in RANKS else 0

@app.post("/game/poker")
def game_poker(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    deck = [(f,s) for f in CARD_FACES for s in ["♠","♥","♦","♣"]]
    random.shuffle(deck)
    player = deck[:2]; dealer_hand = deck[2:4]; community = deck[4:9]
    # 簡化比較：各取最高兩張
    def best(h): return sorted([rank_idx(c) for c in h+community], reverse=True)[:2]
    pb, db2 = best(player), best(dealer_hand)
    result = "win" if pb>db2 else ("draw" if pb==db2 else "lose")
    mult   = 2.0 if result=="win" else (1.0 if result=="draw" else 0.0)
    win    = round(req.bet*mult,2) if result!="lose" and random.random()<RTP else 0.0
    r = {"player":player,"dealer":dealer_hand,"community":community,"result":result,"win":win}
    settle(u, db, req.bet, win, "poker", r)
    return {**r, "balance": u.balance}

# ── 捕魚機 ────────────────────────────────────
FISH = [
    {"name":"小魚","emoji":"🐟","odds":2},
    {"name":"章魚","emoji":"🐙","odds":5},
    {"name":"螃蟹","emoji":"🦀","odds":8},
    {"name":"龍蝦","emoji":"🦞","odds":12},
    {"name":"海龜","emoji":"🐢","odds":20},
    {"name":"鯊魚","emoji":"🦈","odds":35},
    {"name":"海豚","emoji":"🐬","odds":50},
    {"name":"BOSS鯨魚","emoji":"🐳","odds":200},
]

@app.post("/game/fishing")
def game_fishing(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    target_idx = int((req.extra or {}).get("target", 0))
    target_idx = max(0, min(target_idx, len(FISH)-1))
    fish     = FISH[target_idx]
    # 越大的魚越難打中
    catch_rate = RTP / (fish["odds"] / 2)
    caught   = random.random() < catch_rate
    win      = round(req.bet * fish["odds"], 2) if caught else 0.0
    # 顯示場景裡的魚群
    scene    = [random.choice(FISH[:5]) for _ in range(8)]
    r = {"fish": fish, "caught": caught, "scene": scene, "win": win}
    settle(u, db, req.bet, win, "fishing", r)
    return {**r, "balance": u.balance}

# ── 超級深海炮（加強版捕魚） ──────────────────
@app.post("/game/fishing2")
def game_fishing2(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    shots = int((req.extra or {}).get("shots", 3))
    shots = max(1, min(shots, 5))
    total_bet = req.bet * shots
    if total_bet > u.balance + req.bet:
        raise HTTPException(400, "餘額不足")
    results = []
    total_win = 0.0
    for _ in range(shots):
        fish = random.choices(FISH, weights=[1/f["odds"] for f in FISH], k=1)[0]
        caught = random.random() < (RTP / (fish["odds"]/2))
        w = round(req.bet * fish["odds"], 2) if caught else 0.0
        total_win += w
        results.append({"fish": fish, "caught": caught, "win": w})
    r = {"shots": results, "total_win": total_win}
    settle(u, db, req.bet * shots, total_win, "fishing2", r)
    return {**r, "balance": u.balance}

# ── 地雷爆破（Mines）─────────────────────────
@app.post("/game/mines")
def game_mines(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    extra     = req.extra or {}
    mines_cnt = int(extra.get("mines", 3))
    reveal    = int(extra.get("reveal", 1))
    grid_size = 25
    mines_cnt = max(1, min(mines_cnt, 24))
    safe_cnt  = grid_size - mines_cnt
    # 多揭開幾格，倍率遞增
    mult  = round((grid_size / safe_cnt) ** reveal * RTP, 2)
    hit   = random.random() < (mines_cnt / grid_size) * reveal
    win   = 0.0 if hit else round(req.bet * mult, 2)
    positions = random.sample(range(grid_size), mines_cnt)
    r = {"mines": positions, "reveal": reveal, "multiplier": mult, "hit": hit, "win": win}
    settle(u, db, req.bet, win, "mines", r)
    return {**r, "balance": u.balance}

# ── 龍虎鬥 ───────────────────────────────────
@app.post("/game/dragontiger")
def game_dragontiget(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    side  = (req.extra or {}).get("side","dragon")
    dragon= random.choice(CARD_FACES)
    tiger = random.choice(CARD_FACES)
    dv    = CARD_VALS[dragon]; tv = CARD_VALS[tiger]
    winner= "dragon" if dv>tv else ("tiger" if tv>dv else "tie")
    mults = {"dragon":2.0,"tiger":2.0,"tie":8.0}
    win   = round(req.bet*mults[side],2) if winner==side and random.random()<RTP else 0.0
    r = {"dragon":dragon,"tiger":tiger,"dragon_val":dv,"tiger_val":tv,"winner":winner,"side":side,"win":win}
    settle(u, db, req.bet, win, "dragontiget", r)
    return {**r, "balance": u.balance}

# ── 麻將胡牌（押注版）────────────────────────
MAHJONG_TILES = ["🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏",
                  "🀙","🀚","🀛","🀜","🀝","🀞","🀟","🀠","🀡",
                  "🀀","🀁","🀂","🀃","🀄","🀅","🀆"]

@app.post("/game/mahjong")
def game_mahjong(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    # 簡化：抽13張牌，隨機判斷胡牌
    hand = [random.choice(MAHJONG_TILES) for _ in range(13)]
    from collections import Counter
    cnt  = Counter(hand)
    pairs = sum(1 for v in cnt.values() if v>=2)
    trios = sum(1 for v in cnt.values() if v>=3)
    # 胡牌條件簡化
    if trios>=3 and pairs>=1:   result="自摸"; mult=10.0
    elif trios>=2 and pairs>=2: result="胡牌"; mult=4.0
    elif trios>=1 and pairs>=3: result="小胡"; mult=2.0
    else:                       result="未胡"; mult=0.0
    win = round(req.bet*mult,2) if mult>0 and random.random()<RTP else 0.0
    r = {"hand": hand, "result": result, "multiplier": mult, "win": win}
    settle(u, db, req.bet, win, "mahjong", r)
    return {**r, "balance": u.balance}

# ── 冠軍猜球 ──────────────────────────────────
SPORTS = [
    {"home":"🦁 獅子隊","away":"🐯 老虎隊"},
    {"home":"🦅 老鷹隊","away":"🐺 狼隊"},
    {"home":"🔥 火焰隊","away":"💧 冰川隊"},
]

@app.post("/game/sports")
def game_sports(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    side  = (req.extra or {}).get("side","home")
    match = random.choice(SPORTS)
    winner= random.choice(["home","away","draw"])
    mults = {"home":2.0,"away":2.5,"draw":3.5}
    win   = round(req.bet*mults[side],2) if winner==side and random.random()<RTP else 0.0
    r = {**match, "winner": winner, "side": side, "win": win}
    settle(u, db, req.bet, win, "sports", r)
    return {**r, "balance": u.balance}

# ── 神射手（射飛鏢）─────────────────────────
@app.post("/game/darts")
def game_darts(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    target = int((req.extra or {}).get("target", 20))
    target = max(1, min(target, 20))
    hit    = random.randint(1, 20)
    diff   = abs(hit - target)
    if   diff==0: mult=15.0
    elif diff<=2: mult=3.0
    elif diff<=5: mult=1.5
    else:         mult=0.0
    win = round(req.bet*mult,2) if mult>0 and random.random()<RTP else 0.0
    r = {"target": target, "hit": hit, "diff": diff, "multiplier": mult, "win": win}
    settle(u, db, req.bet, win, "darts", r)
    return {**r, "balance": u.balance}

# ── 鬥雞爭霸 ──────────────────────────────────
@app.post("/game/cockfight")
def game_cockfight(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    side   = (req.extra or {}).get("side","red")
    winner = random.choice(["red","blue","draw"])
    mults  = {"red":2.0,"blue":2.0,"draw":6.0}
    win    = round(req.bet*mults[side],2) if winner==side and random.random()<RTP else 0.0
    r = {"winner": winner, "side": side, "win": win,
         "red_power": random.randint(60,100), "blue_power": random.randint(60,100)}
    settle(u, db, req.bet, win, "cockfight", r)
    return {**r, "balance": u.balance}

# ── 命運水晶球 ────────────────────────────────
FORTUNES = ["大吉大利","財源滾滾","好運連連","吉星高照","鴻運當頭",
            "小試牛刀","平淡無奇","雲淡風輕","靜待時機","再接再厲"]

@app.post("/game/crystal")
def game_crystal(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    choice  = int((req.extra or {}).get("choice", 0)) % len(FORTUNES)
    reveal  = random.randint(0, len(FORTUNES)-1)
    mult    = [0,0,0,0,0,2,4,8,16,50][reveal]
    win     = round(req.bet*mult,2) if reveal==choice and random.random()<RTP else 0.0
    r = {"choice": choice, "reveal": reveal,
         "fortune": FORTUNES[reveal], "multiplier": mult, "win": win}
    settle(u, db, req.bet, win, "crystal", r)
    return {**r, "balance": u.balance}

# ── 極速賽車 ──────────────────────────────────
@app.post("/game/racing")
def game_racing(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    pick   = int((req.extra or {}).get("car", 1))
    pick   = max(1, min(pick, 10))
    winner = random.randint(1, 10)
    ranks  = random.sample(range(1,11), 10)
    mult   = 9.0 if winner==pick else 0.0
    win    = round(req.bet*mult,2) if winner==pick and random.random()<RTP else 0.0
    r = {"pick": pick, "winner": winner, "ranks": ranks, "win": win}
    settle(u, db, req.bet, win, "racing", r)
    return {**r, "balance": u.balance}

# ── 幸運數字 ──────────────────────────────────
@app.post("/game/luckynumber")
def game_luckynumber(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    pick   = int((req.extra or {}).get("number", 5)) % 10
    reveal = random.randint(0, 9)
    mult   = 8.5 if pick==reveal else 0.0
    win    = round(req.bet*mult,2) if pick==reveal and random.random()<RTP else 0.0
    r = {"pick": pick, "reveal": reveal, "win": win}
    settle(u, db, req.bet, win, "luckynumber", r)
    return {**r, "balance": u.balance}

# ── 超級彩球 ──────────────────────────────────
@app.post("/game/lottery")
def game_lottery(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    picks  = list(set(int(n)%50+1 for n in (req.extra or {}).get("picks","1,2,3,4,5,6").split(",")[:6]))
    draws  = sorted(random.sample(range(1,50), 6))
    hits   = len(set(picks) & set(draws))
    mults  = {0:0,1:0,2:0,3:5,4:50,5:500,6:10000}
    mult   = mults.get(hits,0)
    win    = round(req.bet*mult,2) if mult>0 and random.random()<RTP else 0.0
    r = {"picks": picks, "draws": draws, "hits": hits, "multiplier": mult, "win": win}
    settle(u, db, req.bet, win, "lottery", r)
    return {**r, "balance": u.balance}

# ── 秒速時時彩 ────────────────────────────────
@app.post("/game/ssc")
def game_ssc(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    extra   = req.extra or {}
    mode    = extra.get("mode","3star")  # 3star/5star/big/small
    numbers = [random.randint(0,9) for _ in range(5)]
    total   = sum(numbers)
    if   mode=="big"   and total>=23:                           mult=1.9; is_win=True
    elif mode=="small" and total<=22:                           mult=1.9; is_win=True
    elif mode=="3star":
        pick = str(extra.get("pick","000"))
        code = ''.join(str(n) for n in numbers[2:])
        is_win = code==pick; mult=900.0
    elif mode=="5star":
        pick = str(extra.get("pick","00000"))
        code = ''.join(str(n) for n in numbers)
        is_win = code==pick; mult=90000.0
    else:               is_win=False; mult=0.0
    win = round(req.bet*mult,2) if is_win and random.random()<RTP else 0.0
    r = {"numbers": numbers, "total": total, "mode": mode, "win": win}
    settle(u, db, req.bet, win, "ssc", r)
    return {**r, "balance": u.balance}

# ── 財富列車 ──────────────────────────────────
@app.post("/game/train")
def game_train(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    stops  = [random.choice(["💰","⭐","🎁","💎","🔥","❌"]) for _ in range(5)]
    chains = 0
    for s in stops:
        if s in ("💰","⭐","🎁","💎","🔥"): chains+=1
        else: break
    mults  = {0:0,1:0,2:1.5,3:3,4:8,5:25}
    mult   = mults.get(chains,0)
    win    = round(req.bet*mult,2) if mult>0 and random.random()<RTP else 0.0
    r = {"stops": stops, "chains": chains, "multiplier": mult, "win": win}
    settle(u, db, req.bet, win, "train", r)
    return {**r, "balance": u.balance}

# ── 火山爆發（累積彩金）──────────────────────
@app.post("/game/volcano")
def game_volcano(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    heat    = random.randint(1,100)
    explode = heat >= 95
    if   explode:  mult=100.0
    elif heat>=80: mult=5.0
    elif heat>=60: mult=2.0
    elif heat>=40: mult=1.0
    else:          mult=0.0
    win = round(req.bet*mult,2) if mult>0 and random.random()<RTP else 0.0
    r = {"heat": heat, "explode": explode, "multiplier": mult, "win": win}
    settle(u, db, req.bet, win, "volcano", r)
    return {**r, "balance": u.balance}

# ── 三公對決 ──────────────────────────────────
@app.post("/game/threecards")
def game_threecards(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    side    = (req.extra or {}).get("side","player")
    p_cards = [random.choice(CARD_FACES) for _ in range(3)]
    b_cards = [random.choice(CARD_FACES) for _ in range(3)]
    p_val   = sum(CARD_VALS[c] for c in p_cards) % 10
    b_val   = sum(CARD_VALS[c] for c in b_cards) % 10
    # 三公特殊：三張 JQK 為三公（最大）
    def is_gong(h): return all(CARD_VALS[c]==0 for c in h)
    p_gong  = is_gong(p_cards); b_gong = is_gong(b_cards)
    if p_gong and b_gong:   winner="tie"
    elif p_gong:            winner="player"
    elif b_gong:            winner="banker"
    elif p_val>b_val:       winner="player"
    elif b_val>p_val:       winner="banker"
    else:                   winner="tie"
    mults = {"player":2.0,"banker":1.95,"tie":8.0}
    win   = round(req.bet*mults[side],2) if winner==side and random.random()<RTP else 0.0
    r = {"player_cards":p_cards,"banker_cards":b_cards,
         "player_val":p_val,"banker_val":b_val,
         "winner":winner,"side":side,"win":win}
    settle(u, db, req.bet, win, "threecards", r)
    return {**r, "balance": u.balance}

# ── 牌九對碰 ──────────────────────────────────
@app.post("/game/paigo")
def game_paigo(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    side    = (req.extra or {}).get("side","player")
    p_score = random.randint(0,9)
    b_score = random.randint(0,9)
    winner  = "player" if p_score>b_score else ("banker" if b_score>p_score else "tie")
    mults   = {"player":1.95,"banker":1.95,"tie":8.0}
    win     = round(req.bet*mults[side],2) if winner==side and random.random()<RTP else 0.0
    r = {"player_score":p_score,"banker_score":b_score,"winner":winner,"side":side,"win":win}
    settle(u, db, req.bet, win, "paigo", r)
    return {**r, "balance": u.balance}

# ── 鑽石炸金花 ────────────────────────────────
@app.post("/game/zhajinhua")
def game_zhajinhua(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    def deal3():
        return [random.choice(CARD_FACES) for _ in range(3)]
    player=deal3(); dealer=deal3()
    def score3(h):
        vals = sorted([CARD_VALS[c] if CARD_VALS[c]>0 else 10 for c in h], reverse=True)
        flush= len(set([random.choice(["♠","♥","♦","♣"]) for _ in range(3)]))==1
        straight= (vals[0]-vals[2]==2 and vals[0]-vals[1]==1)
        triple  = len(set(h))==1
        if triple:              return (5, vals)
        if flush and straight:  return (4, vals)
        if flush:               return (3, vals)
        if straight:            return (2, vals)
        if len(set(h))==2:      return (1, vals)
        return (0, vals)
    ps,ds = score3(player), score3(dealer)
    winner= "player" if ps>ds else ("dealer" if ds>ps else "tie")
    win   = round(req.bet*2.0,2) if winner=="player" and random.random()<RTP else 0.0
    r = {"player":player,"dealer":dealer,"winner":winner,"win":win}
    settle(u, db, req.bet, win, "zhajinhua", r)
    return {**r, "balance": u.balance}

# ── 命運轉盤 ──────────────────────────────────
WHEEL_PRIZES = [
    {"label":"x0","mult":0,"weight":30},
    {"label":"x1","mult":1,"weight":25},
    {"label":"x2","mult":2,"weight":20},
    {"label":"x3","mult":3,"weight":12},
    {"label":"x5","mult":5,"weight":7},
    {"label":"x10","mult":10,"weight":4},
    {"label":"x20","mult":20,"weight":1.5},
    {"label":"JACKPOT x50","mult":50,"weight":0.5},
]

@app.post("/game/wheel")
def game_wheel(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    weights  = [p["weight"] for p in WHEEL_PRIZES]
    prize    = random.choices(WHEEL_PRIZES, weights=weights, k=1)[0]
    segment  = WHEEL_PRIZES.index(prize)
    win      = round(req.bet*prize["mult"],2) if prize["mult"]>0 and random.random()<RTP else 0.0
    r = {"prize": prize, "segment": segment, "win": win}
    settle(u, db, req.bet, win, "wheel", r)
    return {**r, "balance": u.balance}

# ── 嘉年華轉輪 ────────────────────────────────
@app.post("/game/carnival")
def game_carnival(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    outer = random.choice(["💰","⭐","🎁","❌","💎","🔥"])
    inner = random.choice(["x1","x2","x3","x5","x0","x0"])
    mult  = int(inner[1:]) if outer!="❌" else 0
    win   = round(req.bet*mult,2) if mult>0 and random.random()<RTP else 0.0
    r = {"outer": outer, "inner": inner, "multiplier": mult, "win": win}
    settle(u, db, req.bet, win, "carnival", r)
    return {**r, "balance": u.balance}

# ── 閃電骰子 ──────────────────────────────────
@app.post("/game/lightningdice")
def game_lightningdice(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    extra     = req.extra or {}
    bet_total = int(extra.get("bet_total", 10))
    dice      = [random.randint(1,6) for _ in range(3)]
    total     = sum(dice)
    # 閃電數字（隨機1-2個增倍）
    lightning = {random.randint(4,17): random.choice([2,3,4,5])}
    base_mult = 1.0 if total>=11 else (1.0 if total<=10 else 0.0)
    is_win_   = (total>=11 and extra.get("side","big")=="big") or \
                (total<=10 and extra.get("side","big")=="small")
    lightning_mult = lightning.get(total, 1)
    mult = base_mult * lightning_mult if is_win_ else 0.0
    win  = round(req.bet*mult,2) if mult>0 and random.random()<RTP else 0.0
    r = {"dice":dice,"total":total,"lightning":lightning,"multiplier":mult,"win":win}
    settle(u, db, req.bet, win, "lightningdice", r)
    return {**r, "balance": u.balance}

# ── 北京賽車（PK10）──────────────────────────
@app.post("/game/pk10")
def game_pk10(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    pick   = int((req.extra or {}).get("car", 1))
    pick   = max(1, min(pick, 10))
    ranks  = random.sample(range(1,11), 10)
    winner = ranks[0]
    mult   = 9.0 if winner==pick else 0.0
    win    = round(req.bet*mult,2) if winner==pick and random.random()<RTP else 0.0
    r = {"pick": pick, "ranks": ranks, "winner": winner, "win": win}
    settle(u, db, req.bet, win, "pk10", r)
    return {**r, "balance": u.balance}

# ── 黃金競技場 ────────────────────────────────
@app.post("/game/arena")
def game_arena(req: BetReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    deduct_bet(u, db, req.bet)
    players  = [{"id":i+1,"power":random.randint(50,100)} for i in range(4)]
    champion = max(players, key=lambda p:p["power"])
    pick     = int((req.extra or {}).get("pick", 1))
    mult     = 3.5 if champion["id"]==pick else 0.0
    win      = round(req.bet*mult,2) if champion["id"]==pick and random.random()<RTP else 0.0
    r = {"players": players, "champion": champion, "pick": pick, "win": win}
    settle(u, db, req.bet, win, "arena", r)
    return {**r, "balance": u.balance}

# ════════════════════════════════════════════════
# 其他端點
# ════════════════════════════════════════════════

@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_admin==0).order_by(User.balance.desc()).limit(20).all()
    return [{"rank":i+1,"username":u.username,"balance":u.balance,"vip_level":u.vip_level}
            for i,u in enumerate(users)]

@app.post("/recharge")
def recharge(req: RechargeReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    if req.amount<=0: raise HTTPException(400,"儲值金額無效")
    o = RechargeOrder(user_id=u.id, amount=req.amount, method=req.method)
    db.add(o); db.commit(); db.refresh(o)
    return {"order_id":o.id,"amount":req.amount,"method":req.method,"status":"pending","message":"儲值申請已送出，等待審核"}

@app.post("/withdraw")
def withdraw(req: WithdrawReq, u: User = Depends(get_user), db: Session = Depends(get_db)):
    if req.amount<=0 or req.amount>u.balance: raise HTTPException(400,"提款金額無效")
    before = u.balance; u.balance = round(u.balance-req.amount,2)
    record_tx(db, u, "withdraw", -req.amount, before, u.balance)
    db.commit()
    return {"message":"提款申請已送出","amount":req.amount,"balance":u.balance}

@app.get("/transactions")
def get_txs(u: User = Depends(get_user), db: Session = Depends(get_db)):
    txs = db.query(Transaction).filter(Transaction.user_id==u.id)\
              .order_by(Transaction.created_at.desc()).limit(50).all()
    return [{"id":t.id,"type":t.type,"amount":t.amount,
             "before":t.before_balance,"after":t.after_balance,
             "created_at":t.created_at.isoformat()} for t in txs]

@app.get("/announcements")
def get_ann(db: Session = Depends(get_db)):
    items = db.query(Announcement).order_by(Announcement.created_at.desc()).limit(10).all()
    return [{"id":a.id,"title":a.title,"content":a.content,
             "created_at":a.created_at.isoformat()} for a in items]

# ════════════════════════════════════════════════
# 管理員端點
# ════════════════════════════════════════════════

@app.get("/admin/stats")
def admin_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    total_users     = db.query(User).filter(User.is_admin==0).count()
    total_bets      = db.query(GameRecord).count()
    total_bet_amt   = db.query(func.sum(GameRecord.bet)).scalar() or 0
    total_win_amt   = db.query(func.sum(GameRecord.win)).scalar() or 0
    pending_rch     = db.query(RechargeOrder).filter(RechargeOrder.status=="pending").count()
    approved_rch    = db.query(RechargeOrder).filter(RechargeOrder.status=="approved").count()
    return {"total_users":total_users,"total_bets":total_bets,
            "total_bet_amount":round(total_bet_amt,2),
            "total_win_amount":round(total_win_amt,2),
            "house_edge":round(total_bet_amt-total_win_amt,2),
            "pending_recharge":pending_rch,"approved_recharge":approved_rch}

@app.get("/admin/users")
def admin_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_admin==0).order_by(User.created_at.desc()).all()
    return [{"id":u.id,"username":u.username,"phone":u.phone,
             "balance":u.balance,"vip_level":u.vip_level,
             "otp_code":u.otp_code,
             "otp_expires":u.otp_expires.isoformat() if u.otp_expires else None,
             "created_at":u.created_at.isoformat()} for u in users]

@app.get("/admin/recharge_orders")
def admin_orders(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    orders = db.query(RechargeOrder).order_by(RechargeOrder.created_at.desc()).all()
    return [{"id":o.id,"user_id":o.user_id,
             "username":o.user.username if o.user else "?",
             "amount":o.amount,"method":o.method,"status":o.status,
             "created_at":o.created_at.isoformat()} for o in orders]

@app.post("/admin/recharge_orders/{oid}/approve")
def approve_order(oid: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    o = db.query(RechargeOrder).filter(RechargeOrder.id==oid).first()
    if not o: raise HTTPException(404,"訂單不存在")
    if o.status!="pending": raise HTTPException(400,"狀態無法修改")
    o.status="approved"
    u = db.query(User).filter(User.id==o.user_id).first()
    before = u.balance; u.balance = round(u.balance+o.amount,2)
    record_tx(db, u, "recharge", o.amount, before, u.balance)
    update_vip(u); db.commit()
    return {"message":"已審核通過","order_id":oid}

@app.post("/admin/recharge_orders/{oid}/reject")
def reject_order(oid: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    o = db.query(RechargeOrder).filter(RechargeOrder.id==oid).first()
    if not o: raise HTTPException(404,"訂單不存在")
    o.status="rejected"; db.commit()
    return {"message":"已拒絕","order_id":oid}

@app.post("/admin/announcements")
def create_ann(req: AnnouncementCreate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    a = Announcement(title=req.title, content=req.content)
    db.add(a); db.commit(); db.refresh(a)
    return {"id":a.id,"title":a.title,"content":a.content}

@app.delete("/admin/announcements/{aid}")
def delete_ann(aid: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    a = db.query(Announcement).filter(Announcement.id==aid).first()
    if not a: raise HTTPException(404,"公告不存在")
    db.delete(a); db.commit()
    return {"message":"已刪除"}
