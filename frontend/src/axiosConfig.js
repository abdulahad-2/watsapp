import axios from "axios";
import { store } from "./app/store";
import { logout, setUser } from "./features/userSlice";
import { supabase } from "./lib/supabase";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_ENDPOINT,
  withCredentials: true,
});

// Request queue for handling token refresh
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

api.interceptors.request.use(
  async (config) => {
    // 1) Prefer Supabase session access token
    try {
      const { data } = await supabase.auth.getSession();
      const supaToken = data?.session?.access_token;
      if (supaToken) {
        config.headers.Authorization = `Bearer ${supaToken}`;
        return config;
      }
    } catch (e) {
      console.warn("Supabase getSession failed:", e?.message || e);
    }

    // 2) Fallback to Redux/localStorage token for backward compatibility
    const state = store.getState();
    let token = state.user?.user?.token;

    if (!token) {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          token = userData.token;
        }
      } catch (error) {
        console.error("Error reading token from localStorage:", error);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request if a refresh is already in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/auth/refreshtoken");
        const { user } = response.data;

        store.dispatch(setUser(user));

        processQueue(null, user.token);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
