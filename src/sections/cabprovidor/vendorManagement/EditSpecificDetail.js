/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';

// material-ui
import { Autocomplete, Button, Grid, InputLabel, Stack, TextField, Typography } from '@mui/material';

// third-party
import { FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';

// project-imports
import AnimateButton from 'components/@extended/AnimateButton';
import { openSnackbar } from 'store/reducers/snackbar';
import { addSpecialDetails, editVendorSpecificInfo } from 'store/slice/cabProvidor/vendorSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

const validationSchema = yup.object({
  vendorCompanyName: yup.string().required('Cab Provider Name is required'),
  // .min(2, 'Name should be at least 2 characters long'),
  contactPersonName: yup.string(),
  // .required('Contact Person Name is required')
  // .min(2, 'Name should be at least 2 characters long'),
  PAN: yup
    .string()
    // .required('PAN is required')
    .matches(/^([A-Z]){5}([0-9]){4}([A-Z]){1}$/, 'Enter a valid PAN'),
  GSTIN: yup
    .string()
    // .required('GSTIN is required')
    .matches(/^([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z1-9]{1}Z[A-Z0-9]{1})$/, 'Enter a valid GSTIN'),
  workEmail: yup
    .string()
    // .required('Work Email is required')
    .email('Enter a valid email'),
  workMobileNumber: yup
    .string()
    // .required('Mobile Number is required')
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  workLandLineNumber: yup
    .string()
    // .required('LandLine Number is required')
    .matches(/^\d{10}$/, 'Enter a valid 10-digit landline number'),
  officePinCode: yup
    .string()
    // .required('Pin Code is required')
    .matches(/^\d{6}$/, 'Enter a valid 6-digit pin code'),
  officeCity: yup.string(),
  // .required('City is required'),
  officeState: yup.string(),
  // .required('State is required'),
  officeAddress: yup.string(),
  // .required('Office Address is required'),
  bankName: yup.string(),
  // .required('Bank Name is required'),
  branchName: yup.string(),
  // .required('Branch Name is required'),
  IFSC_code: yup
    .string()
    // .required('IFSC Code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code'),
  accountNumber: yup
    .string()
    // .required('Account Number is required')
    .matches(/^\d{9,18}$/, 'Enter a valid account number'),
  accountHolderName: yup.string(),
  // .required('Account Holder Name is required'),
  bankAddress: yup.string(),
  // .required('Bank Address is required'),
  officeChargeAmount: yup
    .number()
    .typeError('Office Charge Amount must be a number')
    .required('Office Charge Amount is required')
    .positive('Office Charge Amount must be a positive number')
  // ESI_Number: yup.string().required('ESI Number is required'),
  // PF_Number: yup.string().required('PF Number is required')
});

// List of Indian states
const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
  'Delhi',
  'Puducherry',
  'Ladakh',
  'Jammu and Kashmir'
];

// ==============================|| VALIDATION WIZARD - PAYMENT ||============================== //

export default function SpecificDetail({ specificDetail, handleNext, userId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      vendorCompanyName: specificDetail.vendorCompanyName || '',
      contactPersonName: specificDetail.contactPersonName || '',
      PAN: specificDetail.PAN || '',
      GSTIN: specificDetail.GSTIN || '',
      workEmail: specificDetail.workEmail || '',
      workMobileNumber: specificDetail.workMobileNumber || '',
      workLandLineNumber: specificDetail.workLandLineNumber || '',
      officePinCode: specificDetail.officePinCode || '',
      officeCity: specificDetail.officeCity || '',
      officeState: specificDetail.officeState || '',
      officeAddress: specificDetail.officeAddress || '',
      bankName: specificDetail.bankName || '',
      branchName: specificDetail.branchName || '',
      IFSC_code: specificDetail.IFSC_code || '',
      accountNumber: specificDetail.accountNumber || '',
      accountHolderName: specificDetail.accountHolderName || '',
      bankAddress: specificDetail.bankAddress || '',
      officeChargeAmount: specificDetail.officeChargeAmount || '',
      ESI_Number: specificDetail.ESI_Number || '',
      PF_Number: specificDetail.PF_Number || ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          data: {
            _id: userId,
            vendorCompanyName: values.vendorCompanyName || '',
            contactPersonName: values.contactPersonName || '',
            PAN: values.PAN || '',
            GSTIN: values.GSTIN || '',
            workEmail: values.workEmail || '',
            workMobileNumber: values.workMobileNumber || '',
            workLandLineNumber: values.workLandLineNumber || '',
            officePinCode: values.officePinCode || '',
            officeCity: values.officeCity || '',
            officeState: values.officeState || '',
            officeAddress: values.officeAddress || '',
            bankName: values.bankName || '',
            branchName: values.branchName || '',
            IFSC_code: values.IFSC_code || '',
            accountNumber: values.accountNumber || '',
            accountHolderName: values.accountHolderName || '',
            bankAddress: values.bankAddress || '',
            officeChargeAmount: values.officeChargeAmount || '',
            ESI_Number: values.ESI_Number || '',
            PF_Number: values.PF_Number || ''
          }
        };

        const response = await dispatch(editVendorSpecificInfo(payload)).unwrap();

        if (response.success) {
          // handleNext();
          // resetForm();

          dispatch(
            openSnackbar({
              open: true,
              message: response.message,
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: true
            })
          );
        }
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
      }
    }
  });

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Specific Information
      </Typography>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Stack spacing={1}>
                <InputLabel>Cab Provider Legal Name</InputLabel>
                <TextField
                  id="vendorCompanyName"
                  name="vendorCompanyName"
                  value={formik.values.vendorCompanyName}
                  onChange={formik.handleChange}
                  error={formik.touched.vendorCompanyName && Boolean(formik.errors.vendorCompanyName)}
                  helperText={formik.touched.vendorCompanyName && formik.errors.vendorCompanyName}
                  placeholder="Enter Cab Provider Name"
                  fullWidth
                  autoComplete="name"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack spacing={1}>
                <InputLabel>Contact Person Name</InputLabel>
                <TextField
                  id="contactPersonName"
                  name="contactPersonName"
                  value={formik.values.contactPersonName}
                  onChange={formik.handleChange}
                  error={formik.touched.contactPersonName && Boolean(formik.errors.contactPersonName)}
                  helperText={formik.touched.contactPersonName && formik.errors.contactPersonName}
                  placeholder="Enter Contact Person Name"
                  fullWidth
                  autoComplete="name"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack spacing={1}>
                <InputLabel>PAN</InputLabel>
                <TextField
                  id="PAN"
                  name="PAN"
                  value={formik.values.PAN}
                  onChange={formik.handleChange}
                  error={formik.touched.PAN && Boolean(formik.errors.PAN)}
                  helperText={formik.touched.PAN && formik.errors.PAN}
                  placeholder="Enter PAN"
                  fullWidth
                  autoComplete="PAN"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack spacing={1}>
                <InputLabel>GSTIN</InputLabel>
                <TextField
                  id="GSTIN"
                  name="GSTIN"
                  value={formik.values.GSTIN}
                  onChange={formik.handleChange}
                  error={formik.touched.GSTIN && Boolean(formik.errors.GSTIN)}
                  helperText={formik.touched.GSTIN && formik.errors.GSTIN}
                  placeholder="Enter GSTIN"
                  fullWidth
                  autoComplete="GSTIN"
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="div">
                Contact
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Work Email</InputLabel>
                <TextField
                  id="workEmail"
                  name="workEmail"
                  placeholder="Enter Work Email"
                  value={formik.values.workEmail}
                  onChange={formik.handleChange}
                  error={formik.touched.workEmail && Boolean(formik.errors.workEmail)}
                  helperText={formik.touched.workEmail && formik.errors.workEmail}
                  fullWidth
                  autoComplete="email"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Mobile Number</InputLabel>
                <TextField
                  id="workMobileNumber"
                  name="workMobileNumber"
                  placeholder="Enter Work Mobile Number"
                  value={formik.values.workMobileNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.workMobileNumber && Boolean(formik.errors.workMobileNumber)}
                  helperText={formik.touched.workMobileNumber && formik.errors.workMobileNumber}
                  fullWidth
                  autoComplete="phone"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Landline Number</InputLabel>
                <TextField
                  id="workLandLineNumber"
                  name="workLandLineNumber"
                  placeholder="Enter Work Landline"
                  value={formik.values.workLandLineNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.workLandLineNumber && Boolean(formik.errors.workLandLineNumber)}
                  helperText={formik.touched.workLandLineNumber && formik.errors.workLandLineNumber}
                  fullWidth
                  autoComplete="phone"
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="div">
                Office Address
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Pin Code</InputLabel>
                <TextField
                  id="officePinCode"
                  name="officePinCode"
                  placeholder="Enter Office Pin Code"
                  value={formik.values.officePinCode}
                  onChange={formik.handleChange}
                  error={formik.touched.officePinCode && Boolean(formik.errors.officePinCode)}
                  helperText={formik.touched.officePinCode && formik.errors.officePinCode}
                  fullWidth
                  autoComplete="pincode"
                />
              </Stack>
            </Grid>{' '}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>City</InputLabel>
                <TextField
                  id="officeCity"
                  name="officeCity"
                  placeholder="Enter City"
                  value={formik.values.officeCity}
                  onChange={formik.handleChange}
                  error={formik.touched.officeCity && Boolean(formik.errors.officeCity)}
                  helperText={formik.touched.officeCity && formik.errors.officeCity}
                  fullWidth
                  autoComplete="city"
                />
              </Stack>
            </Grid>{' '}
            {/* <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>State</InputLabel>
              <TextField
                id="officeState"
                name="officeState"
                placeholder="Enter State"
                value={formik.values.officeState}
                onChange={formik.handleChange}
                error={formik.touched.officeState && Boolean(formik.errors.officeState)}
                helperText={formik.touched.officeState && formik.errors.officeState}
                fullWidth
                autoComplete="state"
              />
            </Stack>
          </Grid> */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={1}>
                <InputLabel>State</InputLabel>
                <Autocomplete
                  fullWidth
                  id="officeState"
                  name="officeState"
                  options={indianStates}
                  value={formik.values.officeState}
                  onChange={(event, newValue) => formik.setFieldValue('officeState', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select State"
                      error={formik.touched.officeState && Boolean(formik.errors.officeState)}
                      helperText={formik.touched.officeState && formik.errors.officeState}
                    />
                  )}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel>Address</InputLabel>
                <TextField
                  id="officeAddress"
                  name="officeAddress"
                  placeholder="Enter Office Address"
                  value={formik.values.officeAddress}
                  onChange={formik.handleChange}
                  error={formik.touched.officeAddress && Boolean(formik.errors.officeAddress)}
                  helperText={formik.touched.officeAddress && formik.errors.officeAddress}
                  fullWidth
                  autoComplete="address"
                  multiline
                  rows={3}
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="div">
                Bank Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Bank Name</InputLabel>
                <TextField
                  id="bankName"
                  name="bankName"
                  placeholder="Enter Bank Name"
                  value={formik.values.bankName}
                  onChange={formik.handleChange}
                  error={formik.touched.bankName && Boolean(formik.errors.bankName)}
                  helperText={formik.touched.bankName && formik.errors.bankName}
                  fullWidth
                  autoComplete="bankName"
                />
              </Stack>
            </Grid>{' '}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Branch Name</InputLabel>
                <TextField
                  id="branchName"
                  name="branchName"
                  placeholder="Enter Branch Name"
                  value={formik.values.branchName}
                  onChange={formik.handleChange}
                  error={formik.touched.branchName && Boolean(formik.errors.branchName)}
                  helperText={formik.touched.branchName && formik.errors.branchName}
                  fullWidth
                  autoComplete="branchName"
                />
              </Stack>
            </Grid>{' '}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>IFSC Code</InputLabel>
                <TextField
                  id="IFSC_code"
                  name="IFSC_code"
                  placeholder="Enter IFSC Code"
                  value={formik.values.IFSC_code}
                  onChange={formik.handleChange}
                  error={formik.touched.IFSC_code && Boolean(formik.errors.IFSC_code)}
                  helperText={formik.touched.IFSC_code && formik.errors.IFSC_code}
                  fullWidth
                  autoComplete="IFSC"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel>Account Number</InputLabel>
                <TextField
                  id="accountNumber"
                  name="accountNumber"
                  placeholder="Enter Account Number"
                  value={formik.values.accountNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
                  helperText={formik.touched.accountNumber && formik.errors.accountNumber}
                  fullWidth
                  autoComplete="accountNumber"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel>Account Holder Name</InputLabel>
                <TextField
                  id="accountHolderName"
                  name="accountHolderName"
                  placeholder="Enter Account Holder Name"
                  value={formik.values.accountHolderName}
                  onChange={formik.handleChange}
                  error={formik.touched.accountHolderName && Boolean(formik.errors.accountHolderName)}
                  helperText={formik.touched.accountHolderName && formik.errors.accountHolderName}
                  fullWidth
                  autoComplete="accountHolderName"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel>Address</InputLabel>
                <TextField
                  id="bankAddress"
                  name="bankAddress"
                  placeholder="Enter Bank Address"
                  value={formik.values.bankAddress}
                  onChange={formik.handleChange}
                  error={formik.touched.bankAddress && Boolean(formik.errors.bankAddress)}
                  helperText={formik.touched.bankAddress && formik.errors.bankAddress}
                  fullWidth
                  autoComplete="bankAddress"
                  multiline
                  rows={3}
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="div">
                Other Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Office Charge Amount</InputLabel>
                <TextField
                  id="officeChargeAmount"
                  name="officeChargeAmount"
                  type="number"
                  placeholder="Enter Office Charge Amount"
                  value={formik.values.officeChargeAmount}
                  onChange={formik.handleChange}
                  error={formik.touched.officeChargeAmount && Boolean(formik.errors.officeChargeAmount)}
                  helperText={formik.touched.officeChargeAmount && formik.errors.officeChargeAmount}
                  fullWidth
                  autoComplete="officeChargeAmount"
                />
              </Stack>
            </Grid>{' '}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>ESI Number</InputLabel>
                <TextField
                  id="ESI_Number"
                  name="ESI_Number"
                  placeholder="Enter ESI Number"
                  value={formik.values.ESI_Number}
                  onChange={formik.handleChange}
                  error={formik.touched.ESI_Number && Boolean(formik.errors.ESI_Number)}
                  helperText={formik.touched.ESI_Number && formik.errors.ESI_Number}
                  fullWidth
                  autoComplete="ESI_Number"
                />
              </Stack>
            </Grid>{' '}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>PF Number</InputLabel>
                <TextField
                  id="PF_Number"
                  name="PF_Number"
                  placeholder="Enter PF Number"
                  value={formik.values.PF_Number}
                  onChange={formik.handleChange}
                  error={formik.touched.PF_Number && Boolean(formik.errors.PF_Number)}
                  helperText={formik.touched.PF_Number && formik.errors.PF_Number}
                  fullWidth
                  autoComplete="PF_Number"
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="right">
                <Button onClick={() => navigate('/management/vendor/view')} sx={{ my: 3, ml: 1 }}>
                  Back
                </Button>
                <AnimateButton>
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{ my: 3, ml: 1 }}
                    // onClick={() => setErrorIndex(1)}
                    // disabled={!(formik.dirty && formik.isValid) || formik.isSubmitting}
                    disabled={!formik.dirty || formik.isSubmitting}
                  >
                    Update Specific Details
                  </Button>
                </AnimateButton>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </FormikProvider>
    </>
  );
}

SpecificDetail.propTypes = {
  paymentData: PropTypes.object,
  setPaymentData: PropTypes.func,
  handleNext: PropTypes.func,
  handleBack: PropTypes.func
  // setErrorIndex: PropTypes.func
};
