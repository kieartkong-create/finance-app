import { useState, useEffect, useCallback } from 'react';
import OverallDashboard from './components/OverallDashboard';
import SummaryCards from './components/SummaryCards';
import MonthlyChart from './components/MonthlyChart';
import WeeklyChart from './components/WeeklyChart';
import CategoryChart from './components/CategoryChart';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ReceiptScanner from './components/ReceiptScanner';
import InvestmentScanner from './components/InvestmentScanner';
import InvestmentList from './components/InvestmentList';
import * as api from './api/transactions';
import { getInvestments, getInvestmentSummary } from './api/investments';
import './index.css';

const MONTHS_TH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

const TABS = [
  { key: 'overview', label: '🏠 ภาพรวม' },
  { key: 'dashboard', label: '📊 รายรับจ่าย' },
  { key: 'transactions', label: '📝 รายการ' },
  { key: 'receipt', label: '📷 สแกนใบเสร็จ' },
  { key: 'investment', label: '📈 การลงทุน' },
];

export default function App() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [tab, setTab] = useState('overview');

  const [summary, setSummary] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [investSummary, setInvestSummary] = useState({});
  const [loading, setLoading] = useState(false);

  const loadTransactions = useCallback(async () => {
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
      setSummary(s); setTransactions(t); setWeekly(w); setCategories(c);
      const agg = [];
      for (let m = 1; m <= 12; m++) {
        ['income', 'expense'].forEach(type => {
          const total = yd.filter(r => new Date(r.date).getMonth() + 1 === m && r.type === type)
            .reduce((s, r) => s + parseFloat(r.amount), 0);
          if (total > 0) agg.push({ month: m, type, total });
        });
      }
      setYearlyData(agg);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [year, month]);

  const loadInvestments = useCallback(async () => {
    try {
      const [inv, invSum] = await Promise.all([getInvestments(), getInvestmentSummary()]);
      setInvestments(inv);
      setInvestSummary(invSum);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);
  useEffect(() => { loadInvestments(); }, [loadInvestments]);

  const handleCreate = async (data) => { await api.createTransaction(data); loadTransactions(); };
  const handleDelete = async (id) => { if (window.confirm('ลบรายการนี้?')) { await api.deleteTransaction(id); loadTransactions(); } };
  const handleUpdate = async (id, data) => { await api.updateTransaction(id, data); loadTransactions(); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">💰 การเงินส่วนตัว</h1>
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
        <nav className="max-w-5xl mx-auto px-4 flex gap-1 pb-2 overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${tab === key ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading && <p className="text-center text-gray-400 text-sm mb-4">กำลังโหลด...</p>}

        {tab === 'overview' && (
          <OverallDashboard summary={summary} investSummary={investSummary} />
        )}

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

        {tab === 'receipt' && (
          <ReceiptScanner onSaved={loadTransactions} />
        )}

        {tab === 'investment' && (
          <>
            <InvestmentScanner onSaved={loadInvestments} />
            <InvestmentList investments={investments} onRefresh={loadInvestments} />
          </>
        )}
      </main>
    </div>
  );
}
