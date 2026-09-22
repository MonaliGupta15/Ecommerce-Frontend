import axios from "axios";

const defaultBaseUrl = import.meta.env.PROD
  ? "https://ecommerce-be-0frn.onrender.com/api"
  : "http://localhost:8080/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseUrl,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;