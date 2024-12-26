import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios'; // Adjust the import path according to your project structure
import { commonInitialState, commonReducers } from 'store/slice/common';
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

// Define the async thunk for fetching drivers
export const fetchDrivers = createAsyncThunk(
  'drivers/fetchDrivers',
  async ({ page = 1, limit = 10, driverType = 1, vendorID = null, query }, { rejectWithValue }) => {
    try {
      // Replace with your actual endpoint
      const queryParams = {
        drivertype: driverType,
        page,
        limit,
        ...(vendorID && { vendorId: vendorID }),
        name: query
      };
      const response = await axios.get(`/driver/list`, { params: queryParams });
      return response.data.data; // This should match the shape of the data you expect
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Define the async thunk for adding a driver
export const addDriver = createAsyncThunk('drivers/addDriver', async (driver, { rejectWithValue }) => {
  try {
    // Replace with your actual endpoint
    const response = await axios.post('/drivers', driver);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Define the async thunk for updating a driver
export const updateDriver = createAsyncThunk('drivers/updateDriver', async ({ id, updatedData }, { rejectWithValue }) => {
  try {
    // Replace with your actual endpoint
    const response = await axios.put(`/drivers/${id}`, updatedData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// update driver basic details
export const updateDriverBasicDetails = createAsyncThunk('driver/updateBasicDetails', async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/driver/update/basic/details`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log(`🚀 ~ updateDriverBasicDetails ~ response:`, response);
    return { status: response.status, message: response.data.message };
  } catch (error) {
    console.log('Error :: updateDriverBasicDetails =', error);
    return rejectWithValue(error.response.data);
  }
});

// update driver specific details
export const updateDriverSpecificDetails = createAsyncThunk('driver/updateSpecificDetails', async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/driver/update/specific/details`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log(`🚀 ~ updateDriverSpecificDetails ~ response:`, response);
    return { status: response.status, message: response.data.message };
  } catch (error) {
    console.log('Error :: updateDriverSpecificDetails =', error);
    return rejectWithValue(error.response.data);
  }
});

// Define the async thunk for deleting a driver
export const deleteDriver = createAsyncThunk('drivers/deleteDriver', async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const id = state.drivers.selectedID;
    const response = await axios.delete(`/driver?driverId=${id}`);
    return response;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// register driver
export const registerDriver = createAsyncThunk('drivers/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.post(`/driver/register`, payload);
    return { status: response.status };
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// fetch all Drivers without pagination
export const fetchAllDrivers = createAsyncThunk('drivers/fetchAllDrivers', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/driver/all/system?cabProviderId=${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// fetch driver details
export const fetchDriverDetails = createAsyncThunk('driver/fetchDetails', async (id, { getState, rejectWithValue }) => {
  try {
    // const state = getState();
    // const driverID = state.driver.selectedID;
    console.log(`🚀 ~ driverID:`, id);
    // const _id = driverID || id;
    const response = await axios.get(`/driver/by?driverId=${id}`);
    console.log(`🚀 ~ fetchDriverDetails ~ response:`, response);
    return response?.data?.data;
  } catch (error) {
    console.log('Error :: fetchDriverDetails =', error);
    return rejectWithValue(error.response.data);
  }
});

export const fetchDrivers1 = createAsyncThunk('drivers/fetchDrivers1', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/driver/all?drivertype=1`);
    return response.data.data.result; // This should match the shape of the data you expect
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

const initialState = {
  ...commonInitialState,
  drivers: [], // Empty array initially
  allDrivers: [],
  drivers1: [],
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10,
    lastPageNo: 1
  },
  loading: false,
  error: null
};

const driverSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    ...commonReducers,
    reset: () => initialState, // Reset state to initial state on logout
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.drivers = action.payload.result || []; // Handle empty result
        state.metaData = {
          totalCount: action.payload.total || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          lastPageNo: Math.ceil(action.payload.total / action.payload.limit) || 1
        };
        state.loading = false;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(addDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDriver.fulfilled, (state, action) => {
        state.drivers.push(action.payload);
        state.loading = false;
      })
      .addCase(addDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDriver.fulfilled, (state, action) => {
        const index = state.drivers.findIndex((driver) => driver._id === action.payload._id);
        if (index !== -1) {
          state.drivers[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.drivers = state.drivers.filter((driver) => driver._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchAllDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDrivers.fulfilled, (state, action) => {
        state.allDrivers = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchDrivers1.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers1.fulfilled, (state, action) => {
        state.drivers1 = action.payload;
        state.loading = false;
      })
      .addCase(fetchDrivers1.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError, handleOpen, handleClose, setSelectedID, setGetSingleDetails, setDeletedName } = driverSlice.actions;
export const driverReducer = driverSlice.reducer;
