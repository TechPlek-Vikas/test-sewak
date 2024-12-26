import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

// Define the async thunk for fetching advance types
export const fetchAdvanceType = createAsyncThunk('advanceType/fetchAdvanceType', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/advanceType/all?cabProviderId=${id}`);
    return response.data.dataList;
  } catch (error) {
    // Return a rejected value with error details
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Define the async thunk for adding a advance type
export const addAdvanceType = createAsyncThunk(
  'advanceType/addAdvanceType',
  async ({ advanceTypeName, interestRate }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/advanceType/add', {
        data: {
          advanceTypeName,
          interestRate
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Define the async thunk for updating a advance type
export const updateAdvanceType = createAsyncThunk(
  'advanceType/updateAdvanceType',
  async ({ _id, advanceTypeName, interestRate }, { rejectWithValue }) => {
    try {
      // Replace with your actual endpoint
      const response = await axios.put(`/advanceType/edit`, { data: { _id, advanceTypeName, interestRate } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Define the async thunk for deleting a advance type
export const deleteAdvanceType = createAsyncThunk('advanceType/deleteAdvanceType', async (id, { rejectWithValue }) => {
  try {
    // Replace with your actual endpoint
    await axios.delete(`/advanceType?advanceTypeId=${id}`);
    return id; // Return the id for deletion
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Initial state for the advance type
const initialState = {
  advanceType: [], // Empty array initially
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10
  },
  loading: false,
  error: null
};

// Create the slice for advance type
const advanceTypeSlice = createSlice({
  name: 'advanceType',
  initialState,
  reducers: {
    reset: () => initialState, // Reset state to initial state
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdvanceType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvanceType.fulfilled, (state, action) => {
        state.advanceType = action.payload || null; // Handle empty result
        state.loading = false;
      })
      .addCase(fetchAdvanceType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(addAdvanceType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAdvanceType.fulfilled, (state, action) => {
        state.advanceType.push(action.payload);
        state.loading = false;
      })
      .addCase(addAdvanceType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateAdvanceType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdvanceType.fulfilled, (state, action) => {
        const index = state.advanceType.findIndex((advanceType) => advanceType._id === action.payload._id);
        if (index !== -1) {
          state.advanceType[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateAdvanceType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteAdvanceType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdvanceType.fulfilled, (state, action) => {
        state.advanceType = state.advanceType.filter((advanceType) => advanceType._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteAdvanceType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError } = advanceTypeSlice.actions;
export const advanceTypeReducer = advanceTypeSlice.reducer;
