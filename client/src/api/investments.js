import axios from 'axios';

const BASE = '/api/investments';
export const getInvestments = () => axios.get(BASE).then(r => r.data);
export const getInvestmentSummary = () => axios.get(`${BASE}/summary`).then(r => r.data);
export const scanInvestment = (file) => {
  const form = new FormData();
  form.append('image', file);
  return axios.post(`${BASE}/scan`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
};
export const saveInvestments = (items) => axios.post(`${BASE}/save`, { items }).then(r => r.data);
export const updateInvestment = (id, data) => axios.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteInvestment = (id) => axios.delete(`${BASE}/${id}`).then(r => r.data);
