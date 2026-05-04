import { useState } from 'react';
import TransactionForm from './TransactionForm';

const fmt = (n) => parseFloat(n).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

export default function TransactionList({ transactions, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(null);

  const handleUpdate = async (data) => {
    await onUpdate(editing.id, data);
    setEditing(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="px-5 py-4 border-b">
        <h2 className="text-base font-semibold text-gray-700">รายการทั้งหมด</h2>
      </div>
      {transactions.length === 0 ? (
        <p className="text-center text-gray-400 py-10 text-sm">ยังไม่มีรายการ</p>
      ) : (
        <ul className="divide-y">
          {transactions.map(t =>
            editing?.id === t.id ? (
              <li key={t.id} className="p-4">
                <TransactionForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
              </li>
            ) : (
              <li key={t.id} className="flex items-center px-5 py-3 hover:bg-gray-50 gap-3">
                <div className={`w-2 h-10 rounded-full ${t.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{t.category}</p>
                  <p className="text-xs text-gray-400">{t.description || '-'} · {fmtDate(t.date)}</p>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}฿{fmt(t.amount)}
                </span>
                <button onClick={() => setEditing({ ...t, date: t.date.split('T')[0] })}
                  className="text-xs text-blue-400 hover:text-blue-600 px-2">แก้ไข</button>
                <button onClick={() => onDelete(t.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-2">ลบ</button>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
