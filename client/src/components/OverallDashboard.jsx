import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

const fmt = (n) => parseFloat(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#facc15', '#a78bfa', '#fb923c'];
const TYPE_ICONS = { กองทุน: '📦', หุ้น: '📈', คริปโต: '🪙', ทองคำ: '🥇', อื่นๆ: '💼' };

export default function OverallDashboard({ summary, investSummary }) {
  const income = summary?.income || 0;
  const expense = summary?.expense || 0;
  const balance = summary?.balance || 0;
  const totalCost = investSummary?.totalCost || 0;
  const totalValue = investSummary?.totalValue || 0;
  const pl = investSummary?.totalProfitLoss || 0;
  const plPct = investSummary?.totalReturnPercent || 0;
  const netWorth = balance + totalValue;

  const byType = investSummary?.byType || {};
  const pieData = Object.entries(byType).map(([name, v]) => ({ name, value: v.value })).filter(d => d.value > 0);

  const barData = [
    { name: 'รายรับ', value: income, fill: '#4ade80' },
    { name: 'รายจ่าย', value: expense, fill: '#f87171' },
    { name: 'ลงทุน (ต้นทุน)', value: totalCost, fill: '#60a5fa' },
    { name: 'พอร์ต (ปัจจุบัน)', value: totalValue, fill: '#818cf8' },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Net Worth Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow p-5 text-white">
        <p className="text-sm opacity-80">ความมั่งคั่งสุทธิ (Net Worth)</p>
        <p className="text-3xl font-bold mt-1">฿{fmt(netWorth)}</p>
        <div className="flex gap-4 mt-3 text-xs opacity-80">
          <span>เงินสด ฿{fmt(balance)}</span>
          <span>พอร์ต ฿{fmt(totalValue)}</span>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl shadow p-4 border-l-4 border-green-400">
          <p className="text-xs text-gray-500">รายรับ (เดือนนี้)</p>
          <p className="text-lg font-bold text-green-600">฿{fmt(income)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 border-l-4 border-red-400">
          <p className="text-xs text-gray-500">รายจ่าย (เดือนนี้)</p>
          <p className="text-lg font-bold text-red-500">฿{fmt(expense)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 border-l-4 border-blue-400">
          <p className="text-xs text-gray-500">มูลค่าพอร์ต</p>
          <p className="text-lg font-bold text-blue-600">฿{fmt(totalValue)}</p>
        </div>
        <div className={`bg-white rounded-2xl shadow p-4 border-l-4 ${pl >= 0 ? 'border-emerald-400' : 'border-orange-400'}`}>
          <p className="text-xs text-gray-500">กำไร/ขาดทุน</p>
          <p className={`text-lg font-bold ${pl >= 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
            {pl >= 0 ? '+' : ''}฿{fmt(pl)}
          </p>
          <p className={`text-xs font-medium ${pl >= 0 ? 'text-emerald-500' : 'text-orange-400'}`}>
            {pl >= 0 ? '+' : ''}{parseFloat(plPct).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Bar Chart - Overview */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">ภาพรวมการเงิน</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `฿${v.toLocaleString('th-TH')}`} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Investment Pie */}
      {pieData.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-3">สัดส่วนพอร์ตการลงทุน</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width={200} height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `฿${v.toLocaleString('th-TH')}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {Object.entries(byType).map(([type, v], i) => {
                const typePl = v.value - v.cost;
                const typePct = v.cost > 0 ? ((typePl / v.cost) * 100).toFixed(2) : 0;
                return (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span>{TYPE_ICONS[type]} {type}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">฿{fmt(v.value)}</span>
                      <span className={`ml-2 text-xs ${typePl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {typePl >= 0 ? '+' : ''}{typePct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
