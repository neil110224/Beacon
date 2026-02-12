import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Assuming you have an API service. Replace with your actual API call.
// Example: import api from '../services/api'; // Or however you import it
// If you don't have it, create a simple one, e.g.:
// const api = { updateProfile: (data) => fetch('/api/update-profile', { method: 'POST', body: data }) };

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      // Prepare FormData if a file is included (for profile picture upload)
      const formData = new FormData();
      Object.keys(profileData).forEach((key) => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key]);
        }
      });

      // Make the API call. Adjust based on your API service.
      // Assuming api.updateProfile returns a promise with the updated user data.
      const response = await api.updateProfile(formData); // Or your API method
      return response.data; // Expected to return the updated user object
    } catch (error) {
      return rejectWithValue(error.response?.data || "Update failed");
    }
  },
);

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;

      state.user = {
        ...user,
        access_permissions: user.role?.access_permissions || [],
        role_name: user.role?.name || null,
      };
      state.token = token;
      state.isAuthenticated = true;
      // Optionally save to localStorage here if needed, but initialState loads it
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
          access_permissions:
            action.payload.role?.access_permissions ||
            state.user.access_permissions,
        };
        // Save updated user to localStorage
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        // Update the user in state with the response data
        state.user = {
          ...state.user,
          ...action.payload,
          access_permissions:
            action.payload.role?.access_permissions ||
            state.user?.access_permissions ||
            [],
        };
        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        // Handle error if needed (e.g., show a toast or log)
        console.error("Profile update failed:", action.payload);
      });
  },
});

export const { setCredentials, setToken, logout, updateUser, resetAuth } =
  authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserPermissions = (state) =>
  state.auth?.user?.access_permissions || [];
export const selectHasPermission = (permission) => (state) => {
  const permissions = state.auth?.user?.access_permissions || [];
  return permissions.includes(permission);
};
