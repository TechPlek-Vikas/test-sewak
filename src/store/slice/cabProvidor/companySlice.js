import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { openSnackbar } from 'store/reducers/snackbar';
import axios from 'utils/axios';
import { commonInitialState, commonReducers } from '../common';
import { logoutActivity } from './accountSettingSlice';
import { handleReset } from 'utils/helper';

// Define the async thunk for fetching companies
export const fetchCompanies = createAsyncThunk('companies/fetchCompanies', async ({ page, limit, query }, { rejectWithValue }) => {
  try {
    // Replace with your actual endpoint
    // const response = await axios.get(`/company?page=${page}&limit=${limit}&name=${query}`);
    const response = await axios.get(`/company`, {
      params: {
        page: page,
        limit: limit,
        name: query
      }
    });
    return response.data.data; // This should match the shape of the data you expect
  } catch (error) {
    // Return a rejected value with error details
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Fetch company details by id
export const fetchCompanyDetails = createAsyncThunk('companies/fetchCompanyDetails', async (id, { rejectWithValue }) => {
  try {
    // Send a GET request to fetch details of a specific company by companyId
    const response = await axios.get(`/company/by?companyId=${id}`);
    return response.data.data; // Ensure this matches the shape of the data you expect
  } catch (error) {
    // Return a rejected value with error details
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Fetch company branch details by id
export const fetchCompanyBranchDetails = createAsyncThunk('companies/fetchCompanyBranchDetails', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/companyBranch/by?branchId=${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Define the async thunk for adding a company
export const addCompany = createAsyncThunk('companies/addCompany', async (company, { rejectWithValue, dispatch }) => {
  try {
    const response = await axios.post('/company', company);

    if (response.status === 201) {
      // Dispatch success snackbar
      dispatch(
        openSnackbar({
          open: true,
          message: response.data.message,
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

// Define the async thunk for adding a branch
export const addBranch = createAsyncThunk('companies/addBranch', async (company, { rejectWithValue, dispatch }) => {
  try {
    const response = await axios.post('/companyBranch/add', company);

    if (response.status === 201) {
      // Dispatch success snackbar
      dispatch(
        openSnackbar({
          open: true,
          message: response.data.message,
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

// Define the async thunk for updating a company
export const updateCompany = createAsyncThunk('companies/updateCompany', async (payload, { rejectWithValue }) => {
  try {
    // Make sure to replace the URL with your actual endpoint
    const response = await axios.put(`/company/edit`, payload);
    console.log(response);
    return { success: response.data.success, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Update company branch
export const updateCompanyBranch = createAsyncThunk('companies/updateCompanyBranch', async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/companyBranch/edit`, payload);
    console.log(response);
    return { success: response.data.success, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Define the async thunk for deleting a company
export const deleteCompany = createAsyncThunk('companies/deleteCompany', async (id, { rejectWithValue }) => {
  try {
    // Make sure to replace the URL with your actual endpoint
    await axios.delete(`/api/companies/${id}`);
    return id; // Return the id for deletion
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Get all the assigned vendors on a company
export const fetchCompaniesAssignedVendors = createAsyncThunk(
  'companies/fetchCompaniesAssignedVendors',
  async (id, { rejectWithValue }) => {
    try {
      // Send a GET request to fetch details of a specific company by companyId
      const response = await axios.get(`/company/vendors?companyID=${id}`);
      return response.data.data; // Ensure this matches the shape of the data you expect
    } catch (error) {
      // Return a rejected value with error details
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Get all the assigned drivers on a company
export const fetchCompaniesAssignedDrivers = createAsyncThunk(
  'companies/fetchCompaniesAssignedDrivers',
  async (id, { rejectWithValue }) => {
    try {
      // Send a GET request to fetch details of a specific company by companyId
      const response = await axios.get(`/company/drivers?companyID=${id}`);
      return response.data.data; // Ensure this matches the shape of the data you expect
    } catch (error) {
      // Return a rejected value with error details
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Update status of company
export const updateCompanyStatus = createAsyncThunk('vendors/updateCompanyStatus', async (status, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const id = state.companies.selectedID;
    const response = await axios.put('/company/updateActiveStatus', { data: { companyId: id, status } });
    return { success: response.data.success, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

// Update status of company branch
export const updateCompanyBranchStatus = createAsyncThunk(
  'vendors/updateCompanyBranchStatus',
  async (status, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const id = state.companies.selectedID;
      const response = await axios.put('/companyBranch/updateActiveStatus', { data: { companyBranchId: id, status } });
      console.log(response);
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const initialState = {
  ...commonInitialState,
  companies: [], // Empty array initially
  companyDetails: null,
  companiesVendor: [],
  companiesDriver: [],
  metaData: {
    totalCount: 0,
    page: 1,
    limit: 10
  },
  loading: false,
  error: null
};

const companySlice = createSlice({
  name: 'companies',
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
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies = action.payload.result || []; // Handle empty result
        state.metaData = {
          totalCount: action.payload.totalCount || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10
        };
        state.loading = false;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchCompanyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyDetails.fulfilled, (state, action) => {
        state.companyDetails = action.payload || null; // Handle empty result
        state.loading = false;
      })
      .addCase(fetchCompanyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(addCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCompany.fulfilled, (state, action) => {
        state.companies.push(action.payload);
        state.loading = false;
      })
      .addCase(addCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(addBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBranch.fulfilled, (state, action) => {
        state.companies.push(action.payload);
        state.loading = false;
      })
      .addCase(addBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex((company) => company._id === action.payload._id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.companies = state.companies.filter((company) => company._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchCompaniesAssignedVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompaniesAssignedVendors.fulfilled, (state, action) => {
        state.companiesVendor = action.payload || null; // Handle empty result
        state.loading = false;
      })
      .addCase(fetchCompaniesAssignedVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchCompaniesAssignedDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompaniesAssignedDrivers.fulfilled, (state, action) => {
        state.companiesDriver = action.payload || null; // Handle empty result
        state.loading = false;
      })
      .addCase(fetchCompaniesAssignedDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

// Export the reducer and actions
export const { reset, resetError, setSelectedID } = companySlice.actions;
export const companyReducer = companySlice.reducer;
