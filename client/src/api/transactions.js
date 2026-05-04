import axios from 'axios';

const BASE = '/api/transactions';

export const getTransactions = (params) => axios.get(BASE, { params }).then(r => r.data);
export const getSummary = (params) => axios.get(`${BASE}/summary`, { params }).then(r => r.data);
export const getWeekly = (params) => axios.get(`${BASE}/weekly`, { params }).then(r => r.data);
export const getCategories = (params) => axios.get(`${BASE}/categories`, { params }).then(r => r.data);
export const createTransaction = (data) => axios.post(BASE, data).then(r => r.data);
export const updateTransaction = (id, data) => axios.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteTransaction = (id) => axios.delete(`${BASE}/${id}`).then(r => r.data);
