import { useState, useRef } from 'react';
import { scanReceipt } from '../api/receipts';
import { createTransaction } from '../api/transactions';

const today = () => new Date().toISOString().split('T')[0];
const CATS = ['อาหาร', 'เดินทาง', 'ที่พัก', 'สุขภาพ', 'ช้อปปิ้ง', 'บันเทิง', 'ใบเสร็จ', 'อื่นๆ'];

export default function ReceiptScanner({ onSaved }) {
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setDone(false);
    setScanning(true);
    try {
      const data = await scanReceipt(file);
      setResult({ ...data, date: data.date || today() });
    } catch (e) {
      alert('อ่านใบเสร็จไม่ได้: ' + e.message);
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await createTransaction(result);
      setDone(true);
      onSaved?.();
    } catch (e) {
      alert('บันทึกไม่สำเร็จ: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => { setPreview(null); setResult(null); setDone(false); };
  const set = (k, v) => setResult(r => ({ ...r, [k]: v }));

  return (
    <div className="bg-white rounded-2xl shadow p-5 mb-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">📷 สแกนใบเสร็จด้วย AI</h2>

      {!preview ? (
        <div
          onClick={() => inputRef.current.click()}
          className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 transition"
        >
          <p className="text-4xl mb-2">📸</p>
          <p className="text-gray-500 text-sm">แตะเพื่อถ่ายภาพหรือเลือกรูปใบเสร็จ</p>
          <p className="text-gray-400 text-xs mt-1">JPG, PNG, HEIC</p>
          <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3">
            <img src={preview} alt="receipt" className="w-28 h-36 object-cover rounded-lg border flex-shrink-0" />
            <div className="flex-1">
              {scanning && (
                <div className="flex items-center gap-2 text-blue-500 mt-4">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <span className="text-sm">Gemini กำลังอ่านใบเสร็จ...</span>
                </div>
              )}
              {done && (
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-green-600 font-medium text-sm">✅ บันทึกสำเร็จแล้ว!</p>
                  <button onClick={reset} className="text-sm text-blue-500 hover:underline">+ สแกนใบเสร็จใหม่</button>
                </div>
              )}
              {result && !done && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-xs text-gray-400">จำนวนเงิน (฿)</label>
                    <input type="number" value={result.amount} onChange={e => set('amount', parseFloat(e.target.value))}
                      className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">วันที่</label>
                    <input type="date" value={result.date || today()} onChange={e => set('date', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">หมวดหมู่</label>
                    <select value={result.category} onChange={e => set('category', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">หมายเหตุ</label>
                    <input type="text" value={result.description || ''} onChange={e => set('description', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {result && !done && (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-50">
                {saving ? 'กำลังบันทึก...' : '💾 บันทึกรายจ่าย'}
              </button>
              <button onClick={reset} className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg py-2 text-sm transition">
                ยกเลิก
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
