import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios'; // Adjust the import path according to your project structure
import { commonInitialState, commonReducers } from 'store/slice/common';
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';
import { USERTYPE } from 'constant';

const initialState = {
  ...commonInitialState,
  vehicleTypes: [], // Empty array initially
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10,
    lastPageNo: 1
  },
  loading: false,
  error: null
};

const API = {
  CREATE: '/vehicleType/add',
  UPDATE: '/vehicleType/update',
  DELETE: '/vehicleType',
  DETAILS: '/vehicleType',
  ALL: '/vehicleType'
};

const FETCH_API = {
  [USERTYPE.iscabProvider]: '/vehicleType',
  [USERTYPE.isVendor]: '/vehicleType/for/adding/vehicles',
  [USERTYPE.iscabProviderUser]: '/vehicleType/for/adding/vehicles',
  [USERTYPE.isVendorUser]: '/vehicleType/for/adding/vehicles'
};

export const fetchAllVehicleTypesForAll = createAsyncThunk('vehicleTypes/fetchAll1', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/vehicleType');
    return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const fetchAllVehicleTypes = createAsyncThunk('vehicleTypes/fetchAll', async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const userType = state.auth.userType;
    const response = await axios.get(FETCH_API[userType]);
    return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const fetchVehicleTypeDetails = createAsyncThunk('vehicleType/fetchDetails', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const vehicleTypeId = state.vehicleTypes.selectedID;
    const response = await axios.get(`${API.DETAILS}/by?vehicleTypeId=${vehicleTypeId}`);
    return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const addVehicleType = createAsyncThunk('vehicleType/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.post(API.CREATE, payload);
    return { status: response.status };
    //   return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const updateVehicleType = createAsyncThunk('vehicleType/update', async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.put(API.UPDATE, payload);
    return { status: response.status };

    //   return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const deleteVehicleType = createAsyncThunk('vehicleType/delete', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const vehicleTypeId = state.vehicleTypes.selectedID;

    const payload = {
      data: {
        vehicleTypeId
      }
    };
    const response = await axios.delete(API.DELETE, { data: payload });
    return { status: response.status };

    //   return response?.data?.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

const vehicleType = createSlice({
  name: 'vehicleTypes',
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
      .addCase(fetchAllVehicleTypesForAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVehicleTypesForAll.fulfilled, (state, action) => {
        state.vehicleTypes = action.payload || []; // Handle empty result
        state.loading = false;
      })
      .addCase(fetchAllVehicleTypesForAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchAllVehicleTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVehicleTypes.fulfilled, (state, action) => {
        state.vehicleTypes = action.payload || []; // Handle empty result
        state.loading = false;
      })
      .addCase(fetchAllVehicleTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch Vehicle Type Details
      .addCase(fetchVehicleTypeDetails.pending, () => {
        // state.loading = true;
      })
      .addCase(fetchVehicleTypeDetails.fulfilled, (state, action) => {
        // state.loading = false;
        state.getSingleDetails = action.payload;
      })
      .addCase(fetchVehicleTypeDetails.rejected, (state, action) => {
        // state.loading = false;
        state.errorDetails = action.payload || action.error.message;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError, setDeletedName, setSelected, handleOpen, handleClose, setIsCreating, clearSingleDetails, setSelectedID } =
  vehicleType.actions;

export const vehicleTypeReducer = vehicleType.reducer;
