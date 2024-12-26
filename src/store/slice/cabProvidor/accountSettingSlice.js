import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { FAKE_ACCOUNT_SETTINGS, FAKE_ACCOUNT_SETTINGS_2 } from 'pages/setting/account';
import axios from 'utils/axios'; // Adjust the import path according to your project structure
import { handleReset } from 'utils/helper';

const initialState = {
  settings: null,
  loading: false,
  error: null
};

export const fetchAccountSettings = createAsyncThunk('accountSettings/fetchAccountSettings', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/accountSetting');
    console.log('response', response);
    return response;
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // return {
    //   name: 'Ram',
    //   title: 'Ram Travels',
    //   logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Kim_Jong-un_April_2019_%28cropped%29.jpg',
    //   smallLogo: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTri4LTaGmAlYGNUVKjevQgLD5F_nbTsXvr5A&s`,
    //   favIcon: 'https://cdn4.vectorstock.com/i/1000x1000/28/08/north-korea-flag-icon-isolate-print-vector-30902808.jpg'
    // };

    // return { status: 200, data: FAKE_ACCOUNT_SETTINGS };
    // return { status: 200, data: FAKE_ACCOUNT_SETTINGS_2 };
    // eslint-disable-next-line no-unreachable
  } catch (error) {
    console.log('Error fetching account settings:', error);
    // return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const mutateAccountSettings = createAsyncThunk('accountSettings/mutateAccountSettings', async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.put('/accountSetting/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;

    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // return {
    //   status: 200,
    //   data: FAKE_ACCOUNT_SETTINGS
    // };
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

const accountSettingSlice = createSlice({
  name: 'accountSettings',
  initialState,
  reducers: {
    reset: () => initialState, // Reset state to initial state on logout
    resetError: (state) => {
      state.error = null;
    },
    logoutActivity() {
      console.log('authentication logout redux toolkit');
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountSettings.fulfilled, (state, action) => {
        console.log('action.payload', action.payload.data.data);

        state.settings = action.payload.data.data || null; // Handle empty result

        state.loading = false;
      })
      .addCase(fetchAccountSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(logoutActivity, handleReset(initialState));
  }
});

export const { reset, resetError, logoutActivity } = accountSettingSlice.actions;
export const accountSettingsReducer = accountSettingSlice.reducer;
