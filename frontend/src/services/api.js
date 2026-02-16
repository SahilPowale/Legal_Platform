// frontend/src/services/api.js

// Detect environment: Localhost or Production
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// CHANGE THIS URL AFTER DEPLOYING (e.g., to your Render/Vercel backend link)
export const BASE_URL = isLocal 
    ? "http://localhost:5000" 
    : "https://your-app-name.onrender.com"; 

// Generic API Caller
export const apiCall = async (endpoint, method = 'GET', body = null, token = null, isFile = false) => {
    try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        // If uploading a file, DO NOT set Content-Type (Browser sets it automatically with boundary)
        if (!isFile) headers['Content-Type'] = 'application/json';

        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers,
            body: isFile ? body : (body ? JSON.stringify(body) : null)
        });

        const data = await res.json();

        if (!res.ok) {
            console.error(`API Error [${endpoint}]:`, data.message || data);
            return null; // Return null so UI handles it gracefully
        }
        
        return data;
    } catch (error) {
        console.error("Network/Server Error:", error);
        return null;
    }
};