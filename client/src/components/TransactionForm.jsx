import { useState } from 'react';

const INCOME_CATS = ['เงินเดือน', 'ธุรกิจ', 'ลงทุน', 'โบนัส', 'อื่นๆ'];
const EXPENSE_CATS = ['อาหาร', 'เดินทาง', 'ที่พัก', 'สุขภาพ', 'ช้อปปิ้ง', 'บันเทิง', 'ใบเสร็จ', 'อื่นๆ'];

const today = () => new Date().toISOString().split('T')[0];

export default function TransactionForm({ onSubmit, initial, onCancel }) {
  const [form, setForm] = useState(initial || { type: 'expense', amount: '', category: '', description: '', date: today() });

  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value, ...(e.target.name === 'type' ? { category: '' } : {}) }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) return;
    onSubmit({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow p-5 mb-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">{initial ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">ประเภท</label>
          <select name="type" value={form.type} onChange={handle} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="income">รายรับ</option>
            <option value="expense">รายจ่าย</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">จำนวนเงิน (฿)</label>
          <input type="number" name="amount" value={form.amount} onChange={handle} min="0.01" step="0.01" placeholder="0.00"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">หมวดหมู่</label>
          <select name="category" value={form.category} onChange={handle} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">เลือกหมวดหมู่</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">วันที่</label>
          <input type="date" name="date" value={form.date} onChange={handle}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <label className="text-xs text-gray-500 mb-1 block">หมายเหตุ</label>
          <input type="text" name="description" value={form.description} onChange={handle} placeholder="(ไม่บังคับ)"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium transition">
            {initial ? 'บันทึก' : 'เพิ่ม'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium transition">
              ยกเลิก
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
