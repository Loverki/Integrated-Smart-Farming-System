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

// Response interceptor to handle account deactivation
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 403 Forbidden (account deactivated)
    if (error.response && error.response.status === 403) {
      const message = error.response.data?.message || "Your account has been deactivated.";
      
      // Check if it's a farmer or admin based on which token exists
      const isFarmer = localStorage.getItem("token");
      const isAdmin = localStorage.getItem("adminToken");
      
      if (isFarmer) {
        // Clear farmer data
        localStorage.removeItem("token");
        localStorage.removeItem("farmerId");
        localStorage.removeItem("farmerName");
        alert(message);
        window.location.href = "/login";
      } else if (isAdmin) {
        // Clear admin data
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminUsername");
        alert(message);
        window.location.href = "/admin-login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;
