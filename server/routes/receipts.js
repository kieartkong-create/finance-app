const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const RECEIPT_PROMPT = `คุณเป็น AI อ่านใบเสร็จ กรุณาอ่านรูปใบเสร็จนี้และดึงข้อมูล
ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "amount": ยอดรวมสุดท้าย (ตัวเลขเท่านั้น ไม่ใส่ , หรือ ฿),
  "description": ชื่อร้านหรือรายละเอียดสั้นๆ,
  "date": วันที่ในรูปแบบ YYYY-MM-DD (null ถ้าไม่พบ),
  "category": หมวดหมู่จาก [อาหาร, เดินทาง, ที่พัก, สุขภาพ, ช้อปปิ้ง, บันเทิง, ใบเสร็จ, อื่นๆ]
}`;

router.post('/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'ไม่พบรูปภาพ' });
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      RECEIPT_PROMPT,
      { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } },
    ]);
    const text = result.response.text().trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('ไม่สามารถอ่านใบเสร็จได้');
    const data = JSON.parse(match[0]);
    res.json({ type: 'expense', ...data, amount: parseFloat(String(data.amount).replace(/,/g, '')) || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
