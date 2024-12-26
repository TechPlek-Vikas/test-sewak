import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios'; // Adjust the import path according to your project structure
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

const initialState = {
  cabs: [], // Empty array initially
  cabs1: [],
  getSingleDetails: null,
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10,
    lastPageNo: 1
  },
  loading: false,
  error: null,
  errorDetails: null
};

export const fetchCabs = createAsyncThunk(
  'cabs/fetchCabs',
  async ({ page = 1, limit = 10, vendorID = null, query }, { rejectWithValue }) => {
    try {
      const queryParams = {
        page,
        limit,
        ...(vendorID && { vendorId: vendorID }),
        vehicleNumber: query
      };
      const response = await axios.get(`/vehicle/all`, {
        params: queryParams
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const addCab = createAsyncThunk('cabs/add', async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`/vehicle/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return { status: response.status };
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const editCab = createAsyncThunk('cabs/edit', async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/vehicle/edit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return { status: response.status };
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const fetchCabDetails = createAsyncThunk('cabs/fetchCabDetails', async (id, { getState, rejectWithValue }) => {
  try {
    const response = await axios.get(`/vehicle/by?vehicleId=${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const fetchCab1 = createAsyncThunk('cabs/fetchCab1', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/vehicle/all/linked/drivers`);
    return response.data.data; // This should match the shape of the data you expect
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

const cabSlice = createSlice({
  name: 'cabs',
  initialState,
  reducers: {
    reset: () => initialState, // Reset state to initial state on logout
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCabs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCabs.fulfilled, (state, action) => {
        state.cabs = action.payload.result || []; // Handle empty result
        state.metaData = {
          totalCount: action.payload.total || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          lastPageNo: Math.ceil(action.payload.total / action.payload.limit) || 1
        };
        state.loading = false;
      })
      .addCase(fetchCabs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(editCab.pending, (state) => {
        state.loading = true;
      })
      .addCase(editCab.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(editCab.rejected, (state, action) => {
        state.loading = false;
        state.errorUpdate = action.payload;
      })
      .addCase(fetchCabDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCabDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.getSingleDetails = action.payload;
      })
      .addCase(fetchCabDetails.rejected, (state, action) => {
        state.loading = false;
        state.errorDetails = action.payload;
      })
      .addCase(fetchCab1.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCab1.fulfilled, (state, action) => {
        state.loading = false;
        state.cabs1 = action.payload;
      })
      .addCase(fetchCab1.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError, setIsCreating } = cabSlice.actions;
export const cabReducer = cabSlice.reducer;
