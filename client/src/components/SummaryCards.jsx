export default function SummaryCards({ summary }) {
  const fmt = (n) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-green-400">
        <p className="text-sm text-gray-500">รายรับ</p>
        <p className="text-2xl font-bold text-green-600">฿{fmt(summary.income || 0)}</p>
        <p className="text-xs text-gray-400">{summary.incomeCount || 0} รายการ</p>
      </div>
      <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-red-400">
        <p className="text-sm text-gray-500">รายจ่าย</p>
        <p className="text-2xl font-bold text-red-500">฿{fmt(summary.expense || 0)}</p>
        <p className="text-xs text-gray-400">{summary.expenseCount || 0} รายการ</p>
      </div>
      <div className={`bg-white rounded-2xl shadow p-5 border-l-4 ${(summary.balance || 0) >= 0 ? 'border-blue-400' : 'border-orange-400'}`}>
        <p className="text-sm text-gray-500">คงเหลือ</p>
        <p className={`text-2xl font-bold ${(summary.balance || 0) >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
          ฿{fmt(summary.balance || 0)}
        </p>
        <p className="text-xs text-gray-400">รายรับ - รายจ่าย</p>
      </div>
    </div>
  );
}
