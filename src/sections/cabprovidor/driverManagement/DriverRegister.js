/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Typography
} from '@mui/material';

import { useFormik, Form, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'store';
import FormikTextField from 'components/textfield/TextField';
import FormikAutocomplete from 'components/autocomplete/AutoComplete';
import { openSnackbar } from 'store/reducers/snackbar';
import { USERTYPE } from 'constant';
import { useDispatch } from 'react-redux';

const validationSchema = Yup.object()
  .shape({
    userName: Yup.string().required('Username is required'),
    userEmail: Yup.string().email('Invalid email address'),
    contactNumber: Yup.string().matches(/^[0-9]{10}$/, 'Contact Number must be exactly 10 digits')
  })
  .test('email-or-phone', 'Either email or phone is required', function (values) {
    const { userEmail, contactNumber } = values;
    if (!userEmail && !contactNumber) {
      return this.createError({
        path: 'userEmail',
        message: 'Either email or phone is required'
      });
    }
    return true;
  });

const DriverRegister = ({
  open,
  handleClose,
  sliceName,
  title,
  initialValuesFun,
  yupSchema = null,
  onSubmit,
  fetchAllData,
  fetchSingleDetails
}) => {
  const dispatch = useDispatch();
  const { isCreating, getSingleDetails } = useSelector((state) => state[sliceName]);

  const vendors = useSelector((state) => state.vendors.allVendors);
  const userType = useSelector((state) => state.auth.userType);

  const data = isCreating ? null : getSingleDetails;

  //   useEffect(() => {
  //     if (!isCreating) {
  //       fetchSingleDetails();
  //     }
  //   }, []);

  const formikHandleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const res = await onSubmit(values, isCreating);
      console.log('res = ', res);
      resetForm();
      handleClose();

      // const message = isCreating ? 'Driver details have been successfully added' : 'Driver details have been successfully updated';
      let message;
      if (!isCreating) {
        message = 'Driver details have been successfully updated';
      } else {
        if (res?.status === 201) {
          message = 'Driver details have been successfully added';
        } else if (res?.status === 200) {
          message = 'This driver is now registered with you and another cab provider';
        }
      }

      dispatch(
        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: {
            color: isCreating && res?.status === 200 ? 'warning' : 'success'
          },
          close: true
        })
      );

      // fetchAllData();
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error?.message || 'Something went wrong',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: initialValuesFun(data),
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: formikHandleSubmit
  });

  const { handleSubmit, isSubmitting, values } = formik;

  const style = [USERTYPE.iscabProvider, USERTYPE.iscabProviderUser].includes(userType) ? 4 : 4;

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <Box sx={{ p: 1, py: 1.5 }}>
          <FormikProvider value={formik}>
            <Form
              autoComplete="off"
              noValidate
              onSubmit={handleSubmit}
              style={{
                width: '100%',
                height: '100%'
              }}
            >
              <DialogTitle>{isCreating ? title.ADD : title.EDIT}</DialogTitle>

              <DialogContent>
                <Grid container spacing={2} alignItems="center" rowGap={2}>
                  {/* Username */}
                  <Grid item xs={12} sm={style}>
                    <Stack spacing={1}>
                      <InputLabel>
                        Username
                        <Typography component="span" sx={{ color: 'red', marginLeft: '4px' }}>
                          *
                        </Typography>
                      </InputLabel>

                      <FormikTextField name="userName" placeholder="Enter Username" fullWidth />
                    </Stack>
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} sm={style}>
                    <Stack spacing={1}>
                      <InputLabel>Email</InputLabel>
                      <FormikTextField name="userEmail" placeholder="Enter Email" fullWidth />
                    </Stack>
                  </Grid>

                  {/* Contact Number */}
                  <Grid item xs={12} sm={style}>
                    <Stack spacing={1}>
                      <InputLabel>Contact Number</InputLabel>

                      <FormikTextField name="contactNumber" placeholder="Enter Contact Number" fullWidth />
                    </Stack>
                  </Grid>

                  {/* Office Charge */}
                  <Grid item xs={12} sm={style}>
                    <Stack spacing={1}>
                      <InputLabel>Office Charge</InputLabel>

                      <FormikTextField
                        name="officeChargeAmount"
                        type="number"
                        placeholder="Enter Office Charge"
                        fullWidth
                        InputProps={{
                          // readOnly: true,

                          inputProps: {
                            sx: {
                              '::-webkit-outer-spin-button': { display: 'none' },
                              '::-webkit-inner-spin-button': { display: 'none' },
                              '-moz-appearance': 'textfield' // Firefox
                            }
                          }
                        }}
                      />
                    </Stack>
                  </Grid>

                  {/* Vendor Company Name */}
                  {[USERTYPE.iscabProvider, USERTYPE.iscabProviderUser].includes(userType) && (
                    <Grid item xs={12} sm={style}>
                      <Stack spacing={1}>
                        <InputLabel>Vendor Company Name</InputLabel>

                        <FormikAutocomplete
                          name="vendorId"
                          options={vendors}
                          placeholder="Vendor company name"
                          getOptionLabel={(option) => option['vendorCompanyName']}
                          saveValue="vendorId"
                          defaultValue={null}
                          value={vendors?.find((item) => item['vendorId'] === values['vendorId']) || null}
                          renderOption={(props, option) => (
                            <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                              {option['vendorCompanyName']}
                            </Box>
                          )}
                        />
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>

              <DialogActions>
                <Button color="error" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit" disabled={isSubmitting}>
                  {isCreating ? 'Add' : 'Save'}
                </Button>
              </DialogActions>
            </Form>
          </FormikProvider>
        </Box>
      </Dialog>
    </>
  );
};

export default DriverRegister;
