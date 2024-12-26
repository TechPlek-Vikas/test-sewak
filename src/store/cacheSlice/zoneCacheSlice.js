import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosServices from 'utils/axios';

// Async thunk to fetch zone data
export const fetchZoneData = createAsyncThunk('zoneCache/fetchZoneData', async (_, { getState }) => {
  const { zoneCache } = getState();

  // Return cached data if available
  if (zoneCache.cache.default) {
    return zoneCache.cache.default;
  }

  // Fetch from API if not cached
  const response = await axiosServices.get('/zoneType/zoneType/zone/wise');
  return response.data.data || [];
});

const zoneCacheSlice = createSlice({
  name: 'zoneCache',
  initialState: {
    cache: {}, // Stores fetched data
    loading: false, // Tracks loading state
    error: null // Tracks error state
  },
  reducers: {
    clearCache: (state) => {
      state.cache = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchZoneData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchZoneData.fulfilled, (state, action) => {
        state.loading = false;
        state.cache.default = action.payload;
      })
      .addCase(fetchZoneData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearCache } = zoneCacheSlice.actions;
export const zoneCacheReducer = zoneCacheSlice.reducer;
