import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { auth } from "../services/auth.service";

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
      const response = await auth.register({
        ...values,
        picture: values.picture || process.env.REACT_APP_DEFAULT_PICTURE,
        status: values.status || process.env.REACT_APP_DEFAULT_STATUS,
      });
      console.log("Register response:", response);

      if (!response.token) {
        throw new Error("No token received from server");
      }

      return {
        user: {
          id: response.user._id,
          name: response.user.name,
          email: response.user.email,
          picture: response.user.picture,
          status: response.user.status,
          token: response.token,
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

      if (!response.token) {
        throw new Error("No token received from server");
      }

      return {
        user: {
          id: response.user._id,
          name: response.user.name,
          email: response.user.email,
          picture: response.user.picture,
          status: response.user.status,
          token: response.token,
        },
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
