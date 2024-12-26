import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

// Define the async thunk for fetching advance
export const fetchAdvances = createAsyncThunk(
  'advances/fetchAdvances',
  async ({ page, limit, startDate, endDate, filterbyUid }, { rejectWithValue }) => {
    try {
      // Advance Requests to CabProvider
      // const response = await axios.get(`/advance/requested/cab/provider?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&filterbyUid=${filterbyUid}`);
      const response = await axios.get(`/advance/requested/cab/provider`, {
        params: {
          page: page,
          limit: limit,
          startDate: startDate,
          endDate: endDate,
          filterbyUid: filterbyUid
        }
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Define the async thunk for fetching advance list for vendor and driver
export const fetchAdvanceList = createAsyncThunk(
  'advances/fetchAdvanceList',
  async ({ page, limit, startDate, endDate }, { rejectWithValue }) => {
    try {
      // Advance Requests to CabProvider
      const response = await axios.get(`/advance/my/list?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Initial state for the zone names
const initialState = {
  advances: [], // Empty array initially
  advancesList: [], // Empty array initially
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10,
    lastPageNo: 1
  },
  loading: false,
  error: null
};

// Create the slice for zone names
const advanceSlice = createSlice({
  name: 'advances',
  initialState,
  reducers: {
    reset: () => initialState, // Reset state to initial state
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdvances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvances.fulfilled, (state, action) => {
        state.advances = action.payload.data; // Handle empty result
        state.metaData = {
          totalCount: action.payload.totalCount || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          lastPageNo: Math.ceil(action.payload.totalCount / action.payload.limit) || 1
        };
        state.loading = false;
      })
      .addCase(fetchAdvances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchAdvanceList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvanceList.fulfilled, (state, action) => {
        console.log('action.payload', action.payload);

        state.advancesList = action.payload.data; // Handle empty result
        state.metaData = {
          totalCount: action.payload.totalCount || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          lastPageNo: Math.ceil(action.payload.totalCount / action.payload.limit) || 1
        };
        state.loading = false;
      })
      .addCase(fetchAdvanceList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError } = advanceSlice.actions;
export const advanceReducer = advanceSlice.reducer;
