import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { USERTYPE } from 'constant';
import axios from 'utils/axios'; // Adjust the import path according to your project structure
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

const API_URL = {
  REGISTER: '/user/register',
  [USERTYPE.superAdmin]: {
    GETALL: '/cabProvider/all'
  },
  [USERTYPE.iscabProvider]: {
    GETALL: '/cabProviderUser/all',
    SPECIFIC_DETAILS: {
      CREATE: '/cabProviderUser/add'
    }
  },
  [USERTYPE.isVendor]: {
    GETALL: '/vendorUser/list',
    SPECIFIC_DETAILS: {
      CREATE: '/vendorUser/add'
    }
  },
  [USERTYPE.iscabProviderUser]: {
    GETALL: '/cabProviderUser/all',
    SPECIFIC_DETAILS: {
      CREATE: '/cabProviderUser/add'
    }
  }
};

// Define the async thunk for fetching users
// export const fetchUsers = createAsyncThunk('users/fetchUsers', async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
//   try {
//     // Replace with your actual endpoint
//     const response = await axios.get(`/users?page=${page}&limit=${limit}`);
//     return response.data.data; // This should match the shape of the data you expect
//   } catch (error) {
//     return rejectWithValue(error.response ? error.response.data : error.message);
//   }
// });

export const fetchUsers = createAsyncThunk('users/fetchAll', async ({ page = 1, limit = 10 }, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const userType = state.auth.userType;

    const response = await axios.get(API_URL[userType].GETALL, {
      params: {
        page,
        limit
      }
    });
    return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Define the async thunk for adding a user
export const addUser = createAsyncThunk('users/addUser', async (user, { rejectWithValue }) => {
  try {
    // Replace with your actual endpoint
    const response = await axios.post('/users', user);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Update user basic details
export const updateUserBasicDetails = createAsyncThunk('users/updateUserBasicDetails', async (pyload, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/cabProvider/update/my/basic/details`, pyload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return { success: response.data.success, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Update specific basic details
export const updateUserSpecificDetails = createAsyncThunk('users/updateUserSpecificDetails', async (pyload, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/cabProvider/update/my/details`, pyload);
    return { success: response.data.success, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Define the async thunk for deleting a user
export const deleteUser = createAsyncThunk('users/deleteUser', async (id, { rejectWithValue }) => {
  try {
    // Replace with your actual endpoint
    await axios.delete(`/users/${id}`);
    return id; // Return the id for deletion
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// register user
export const registerUser = createAsyncThunk('users/registerUser', async (user, { rejectWithValue }) => {
  try {
    // Replace with your actual endpoint
    const response = await axios.post('/user/register', user, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    // return response;
    return { status: response.status, data: response?.data?.data };
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Add Specific User Details
export const addSpecificUserDetails = createAsyncThunk('users/addSpecificUserDetails', async (payload, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const userType = state.auth.userType;
    const response = await axios.post(API_URL[userType].SPECIFIC_DETAILS.CREATE, payload);
    return { status: response.status };
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Get All Permissions of a single user
export const fetchUserPermissions = createAsyncThunk('users/fetchUserPermissions', async (uid, { rejectWithValue }) => {
  try {
    // Send a GET request to fetch details of a specific user by userId
    const response = await axios.get(`/user/all/permission?uid=${uid}`);
    return response.data.data; // Ensure this matches the shape of the data you expect
  } catch (error) {
    // Return a rejected value with error details
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const addSpecificUserDetailsCabProvider = createAsyncThunk(
  'users/addSpecificUserDetailsCabProvider',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/cabProvider/add/details`, payload);
      return { status: response.status };
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const initialState = {
  users: [], // Empty array initially
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10,
    lastPageNo: 1
  },
  loading: false,
  error: null,
  userDetails: null
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    // clear User Details
    clearUserDetails: (state) => {
      state.userDetails = null;
    },
    reset: () => initialState, // Reset state to initial state on logout
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.result || []; // Handle empty result
        state.metaData = {
          totalCount: action.payload.total || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          lastPageNo: Math.ceil(action.payload.total / action.payload.limit) || 1
        };
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
        state.loading = false;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateUserBasicDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserBasicDetails.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateUserBasicDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError, addUserDetails, clearUserDetails } = userSlice.actions;
export const userReducer = userSlice.reducer;
