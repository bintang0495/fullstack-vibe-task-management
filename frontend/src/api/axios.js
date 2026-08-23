import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const baseURL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true // send cookies
});

export default api;
