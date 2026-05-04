import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function WeeklyChart({ data }) {
  const weeks = [...new Set(data.map(r => r.week))].sort();
  const chartData = weeks.map(week => {
    const income = data.filter(r => r.week == week && r.type === 'income')
      .reduce((s, r) => s + parseFloat(r.total), 0);
    const expense = data.filter(r => r.week == week && r.type === 'expense')
      .reduce((s, r) => s + parseFloat(r.total), 0);
    return { name: `สัปดาห์ ${week}`, รายรับ: income, รายจ่าย: expense };
  });

  return (
    <div className="bg-white rounded-2xl shadow p-5 mb-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">รายรับ-รายจ่ายรายสัปดาห์ (เดือนนี้)</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => `฿${v.toLocaleString('th-TH')}`} />
          <Legend />
          <Line type="monotone" dataKey="รายรับ" stroke="#4ade80" strokeWidth={2} dot />
          <Line type="monotone" dataKey="รายจ่าย" stroke="#f87171" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
