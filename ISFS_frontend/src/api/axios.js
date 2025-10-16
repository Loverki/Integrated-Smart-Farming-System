import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
});

instance.interceptors.request.use((config) => {
  // Check for farmer token first, then admin token
  const farmerToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  
  const token = farmerToken || adminToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
