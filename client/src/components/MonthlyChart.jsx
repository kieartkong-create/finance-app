import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

export default function MonthlyChart({ data }) {
  const chartData = MONTHS_TH.map((name, i) => {
    const month = i + 1;
    const income = data.filter(r => r.type === 'income' && parseInt(r.month) === month)
      .reduce((s, r) => s + parseFloat(r.total), 0);
    const expense = data.filter(r => r.type === 'expense' && parseInt(r.month) === month)
      .reduce((s, r) => s + parseFloat(r.total), 0);
    return { name, รายรับ: income, รายจ่าย: expense };
  });

  return (
    <div className="bg-white rounded-2xl shadow p-5 mb-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">รายรับ-รายจ่ายรายเดือน</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => `฿${v.toLocaleString('th-TH')}`} />
          <Legend />
          <Bar dataKey="รายรับ" fill="#4ade80" radius={[4, 4, 0, 0]} />
          <Bar dataKey="รายจ่าย" fill="#f87171" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
