import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { auth } from "../lib/supabase";

const initialState = {
  status: "",
  error: "",
  user: {
    id: "",
    name: "",
    email: "",
    picture: "",
    status: "",
    token: "",
  },
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (values, { rejectWithValue }) => {
    try {
      const { data, error } = await auth.signUp(
        values.email,
        values.password,
        {
          name: values.name,
          picture: values.picture || import.meta.env.VITE_DEFAULT_PICTURE,
          status: values.status || import.meta.env.VITE_DEFAULT_STATUS,
        }
      );
      
      if (error) throw error;
      
      return {
        user: {
          id: data.user.id,
          name: data.user.user_metadata.name,
          email: data.user.email,
          picture: data.user.user_metadata.picture,
          status: data.user.user_metadata.status,
          token: data.session?.access_token,
        }
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
      const { data, error } = await auth.signIn(values.email, values.password);
      
      if (error) throw error;
      
      return {
        user: {
          id: data.user.id,
          name: data.user.user_metadata.name,
          email: data.user.email,
          picture: data.user.user_metadata.picture,
          status: data.user.user_metadata.status,
          token: data.session?.access_token,
        }
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await auth.signOut();
      if (error) throw error;
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
    },
    changeStatus: (state, action) => {
      state.status = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.status = "succeeded";
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
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, changeStatus, setUser } = userSlice.actions;

export default userSlice.reducer;
