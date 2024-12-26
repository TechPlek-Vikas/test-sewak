import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { openSnackbar } from 'store/reducers/snackbar';
import axios from 'utils/axios';
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

// Define the async thunk for fetching rosters by company id
export const fetchCompaniesRosterFile = createAsyncThunk(
  'rosterFile/fetchCompaniesRosterFile',
  async ({ page, limit, startDate, endDate, companyID }, { rejectWithValue }) => {
    try {
      console.log('companyId', companyID);

      // const response = await axios.get(`/cabProvider/roster/data/by?companyId=${id}`);
      let response = await axios.get(`/cabProvider/roster/data/by`, {
        params: {
          page: page,
          limit: limit,
          startDate: startDate,
          endDate: endDate,
          companyId: companyID
        }
      });
      // if (!startDate || !endDate) {
      //   response = await axios.get(`/cabProvider/roster/data/by?page=${page}&limit=${limit}`);
      // } else {
      //   response = await axios.get(`/cabProvider/roster/data/by?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`);
      // }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Define the async thunk for adding a company
export const uploadRosterFile = createAsyncThunk('rosterFile/uploadRosterFile', async (roster, { rejectWithValue, dispatch }) => {
  try {
    const response = await axios.post('/cabProvider/upload/roster', roster);
    if (response.status === 200) {
      // Dispatch success snackbar
      dispatch(
        openSnackbar({
          open: true,
          message: response.data.msg,
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );
    }

    return response.data;
  } catch (error) {
    // Dispatch error snackbar
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
});

const initialState = {
  rosterFiles: [], // Empty array initially
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10
  },
  loading: false,
  error: null
};

const rosterFileSlice = createSlice({
  name: 'rosterFile',
  initialState,
  reducers: {
    reset: () => initialState, // Reset state to initial state on logout
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompaniesRosterFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompaniesRosterFile.fulfilled, (state, action) => {
        state.rosterFiles = action.payload.data || [];
        console.log(action.payload);
        state.metaData = {
          totalCount: action.payload.total || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          lastPageNo: Math.ceil(action.payload.total / action.payload.limit) || 1,
          metaData: action.payload.metadata
        };
        state.loading = false;
      })
      .addCase(fetchCompaniesRosterFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(uploadRosterFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadRosterFile.fulfilled, (state, action) => {
        state.rosterFiles.push(action.payload);
        state.loading = false;
        state.error = null; // Reset error on success
      })
      .addCase(uploadRosterFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError } = rosterFileSlice.actions;
export const rosterFileReducer = rosterFileSlice.reducer;
