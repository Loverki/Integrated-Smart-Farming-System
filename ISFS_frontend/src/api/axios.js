import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
});

instance.interceptors.request.use((config) => {
  // Determine which token to use based on the request URL
  const isAdminRoute = config.url && config.url.startsWith('/admin');
  
  const farmerToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  
  // Use admin token for admin routes, farmer token for others
  const token = isAdminRoute ? adminToken : (farmerToken || adminToken);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor to handle authentication errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data || {};
    const message = data.message || "An error occurred";
    
    // Check if it's a farmer or admin based on which token exists
    const isFarmer = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("adminToken");
    
    // Handle 401 Unauthorized (invalid token, user deleted, token expired)
    if (status === 401 && data.requiresLogin) {
      console.log("🔐 Authentication required - clearing local storage");
      
      if (isFarmer) {
        // Clear ALL farmer data from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("farmerId");
        localStorage.removeItem("farmerName");
        
        // Show appropriate message
        if (data.userDeleted) {
          alert("Your account no longer exists. Please register again.");
        } else if (data.tokenExpired) {
          alert("Your session has expired. Please login again.");
        } else {
          alert(message);
        }
        
        // Redirect to login
        window.location.href = "/";
      } else if (isAdmin) {
        // Clear ALL admin data from localStorage
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminUsername");
        localStorage.removeItem("adminName");
        
        // Show appropriate message
        if (data.userDeleted) {
          alert("Your admin account no longer exists.");
        } else if (data.tokenExpired) {
          alert("Your session has expired. Please login again.");
        } else {
          alert(message);
        }
        
        // Redirect to admin login
        window.location.href = "/";
      }
    }
    
    // Handle 403 Forbidden (account deactivated)
    if (status === 403 && data.requiresLogin) {
      console.log("🚫 Account inactive - clearing local storage");
      
      if (isFarmer) {
        // Clear farmer data
        localStorage.removeItem("token");
        localStorage.removeItem("farmerId");
        localStorage.removeItem("farmerName");
        alert(message);
        window.location.href = "/";
      } else if (isAdmin) {
        // Clear admin data
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminUsername");
        localStorage.removeItem("adminName");
        alert(message);
        window.location.href = "/";
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;
