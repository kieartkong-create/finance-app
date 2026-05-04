const express = require('express');
const multer = require('multer');
const supabase = require('../db/supabase');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const GEMINI_MODEL = 'gemini-2.5-flash';

async function callGemini(prompt, imageBase64, mimeType) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
  };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json();
  if (json.error) throw new Error(`Gemini: ${json.error.message}`);
  return json.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

const INVEST_PROMPT = `คุณเป็น AI อ่านข้อมูลการลงทุน กรุณาอ่านรูป screenshot นี้ (เช่น แอปกองทุน, หุ้น, คริปโต)
แล้วดึงข้อมูลการลงทุนทั้งหมดที่เห็น ตอบเป็น JSON เท่านั้น:
{
  "items": [
    {
      "name": ชื่อกองทุน/หุ้น/สินทรัพย์,
      "type": ประเภทจาก [กองทุน, หุ้น, คริปโต, ทองคำ, อื่นๆ],
      "cost": ต้นทุนรวม (ตัวเลข),
      "current_value": มูลค่าปัจจุบัน (ตัวเลข),
      "note": หมายเหตุเพิ่มเติม (null ถ้าไม่มี)
    }
  ],
  "summary": สรุปภาพรวมจากรูป (string สั้นๆ)
}
ถ้าเห็นหลายรายการให้ใส่ทุกรายการใน items ถ้าไม่พบตัวเลขชัดเจนให้ประมาณจากที่เห็น`;

// GET all investments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('investments').select('*').order('scanned_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET portfolio summary
router.get('/summary', async (req, res) => {
  try {
    const { data, error } = await supabase.from('investments').select('cost,current_value,type');
    if (error) throw error;
    const summary = { totalCost: 0, totalValue: 0, byType: {} };
    data.forEach(r => {
      summary.totalCost += parseFloat(r.cost);
      summary.totalValue += parseFloat(r.current_value);
      if (!summary.byType[r.type]) summary.byType[r.type] = { cost: 0, value: 0 };
      summary.byType[r.type].cost += parseFloat(r.cost);
      summary.byType[r.type].value += parseFloat(r.current_value);
    });
    summary.totalProfitLoss = summary.totalValue - summary.totalCost;
    summary.totalReturnPercent = summary.totalCost > 0
      ? ((summary.totalProfitLoss / summary.totalCost) * 100).toFixed(2)
      : 0;
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST scan investment screenshot
router.post('/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'ไม่พบรูปภาพ' });
    const text = await callGemini(INVEST_PROMPT, req.file.buffer.toString('base64'), req.file.mimetype);
    const match = text.trim().match(/\{[\s\S]*\}/);
    if (!match) throw new Error('ไม่สามารถอ่านข้อมูลการลงทุนได้');
    const parsed = JSON.parse(match[0]);
    const clean = n => parseFloat(String(n || 0).replace(/,/g, '')) || 0;
    const items = (parsed.items || []).map(i => ({
      name: i.name || 'ไม่ทราบชื่อ',
      type: i.type || 'อื่นๆ',
      cost: clean(i.cost),
      current_value: clean(i.current_value),
      note: i.note || null,
    }));
    res.json({ items, summary: parsed.summary || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save investments (batch)
router.post('/save', async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'ไม่มีข้อมูลที่จะบันทึก' });
    const { data, error } = await supabase.from('investments').insert(items).select();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update current price
router.put('/:id', async (req, res) => {
  try {
    const { name, type, cost, current_value, note } = req.body;
    const { data, error } = await supabase.from('investments')
      .update({ name, type, cost, current_value, note, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE investment
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('investments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ deleted: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
