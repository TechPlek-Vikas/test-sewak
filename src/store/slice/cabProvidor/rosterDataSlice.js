import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { openSnackbar } from 'store/reducers/snackbar';
import axios from 'utils/axios';
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

// Define the async thunk for fetching roster data by some identifier (e.g., `companyId`)
export const fetchRosterData = createAsyncThunk('rosterData/fetchRosterData', async ({ id, page, limit }, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/cabProvider/roster/data/by?companyId=${id}&page=${page}&limit=${limit}`);

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const fetchRosterDataByDate = createAsyncThunk(
  'rosterData/fetchRosterDataByDate',
  async ({ data, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/tripData/trip/requests/company?page=${page}&limit=${limit}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Define the async thunk for uploading roster data
export const uploadRosterData = createAsyncThunk(
  'rosterData/uploadRosterData',
  async ({ data, file_id }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post('/tripData/map/roster', data);
      if (response.status === 201) {
        dispatch(
          openSnackbar({
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );

        const putResponse = await axios.put('/tripData/update/roster/status', {
          data: {
            _id: file_id,
            rosterStatus: 1
          }
        });

        if (putResponse.status === 200) {
          dispatch(
            openSnackbar({
              message: 'Status updated successfully', // Unique message
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: true
            })
          );
        }
      }

      return response.data;
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error?.response?.data?.message || 'Something went wrong',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );

      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const initialState = {
  rosterData: [], // Empty array initially
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10
  },
  loading: false,
  error: null
};

const rosterDataSlice = createSlice({
  name: 'rosterData',
  initialState,
  reducers: {
    reset: () => initialState, // Reset state to initial state on logout or other triggers
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRosterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRosterData.fulfilled, (state, action) => {
        state.rosterData = action.payload.data || [];
        state.metaData = {
          totalCount: action.payload.total || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          lastPageNo: Math.ceil(action.payload.total / action.payload.limit) || 1
        };
        state.loading = false;
      })
      .addCase(fetchRosterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchRosterDataByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRosterDataByDate.fulfilled, (state, action) => {
        state.rosterData = action.payload.data || [];
        state.metaData = {
          totalCount: action.payload.totalCount || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          lastPageNo: Math.ceil(action.payload.totalCount / action.payload.limit) || 1
        };
        state.loading = false;
      })
      .addCase(fetchRosterDataByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(uploadRosterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadRosterData.fulfilled, (state, action) => {
        state.rosterData.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(uploadRosterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError } = rosterDataSlice.actions;
export const rosterDataReducer = rosterDataSlice.reducer;
