import axios from "axios"

const api = axios.create({
    baseURL:"https://ecommerce-be-ig9u.onrender.com", 
    withCredentials: true
});

export default api;