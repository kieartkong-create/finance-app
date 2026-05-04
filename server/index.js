require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const transactionsRouter = require('./routes/transactions');
const receiptsRouter = require('./routes/receipts');
const investmentsRouter = require('./routes/investments');

const app = express();
const PORT = process.env.PORT || 10000;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({ origin: isProd ? false : '*' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/transactions', transactionsRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/investments', investmentsRouter);

if (isProd) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
