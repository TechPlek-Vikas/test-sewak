import {
  AppBar,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Form, FormikProvider, useFormik } from 'formik';
import { Add } from 'iconsax-react';
import { useState } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import * as Yup from 'yup';

const remainingAmount = (totalAmount, receivedAmount, TDS) => {
  return totalAmount - receivedAmount - (totalAmount * TDS) / 100;
};

const validationSchema = Yup.object({
  receivedAmount: Yup.number()
    .min(1, 'The amount you enter must be more than zero.')
    .test('max-remaining', function (value) {
      const { totalAmount, TDS } = this.parent; // Access sibling fields
      const maxAllowed = remainingAmount(totalAmount, 0, TDS);
      if (value > maxAllowed) {
        return this.createError({
          path: this.path,
          message: `Received amount exceeds the allowable limit of ₹${maxAllowed}`
        });
      }
      return true;
    })
    .required('Received Amount is required'),
  TDS: Yup.number().min(0, 'TDS must be at least 0').max(100, 'TDS cannot exceed 100').required('TDS is required'),
  transactionID: Yup.string().required('Transaction ID is required')
});

const PaidModal = ({ onClose, amount, onConfirm }) => {
  const [buttonClicked, setButtonClicked] = useState(false);
  const formik = useFormik({
    initialValues: {
      totalAmount: amount || 0,
      transactionID: '',
      receivedAmount: amount,
      TDS: 0,
      TDSRate: 0
    },
    // validationSchema,
    onSubmit: async (values) => {
      setButtonClicked(true);
      console.log(values.totalAmount, values.receivedAmount + values.TDS);
      try {
        onConfirm('Paid', {
          transactionsId: values.transactionID,
          receivedAmount: values.receivedAmount,
          TDS: values.TDS,
          TDSRate: Number(values.TDSRate),
          totalAmount: values.totalAmount,
          status:
            values.totalAmount === values.receivedAmount + values.TDS ? 1 : values.totalAmount > values.receivedAmount + values.TDS ? 3 : 0,
          transactionsType: 'INCOME'
        });
      } catch (error) {
        console.log('error', error);
      } finally {
        setButtonClicked(false);
      }
    }
  });

  const remainingBalance = remainingAmount(formik.values.totalAmount, formik.values.receivedAmount, formik.values.TDSRate);

  const handleCustomChange = (fieldName, value) => {
    // Example: Custom logic before setting the value
    const updatedValue = value < 0 ? 0 : value; // Prevent negative values
    formik.setFieldValue(fieldName, updatedValue);
    if (fieldName === 'TDSRate') {
      const recievedAmount = formik.values.totalAmount - (formik.values.totalAmount * updatedValue) / 100;
      formik.setFieldValue('TDS', (formik.values.totalAmount * updatedValue) / 100);
      formik.setFieldValue('receivedAmount', recievedAmount);
    }
  };
  console.log(formik.values);

  return (
    <>
      <FormikProvider value={formik}>
        <Form
          onSubmit={formik.handleSubmit}
          noValidate
          //  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <AppBar sx={{ position: 'relative', boxShadow: 'none' }}>
            <DialogTitle id="alert-dialog-title">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Change Payment Status</Typography>
                <IconButton onClick={onClose} color="inherit" aria-label="close">
                  <Add style={{ transform: 'rotate(45deg)' }} />
                </IconButton>
              </Stack>
            </DialogTitle>
          </AppBar>

          <Divider />

          <DialogContent>
            <Grid container spacing={2}>
              {/* Total Amount */}
              <Grid item xs={12} md={3}>
                <Stack gap={1}>
                  <InputLabel>Receivables</InputLabel>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ₹ {formik.values.totalAmount}
                  </Typography>
                </Stack>
              </Grid>

              {/* Transaction ID */}
              <Grid item xs={12} md={3}>
                <Stack gap={1}>
                  <InputLabel required htmlFor="transactionID" title="Transaction ID">
                    Transaction ID
                  </InputLabel>
                  <TextField
                    name="transactionID"
                    id="transactionID"
                    type="text"
                    value={formik.values.transactionID}
                    onChange={formik.handleChange}
                    error={formik.touched.transactionID && Boolean(formik.errors.transactionID)}
                    helperText={formik.touched.transactionID && formik.errors.transactionID}
                  />
                </Stack>
              </Grid>

              {/* TDS */}
              <Grid item xs={12} md={3}>
                <Stack gap={1}>
                  <InputLabel required htmlFor="TDS" title="TDS">
                    TDS
                  </InputLabel>
                  <TextField
                    name="TDSRate"
                    id="TDSRate"
                    type="number"
                    value={formik.values.TDSRate}
                    // onChange={formik.handleChange}
                    onChange={(e) => handleCustomChange('TDSRate', e.target.value)}
                    error={formik.touched.TDSRate && Boolean(formik.errors.TDSRate)}
                    helperText={formik.touched.TDSRate && formik.errors.TDSRate}
                    inputProps={{
                      min: 0
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Stack>
              </Grid>

              {/* Received Amount */}
              <Grid item xs={12} md={3}>
                <Stack gap={1}>
                  <InputLabel required htmlFor="receivedAmount" title="Received Amount">
                    Received Amount
                  </InputLabel>
                  <TextField
                    name="receivedAmount"
                    id="receivedAmount"
                    type="number"
                    value={formik.values.receivedAmount}
                    onChange={formik.handleChange}
                    // onChange={(e) => handleCustomChange('receivedAmount', e.target.value)}
                    error={formik.touched.receivedAmount && Boolean(formik.errors.receivedAmount)}
                    helperText={formik.touched.receivedAmount && formik.errors.receivedAmount}
                    inputProps={{
                      min: 0
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                  />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>

          <Divider />

          <DialogActions
            sx={{
              p: 2
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" width={'100%'}>
              <Stack direction="row" gap={1}>
                <InputLabel sx={{ fontWeight: 'bold' }}>Pending Amount</InputLabel>
                {remainingBalance <= 0 ? (
                  <Stack direction="row" alignItems="center" gap={1} color="success.main">
                    <FaCheckCircle size={20} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Cleared
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    ₹ {remainingBalance.toFixed(2)}
                  </Typography>
                )}
              </Stack>

              {/* Buttons */}
              <Stack direction="row" alignItems="center" gap={2}>
                <Button color="error" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" color="success" variant="contained" disabled={buttonClicked}>
                  Proceed
                </Button>
              </Stack>
            </Stack>
          </DialogActions>
        </Form>
      </FormikProvider>
    </>
  );
};

export default PaidModal;
