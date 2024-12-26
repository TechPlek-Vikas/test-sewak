import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

const initialState = {
  subscriptionPlan: null,
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10,
    lastPageNo: 1
  },
  loading: false,
  error: null
};

export const fetchsubscriptionPlan = createAsyncThunk('subscription/fetchsubscriptionPlan', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await axios.get('/subscriptionPlan', { params });
    console.log('response', response);

    return response?.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Add a subscription plan
export const addSubscription = createAsyncThunk(
  'subscription/addSubscription',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/subscriptionPlan', { data: subscriptionData });
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Edit a subscription plan
export const editSubscription = createAsyncThunk(
  'subscription/editSubscription',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await axios.put('/subscriptionPlan/update', { data: subscriptionData });
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Add a delete subscription plan
export const deleteSubscription = createAsyncThunk(
  'subscription/deleteSubscription',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const response = await axios.put('/subscriptionPlan/delete', { 
        data: { subscriptionId } 
      });
      return { subscriptionId, ...response.data }; // Return the subscriptionId for state update
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    reset: () => initialState,
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchsubscriptionPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchsubscriptionPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptionPlan = action.payload;
      })
      .addCase(fetchsubscriptionPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubscription.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the subscription list with the newly added subscription
        if (state.subscriptionPlan?.data) {
          state.subscriptionPlan.data = [...state.subscriptionPlan.data, action.payload];
        }
      })
      .addCase(addSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editSubscription.fulfilled, (state, action) => {
        state.loading = false;
        if (state.subscriptionPlan?.data) {
          // Update the specific subscription in the list
          state.subscriptionPlan.data = state.subscriptionPlan.data.map((subscription) =>
            subscription.subscriptionId === action.payload.subscriptionId ? action.payload : subscription
          );
        }
      })
      .addCase(editSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.loading = false;
        if (state.subscriptionPlan?.data) {
          state.subscriptionPlan.data = state.subscriptionPlan.data.filter(
            (subscription) => subscription.subscriptionId !== action.payload.subscriptionId
          );
        }
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

export const { reset, resetError } = subscriptionSlice.actions;
export const subscriptionReducer = subscriptionSlice.reducer;
