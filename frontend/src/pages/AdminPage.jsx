import { useState } from 'react';

// ─── Color Palette ───────────────────────────────────────────────────────────
const C = {
  sidebar:      '#1e2a3a',
  sidebarHover: '#263347',
  bg:           '#f5f6fa',
  white:        '#ffffff',
  card:         '#ffffff',
  border:       '#e5e7eb',
  primary:      '#2563eb',
  success:      '#16a34a',
  warning:      '#d97706',
  danger:       '#dc2626',
  text:         '#111827',
  textMuted:    '#6b7280',
  textLight:    '#9ca3af',
  headerBg:     '#ffffff',
  tableTh:      '#f9fafb',
};

// ─── Shared Style Helpers ────────────────────────────────────────────────────
const s = {
  card: {
    background: C.card,
    borderRadius: 6,
    padding: '20px 24px',
    border: `1px solid ${C.border}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  badge: (color) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 4,
    fontSize: 11, fontWeight: 500, background: color + '18', color,
    border: `1px solid ${color}33`,
  }),
  btn: (color = C.primary, outline = false) => ({
    padding: '7px 16px', borderRadius: 5,
    border: outline ? `1px solid ${color}` : 'none',
    background: outline ? 'transparent' : color,
    color: outline ? color : C.white,
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
  }),
  btnSm: (color = C.primary) => ({
    padding: '4px 10px', borderRadius: 4, border: 'none',
    background: color, color: C.white, cursor: 'pointer', fontSize: 12, fontWeight: 500,
  }),
  input: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 5,
    color: C.text,
    padding: '7px 10px',
    fontSize: 13,
    outline: 'none',
  },
  th: {
    padding: '10px 14px',
    color: C.textMuted,
    fontSize: 12,
    fontWeight: 600,
    textAlign: 'left',
    background: C.tableTh,
    borderBottom: `1px solid ${C.border}`,
  },
  td: {
    padding: '11px 14px',
    color: C.text,
    fontSize: 13,
    borderBottom: `1px solid ${C.border}`,
  },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockUsers = [
  { id: 1, name: '王小明', email: 'ming@example.com', points: 15200, status: '正常', joined: '2025-01-15', lastLogin: '2026-04-16' },
  { id: 2, name: '李美玲', email: 'ling@example.com', points: 8300,  status: '正常', joined: '2025-03-02', lastLogin: '2026-04-17' },
  { id: 3, name: '陳大偉', email: 'wei@example.com',  points: 2100,  status: '封鎖', joined: '2025-05-18', lastLogin: '2026-03-30' },
  { id: 4, name: '林志豪', email: 'hao@example.com',  points: 45000, status: '正常', joined: '2025-02-11', lastLogin: '2026-04-17' },
  { id: 5, name: '黃雅婷', email: 'ting@example.com', points: 3700,  status: '正常', joined: '2025-07-22', lastLogin: '2026-04-15' },
];

const mockDeposits = [
  { id: 'D0041', user: '王小明', amount: 5000,  method: 'LINE Pay', time: '10:23', status: '待審核' },
  { id: 'D0042', user: '李美玲', amount: 2000,  method: '街口支付', time: '10:45', status: '待審核' },
  { id: 'D0043', user: '林志豪', amount: 10000, method: '銀行轉帳', time: '11:02', status: '待審核' },
  { id: 'D0038', user: '黃雅婷', amount: 1000,  method: 'LINE Pay', time: '09:15', status: '已核准' },
  { id: 'D0037', user: '陳大偉', amount: 3000,  method: '街口支付', time: '08:50', status: '已拒絕' },
];

const mockWithdraws = [
  { id: 'W0021', user: '林志豪', amount: 8000,  bank: '台灣銀行', account: '****1234', time: '09:30', status: '待審核' },
  { id: 'W0022', user: '王小明', amount: 3500,  bank: '中信銀行', account: '****5678', time: '10:10', status: '待審核' },
  { id: 'W0020', user: '李美玲', amount: 1200,  bank: '玉山銀行', account: '****9012', time: '08:20', status: '已核准' },
];

const mockAnnouncements = [
  { id: 1, title: '系統維護通知', content: '本系統將於 4/20 凌晨 2:00-4:00 進行例行維護', priority: '高', status: '發布', date: '2026-04-17' },
  { id: 2, title: '新春活動上線', content: '新春期間存款享雙倍紅利，活動至 2/15 截止', priority: '中', status: '發布', date: '2026-04-10' },
  { id: 3, title: '新遊戲上線公告', content: '全新電子遊戲《財神到》正式上線！', priority: '低', status: '草稿', date: '2026-04-05' },
];

const mockOTP = [
  { user: '王小明', ip: '192.168.1.101', time: '2026-04-17 10:23', status: '成功' },
  { user: '林志豪', ip: '58.243.12.88',  time: '2026-04-17 09:55', status: '成功' },
  { user: 'Unknown', ip: '103.45.67.89', time: '2026-04-17 09:12', status: '失敗' },
  { user: 'Unknown', ip: '103.45.67.89', time: '2026-04-17 09:11', status: '失敗' },
  { user: 'Unknown', ip: '103.45.67.89', time: '2026-04-17 09:10', status: '失敗' },
];

// ─── Mini Chart (SVG bar chart) ───────────────────────────────────────────────
function BarChart({ data, color = C.primary, label }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div>
      {label && <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 8 }}>{label}</div>}
      <svg width="100%" height="80" viewBox={`0 0 ${data.length * 36} 80`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const h = (d.value / max) * 64;
          return (
            <g key={i}>
              <rect x={i * 36 + 4} y={80 - h - 8} width={28} height={h}
                fill={color} opacity={0.75} rx={3} />
              <text x={i * 36 + 18} y={78} textAnchor="middle"
                fill={C.textMuted} fontSize={9}>{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LineChart({ data, color = C.primary }) {
  const max = Math.max(...data.map(d => d.value));
  const W = 400, H = 80, pad = 8;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((d.value / max) * (H - pad * 2));
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (W - pad * 2);
        const y = H - pad - ((d.value / max) * (H - pad * 2));
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ icon, title, value, sub, color, trend }) {
  return (
    <div style={{
      ...s.card,
      borderLeft: `4px solid ${color}`,
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 4 }}>{title}</div>
        <div style={{ color: C.text, fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{value}</div>
        {sub && (
          <div style={{ color: trend === '+' ? C.success : trend === '-' ? C.danger : C.textMuted, fontSize: 11, marginTop: 4 }}>
            {trend === '+' ? '▲' : trend === '-' ? '▼' : ''} {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 40, height: 22, borderRadius: 11,
      background: value ? C.primary : '#d1d5db',
      cursor: 'pointer', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 3,
        left: value ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: C.white,
        transition: 'left .15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────
function Slider({ value, onChange, min = 0, max = 100, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {label && <span style={{ color: C.textMuted, fontSize: 12, width: 80 }}>{label}</span>}
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: C.primary }}
      />
      <span style={{ color: C.primary, fontWeight: 600, width: 40, textAlign: 'right', fontSize: 13 }}>
        {value}%
      </span>
    </div>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <h2 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: 0 }}>{children}</h2>
      {action}
    </div>
  );
}

// ─── Table Wrapper ────────────────────────────────────────────────────────────
function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{headers.map((h, i) => <th key={i} style={s.th}>{h}</th>)}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PAGE COMPONENTS ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function OtpPendingBox() {
  const [otps, setOtps] = useState([]);
  const [loading, setLoading] = useState(false);
  const API = import.meta.env.VITE_API_URL || 'https://casino-production-abbf.up.railway.app';

  const fetchOtps = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/otp-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOtps(data.otps || []);
    } catch (e) {
      setOtps([]);
    } finally {
      setLoading(false);
    }
  };

  // auto-refresh every 15s
  useState(() => {
    fetchOtps();
    const t = setInterval(fetchOtps, 15000);
    return () => clearInterval(t);
  });

  if (otps.length === 0 && !loading) return null;

  return (
    <div style={{
      background: '#fffbe6', border: '2px solid #f59e0b', borderRadius: 10,
      padding: '16px 20px', marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#92400e' }}>📨 待發送驗證碼 ({otps.length})</div>
        <button onClick={fetchOtps} style={{ ...s.btnSm(C.warning), fontSize: 11 }}>🔄 刷新</button>
      </div>
      {loading && <div style={{ color: '#888', fontSize: 13 }}>載入中...</div>}
      {otps.map((o, i) => {
        const exp = new Date(o.expires + 'Z');
        const now = new Date();
        const secLeft = Math.max(0, Math.floor((exp - now) / 1000));
        const minLeft = Math.floor(secLeft / 60);
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '10px 0',
            borderTop: i > 0 ? '1px solid #fde68a' : 'none',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', minWidth: 120 }}>📱 {o.phone}</span>
            <span style={{
              fontSize: 22, fontWeight: 900, letterSpacing: 4,
              color: '#dc2626', background: '#fee2e2', padding: '4px 12px', borderRadius: 8,
              fontFamily: 'monospace',
            }}>{o.otp}</span>
            <span style={{ fontSize: 12, color: '#92400e' }}>⏱ 剩 {minLeft}分{secLeft % 60}秒</span>
            <button
              onClick={() => { navigator.clipboard?.writeText(o.otp); }}
              style={{ ...s.btnSm('#6366f1'), fontSize: 11 }}
            >複製</button>
          </div>
        );
      })}
    </div>
  );
}

function DashboardPage() {
  const revenueData = [
    { label: 'Mo', value: 42000 }, { label: 'Tu', value: 38000 }, { label: 'We', value: 55000 },
    { label: 'Th', value: 61000 }, { label: 'Fr', value: 78000 }, { label: 'Sa', value: 95000 },
    { label: 'Su', value: 88000 },
  ];
  const userGrowth = [
    { label: '1', value: 120 }, { label: '5', value: 145 }, { label: '10', value: 160 },
    { label: '15', value: 155 }, { label: '20', value: 190 }, { label: '25', value: 220 },
    { label: '30', value: 245 },
  ];
  const pending = [
    { type: '儲值審核', count: 3, color: C.warning },
    { type: '提款審核', count: 2, color: C.danger },
    { type: '用戶申訴', count: 1, color: C.primary },
  ];
  return (
    <div>
      <OtpPendingBox />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KPICard icon="💰" title="今日營收" value="NT$124,800" sub="+18.4% vs 昨日" color={C.success} trend="+" />
        <KPICard icon="👥" title="活躍用戶" value="1,284" sub="+52 今日新增" color={C.primary} trend="+" />
        <KPICard icon="🎰" title="遊戲局數" value="8,471" sub="-3.2% vs 昨日" color={C.warning} trend="-" />
        <KPICard icon="💳" title="待處理交易" value="5" sub="需要立即處理" color={C.danger} trend="" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <div style={s.card}>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 12, fontSize: 13 }}>本週營收趨勢</div>
          <BarChart data={revenueData} color={C.primary} />
          <div style={{ marginTop: 6, color: C.textMuted, fontSize: 11 }}>單位：新台幣</div>
        </div>
        <div style={s.card}>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 12, fontSize: 13 }}>本月用戶成長</div>
          <LineChart data={userGrowth} color={C.success} />
          <div style={{ marginTop: 6, color: C.textMuted, fontSize: 11 }}>單位：人數</div>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>待處理項目</SectionTitle>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {pending.map((p, i) => (
            <div key={i} style={{
              border: `1px solid ${C.border}`,
              borderRadius: 5, padding: '12px 18px',
              display: 'flex', alignItems: 'center', gap: 12,
              background: C.white,
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: p.color }}>{p.count}</div>
              <div style={{ color: C.text, fontSize: 13 }}>{p.type}</div>
              <button style={s.btnSm(p.color)}>前往處理</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function UsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [adjustPts, setAdjustPts] = useState('');

  const filtered = users.filter(u =>
    u.name.includes(search) || u.email.includes(search)
  );

  const toggleBlock = (id) => {
    setUsers(us => us.map(u => u.id === id
      ? { ...u, status: u.status === '封鎖' ? '正常' : '封鎖' }
      : u
    ));
  };

  const applyPoints = (id) => {
    const delta = parseInt(adjustPts, 10);
    if (!isNaN(delta)) {
      setUsers(us => us.map(u => u.id === id ? { ...u, points: u.points + delta } : u));
    }
    setEditUser(null);
    setAdjustPts('');
  };

  return (
    <div>
      <SectionTitle action={
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="搜尋用戶名稱 / Email"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...s.input, width: 220 }}
          />
          <button style={s.btn()}>匯出 CSV</button>
        </div>
      }>用戶管理</SectionTitle>

      <div style={s.card}>
        <Table
          headers={['#', '姓名', 'Email', '點數', '狀態', '加入日期', '上次登入', '操作']}
          rows={filtered.map(u => (
            <tr key={u.id}>
              <td style={s.td}>{u.id}</td>
              <td style={s.td}><span style={{ fontWeight: 600 }}>{u.name}</span></td>
              <td style={{ ...s.td, color: C.textMuted }}>{u.email}</td>
              <td style={{ ...s.td, color: C.primary, fontWeight: 600 }}>{u.points.toLocaleString()}</td>
              <td style={s.td}>
                <span style={s.badge(u.status === '正常' ? C.success : C.danger)}>{u.status}</span>
              </td>
              <td style={{ ...s.td, color: C.textMuted }}>{u.joined}</td>
              <td style={{ ...s.td, color: C.textMuted }}>{u.lastLogin}</td>
              <td style={s.td}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {editUser === u.id ? (
                    <>
                      <input
                        placeholder="±點數"
                        value={adjustPts}
                        onChange={e => setAdjustPts(e.target.value)}
                        style={{ ...s.input, width: 80, padding: '4px 8px' }}
                      />
                      <button onClick={() => applyPoints(u.id)} style={s.btnSm(C.success)}>確認</button>
                      <button onClick={() => setEditUser(null)} style={s.btnSm('#9ca3af')}>取消</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditUser(u.id)} style={s.btnSm(C.primary)}>調整點數</button>
                      <button onClick={() => toggleBlock(u.id)}
                        style={s.btnSm(u.status === '封鎖' ? C.success : C.danger)}>
                        {u.status === '封鎖' ? '解封' : '封鎖'}
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function DepositPage() {
  const [items, setItems] = useState(mockDeposits);
  const handle = (id, action) => {
    setItems(it => it.map(i => i.id === id
      ? { ...i, status: action === 'approve' ? '已核准' : '已拒絕' }
      : i
    ));
  };
  return (
    <div>
      <SectionTitle>儲值審核</SectionTitle>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {['待審核', '已核准', '已拒絕'].map(st => {
          const c = st === '待審核' ? C.warning : st === '已核准' ? C.success : C.danger;
          const cnt = items.filter(i => i.status === st).length;
          return (
            <div key={st} style={{ ...s.card, flex: 1, textAlign: 'center', padding: '14px', borderTop: `3px solid ${c}` }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{cnt}</div>
              <div style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>{st}</div>
            </div>
          );
        })}
      </div>
      <div style={s.card}>
        <Table
          headers={['單號', '用戶', '金額', '付款方式', '時間', '狀態', '操作']}
          rows={items.map(item => (
            <tr key={item.id}>
              <td style={{ ...s.td, fontFamily: 'monospace', color: C.primary }}>{item.id}</td>
              <td style={s.td}>{item.user}</td>
              <td style={{ ...s.td, fontWeight: 600, color: C.success }}>NT${item.amount.toLocaleString()}</td>
              <td style={s.td}>{item.method}</td>
              <td style={{ ...s.td, color: C.textMuted }}>{item.time}</td>
              <td style={s.td}>
                <span style={s.badge(
                  item.status === '待審核' ? C.warning :
                  item.status === '已核准' ? C.success : C.danger
                )}>{item.status}</span>
              </td>
              <td style={s.td}>
                {item.status === '待審核' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handle(item.id, 'approve')} style={s.btnSm(C.success)}>核准</button>
                    <button onClick={() => handle(item.id, 'reject')} style={s.btnSm(C.danger)}>拒絕</button>
                  </div>
                ) : <span style={{ color: C.textLight }}>—</span>}
              </td>
            </tr>
          ))}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function WithdrawPage() {
  const [items, setItems] = useState(mockWithdraws);
  const handle = (id, action) => {
    setItems(it => it.map(i => i.id === id
      ? { ...i, status: action === 'approve' ? '已核准' : '已拒絕' }
      : i
    ));
  };
  return (
    <div>
      <SectionTitle>提款審核</SectionTitle>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {['待審核', '已核准', '已拒絕'].map(st => {
          const c = st === '待審核' ? C.warning : st === '已核准' ? C.success : C.danger;
          const cnt = items.filter(i => i.status === st).length;
          return (
            <div key={st} style={{ ...s.card, flex: 1, textAlign: 'center', padding: '14px', borderTop: `3px solid ${c}` }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{cnt}</div>
              <div style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>{st}</div>
            </div>
          );
        })}
      </div>
      <div style={s.card}>
        <Table
          headers={['單號', '用戶', '金額', '銀行', '帳號', '時間', '狀態', '操作']}
          rows={items.map(item => (
            <tr key={item.id}>
              <td style={{ ...s.td, fontFamily: 'monospace', color: C.primary }}>{item.id}</td>
              <td style={s.td}>{item.user}</td>
              <td style={{ ...s.td, fontWeight: 600, color: C.danger }}>NT${item.amount.toLocaleString()}</td>
              <td style={s.td}>{item.bank}</td>
              <td style={{ ...s.td, fontFamily: 'monospace', color: C.textMuted }}>{item.account}</td>
              <td style={{ ...s.td, color: C.textMuted }}>{item.time}</td>
              <td style={s.td}>
                <span style={s.badge(
                  item.status === '待審核' ? C.warning :
                  item.status === '已核准' ? C.success : C.danger
                )}>{item.status}</span>
              </td>
              <td style={s.td}>
                {item.status === '待審核' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handle(item.id, 'approve')} style={s.btnSm(C.success)}>核准</button>
                    <button onClick={() => handle(item.id, 'reject')} style={s.btnSm(C.danger)}>拒絕</button>
                  </div>
                ) : <span style={{ color: C.textLight }}>—</span>}
              </td>
            </tr>
          ))}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function GamesPage() {
  const initGames = [
    { id: 'slots1', name: '財神臨門', rtp: 96, enabled: true, minBet: 10, maxBet: 5000 },
    { id: 'slots2', name: '龍鳳呈祥', rtp: 94, enabled: true, minBet: 5, maxBet: 3000 },
    { id: 'slots3', name: '幸運三葉草', rtp: 97, enabled: false, minBet: 1, maxBet: 1000 },
    { id: 'fish1',  name: '大海撈金', rtp: 92, enabled: true, minBet: 20, maxBet: 10000 },
    { id: 'card1',  name: '百家樂', rtp: 98, enabled: true, minBet: 100, maxBet: 50000 },
    { id: 'card2',  name: '龍虎鬥', rtp: 96, enabled: true, minBet: 50, maxBet: 20000 },
  ];
  const [games, setGames] = useState(initGames);

  const update = (id, field, val) =>
    setGames(gs => gs.map(g => g.id === id ? { ...g, [field]: val } : g));

  return (
    <div>
      <SectionTitle>遊戲設定</SectionTitle>
      <div style={{ display: 'grid', gap: 10 }}>
        {games.map(g => (
          <div key={g.id} style={{
            ...s.card, display: 'flex', alignItems: 'center', gap: 20,
            opacity: g.enabled ? 1 : 0.6,
          }}>
            <div style={{ width: 160, color: C.text, fontWeight: 500, fontSize: 14 }}>{g.name}</div>
            <div style={{ flex: 1 }}>
              <Slider value={g.rtp} onChange={v => update(g.id, 'rtp', v)}
                min={85} max={99} label="RTP 回報率" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 200 }}>
              <span style={{ color: C.textMuted, fontSize: 12 }}>最低:</span>
              <input value={g.minBet} onChange={e => update(g.id, 'minBet', e.target.value)}
                style={{ ...s.input, width: 70, padding: '5px 8px' }} />
              <span style={{ color: C.textMuted, fontSize: 12 }}>最高:</span>
              <input value={g.maxBet} onChange={e => update(g.id, 'maxBet', e.target.value)}
                style={{ ...s.input, width: 80, padding: '5px 8px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ color: g.enabled ? C.success : C.textMuted, fontSize: 12 }}>
                {g.enabled ? '上線中' : '已下架'}
              </span>
              <Toggle value={g.enabled} onChange={v => update(g.id, 'enabled', v)} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
        <button style={s.btn()}>儲存設定</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AnnouncementsPage() {
  const [items, setItems] = useState(mockAnnouncements);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', priority: '中' });
  const [showForm, setShowForm] = useState(false);

  const save = () => {
    if (editing !== null) {
      setItems(it => it.map(i => i.id === editing ? { ...i, ...form } : i));
      setEditing(null);
    } else {
      setItems(it => [...it, {
        id: Date.now(), ...form, status: '草稿', date: new Date().toISOString().slice(0, 10)
      }]);
    }
    setForm({ title: '', content: '', priority: '中' });
    setShowForm(false);
  };

  const del = (id) => setItems(it => it.filter(i => i.id !== id));

  const startEdit = (item) => {
    setForm({ title: item.title, content: item.content, priority: item.priority });
    setEditing(item.id);
    setShowForm(true);
  };

  const priorityColor = p => p === '高' ? C.danger : p === '中' ? C.warning : C.textMuted;

  return (
    <div>
      <SectionTitle action={
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: '', content: '', priority: '中' }); }}
          style={s.btn()}>
          {showForm ? '取消' : '新增公告'}
        </button>
      }>公告管理</SectionTitle>

      {showForm && (
        <div style={{ ...s.card, marginBottom: 14 }}>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
            {editing ? '編輯公告' : '新增公告'}
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={{ color: C.textMuted, fontSize: 12, display: 'block', marginBottom: 4 }}>標題</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                style={{ ...s.input, width: '100%', boxSizing: 'border-box' }} placeholder="公告標題" />
            </div>
            <div>
              <label style={{ color: C.textMuted, fontSize: 12, display: 'block', marginBottom: 4 }}>內容</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={3} style={{ ...s.input, width: '100%', resize: 'vertical', boxSizing: 'border-box' }}
                placeholder="公告內容" />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label style={{ color: C.textMuted, fontSize: 12 }}>優先級：</label>
              {['高', '中', '低'].map(p => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="radio" name="priority" value={p}
                    checked={form.priority === p} onChange={() => setForm(f => ({ ...f, priority: p }))} />
                  <span style={{ color: priorityColor(p), fontSize: 13 }}>{p}</span>
                </label>
              ))}
              <button onClick={save} style={{ ...s.btn(), marginLeft: 'auto' }}>
                {editing ? '更新' : '發布'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {items.map(item => (
          <div key={item.id} style={{
            ...s.card, display: 'flex', alignItems: 'flex-start', gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{item.title}</span>
                <span style={s.badge(priorityColor(item.priority))}>{item.priority}優先</span>
                <span style={s.badge(item.status === '發布' ? C.success : C.textMuted)}>{item.status}</span>
              </div>
              <div style={{ color: C.textMuted, fontSize: 13 }}>{item.content}</div>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ color: C.textLight, fontSize: 11, marginBottom: 8 }}>{item.date}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => startEdit(item)} style={s.btnSm(C.primary)}>編輯</button>
                <button onClick={() => del(item.id)} style={s.btnSm(C.danger)}>刪除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ActivitiesPage() {
  const initActs = [
    { id: 1, name: '新用戶歡迎禮', desc: '首次存款送100%紅利，上限NT$3,000', enabled: true, value: '100%', type: '新用戶' },
    { id: 2, name: '每日簽到獎勵', desc: '每日登入送10-100點數', enabled: true, value: '10-100點', type: '常規' },
    { id: 3, name: '救援金活動', desc: '當日輸超過NT$1,000送10%救援金', enabled: false, value: '10%', type: '常規' },
    { id: 4, name: '好友推薦', desc: '推薦好友成功存款，雙方各得200點', enabled: true, value: '200點', type: '推薦' },
    { id: 5, name: '生日禮金', desc: '生日當週存款送雙倍紅利', enabled: true, value: '200%', type: 'VIP' },
    { id: 6, name: '閃充活動', desc: '特定時段存款享1.5倍紅利', enabled: false, value: '150%', type: '限時' },
    { id: 7, name: '週排行獎勵', desc: '每週遊戲點數排行前10名特別獎勵', enabled: true, value: '前10名', type: '競賽' },
  ];
  const [acts, setActs] = useState(initActs);
  const toggle = id => setActs(as => as.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  const typeColor = t => {
    const m = { '新用戶': C.success, '常規': C.primary, '推薦': C.warning, 'VIP': '#7c3aed', '限時': C.danger, '競賽': '#0891b2' };
    return m[t] || C.textMuted;
  };
  return (
    <div>
      <SectionTitle action={<button style={s.btn()}>新增活動</button>}>活動設定</SectionTitle>
      <div style={{ display: 'grid', gap: 10 }}>
        {acts.map(a => (
          <div key={a.id} style={{
            ...s.card, display: 'flex', alignItems: 'center', gap: 16,
            opacity: a.enabled ? 1 : 0.6,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: C.text, fontWeight: 500, fontSize: 14 }}>{a.name}</span>
                <span style={s.badge(typeColor(a.type))}>{a.type}</span>
              </div>
              <div style={{ color: C.textMuted, fontSize: 12 }}>{a.desc}</div>
            </div>
            <div style={{ color: C.primary, fontWeight: 600, fontSize: 14, width: 80, textAlign: 'center' }}>
              {a.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ color: a.enabled ? C.success : C.textMuted, fontSize: 12 }}>
                {a.enabled ? '進行中' : '已停用'}
              </span>
              <Toggle value={a.enabled} onChange={() => toggle(a.id)} />
            </div>
            <button style={s.btnSm(C.primary)}>設定</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function PaymentPage() {
  const initMethods = [
    { id: 'linepay', name: 'LINE Pay', icon: '💚', enabled: true, minDeposit: 100, maxDeposit: 30000, fee: 1.5 },
    { id: 'jkopay',  name: '街口支付', icon: '🔵', enabled: true, minDeposit: 100, maxDeposit: 20000, fee: 1.2 },
    { id: 'bank',    name: '銀行轉帳', icon: '🏦', enabled: true, minDeposit: 1000, maxDeposit: 200000, fee: 0 },
    { id: 'crypto',  name: '虛擬貨幣', icon: '₿', enabled: false, minDeposit: 500, maxDeposit: 100000, fee: 0.5 },
  ];
  const [methods, setMethods] = useState(initMethods);
  const update = (id, f, v) => setMethods(ms => ms.map(m => m.id === id ? { ...m, [f]: v } : m));

  return (
    <div>
      <SectionTitle>付款設定</SectionTitle>
      <div style={{ display: 'grid', gap: 14 }}>
        {methods.map(m => (
          <div key={m.id} style={{ ...s.card, opacity: m.enabled ? 1 : 0.65 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 22 }}>{m.icon}</span>
              <span style={{ color: C.text, fontWeight: 600, fontSize: 15 }}>{m.name}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: m.enabled ? C.success : C.danger, fontSize: 12 }}>
                  {m.enabled ? '啟用中' : '已停用'}
                </span>
                <Toggle value={m.enabled} onChange={v => update(m.id, 'enabled', v)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: '最低存款 (NT$)', field: 'minDeposit' },
                { label: '最高存款 (NT$)', field: 'maxDeposit' },
                { label: '手續費 (%)', field: 'fee' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label style={{ color: C.textMuted, fontSize: 11, display: 'block', marginBottom: 4 }}>{label}</label>
                  <input
                    value={m[field]}
                    onChange={e => update(m.id, field, e.target.value)}
                    style={{ ...s.input, width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
        <button style={s.btn()}>儲存設定</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function SecurityPage() {
  const [blockedIPs, setBlockedIPs] = useState([
    { ip: '103.45.67.89', reason: '多次登入失敗', blockedAt: '2026-04-17 09:15' },
    { ip: '198.51.100.44', reason: '異常大量請求', blockedAt: '2026-04-16 14:30' },
  ]);
  const [newIP, setNewIP] = useState('');

  const addBlock = () => {
    if (newIP.trim()) {
      setBlockedIPs(bs => [...bs, { ip: newIP.trim(), reason: '手動封鎖', blockedAt: new Date().toLocaleString() }]);
      setNewIP('');
    }
  };

  const unblock = ip => setBlockedIPs(bs => bs.filter(b => b.ip !== ip));

  return (
    <div>
      <SectionTitle>安全中心</SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <KPICard icon="🔑" title="今日 OTP 驗證" value="248" sub="+12 vs 昨日" color={C.primary} trend="+" />
        <KPICard icon="🚫" title="今日攔截請求" value="31" sub="3 個可疑 IP" color={C.danger} trend="-" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={s.card}>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 12, fontSize: 13 }}>OTP 驗證記錄</div>
          <Table
            headers={['用戶', 'IP', '時間', '結果']}
            rows={mockOTP.map((o, i) => (
              <tr key={i}>
                <td style={s.td}>{o.user}</td>
                <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11, color: C.textMuted }}>{o.ip}</td>
                <td style={{ ...s.td, fontSize: 11, color: C.textMuted }}>{o.time}</td>
                <td style={s.td}>
                  <span style={s.badge(o.status === '成功' ? C.success : C.danger)}>{o.status}</span>
                </td>
              </tr>
            ))}
          />
        </div>

        <div style={s.card}>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 12, fontSize: 13 }}>IP 封鎖名單</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="輸入 IP 位址"
              value={newIP} onChange={e => setNewIP(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addBlock()}
              style={{ ...s.input, flex: 1 }}
            />
            <button onClick={addBlock} style={s.btn(C.danger)}>封鎖</button>
          </div>
          {blockedIPs.length === 0
            ? <div style={{ color: C.textLight, textAlign: 'center', padding: '20px 0', fontSize: 13 }}>無封鎖 IP</div>
            : blockedIPs.map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
                borderBottom: i < blockedIPs.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <span style={{ fontFamily: 'monospace', color: C.danger, fontSize: 13, flex: 1 }}>{b.ip}</span>
                <span style={{ color: C.textMuted, fontSize: 11, flex: 1 }}>{b.reason}</span>
                <button onClick={() => unblock(b.ip)} style={s.btnSm(C.success)}>解除</button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function SystemPage() {
  const [settings, setSettings] = useState({
    maintenance: false,
    maintenanceMsg: '系統維護中，預計 2 小時後恢復服務',
    registrationOpen: true,
    minWithdraw: 500,
    maxWithdraw: 100000,
    dailyWithdrawLimit: 3,
    sessionTimeout: 30,
    debugMode: false,
    twoFARequired: true,
    betLogRetention: 90,
  });

  const set = (k, v) => setSettings(prev => ({ ...prev, [k]: v }));

  const Row = ({ label, desc, children }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 0', borderBottom: `1px solid ${C.border}`,
    }}>
      <div>
        <div style={{ color: C.text, fontSize: 14 }}>{label}</div>
        {desc && <div style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: 24 }}>{children}</div>
    </div>
  );

  return (
    <div>
      <SectionTitle>系統設定</SectionTitle>

      {settings.maintenance && (
        <div style={{
          background: '#fef2f2', border: `1px solid #fecaca`,
          borderRadius: 5, padding: '10px 14px', marginBottom: 14,
          color: C.danger, fontSize: 13,
        }}>
          ⚠️ 維護模式已開啟 — 用戶目前無法存取平台
        </div>
      )}

      <div style={s.card}>
        <Row label="維護模式" desc="開啟後所有用戶將看到維護頁面">
          <Toggle value={settings.maintenance} onChange={v => set('maintenance', v)} />
        </Row>
        {settings.maintenance && (
          <div style={{ padding: '8px 0' }}>
            <textarea
              value={settings.maintenanceMsg}
              onChange={e => set('maintenanceMsg', e.target.value)}
              rows={2} style={{ ...s.input, width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>
        )}
        <Row label="開放註冊" desc="關閉後新用戶無法註冊">
          <Toggle value={settings.registrationOpen} onChange={v => set('registrationOpen', v)} />
        </Row>
        <Row label="強制 2FA" desc="要求所有用戶啟用雙重驗證">
          <Toggle value={settings.twoFARequired} onChange={v => set('twoFARequired', v)} />
        </Row>
        <Row label="除錯模式" desc="啟用詳細記錄（僅限開發環境）">
          <Toggle value={settings.debugMode} onChange={v => set('debugMode', v)} />
        </Row>
      </div>

      <div style={{ ...s.card, marginTop: 14 }}>
        <div style={{ color: C.text, fontWeight: 600, marginBottom: 12, fontSize: 13 }}>提款限制</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: '最低提款 (NT$)', key: 'minWithdraw' },
            { label: '最高提款 (NT$)', key: 'maxWithdraw' },
            { label: '每日提款次數', key: 'dailyWithdrawLimit' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label style={{ color: C.textMuted, fontSize: 11, display: 'block', marginBottom: 4 }}>{label}</label>
              <input
                value={settings[key]}
                onChange={e => set(key, e.target.value)}
                style={{ ...s.input, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...s.card, marginTop: 14 }}>
        <div style={{ color: C.text, fontWeight: 600, marginBottom: 12, fontSize: 13 }}>其他設定</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { label: 'Session 逾時 (分鐘)', key: 'sessionTimeout' },
            { label: '下注記錄保留天數', key: 'betLogRetention' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label style={{ color: C.textMuted, fontSize: 11, display: 'block', marginBottom: 4 }}>{label}</label>
              <input
                value={settings[key]}
                onChange={e => set(key, e.target.value)}
                style={{ ...s.input, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button style={s.btn('#6b7280', true)}>重置預設值</button>
        <button style={s.btn()}>儲存所有設定</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const MENU = [
  { key: 'dashboard',     icon: '🏠', label: '儀表板' },
  { key: 'users',         icon: '👥', label: '用戶管理' },
  { key: 'deposits',      icon: '💰', label: '儲值審核',  badge: 3 },
  { key: 'withdrawals',   icon: '💸', label: '提款審核',  badge: 2 },
  { key: 'games',         icon: '🎰', label: '遊戲設定' },
  { key: 'announcements', icon: '📢', label: '公告管理' },
  { key: 'activities',    icon: '🎁', label: '活動設定' },
  { key: 'payment',       icon: '💳', label: '付款設定' },
  { key: 'security',      icon: '🔐', label: '安全中心' },
  { key: 'system',        icon: '⚙️', label: '系統設定' },
];

const PAGE_COMPONENTS = {
  dashboard:     DashboardPage,
  users:         UsersPage,
  deposits:      DepositPage,
  withdrawals:   WithdrawPage,
  games:         GamesPage,
  announcements: AnnouncementsPage,
  activities:    ActivitiesPage,
  payment:       PaymentPage,
  security:      SecurityPage,
  system:        SystemPage,
};

export default function AdminPage() {
  const [active, setActive] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const menu = MENU.find(m => m.key === active);
  const PageComp = PAGE_COMPONENTS[active];

  return (
    <div style={{
      display: 'flex', height: '100vh', background: C.bg,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif",
      color: C.text, overflow: 'hidden',
    }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div style={{
        width: collapsed ? 56 : 220,
        background: C.sidebar,
        display: 'flex', flexDirection: 'column',
        flexShrink: 0,
        transition: 'width .2s',
      }}>
        {/* Logo */}
        <div style={{
          height: 56,
          padding: collapsed ? '0 12px' : '0 16px',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: C.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: C.white, flexShrink: 0,
              }}>🎰</div>
              <div>
                <div style={{ color: C.white, fontWeight: 600, fontSize: 13, lineHeight: 1 }}>Casino</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 }}>Admin Panel</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: C.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>🎰</div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16, padding: 2 }}
            >‹</button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {MENU.map(item => {
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed ? 0 : 10,
                  width: '100%',
                  padding: collapsed ? '10px 0' : '9px 16px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'none',
                  border: 'none',
                  borderLeft: isActive ? `3px solid ${C.primary}` : '3px solid transparent',
                  color: isActive ? C.white : 'rgba(255,255,255,0.55)',
                  cursor: 'pointer', fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left', position: 'relative',
                }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'none')}
              >
                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span style={{
                    background: C.danger, color: C.white,
                    borderRadius: 10, fontSize: 10, fontWeight: 600,
                    padding: '1px 6px', lineHeight: '16px',
                  }}>{item.badge}</span>
                )}
                {collapsed && item.badge && (
                  <span style={{
                    position: 'absolute', top: 5, right: 8,
                    background: C.danger, color: C.white,
                    borderRadius: '50%', width: 14, height: 14,
                    fontSize: 9, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Expand button when collapsed / User info when expanded */}
        {collapsed ? (
          <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setCollapsed(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16 }}
            >›</button>
          </div>
        ) : (
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: C.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.white, fontWeight: 600, fontSize: 13, flexShrink: 0,
            }}>A</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: C.white, fontSize: 12, fontWeight: 500 }}>Admin</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>超級管理員</div>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 }}
              title="登出">⏻</button>
          </div>
        )}
      </div>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          height: 56, padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: C.headerBg,
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: C.textMuted, fontSize: 13 }}>管理後台</span>
            <span style={{ color: C.textLight, fontSize: 13 }}>›</span>
            <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{menu?.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: C.success, fontSize: 12,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.success, display: 'inline-block' }} />
              系統正常
            </div>
            <div style={{ color: C.textMuted, fontSize: 12 }}>
              {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
            </div>
            <button style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 17 }}
              title="通知">🔔</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <PageComp />
        </div>
      </div>
    </div>
  );
}
