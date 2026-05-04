import { useState } from 'react';
import { updateInvestment, deleteInvestment } from '../api/investments';

const fmt = (n) => parseFloat(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const TYPE_ICONS = { กองทุน: '📦', หุ้น: '📈', คริปโต: '🪙', ทองคำ: '🥇', อื่นๆ: '💼' };

export default function InvestmentList({ investments, onRefresh }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startEdit = (inv) => { setEditing(inv.id); setForm({ ...inv }); };
  const cancelEdit = () => setEditing(null);

  const handleUpdate = async () => {
    try {
      await updateInvestment(editing, form);
      setEditing(null);
      onRefresh();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ลบรายการนี้?')) return;
    await deleteInvestment(id);
    onRefresh();
  };

  if (!investments.length) return (
    <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400 text-sm">ยังไม่มีข้อมูลการลงทุน</div>
  );

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="px-5 py-4 border-b"><h2 className="text-base font-semibold text-gray-700">รายการลงทุนทั้งหมด</h2></div>
      <ul className="divide-y">
        {investments.map(inv => {
          const pl = parseFloat(inv.profit_loss || 0);
          const pct = parseFloat(inv.return_percent || 0);
          return editing === inv.id ? (
            <li key={inv.id} className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[['name','ชื่อ','text'],['cost','ต้นทุน (฿)','number'],['current_value','มูลค่าปัจจุบัน (฿)','number']].map(([k,label,type]) => (
                  <div key={k}>
                    <label className="text-xs text-gray-400">{label}</label>
                    <input type={type} value={form[k] || ''} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}
                      className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-gray-400">หมายเหตุ</label>
                  <input value={form.note || ''} onChange={e => setForm(f => ({...f,note:e.target.value}))}
                    className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleUpdate} className="flex-1 bg-blue-500 text-white rounded-lg py-1.5 text-sm">บันทึก</button>
                <button onClick={cancelEdit} className="flex-1 bg-gray-100 text-gray-600 rounded-lg py-1.5 text-sm">ยกเลิก</button>
              </div>
            </li>
          ) : (
            <li key={inv.id} className="flex items-center px-5 py-3 hover:bg-gray-50 gap-3">
              <span className="text-2xl">{TYPE_ICONS[inv.type] || '💼'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{inv.name}</p>
                <p className="text-xs text-gray-400">{inv.type} · ต้นทุน ฿{fmt(inv.cost)}</p>
              </div>
              <div className="text-right mr-2">
                <p className="text-sm font-semibold text-gray-700">฿{fmt(inv.current_value)}</p>
                <p className={`text-xs font-medium ${pl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {pl >= 0 ? '+' : ''}฿{fmt(pl)} ({pl >= 0 ? '+' : ''}{parseFloat(pct).toFixed(2)}%)
                </p>
              </div>
              <button onClick={() => startEdit(inv)} className="text-xs text-blue-400 hover:text-blue-600 px-1">แก้ไข</button>
              <button onClick={() => handleDelete(inv.id)} className="text-xs text-red-400 hover:text-red-600 px-1">ลบ</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
