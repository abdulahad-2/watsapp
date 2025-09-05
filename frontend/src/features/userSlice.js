import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { auth } from "../services/auth.service";
import api from "../lib/axiosConfig";

// Load user from localStorage if available
const loadUserFromStorage = () => {
  try {
    const savedUser = localStorage.getItem('user');
    console.log('Loading user from localStorage:', savedUser);
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Ensure we have all required fields and mirror _id
      const id = userData.id || userData._id || "";
      return {
        id,
        _id: userData._id || id,
        name: userData.name || "",
        email: userData.email || "",
        picture: userData.picture || "",
        status: userData.status || "",
        token: userData.token || "",
      };
    }
    return {
      id: "",
      _id: "",
      name: "",
      email: "",
      picture: "",
      status: "",
      token: "",
    };
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    return {
      id: "",
      _id: "",
      name: "",
      email: "",
      picture: "",
      status: "",
      token: "",
    };
  }
};

const initialState = {
  status: "",
  error: "",
  user: loadUserFromStorage(),
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (values, { rejectWithValue }) => {
    try {
      const response = await auth.register({
        ...values,
        picture: values.picture || process.env.REACT_APP_DEFAULT_PICTURE,
        status: values.status || process.env.REACT_APP_DEFAULT_STATUS,
      });
      console.log("Register response:", response);

      if (!response.user?.token) {
        throw new Error("No token received from server");
      }

      // Overlay local profile fields to persist client-side customizations
      let savedLocal = null;
      try {
        savedLocal = JSON.parse(localStorage.getItem('user')) || null;
      } catch (_) {}

      const id = response.user.id || response.user._id || "";
      const mergedName = savedLocal?.name || response.user.name;
      const mergedPicture = savedLocal?.picture || response.user.picture;
      const mergedStatus = savedLocal?.status || response.user.status;
      return {
        user: {
          id,
          _id: response.user._id || id,
          name: mergedName,
          email: response.user.email,
          picture: mergedPicture,
          status: mergedStatus,
          token: response.user.token,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (values, { rejectWithValue }) => {
    try {
      const response = await auth.login(values);
      console.log("Auth response:", response);

      if (!response.user?.token) {
        throw new Error("No token received from server");
      }

      const id = response.user.id || response.user._id || "";
      return {
        user: {
          id,
          _id: response.user._id || id,
          name: response.user.name,
          email: response.user.email,
          picture: response.user.picture,
          status: response.user.status,
          token: response.user.token,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Persist profile to backend so changes survive login
export const saveProfile = createAsyncThunk(
  "user/save_profile",
  async (values, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const current = state.user?.user || {};
      const payload = {
        email: current.email,
        name: values.name ?? current.name,
        picture: values.picture ?? current.picture,
        status: values.status ?? current.status,
      };
      const { data } = await api.put("/users/profile", payload);
      // Backend returns { message, user }
      const updated = data?.user || payload;
      const id = current.id || current._id || updated._id || updated.id || "";
      return {
        user: {
          id,
          _id: current._id || id,
          name: updated.name,
          email: current.email,
          picture: updated.picture,
          status: updated.status,
          token: current.token,
        },
      };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.error || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await auth.logout();
      return {};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.status = "";
      state.error = "";
      state.user = {
        id: "",
        name: "",
        email: "",
        picture: "",
        status: "",
        token: "",
      };
      localStorage.removeItem('user');
    },
    changeStatus: (state, action) => {
      state.status = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.status = "succeeded";
      console.log('Saving user to localStorage:', action.payload);
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      console.log('Updating user profile in localStorage:', state.user);
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
  extraReducers(builder) {
    builder
      .addCase(registerUser.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        state.user = action.payload.user;
        console.log('Register success - saving user:', action.payload.user);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        state.user = action.payload.user;
        console.log('Login success - saving user:', action.payload.user);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.status = "";
        state.error = "";
        state.user = {
          id: "",
          name: "",
          email: "",
          picture: "",
          status: "",
          token: "",
        };
        localStorage.removeItem('user');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(saveProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, changeStatus, setUser, updateUserProfile } = userSlice.actions;

export default userSlice.reducer;
