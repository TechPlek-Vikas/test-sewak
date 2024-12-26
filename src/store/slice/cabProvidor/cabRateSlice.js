/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios'; // Adjust the import path according to your project structure
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

const API_URL = {
  ALL: '',
  DETAILS: '',
  CREATE: {
    VENDOR: '/cabRateMaster/add',
    DRIVER: '/cabRateMasterDriver/add'
  },
  DELETE: '',
  UPDATE: ''
};

export const createRateMasterForVendor = createAsyncThunk('cabRateMaster/vendor/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.post(API_URL.CREATE.VENDOR, payload);
    return { status: response.status };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const createRateMasterForDriver = createAsyncThunk('cabRateMaster/driver/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.post(API_URL.CREATE.DRIVER, payload);
    return { status: response.status };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const initialState = {
  loading: false,
  error: null
};

const cabRateSlice = createSlice({
  name: 'cabRate',
  initialState,
  reducers: {
    reset: () => initialState, // Reset state to initial state on logout
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logoutActivity, handleReset(initialState));
  }
});

export const { reset, resetError } = cabRateSlice.actions;
export const cabRateReducer = cabRateSlice.reducer;
