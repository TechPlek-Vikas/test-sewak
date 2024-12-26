import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosServices from 'utils/axios';

// Async thunk to fetch vehicle types with dynamic cache key
export const fetchVehicleTypes = createAsyncThunk('vehicleType/fetchVehicleTypes', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosServices.get('/vehicleType');
    const vehicles = response.data.data || [];
    return vehicles.map((item) => ({
      _id: item._id,
      vehicleTypeName: item.vehicleTypeName
    }));
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicle types');
  }
});


const vehicleTypeSlice = createSlice({
  name: 'vehicleType',
  initialState: {
    cache: { default: [] },
    loading: false,
    initialized: false, // Added initialized state
    error: null
  },
  reducers: {
    resetState(state) {
      state.cache = { default: [] };
      state.loading = false;
      state.initialized = false; // Reset initialized
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicleTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true; // Mark as initialized on success
        state.cache.default = action.payload;
      })
      .addCase(fetchVehicleTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});


export const { resetState } = vehicleTypeSlice.actions;
export const vehicleTypeReducer1 = vehicleTypeSlice.reducer;
