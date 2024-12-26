import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { USERTYPE } from 'constant';
import axios from 'utils/axios'; // Adjust the import path according to your project structure
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

const initialState = {
  roles: [], // Empty array initially
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10,
    lastPageNo: 1
  },
  loading: false,
  error: null
};

const API = {
  [USERTYPE.iscabProvider]: {
    CREATE: '/cabProvidersRole2/add',
    UPDATE: '/cabProvidersRole2/edit/permissions',
    DELETE: '/cabProvidersRole2/delete?roleId=',
    DETAILS: '/cabProvidersRole2/all/permission?roleId=',
    ALL: '/cabProvidersRole2/all'
  },
  [USERTYPE.isVendor]: {
    CREATE: '/vendorsRole2/add',
    UPDATE: '/vendorsRole2/edit/permissions',
    DELETE: '/vendorsRole2/delete?roleId=',
    DETAILS: '/vendorsRole2/all/permission?roleId=',
    ALL: '/vendorsRole2/all'
  }
};

export const fetchAllRoles = createAsyncThunk('roles/fetchAll', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const userType = state.auth.userType;
    const response = await axios.get(API[userType].ALL);
    return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const fetchRoleDetails = createAsyncThunk('roles/fetchRoleDetails', async (id, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const userType = state.auth.userType;
    const response = await axios.get(API[userType].DETAILS + id);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const addRole = createAsyncThunk('roles/addRole', async (payload, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const userType = state.auth.userType;
    const response = await axios.post(API[userType].CREATE, payload);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const updateRole = createAsyncThunk('roles/updateRole', async (payload, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const userType = state.auth.userType;
    const response = await axios.put(API[userType].UPDATE, payload);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const deleteRole = createAsyncThunk('roles/deleteRole', async (id, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const userType = state.auth.userType;
    const response = await axios.delete(API[userType].DELETE + id);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    reset: () => initialState, // Reset state to initial state on logout
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRoles.fulfilled, (state, action) => {
        state.roles = action.payload || []; // Handle empty result
        state.loading = false;
      })
      .addCase(fetchAllRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError } = roleSlice.actions;
export const roleReducer = roleSlice.reducer;
