import axios from "axios";
import { getToken, dispatch } from "./storeAccess";

// Create an axios instance with custom config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get the token using our store access utility
    const token = getToken();
    console.log("Current token:", token); // Debug log

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Request headers:", config.headers); // Debug log
    } else {
      console.log("No token found in store"); // Debug log
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          processQueue(err);
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/api/auth/refresh");
        const { user } = response.data;

        // Import the action creator dynamically to avoid circular dependency
        const { setUser } = await import("../features/userSlice");
        dispatch(setUser(user));

        originalRequest.headers.Authorization = `Bearer ${user.token}`;
        processQueue(null, user.token);
        return api(originalRequest);
      } catch (refreshError) {
        // Import the logout action creator dynamically
        const { logout } = await import("../features/userSlice");
        dispatch(logout());
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
