import { useTheme } from '@mui/material/styles';

import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import { FieldArray, Form, FormikProvider, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { useCallback, useEffect, useState } from 'react';
import { getApiResponse } from 'utils/axiosHelper';
import { useNavigate } from 'react-router';
import { Add, Edit, Setting } from 'iconsax-react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { addMonths, format, isValid } from 'date-fns';
import AddressModal from '../components/CompanySelectModel';
import GenericSelect from 'components/select/GenericSelect';

const customTextFieldStyle = {
  '& .MuiInputBase-input': {
    padding: '8px'
  }
};
const Create = () => {
  const theme = useTheme();
  const navigation = useNavigate();
  const { user, userSpecificData } = useAuth();
  console.log({ user, userSpecificData });

  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    invoice: {
      prefix: 'INV-',
      invoiceNumber: 1
    }
  });

  const [tempSettings, setTempSettings] = useState({
    invoice: { ...settings.invoice }
  });
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceIdDialog, setInvoiceIdDialog] = useState(false);

  const handleInvoiceIdDialog = () => {
    setTempSettings({
      invoice: { ...settings.invoice }
    });
    setInvoiceIdDialog((prev) => !prev);
  };

  // populate Invoice Setting
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const cabProviderId = user._id;
        const url = `/invoice/settings/list`;
        const config = {
          params: {
            cabProviderId
          }
        };

        const response = await getApiResponse(url, config);

        if (response.success) {
          if (!response.data) {
            alert('Invoice Settings Not Found');
            navigation('/settings/invoice', {
              replace: true
            });
            return;
          }
          const { invoiceSetting } = response.data;

          setSettings(invoiceSetting);
          setLoading(false);
        }
      } catch (error) {
        console.log('Error fetching settings: (Invoice Creation)', error);
      }
    };
    fetchSettings();
  }, []);

  // Update invoiceId dynamically based on settings
  useEffect(() => {
    const { prefix = 'INV-', invoiceNumber = 1 } = settings.invoice || {};
    const formattedNumber = String(invoiceNumber); // Format as 000001
    setInvoiceId(`${prefix}${formattedNumber}`);
  }, [settings]);

  const [invoiceStatus, setInvoiceStatus] = useState('Unpaid');

  const [dates, setDates] = useState({
    invoiceDate: new Date(), // Default to today's date
    invoiceDueDate: addMonths(new Date(), 1) // Default to 1 month after today's date
  });

  // Handler for updating dates
  const handleDateChange = (field, newValue) => {
    setDates((prev) => {
      const updatedDates = { ...prev };

      if (isValid(newValue)) {
        updatedDates[field] = newValue; // Update the changed field
        // Automatically update due date if invoiceDate is changed
        if (field === 'invoiceDate') {
          updatedDates.invoiceDueDate = addMonths(newValue, 1);
        }
      }
      return updatedDates;
    });
  };

  const [sendersDetails, setSendersDetails] = useState({
    name: userSpecificData.cabProviderLegalName || '',
    address: user.address || '',
    GSTIN: userSpecificData.GSTIN || '',
    PAN: userSpecificData.PAN || '',
    city: user.city || '', // added city here
    state: user.state || '', // added state here
    postal_code: user.pinCode || '' // added postal_code here
  });

  const [senderEditMode, setSenderEditMode] = useState(false);

  const handleSaveSenderDetails = useCallback(() => {
    setSenderEditMode(false);
  }, []);

  const handleChangeSenderDetails = useCallback((e) => {
    const { name, value } = e.target;
    setSendersDetails((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const [recieversDetails, setRecieversDetails] = useState({
    company_name: userSpecificData.cabProviderLegalName || '',
    address: user.address || '',
    GSTIN: userSpecificData.GSTIN || '',
    PAN: userSpecificData.PAN || '',
    city: user.city || '', // added city here
    state: user.state || '', // added state here
    postal_code: user.pinCode || '' // added postal_code here
  });

  const [recieversModalOpen, setRecieversModalOpen] = useState(false);

  const [groupByOption, setGroupByOption] = useState('Company Rate');

  return (
    <>
      <MainCard>
        <Grid container spacing={2}>
          {/*Invoice No*/}
          <Grid item xs={12} sm={6} md={3}>
            <Stack spacing={1}>
              <InputLabel>Invoice Id</InputLabel>
              <FormControl sx={{ width: '100%' }}>
                <TextField
                  required
                  name="invoice_id"
                  id="invoice_id"
                  value={`${settings.invoice?.prefix}-${settings.invoice?.invoiceNumber}`} // Controlled value
                  InputProps={{
                    readOnly: true, // Editable only if 'manual' is selected
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleInvoiceIdDialog} size="small">
                          <Edit color="rgb(91,107,121)" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </FormControl>
            </Stack>
          </Grid>
          {/* Status*/}
          <Grid item xs={12} sm={6} md={3}>
            <Stack spacing={1}>
              <InputLabel>Status</InputLabel>
              <FormControl sx={{ width: '100%' }}>
                <Select value={invoiceStatus} displayEmpty name="status" onChange={(e) => setInvoiceStatus(e.target.value)}>
                  <MenuItem disabled value="">
                    Select status
                  </MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Unpaid">Unpaid</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
          {/* Invoice Date*/}
          <Grid item xs={12} sm={6} md={3}>
            <Stack spacing={1}>
              <InputLabel>Date</InputLabel>
              <FormControl sx={{ width: '100%' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    format="dd/MM/yyyy"
                    value={dates.invoiceDate}
                    onChange={(newValue) => handleDateChange('invoiceDate', newValue)}
                  />
                </LocalizationProvider>
              </FormControl>
            </Stack>
          </Grid>
          {/* Invoice Due Date*/}
          <Grid item xs={12} sm={6} md={3}>
            <Stack spacing={1}>
              <InputLabel>Due Date</InputLabel>
              <FormControl sx={{ width: '100%' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    format="dd/MM/yyyy"
                    value={dates.invoiceDueDate}
                    onChange={(newValue) => handleDateChange('invoiceDueDate', newValue)}
                  />
                </LocalizationProvider>
              </FormControl>
            </Stack>
          </Grid>
          {/* Senders Details*/}
          <Grid item xs={12} sm={6}>
            <MainCard sx={{ minHeight: 168 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Stack spacing={2}>
                    <Typography variant="h5">From:</Typography>
                    <Stack sx={{ width: '100%' }}>
                      {senderEditMode ? (
                        <Grid container spacing={2}>
                          {[
                            { label: 'Name', name: 'name', value: sendersDetails.name },
                            { label: 'Address', name: 'address', value: sendersDetails.address },
                            { label: 'City', name: 'city', value: sendersDetails.city },
                            { label: 'State', name: 'state', value: sendersDetails.state },
                            { label: 'Postal Code', name: 'postal_code', value: sendersDetails.postal_code },
                            { label: 'GSTIN', name: 'GSTIN', value: sendersDetails.GSTIN },
                            { label: 'PAN', name: 'PAN', value: sendersDetails.PAN }
                          ].map((field, index) => (
                            <Grid item xs={6} key={index}>
                              <TextField
                                label={field.label}
                                value={field.value || ''} // Ensures it shows an empty string if the value is undefined
                                name={field.name}
                                onChange={handleChangeSenderDetails}
                                fullWidth
                                sx={customTextFieldStyle}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <>
                          <Typography variant="subtitle1">{sendersDetails.name}</Typography>
                          <Typography color="secondary">
                            {`${sendersDetails.address}, ${sendersDetails.city || ''}, ${sendersDetails.state || ''} - ${
                              sendersDetails.postal_code || ''
                            }`}
                          </Typography>
                          <Typography color="secondary">
                            <strong>GSTIN:</strong> {sendersDetails.GSTIN}
                          </Typography>
                          <Typography color="secondary">
                            <strong>PAN:</strong> {sendersDetails.PAN}
                          </Typography>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign={{ xs: 'left', sm: 'right' }} color="secondary.200">
                    {senderEditMode ? (
                      <Button variant="outlined" color="secondary" onClick={handleSaveSenderDetails} size="small">
                        Save
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        color="secondary"
                        onClick={() => setSenderEditMode(true)}
                        size="small"
                      >
                        Change
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          {/* Recievers Details*/}
          <Grid item xs={12} sm={6}>
            <MainCard sx={{ minHeight: 168 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Stack spacing={2}>
                    <Typography variant="h5">To:</Typography>
                    <Stack sx={{ width: '100%' }}>
                      <Typography variant="subtitle1">{recieversDetails.company_name}</Typography>
                      <Typography color="secondary">
                        {' '}
                        {`${recieversDetails.address}, ${recieversDetails.city || ''}, ${recieversDetails.state || ''} - ${
                          recieversDetails.postal_code || ''
                        }`}
                      </Typography>
                      <Typography color="secondary">
                        <strong>GSTIN:</strong> {recieversDetails.GSTIN}
                      </Typography>
                      <Typography color="secondary">
                        {' '}
                        <strong>PAN:</strong> {recieversDetails.PAN}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="right" color="secondary.200">
                    <Button
                      size="small"
                      startIcon={<Add />}
                      color="secondary"
                      variant="outlined"
                      onClick={() => setRecieversModalOpen(true)}
                    >
                      Add
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>

          {/* Details */}
          {
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent={'space-between'} alignItems={'center'}>
                <Typography variant="h5">Details</Typography>
                <Typography variant="caption" sx={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'text.secondary' }}>
                  Generating Invoice for{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold', fontStyle: 'normal', color: 'primary.main' }}>
                    {0} trips
                  </Typography>
                  .
                </Typography>

                <Box sx={{ width: '20%' }}>
                  <GenericSelect
                    label="Group By"
                    name="particularType"
                    options={[
                      { value: 'Company Rate', label: 'Company Rate' },
                      { value: 'Zone', label: 'Zone' },
                      { value: 'Zone Type', label: 'Zone Type' },
                      { value: 'Vehicle Type', label: 'Vehicle Type' }
                    ]}
                    value={groupByOption}
                    onChange={(e) => setGroupByOption(e.target.value)}
                    fullWidth
                  />
                </Box>
              </Stack>
            </Grid>
          }
        </Grid>
      </MainCard>
      {/* Dialog for pop-up (Invoice Id)*/}
      <Dialog
        open={invoiceIdDialog}
        onClose={handleInvoiceIdDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            maxHeight: '80vh',
            minHeight: '40vh',
            width: '600px',
            maxWidth: '90%'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Enter invoice no. manually</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            {"Invoice won't save if entered Invoice no already exists!"}
          </Typography>

          <Stack
            direction="row"
            spacing={2} // Adjust the gap between items
            sx={{ marginTop: '8px' }}
          >
            <TextField
              label="Prefix"
              value={tempSettings.invoice?.prefix}
              variant="standard"
              onChange={(e) =>
                setTempSettings((prevTemp) => ({
                  ...prevTemp,
                  invoice: {
                    ...prevTemp.invoice,
                    prefix: e.target.value // Update prefix only in tempSettings
                  }
                }))
              }
              fullWidth
              margin="dense"
            />
            <TextField
              label="Next Number"
              value={tempSettings.invoice?.invoiceNumber}
              variant="standard"
              onChange={(e) =>
                setTempSettings((prevTemp) => ({
                  ...prevTemp,
                  invoice: {
                    ...prevTemp.invoice,
                    invoiceNumber: e.target.value // Update invoiceNumber only in tempSettings
                  }
                }))
              }
              fullWidth
              margin="dense"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              // Save changes to settings
              setSettings((prevSettings) => ({
                ...prevSettings,
                invoice: { ...tempSettings.invoice }
              }));
              setInvoiceIdDialog(false); // Close the dialog
            }}
          >
            Save
          </Button>
          <Button
            onClick={() => {
              // Close the dialog without saving changes
              setInvoiceIdDialog(false);
            }}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <AddressModal
        value={recieversDetails}
        setFilterOptions={setRecieversDetails}
        open={recieversModalOpen}
        setOpen={setRecieversModalOpen}
      />
    </>
  );
};

export default Create;
