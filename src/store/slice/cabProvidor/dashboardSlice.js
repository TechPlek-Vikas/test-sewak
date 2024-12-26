import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios'; // Adjust the import path according to your project structure
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

const initialState = {
  data: null, // Empty array initially
  companyData: [],
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10,
    lastPageNo: 1
  },
  loading: false,
  error: null
};

export const fetchDashboardData = createAsyncThunk('dashboard/fetchDashboardData', async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.get('/dashboard/data', {
      params: {
        startDate: payload?.startDate,
        endDate: payload?.endDate
      }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        console.log(action.payload);
        state.loading = false;
        state.data = action.payload;
        state.companyData = action.payload?.companyWiseEarnings || [];
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

export const dashboardReducer = dashboardSlice.reducer;
