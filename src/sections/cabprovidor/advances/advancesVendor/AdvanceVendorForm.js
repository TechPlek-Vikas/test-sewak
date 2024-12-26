import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import axios from 'axios';

// material-ui
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, FormikProvider } from 'formik';

// project-imports
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

const CustomerSchema = Yup.object({
  advanceType: Yup.string().required('Advance Type is required'), // Validate that an advance type is selected

  amount: Yup.number()
    .required('Amount is required') // Validate that the amount is provided
    .positive('Amount must be a positive number') // Validate that the amount is positive
    .typeError('Amount must be a number') // Ensure it's a number type
});

// ==============================|| Advance Vendor - ADD / EDIT ||============================== //

const AdvanceVendorForm = ({ customer, onCancel, key, setKey }) => {
  const isCreating = !customer;
  const token = localStorage.getItem('serviceToken');
  const [loading, setLoading] = useState(true);

  const [fetchAllAdvance, setFetchAllAdvance] = useState(null);
  const [advanceProvider, setAdvanceProvider] = useState(null);

  useEffect(() => {
    const providerId = localStorage.getItem('providerId');

    const fetchdata = async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}advanceType/cab/providerId`, {
        headers: {
          Authorization: `${token}`
        }
      });
      if (response.status === 200) {
        setLoading(false);
      }
      localStorage.setItem('providerId', JSON.stringify(response.data.cabProviderId));
      setAdvanceProvider(response.data.cabProviderId);
    };

    if (!providerId) {
      fetchdata();
    } else {
      setAdvanceProvider(JSON.parse(providerId));
    }
  }, []);

  useEffect(() => {
    const providerId1 = JSON.parse(localStorage.getItem('providerId'));
    const fetchdata = async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}advanceType/all?cabProviderId=${providerId1}`, {
        headers: {
          Authorization: `${token}`
        }
      });

      if (response.status === 200) {
        setLoading(false);
      }
      setFetchAllAdvance(response.data.dataList);
    };

    fetchdata();
  }, []);

  const formik = useFormik({
    initialValues: {
      amount: customer?.amount || '',
      remarks: customer?.remarks || '',
      advanceTypeId: customer?.['advanceTypeId._id'] || '',
      advanceType: customer?.['advanceTypeId._id'] || ''
    },
    validationSchema: CustomerSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (isCreating) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}advance/request`,
            {
              data: {
                cabProviderId: advanceProvider,
                amount: values.amount,
                remarks: values.remarks,
                vendorId: '',
                advanceTypeId: values.advanceType
              }
            },
            {
              headers: {
                Authorization: `${token}`
              }
            }
          );
          if (response.status === 201) {
            console.log('res', response);

            setKey(key + 1);
            resetForm();
          }
          setKey(key + 1);
          dispatch(
            openSnackbar({
              open: true,
              message: response?.data?.message || 'Advance requested successfully.',
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          );
        } else {
          // PUT request for editing existing record
          const response = await axios.put(
            `${process.env.REACT_APP_API_URL}advance/edit`,
            {
              data: {
                _id: advanceProvider,
                amount: values.amount,
                remarks: values.remarks,
                vendorId: '',
                advanceTypeId: values.advanceType
              }
            },
            {
              headers: {
                Authorization: `${token}`
              }
            }
          );
          if (response.status === 200) {
            setKey(key + 1);
          }
          dispatch(
            openSnackbar({
              open: true,
              message: 'Advance updated successfully.',
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          );
        }
        onCancel();
      } catch (error) {
        console.error(error);
        dispatch(
          openSnackbar({
            open: true,
            message: error?.response?.data?.message || 'An error occurred. Please try again.',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: false
          })
        );
      }
    }
  });

  useEffect(() => {
    const { amount, interestRate } = formik.values;

    if (amount && interestRate) {
      const requestedAmount = parseFloat(amount);
      const rate = parseFloat(interestRate);

      if (!isNaN(requestedAmount) && !isNaN(rate)) {
        const finalAmount = requestedAmount + requestedAmount * (rate / 100);
        formik.setFieldValue('finalAmount', finalAmount.toFixed(2)); // Update payableAmount with the calculated value
      }
    }
  }, [formik.values.amount, formik.values.interestRate]);

  const handleCancel = () => {
    formik.resetForm({
      values: {
        ...formik.initialValues,
        interestRate: '',
        finalAmount: ''
      }
    });
    onCancel(); // Call the onCancel prop function
  };

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <form onSubmit={formik.handleSubmit}>
            <DialogTitle>{isCreating ? 'Request Advance' : 'Edit Advance'}</DialogTitle>
            <Divider />

            <DialogContent sx={{ p: 2.5 }} direction="row">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="amount">Amount</InputLabel>
                    <TextField
                      fullWidth
                      id="amount"
                      name="amount"
                      value={formik.values.amount}
                      onChange={formik.handleChange}
                      placeholder="Enter Amount"
                      type="number"
                      error={Boolean(formik.touched.amount && formik.errors.amount)}
                      helperText={formik.touched.amount && formik.errors.amount}
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

                <Grid item xs={12} sm={6}>
                  {' '}
                  <Stack spacing={1}>
                    <InputLabel htmlFor="remarks">Remarks</InputLabel>
                    <TextField
                      fullWidth
                      id="remarks"
                      name="remarks"
                      value={formik.values.remarks}
                      onChange={formik.handleChange}
                      placeholder="Please Add Remarks"
                      error={Boolean(formik.touched.remarks && formik.errors.remarks)}
                      helperText={formik.touched.remarks && formik.errors.remarks}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="advanceType">Advance Type</InputLabel>
                    <FormControl>
                      <InputLabel>Advance Type</InputLabel>
                      <Select
                        fullWidth
                        placeholder="Enter Advance Type"
                        defaultValue=""
                        id="advanceType"
                        name="advanceType"
                        value={formik.values.advanceType}
                        onChange={(e) => {
                          const selectedAdvanceType = fetchAllAdvance.find((item) => item._id === e.target.value);
                          formik.setFieldValue('advanceType', e.target.value); // Update the advance type
                          formik.setFieldValue('interestRate', selectedAdvanceType?.interestRate || ''); // Update the interest rate
                        }}
                        error={formik.touched.advanceType && Boolean(formik.errors.advanceType)}
                        helperText={formik.touched.advanceType && formik.errors.advanceType}
                        autoComplete="advanceType"
                      >
                        {fetchAllAdvance &&
                          fetchAllAdvance.map((item, index) => (
                            <MenuItem key={index} value={item._id}>
                              {item.advanceTypeName}
                            </MenuItem>
                          ))}
                      </Select>
                      {formik.touched.advanceType && formik.errors.advanceType && (
                        <FormHelperText error id="standard-weight-helper-text-password-login">
                          {formik.errors.advanceType}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="interestRate">Interest Rate</InputLabel>
                    <TextField
                      fullWidth
                      id="interestRate"
                      name="interestRate"
                      type="number"
                      value={formik.values.interestRate}
                      onChange={formik.handleChange} // Allow manual updates if needed
                      placeholder="Enter Interest Rate"
                      error={Boolean(formik.touched.interestRate && formik.errors.interestRate)}
                      helperText={formik.touched.interestRate && formik.errors.interestRate}
                      InputProps={{
                        readOnly: true,

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

                <Grid item xs={12} sm={4}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="finalAmount">Final Amount</InputLabel>
                    <TextField
                      fullWidth
                      id="finalAmount"
                      name="finalAmount"
                      value={formik.values.finalAmount}
                      onChange={formik.handleChange}
                      placeholder="Enter Final Amount"
                      error={Boolean(formik.touched.finalAmount && formik.errors.finalAmount)}
                      helperText={formik.touched.finalAmount && formik.errors.finalAmount}
                      InputProps={{
                        readOnly: true // Make the field read-only since it's auto-calculated
                      }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>

            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button color="error" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!(formik.values.amount && formik.values.advanceType) || !formik.isValid || !formik.dirty}
                >
                  {isCreating ? 'Add' : 'Edit'}
                </Button>
              </Stack>
            </DialogActions>
          </form>
        </LocalizationProvider>
      </FormikProvider>
      {/* {!isCreating && <AlertCustomerDelete title={customer.fatherName} open={openAlert} handleClose={handleAlertClose} />} */}
    </>
  );
};

AdvanceVendorForm.propTypes = {
  customer: PropTypes.any,
  onCancel: PropTypes.func
};

export default AdvanceVendorForm;
