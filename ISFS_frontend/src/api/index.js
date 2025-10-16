import axios from "axios";

const API_URL = "http://localhost:5000/api"; // backend URL

// Farmer APIs
export const getFarmers = () => axios.get(`${API_URL}/farmers`);
export const addFarmer = (farmer) => axios.post(`${API_URL}/farmers`, farmer);

// Later: Farms, Crops, Labour, Fertilizer, Sales
