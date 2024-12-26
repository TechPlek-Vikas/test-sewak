/* eslint-disable no-unused-vars */
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, InputLabel, Stack } from '@mui/material';
import { useFormik, Form, FormikProvider } from 'formik';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';
import FormikTextField from 'components/textfield/TextField';
import FormikAutocomplete from 'components/autocomplete/AutoComplete';
import { addSubscription, editSubscription } from 'store/slice/cabProvidor/subscriptionSlice';
import * as yup from 'yup';

const SubscriptionAdd = ({ open, handleClose, data, currentSubscription, refreshTable }) => {
  const dispatch = useDispatch();

  // Determine create or edit mode based on currentSubscription or data
  const isCreating = !currentSubscription || !currentSubscription.id;

  const title = {
    ADD: 'Add Subscription',
    EDIT: 'Edit Subscription'
  };

  const validationSchema = yup.object({
    name: yup.string()
      .required('Name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    cost: yup.number()
      .required('Cost is required')
      .positive('Cost must be a positive number')
      .max(1000000, 'Cost cannot exceed 1,000,000')
  });

  const formikHandleSubmit = async (values, { setSubmitting, resetForm }) => {
    
    try {
      const action = isCreating ? addSubscription : editSubscription;
      await dispatch(action(values)).unwrap(); // Assuming you are using redux toolkit's unwrap for async actions
      resetForm();
      handleClose();
      refreshTable();
      const message = isCreating
        ? 'Subscription details have been successfully added'
        : 'Subscription details have been successfully updated';

      dispatch(
        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'success' },
          close: true
        })
      );
    } catch (error) {
      console.error('Error :: formikHandleSubmit =', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error?.message || 'Something went wrong',
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      subscriptionId: currentSubscription?._id || data?._id || null,
      name: currentSubscription?.name || data?.name || '',
      maxCabs: currentSubscription?.maxCabs || data?.maxCabs || '',
      maxDrivers: currentSubscription?.maxDrivers || data?.maxDrivers || '',
      maxUsersOnEachVendors: currentSubscription?.maxUsersOnEachVendors || data?.maxUsersOnEachVendors || '',
      maxUsersOnEachCompany: currentSubscription?.maxUsersOnEachCompany || data?.maxUsersOnEachCompany || '',
      maxUsersOnEachCabProviders: currentSubscription?.maxUsersOnEachCabProviders || data?.maxUsersOnEachCabProviders || '',
      cost: currentSubscription?.cost || data?.cost || '',
      expiresInMonths: currentSubscription?.expiresInMonths || data?.expiresInMonths || '',
      tag: currentSubscription?.tag || data?.tag || '',
      highlight: currentSubscription?.highlight || data?.highlight || false
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: formikHandleSubmit
  });

  const { handleSubmit, dirty, isSubmitting } = formik;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <Box sx={{ p: 1, py: 1.5 }}>
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit} style={{ width: '100%', height: '100%' }}>
            <DialogTitle>{isCreating ? title.ADD : title.EDIT}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} alignItems="center" rowGap={2}>
                <Grid item xs={12} lg={3}>
                  <Stack spacing={1}>
                    <InputLabel>Name</InputLabel>
                    <FormikTextField name="name" placeholder="Enter Subscription Name" />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={3}>
                  <Stack spacing={1}>
                    <InputLabel>Max Cabs</InputLabel>
                    <FormikTextField
                      name="maxCabs"
                      type="number"
                      placeholder="Enter Max Cabs"
                      inputProps={{
                        sx: {
                          '::-webkit-outer-spin-button': { display: 'none' },
                          '::-webkit-inner-spin-button': { display: 'none' },
                          '-moz-appearance': 'textfield' // Firefox
                        }
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={3}>
                  <Stack spacing={1}>
                    <InputLabel>Max Drivers</InputLabel>
                    <FormikTextField
                      name="maxDrivers"
                      type="number"
                      placeholder="Enter Max Drivers"
                      inputProps={{
                        sx: {
                          '::-webkit-outer-spin-button': { display: 'none' },
                          '::-webkit-inner-spin-button': { display: 'none' },
                          '-moz-appearance': 'textfield' // Firefox
                        }
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={3}>
                  <Stack spacing={1}>
                    <InputLabel>Max Users On Vendor</InputLabel>
                    <FormikTextField
                      name="maxUsersOnEachVendors"
                      type="number"
                      placeholder="Enter Max Users On Vendor"
                      inputProps={{
                        sx: {
                          '::-webkit-outer-spin-button': { display: 'none' },
                          '::-webkit-inner-spin-button': { display: 'none' },
                          '-moz-appearance': 'textfield' // Firefox
                        }
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Max Users On Company</InputLabel>
                    <FormikTextField
                      name="maxUsersOnEachCompany"
                      type="number"
                      placeholder="Enter Max Users On Company"
                      inputProps={{
                        sx: {
                          '::-webkit-outer-spin-button': { display: 'none' },
                          '::-webkit-inner-spin-button': { display: 'none' },
                          '-moz-appearance': 'textfield' // Firefox
                        }
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Stack spacing={1}>
                    <InputLabel>Max Users On Cab Provider</InputLabel>
                    <FormikTextField
                      name="maxUsersOnEachCabProviders"
                      type="number"
                      placeholder="Enter Max Users On Cab Provider"
                      inputProps={{
                        sx: {
                          '::-webkit-outer-spin-button': { display: 'none' },
                          '::-webkit-inner-spin-button': { display: 'none' },
                          '-moz-appearance': 'textfield' // Firefox
                        }
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={3}>
                  <Stack spacing={1}>
                    <InputLabel>Cost</InputLabel>
                    <FormikTextField
                      name="cost"
                      type="number"
                      placeholder="Enter Cost"
                      value={formik.values.cost}
                      onChange={formik.handleChange}
                      error={formik.touched.cost && Boolean(formik.errors.cost)}
                      helperText={formik.touched.cost && formik.errors.cost}
                      inputProps={{
                        sx: {
                          '::-webkit-outer-spin-button': { display: 'none' },
                          '::-webkit-inner-spin-button': { display: 'none' },
                          '-moz-appearance': 'textfield' // Firefox
                        }
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={3}>
                  <Stack spacing={1}>
                    <InputLabel>Expires In Months</InputLabel>
                    <FormikTextField
                      name="expiresInMonths"
                      type="number"
                      placeholder="Enter Expiry Duration"
                      inputProps={{
                        sx: {
                          '::-webkit-outer-spin-button': { display: 'none' },
                          '::-webkit-inner-spin-button': { display: 'none' },
                          '-moz-appearance': 'textfield' // Firefox
                        }
                      }}
                    />
                  </Stack>
                </Grid>
                {isCreating && (
                  <>
                    <Grid item xs={12} lg={3}>
                      <Stack spacing={1}>
                        <InputLabel>Tag</InputLabel>
                        <FormikTextField name="tag" placeholder="Enter Tag" />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} lg={3}>
                      <Stack spacing={1}>
                        <InputLabel>Highlight</InputLabel>
                        <FormikAutocomplete
                          name="highlight"
                          options={[
                            { id: true, value: 'Yes' },
                            { id: false, value: 'No' }
                          ]}
                          placeholder="Highlight"
                          getOptionLabel={(option) => option.value}
                          saveValue="id"
                        />
                      </Stack>
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button color="error" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="contained" type="submit" disabled={!dirty || isSubmitting}>
                {isCreating ? 'Add' : 'Save'}
              </Button>
            </DialogActions>
          </Form>
        </FormikProvider>
      </Box>
    </Dialog>
  );
};

export default SubscriptionAdd;
