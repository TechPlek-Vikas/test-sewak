import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios'; // Adjust the import path according to your project structure
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

const initialState = {
  data: [], // Empty array initially
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10,
    lastPageNo: 1
  },
  loading: false,
  error: null
};

export const getInvoiceDetails = createAsyncThunk('invoices/getInvoiceDetails', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/invoice/by?invoiceId=${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    reset: () => initialState, // Reset state to initial state on logout
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError } = invoiceSlice.actions;
export const invoicesReducer = invoiceSlice.reducer;
