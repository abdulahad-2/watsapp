import api from "../axiosConfig";
import { auth as supaAuth } from "../lib/supabase";

export const auth = {
  // Register using Supabase
  async register(values) {
    const { email, password, name, picture, status } = values;
    const data = await supaAuth.signUp(email, password, { name, picture, status });
    // Build unified response shape { user: { ... , token } }
    const user = {
      id: data.user?.id,
      email: data.user?.email,
      name: data.user?.user_metadata?.name || name || data.user?.email?.split("@")[0],
      picture: data.user?.user_metadata?.picture || picture || undefined,
      status: data.user?.user_metadata?.status || status || "Hey there! I am using WhatsApp.",
      token: data.session?.access_token || undefined,
    };
    return { message: "register success.", user };
  },

  // Login using Supabase password auth
  async login(values) {
    const { email, password } = values;
    try {
      const data = await supaAuth.signIn(email, password);
      // Merge with any existing local profile to preserve custom name/picture/status
      const existingRaw = localStorage.getItem("user");
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const merged = {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name || existing.name || data.user?.email?.split("@")[0],
        picture: data.user?.user_metadata?.picture || existing.picture,
        status: data.user?.user_metadata?.status || existing.status || "Hey there! I am using WhatsApp.",
        token: data.session?.access_token,
      };
      return { message: "login success.", user: merged };
    } catch (err) {
      // Surface clearer error messages for UI
      const msg = err?.message || "Login failed";
      throw new Error(msg);
    }
  },

  async logout() {
    await supaAuth.signOut();
    localStorage.removeItem("user");
    return { message: "logout success" };
  },

  async refreshToken() {
    // Supabase auto-refreshes; expose session for callers if needed
    const session = await supaAuth.getUser();
    return session;
  },
};
