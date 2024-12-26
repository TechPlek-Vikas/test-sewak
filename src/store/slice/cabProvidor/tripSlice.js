import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

// Initial state for the zone names
const initialState = {
  data: [], // Empty array initially
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10
  },
  loading: false,
  error: null
};

export const addNewTrip = createAsyncThunk('trips/addNewTrip', async (payload, { rejectWithValue }) => {
  try {
    console.log(`🚀 ~ addNewTrip ~ payload:`, payload);
    const response = await axios.post('/assignTrip/single/trip', payload);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const updateTrip = createAsyncThunk('trips/updateTrip', async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.put('/assignTrip/single/trip/edit', payload);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const fetchTripDetails = createAsyncThunk('trips/fetchTripDetails', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/assignTrip/getTripById?assignTripID=${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    reset: () => initialState, // Reset state to initial state
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError } = tripSlice.actions;
export const tripReducer = tripSlice.reducer;
