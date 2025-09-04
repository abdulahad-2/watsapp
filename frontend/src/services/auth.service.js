import api from "../axiosConfig";

export const auth = {
  async register(values) {
    const { data } = await api.post("/auth/register", values);
    return data;
  },

  async login(values) {
    const { data } = await api.post("/auth/login", values);
    return data;
  },

  async logout() {
    const { data } = await api.post("/auth/logout");
    // Clear any stored tokens
    localStorage.removeItem("user");
    return data;
  },

  async refreshToken() {
    const { data } = await api.post("/auth/refreshtoken");
    return data;
  },
};
