const express = require('express');
const multer = require('multer');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const GEMINI_MODEL = 'gemini-2.5-flash';

const RECEIPT_PROMPT = `คุณเป็น AI อ่านใบเสร็จ กรุณาอ่านรูปใบเสร็จนี้และดึงข้อมูล
ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "amount": ยอดรวมสุดท้าย (ตัวเลขเท่านั้น ไม่ใส่ , หรือ ฿),
  "description": ชื่อร้านหรือรายละเอียดสั้นๆ,
  "date": วันที่ในรูปแบบ YYYY-MM-DD (null ถ้าไม่พบ),
  "category": หมวดหมู่จาก [อาหาร, เดินทาง, ที่พัก, สุขภาพ, ช้อปปิ้ง, บันเทิง, ใบเสร็จ, อื่นๆ]
}`;

async function callGemini(prompt, imageBase64, mimeType) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: imageBase64 } },
      ],
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
  };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json();
  if (json.error) throw new Error(`Gemini: ${json.error.message}`);
  return json.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

router.post('/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'ไม่พบรูปภาพ' });
    const text = await callGemini(RECEIPT_PROMPT, req.file.buffer.toString('base64'), req.file.mimetype);
    const match = text.trim().match(/\{[\s\S]*\}/);
    if (!match) throw new Error('ไม่สามารถอ่านใบเสร็จได้ กรุณาลองใหม่');
    const data = JSON.parse(match[0]);
    res.json({ type: 'expense', ...data, amount: parseFloat(String(data.amount).replace(/,/g, '')) || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
