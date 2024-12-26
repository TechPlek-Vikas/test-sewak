import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';
import { filterByKey } from 'store/utils/helper';

const initialState = {
  cache: {},
  zoneTypes: [], // Empty array initially
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10
  },
  loading: false,
  error: null
};

export const fetchAllZoneTypes = createAsyncThunk('zoneTypes/fetchAll', async (_, { getState, rejectWithValue }) => {
  try {
    const { zoneType } = getState();
    console.log(`🚀 ~ fetchAllZoneTypes ~ zoneType:`, zoneType);
    console.log('cache' in zoneType);

    if (zoneType.cache['All']) {
      return zoneType.cache['All'];
    }
    const response = await axios.get('/zoneType/all');
    return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const addZoneType = createAsyncThunk(
  'zoneType/addzoneType',
  async ({ zoneId, zoneTypeName, zoneTypeDescription }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/zoneType/add', {
        data: {
          zoneId,
          zoneTypeName,
          zoneTypeDescription
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Define the async thunk for updating a zone type
export const updateZoneType = createAsyncThunk(
  'zoneType/updatezoneType',
  async ({ _id, zoneTypeName, zoneTypeDescription }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/zoneType/edit`, { data: { _id, zoneTypeName, zoneTypeDescription } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Define the async thunk for deleting a zone type
export const deleteZoneType = createAsyncThunk('zoneType/deletezoneType', async (id, { rejectWithValue }) => {
  try {
    // Replace with your actual endpoint
    await axios.delete(`/zoneType?zoneTypeId=${id}`);
    return id; // Return the id for deletion
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Create the slice for zone names
const zoneTypeSlice = createSlice({
  name: 'zoneTypes',
  initialState,
  reducers: {
    reset: () => initialState, // Reset state to initial state
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllZoneTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllZoneTypes.fulfilled, (state, action) => {
        console.log(`🚀 ~ .addCase ~ action:`, action);
        state.zoneTypes = action.payload; // Handle empty result
        state.cache['All'] = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllZoneTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(addZoneType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addZoneType.fulfilled, (state, action) => {
        console.log(`🚀 ~ .addCase ~ action:`, action);
        state.zoneTypes.unshift(action.payload.data); // Add the new zone type to the beginning of the array
        delete state.cache['All'];
        state.loading = false;
      })
      .addCase(addZoneType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(updateZoneType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateZoneType.fulfilled, (state, action) => {
        console.log(`🚀 ~ .addCase ~ action:`, action);
        state.loading = false;
        state.error = null; // Reset error on success

        const index = state.zoneTypes.findIndex((zoneType) => zoneType._id === action.payload.data._id);
        if (index !== -1) {
          state.zoneTypes[index] = action.payload.data;
          delete state.cache['All'];
        }
      })
      .addCase(updateZoneType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(deleteZoneType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteZoneType.fulfilled, (state, action) => {
        console.log(`🚀 ~ .addCase ~ action:`, action);
        state.loading = false;
        state.error = null; // Reset error on success
        const result = filterByKey(state.zoneTypes, '_id', action.payload);
        console.log(`🚀 ~ .addCase ~ result:`, result);
        state.zoneTypes = result;
        state.cache['All'] = result;
      })
      .addCase(deleteZoneType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError } = zoneTypeSlice.actions;
export const zoneTypeReducer = zoneTypeSlice.reducer;
