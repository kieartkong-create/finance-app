import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4ade80','#60a5fa','#f472b6','#facc15','#fb923c','#a78bfa','#34d399','#f87171'];

export default function CategoryChart({ data, type }) {
  const filtered = data.filter(r => r.type === type);
  const chartData = filtered.map(r => ({
    name: r.category,
    value: parseFloat(r.total),
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-5 flex items-center justify-center h-48 text-gray-400 text-sm">
        ยังไม่มีข้อมูล{type === 'income' ? 'รายรับ' : 'รายจ่าย'}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-base font-semibold text-gray-700 mb-3">
        หมวดหมู่{type === 'income' ? 'รายรับ' : 'รายจ่าย'}
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => `฿${v.toLocaleString('th-TH')}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
