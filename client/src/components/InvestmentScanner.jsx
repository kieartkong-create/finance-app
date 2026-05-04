import { useState, useRef } from 'react';
import { scanInvestment, saveInvestments } from '../api/investments';

const TYPES = ['กองทุน', 'หุ้น', 'คริปโต', 'ทองคำ', 'อื่นๆ'];
const fmt = (n) => parseFloat(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

export default function InvestmentScanner({ onSaved }) {
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setItems([]); setDone(false); setScanning(true);
    try {
      const data = await scanInvestment(file);
      setItems(data.items || []);
      setSummary(data.summary || '');
    } catch (e) {
      alert('อ่านข้อมูลการลงทุนไม่ได้: ' + e.message);
    } finally {
      setScanning(false);
    }
  };

  const updateItem = (i, k, v) => setItems(arr => arr.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const removeItem = (i) => setItems(arr => arr.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveInvestments(items.map(it => ({
        ...it,
        cost: parseFloat(it.cost) || 0,
        current_value: parseFloat(it.current_value) || 0,
      })));
      setDone(true);
      onSaved?.();
    } catch (e) {
      alert('บันทึกไม่สำเร็จ: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => { setPreview(null); setItems([]); setDone(false); setSummary(''); };

  return (
    <div className="bg-white rounded-2xl shadow p-5 mb-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">📈 สแกนพอร์ตการลงทุนด้วย AI</h2>
      <p className="text-xs text-gray-400 mb-4">อัพโหลด screenshot จากแอปกองทุน / หุ้น / คริปโต → AI จะอ่านและสรุปผลตอบแทนให้</p>

      {!preview ? (
        <div onClick={() => inputRef.current.click()}
          className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center cursor-pointer hover:bg-green-50 transition">
          <p className="text-4xl mb-2">📊</p>
          <p className="text-gray-500 text-sm">แตะเพื่อเลือก screenshot พอร์ตการลงทุน</p>
          <p className="text-gray-400 text-xs mt-1">รองรับ K-My Funds, Jitta, Bitkub, iBanking ฯลฯ</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div>
          <div className="flex gap-3 mb-4">
            <img src={preview} alt="investment" className="w-24 h-32 object-cover rounded-lg border flex-shrink-0" />
            <div className="flex-1">
              {scanning && (
                <div className="flex items-center gap-2 text-green-500 mt-6">
                  <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full" />
                  <span className="text-sm">Gemini กำลังอ่านพอร์ตการลงทุน...</span>
                </div>
              )}
              {summary && <p className="text-xs text-gray-500 mt-2 italic">"{summary}"</p>}
              {done && (
                <div className="mt-4">
                  <p className="text-green-600 font-medium text-sm">✅ บันทึกสำเร็จ {items.length} รายการ!</p>
                  <button onClick={reset} className="mt-2 text-sm text-blue-500 hover:underline">+ สแกนใหม่</button>
                </div>
              )}
            </div>
          </div>

          {items.length > 0 && !done && (
            <div className="space-y-3 mb-4">
              {items.map((it, i) => {
                const pl = (parseFloat(it.current_value) || 0) - (parseFloat(it.cost) || 0);
                const pct = parseFloat(it.cost) > 0 ? ((pl / parseFloat(it.cost)) * 100).toFixed(2) : 0;
                return (
                  <div key={i} className="border rounded-xl p-3 bg-gray-50">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="text-xs text-gray-400">ชื่อ</label>
                        <input value={it.name} onChange={e => updateItem(i, 'name', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-300" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">ประเภท</label>
                        <select value={it.type} onChange={e => updateItem(i, 'type', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-300">
                          {TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">ต้นทุน (฿)</label>
                        <input type="number" value={it.cost} onChange={e => updateItem(i, 'cost', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-300" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">มูลค่าปัจจุบัน (฿)</label>
                        <input type="number" value={it.current_value} onChange={e => updateItem(i, 'current_value', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-300" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${pl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {pl >= 0 ? '+' : ''}฿{fmt(pl)} ({pct}%)
                      </span>
                      <button onClick={() => removeItem(i)} className="text-xs text-red-400 hover:text-red-600">ลบ</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {items.length > 0 && !done && (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-50">
                {saving ? 'กำลังบันทึก...' : `💾 บันทึก ${items.length} รายการ`}
              </button>
              <button onClick={reset} className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg py-2 text-sm">ยกเลิก</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
