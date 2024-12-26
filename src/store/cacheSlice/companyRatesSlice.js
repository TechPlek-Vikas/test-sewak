import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { USERTYPE } from 'constant';
import axiosServices from 'utils/axios';

// Async thunk to fetch company rates with userType
export const fetchCompanyRates = createAsyncThunk(
  'companyRates/fetchCompanyRates',
  async ({ companyId, userType }, { getState, rejectWithValue }) => {
    const { companyRates } = getState();

    // Check if data for the selected company is already cached
    if (companyRates.cache[companyId]) {
      return companyRates.cache[companyId];
    }

    // Determine API URL based on userType
    let apiUrl;
    if (userType === USERTYPE.iscabProvider) {
      apiUrl = `/company/unwind/rates?companyId=${companyId}`; // API for userType 1
    } else if (userType === USERTYPE.isVendor) {
      apiUrl = `/cabRateMaster/unwind/rate?companyID=${companyId}`; // API for userType 2
    } else {
      return rejectWithValue('Invalid userType');
    }

    // Fetch company rates from API
    try {
      const response = await axiosServices.get(apiUrl);
      return { companyId, rates: response.data.data || [] };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch company rates');
    }
  }
);

const companyRatesSlice = createSlice({
  name: 'companyRates',
  initialState: {
    cache: {}, // Stores cached company rates
    loading: false, // Tracks loading state
    error: null // Tracks error state
  },
  reducers: {
    clearCompanyRatesCache: (state) => {
      state.cache = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyRates.fulfilled, (state, action) => {
        state.loading = false;
        const { companyId, rates } = action.payload;
        state.cache[companyId] = rates; // Cache rates by companyId
      })
      .addCase(fetchCompanyRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCompanyRatesCache } = companyRatesSlice.actions;
export const companyRatesReducer = companyRatesSlice.reducer;
