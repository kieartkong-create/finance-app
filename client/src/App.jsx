import { useState, useEffect, useCallback } from 'react';
import SummaryCards from './components/SummaryCards';
import MonthlyChart from './components/MonthlyChart';
import WeeklyChart from './components/WeeklyChart';
import CategoryChart from './components/CategoryChart';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import * as api from './api/transactions';
import './index.css';

const MONTHS_TH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

export default function App() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [tab, setTab] = useState('dashboard');

  const [summary, setSummary] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { year, month };
      const [s, t, w, c, yd] = await Promise.all([
        api.getSummary(params),
        api.getTransactions(params),
        api.getWeekly(params),
        api.getCategories(params),
        api.getTransactions({ year }),
      ]);
      setSummary(s);
      setTransactions(t);
      setWeekly(w);
      setCategories(c);

      const agg = [];
      for (let m = 1; m <= 12; m++) {
        ['income', 'expense'].forEach(type => {
          const total = yd
            .filter(r => new Date(r.date).getMonth() + 1 === m && r.type === type)
            .reduce((s, r) => s + parseFloat(r.amount), 0);
          if (total > 0) agg.push({ month: m, type, total });
        });
      }
      setYearlyData(agg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => { await api.createTransaction(data); load(); };
  const handleDelete = async (id) => { if (window.confirm('ลบรายการนี้?')) { await api.deleteTransaction(id); load(); } };
  const handleUpdate = async (id, data) => { await api.updateTransaction(id, data); load(); };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">💰 รายรับรายจ่ายส่วนตัว</h1>
          <div className="flex gap-2 items-center">
            <select value={month} onChange={e => setMonth(+e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              {MONTHS_TH.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(+e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-4 flex gap-1 pb-2">
          {[['dashboard', 'แดชบอร์ด'], ['transactions', 'รายการ']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === key ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading && <p className="text-center text-gray-400 text-sm mb-4">กำลังโหลด...</p>}

        {tab === 'dashboard' && (
          <>
            <SummaryCards summary={summary} />
            <MonthlyChart data={yearlyData} />
            <WeeklyChart data={weekly} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CategoryChart data={categories} type="income" />
              <CategoryChart data={categories} type="expense" />
            </div>
          </>
        )}

        {tab === 'transactions' && (
          <>
            <TransactionForm onSubmit={handleCreate} />
            <TransactionList transactions={transactions} onDelete={handleDelete} onUpdate={handleUpdate} />
          </>
        )}
      </main>
    </div>
  );
}
