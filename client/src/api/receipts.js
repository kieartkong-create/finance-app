import axios from 'axios';

export const scanReceipt = (file) => {
  const form = new FormData();
  form.append('image', file);
  return axios.post('/api/receipts/scan', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
};
