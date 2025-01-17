import { useLocation, useNavigate } from 'react-router';

// material-ui
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
  Paper,
  Radio,
  RadioGroup,
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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party

import { FieldArray, Form, FormikProvider, useFormik } from 'formik';

// project-imports
import MainCard from 'components/MainCard';

import { dispatch, set, useSelector } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { customerPopup, selectCountry, reviewInvoicePopup, getInvoiceList } from 'store/reducers/invoice';

// assets
import { Add, Edit, Setting, Trash } from 'iconsax-react';
import { useCallback, useEffect, useState } from 'react';
import GenericSelect from 'components/select/GenericSelect';
import { formatDateUsingMoment } from 'utils/helper';
import axios from 'utils/axios';
import { getApiResponse } from 'utils/axiosHelper';
import _ from 'lodash'; // For debouncing
import useAuth from 'hooks/useAuth';
import CustomCircularLoader from 'components/CustomCircularLoader';
import { USERTYPE } from 'constant';
import axiosServices from 'utils/axios';
import moment from 'moment';

const API_URL = {
  [USERTYPE.iscabProvider]: '/invoice/create',
  [USERTYPE.isVendor]: '/invoice/create'
};

export const TAX_TYPE = {
  INDIVIDUAL: 'Individual',
  GROUP: 'Group'
};

export const DISCOUNT_TYPE = {
  ...TAX_TYPE,
  NO: 'No'
};

const DISCOUNT_BY = {
  PERCENTAGE: 'Percentage',
  AMOUNT: 'Amount'
};

export const STATUS = {
  YES: 1,
  NO: 0
};

const SETTINGS = {
  invoice: {
    preFix: 'INV',
    invoiceNumber: 1
  },

  tax: {
    // apply: TAX_TYPE.INDIVIDUAL
    apply: TAX_TYPE.GROUP
  },
  discount: {
    // apply: DISCOUNT_TYPE.INDIVIDUAL,
    apply: DISCOUNT_TYPE.GROUP,
    // by: DISCOUNT_BY.PERCENTAGE

    by: DISCOUNT_BY.AMOUNT
  },
  additionalCharges: STATUS.YES,
  roundOff: STATUS.YES
};

const item = {
  itemName: '',
  rate: 0,
  quantity: 0,

  HSN_SAC_code: '',
  itemTax: 0,
  Tax_amount: 0,

  itemDiscount: 0,
  discount: 0,

  amount: 0
};

const getInitialValues = (data, user, userSpecificData, invoiceData = null, customerInfo = null, servicePeriod = null) => {
  const result = {
    id: 120,
    invoice_id: Date.now(),
    status: 'Unpaid' || '',
    date: new Date(), // For Invoice Date
    due_date: null, // For Invoice Due Date
    start_date: servicePeriod ? new Date(servicePeriod.minDate) : null, // For Start Date
    end_date: servicePeriod ? new Date(servicePeriod.maxDate) : null, // For End Date
    cashierInfo: {
      cabProviderLegalName: userSpecificData?.cabProviderLegalName || userSpecificData?.vendorCompanyName || '',
      PAN: userSpecificData?.PAN || '',
      GSTIN: userSpecificData?.GSTIN || '',
      contactPersonName: userSpecificData?.contactPersonName || '',
      workEmail: user?.userEmail || '',
      workMobileNumber: userSpecificData?.workMobileNumber || '',
      officeAddress: userSpecificData?.officeAddress || '',
      officePinCode: userSpecificData?.officePinCode || '',
      officeState: userSpecificData?.officeState || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      postal_code: user?.pinCode || ''
    },
    customerInfo: customerInfo
      ? customerInfo
      : {
          address: '',
          city: '',
          state: '',
          postal_code: '',
          GSTIN: '',
          company_name: '',
          PAN: '',
          company_email: ''
        },
    invoiceData: invoiceData ? invoiceData : [item],
    bank_details: {
      accountHolderName: userSpecificData?.cabProviderLegalName || '',
      accountNumber: userSpecificData?.workMobileNumber || '',
      IFSCCode: userSpecificData?.IFSC_code || '',
      bankName: userSpecificData?.branchName || ''
    },
    total: 0,
    subTotal: 0,
    totalTax: 0,
    totalDiscount: 0,
    grandTotal: 0,

    notes: '',
    terms: '',
    CGST: 0,
    SGST: 0,
    IGST: 0,
    MCDAmount: 0,
    tollParkingCharges: 0,
    penalty: 0,
    additional: {}
  };

  return result;
};

const getDiscountLabel = (val) => {
  if (!val) return;

  const { by, currency = '₹' } = val;
  return by === DISCOUNT_BY.PERCENTAGE
    ? `Discount (%)` // Use percentage symbol for percentage discounts
    : `Discount (${currency})`; // Use currency symbol for amount discounts
};

const PARTICULAR_TYPE = {
  COMPANY_RATE: 0,
  ZONE: 1,
  ZONE_TYPE: 2,
  VEHICLE_TYPE: 3
};

const PARTICULAR_TYPE_GROUP_KEY = {
  [PARTICULAR_TYPE.COMPANY_RATE]: 'companyRate',
  [PARTICULAR_TYPE.ZONE]: 'zoneNameID',
  [PARTICULAR_TYPE.ZONE_TYPE]: 'zoneTypeID',
  [PARTICULAR_TYPE.VEHICLE_TYPE]: 'vehicleTypeID'
};

const optionsForParticularType = [
  { value: PARTICULAR_TYPE.COMPANY_RATE, label: 'Company Rate' },
  { value: PARTICULAR_TYPE.ZONE, label: 'Zone' },
  { value: PARTICULAR_TYPE.ZONE_TYPE, label: 'Zone Type' },
  { value: PARTICULAR_TYPE.VEHICLE_TYPE, label: 'Vehicle Type' }
];

// Helper function to extract the correct grouping key
const getGroupKey = (item, key) => {
  if (key === 'zoneNameID') {
    return item[key]?.zoneName || 'Unknown'; // Access the name inside the object
  }
  if (key === 'zoneTypeID') {
    return item[key]?.zoneTypeName || 'Unknown'; // Access the name inside the object
  }
  if (key === 'vehicleTypeID') {
    return item[key]?.vehicleTypeName || 'Unknown'; // Access the name inside the object
  }
  return item[key];
};

const groupDataWithSuffix = (data, groupByKey) => {
  // Group the data
  const grouped = _.groupBy(data, (item) => {
    const primaryKey = getGroupKey(item, groupByKey);
    const secondaryKey = groupByKey !== 'companyRate' ? item.companyRate : '';
    return `${primaryKey}||${secondaryKey}`;
  });

  // Convert grouped data into unique objects with a suffix for duplicates
  const result = [];
  let suffixCounts = {}; // Tracks suffix for each unique group key

  Object.entries(grouped).forEach(([key, items], i) => {
    const [primaryKey, secondaryKey] = key.split('||');

    // Increment the suffix count for this primaryKey
    suffixCounts[primaryKey] = (suffixCounts[primaryKey] || 0) + 1;
    const suffix = `(${suffixCounts[primaryKey]})`;

    const ids = items.map((item) => item._id);
    // Add the formatted object to the result
    result.push({
      itemName: groupByKey === 'companyRate' ? `Trip (${i + 1})` : `${primaryKey} ${suffix}`,
      rate: secondaryKey || items[0].companyRate || 'Unknown',
      qty: items.length,
      ids: ids
    });
  });

  return result;
};

const groupGuardRates = (tripData) => {
  const groupedRates = tripData.reduce((acc, item) => {
    const guardPrice = item.companyGuardPrice;

    if (!acc[guardPrice]) {
      acc[guardPrice] = { name: `Guard Price (${Object.keys(acc).length + 1})`, qty: 0, rate: guardPrice };
    }

    acc[guardPrice].qty += 1; // Increment the count for the unique rate

    return acc;
  }, {});

  // Convert grouped data into an array format
  return Object.values(groupedRates);
};

const Create3 = () => {
  const theme = useTheme();
  const navigation = useNavigate();
  const location = useLocation();
  const stateData = location.state?.tripData;
  const [tripData, setTripData] = useState(stateData || []);

  const { user, userSpecificData } = useAuth();

  const { isCustomerOpen, countries, country, lists, isOpen } = useSelector((state) => state.invoice);
  const [settings, setSettings] = useState({});
  const [isEditable] = useState(false);
  const [cashierValues, setCashierValues] = useState({});
  const [formValues, setFormValues] = useState(cashierValues || {});
  const [editMode, setEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOption, setSelectedOption] = useState('auto'); // 'auto' for auto-generate, 'manual' for manual input
  const [prefix, setPrefix] = useState('INV-');
  const [nextNumber, setNextNumber] = useState('000001');
  const [invoiceId, setInvoiceId] = useState(`${prefix}${nextNumber}`);
  const [isBankDetailsEditing, setIsBankDetailsEditing] = useState(false);
  const [formikInitialValues, setFormikInitialValues] = useState(getInitialValues(settings, user, userSpecificData)); // NEW
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(true); // Start with the dialog open
  // const [showCreatePage, setShowCreatePage] = useState(false); // Track if the create page should be visible
  const [showCreatePage, setShowCreatePage] = useState(true); // true because don't want to show popoup for settings
  const [loadingTable, setLoadingTable] = useState(true); // New state for table loading
  const [particularType, setParticularType] = useState(0);
  const [groupTax, setGroupTax] = useState(0);
  const [groupDiscount, setGroupDiscount] = useState(0);
  const [linkedTripIds, setLinkedTripIds] = useState([]);
  const [groupBy, setGroupBy] = useState('companyRate');
  const [customerInfo, setCustomerInfo] = useState(null);
  const [servicePeriod, setServicePeriod] = useState(null);
  // tripData
  const [additionalRates, setAdditonalRates] = useState({
    guardRate: 0,
    tollCharges: 0,
    additonalCharges: 0,
    penalty: 0,
    mcdCharge: 0
  });

  const userType = useSelector((state) => state.auth.userType);

  const handleFormikSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      const cabProviderId = JSON.parse(localStorage.getItem('userInformation'))?.userId || '';
      const format = 'YYYY-MM-DD';

      if (!values?.customerInfo?._id) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Please select company',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
        return;
      }
      console.log('values.invoiceData', values);

      const taxInformation = values.invoiceData.map((item) => {
        return {
          ids: item.ids,
          taxRate: item.itemTax
        };
      });
      const payload = {
        data: {
          companyId: values?.customerInfo?._id || '',
          cabProviderId,
          invoiceNumber: invoiceId,
          invoiceDate: formatDateUsingMoment(values?.date, format),
          dueDate: formatDateUsingMoment(values?.due_date, format),
          servicePeriod:
            formatDateUsingMoment(values?.start_date, 'DD-MM-YYYY') + ' to ' + formatDateUsingMoment(values?.end_date, 'DD-MM-YYYY'),
          linkedTripIds1: taxInformation,
          linkedTripIds,
          invoiceData: values?.invoiceData || [],
          // subTotal: values?.subTotal,
          // totalAmount: values?.grandTotal,
          // grandTotal: values?.grandTotal,
          subTotal: subTotal,
          totalAmount: grandTotal,
          grandTotal: grandTotal,
          CGST: totalTaxAmount / 2 || 0,
          SGST: totalTaxAmount / 2 || 0,
          IGST: totalTaxAmount || 0,
          MCDAmount: additionalRates.mcdCharge,
          tollParkingCharges: additionalRates.tollCharges,
          penalty: additionalRates.penalty,
          terms: values?.terms,
          billedTo: values?.customerInfo,
          billedBy: values?.cashierInfo,
          bankDetails: values?.bank_details,
          settings: {
            discount: {
              apply: settings.discount.apply,
              by: settings.discount.by
            },
            tax: {
              apply: settings.tax.apply
            }
          }
        }
      };

      console.log({ payload });
      // alert(JSON.stringify(payload, null, 2));
      const response = await axios.post(API_URL[userType], payload);

      if (response.status === 201) {
        dispatch(
          openSnackbar({
            open: true,
            message: `Invoice Created successfully`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );

        resetForm();
        navigation('/apps/invoices/list', {
          replace: true
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formik = useFormik({
    // initialValues: getInitialValues(settings),
    initialValues: formikInitialValues,
    enableReinitialize: true,
    onSubmit: handleFormikSubmit
  });

  const { handleBlur, errors, handleChange, handleSubmit, values, isValid, setFieldValue, touched } = formik;

  useEffect(() => {
    async function fetchSettings() {
      try {
        const cabProviderId = JSON.parse(localStorage.getItem('userInformation'))?.userId || '';
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

          setPrefix(invoiceSetting?.invoice?.prefix + '-' || 'INV-');
          setNextNumber(String(invoiceSetting?.invoice?.invoiceNumber) || '000001');
          setInvoiceId(invoiceSetting?.invoice?.prefix + '-' + String(invoiceSetting?.invoice?.invoiceNumber));

          setLoading(false);
        }
      } catch (error) {
        console.log('Error fetching settings: (Invoice Creation)', error);
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

    fetchSettings();
  }, []);

  const handleBankDetailsEditToggle = () => {
    setIsBankDetailsEditing(!isBankDetailsEditing);
  };

  const handleSettingClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOptionChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);

    // Auto-generate invoice ID when 'auto' is selected
    if (value === 'auto') {
      setInvoiceId(`${prefix}${nextNumber}`); // Update invoiceId based on prefix and next number
    }
  };

  // Handle manual input for the invoice ID
  const handleInvoiceIdChange = (event) => {
    if (selectedOption === 'manual') {
      setInvoiceId(event.target.value); // Allow manual input when 'manual' is selected
    }
  };

  const handleSave = () => {
    if (selectedOption === 'auto') {
      // Combine prefix and nextNumber to create the invoiceId
      const newInvoiceId = `${prefix}${nextNumber}`;
      setInvoiceId(newInvoiceId); // Update the controlled value
    }
    // Close the dialog after saving
    handleCloseDialog();
  };

  useEffect(() => {
    setFormValues(cashierValues);
  }, [cashierValues]);

  const handleChangeCashierDetails = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSaveCashierDetails = () => {
    setEditMode(false);
    setFieldValue('cashierInfo', formValues);
  };

  const handleEditCashierDetails = () => {
    setEditMode(true);
  };

  useEffect(() => {
    setCashierValues(values?.cashierInfo || {});
  }, []);

  useEffect(() => {
    setLoadingTable(true); // Set loading to true while waiting for initial values

    setFormikInitialValues(getInitialValues(settings, user, userSpecificData));

    setLoadingTable(false); // Set loading to false when initial values are ready
  }, [settings, user, userSpecificData]);

  useEffect(() => {
    const fetchCompanyData = async (id) => {
      try {
        if (id) {
          const response = await axiosServices.get(`/company/by?companyId=${id}`);
          if (response.status === 200) {
            const data = response.data.data;
            const { rateData, ...rest } = data;
            setCustomerInfo(rest);
          }
        }
      } catch (error) {
        console.log('Error fetching company data:', error);
      }
    };

    const companyID = tripData[0]?.companyID?._id || '';

    // Extract start date and end date
    const result = findMinMaxDates(tripData);
    if (typeof result === 'object') {
      setServicePeriod(result);
    }

    const allTripID = tripData.map((trip) => trip._id);
    setLinkedTripIds(allTripID);

    if (companyID) {
      fetchCompanyData(companyID);
    }
  }, [tripData, setFieldValue]);

  useEffect(() => {
    const mappedData = groupDataWithSuffix(tripData, groupBy);
    // const mappedData = groupDataWithSuffix(dummyData, groupBy);
    console.log({ mappedData });

    const updatedData = mappedData.map((item) => {
      return {
        itemName: item.itemName,
        rate: isNaN(Number(item.rate)) ? 0 : Number(item.rate),
        quantity: item.qty,

        HSN_SAC_code: '',
        itemTax: 0,
        Tax_amount: 0,

        itemDiscount: 0,
        discount: 0,
        ids: item.ids || [],

        amount: isNaN(Number(item.rate)) ? 0 : Number(item.rate) * item.qty
      };
    });

    const groupedGuardRates = groupGuardRates(tripData);

    const guardRates =
      groupedGuardRates.length > 0
        ? groupedGuardRates.map((item) => {
            return {
              itemName: item.name,
              rate: typeof item.rate === 'string' ? 0 : item.rate,
              quantity: item.qty,

              HSN_SAC_code: '',
              itemTax: 0,
              Tax_amount: 0,

              itemDiscount: 0,
              discount: 0,

              amount: typeof item.rate === 'string' ? 0 : item.rate * item.qty
            };
          })
        : [];

    const allData = [...updatedData, ...guardRates];

    setFormikInitialValues(getInitialValues(settings, user, userSpecificData, allData, customerInfo, servicePeriod));
  }, [tripData, groupBy, setFieldValue, user, userSpecificData, settings, customerInfo, servicePeriod]);

  const handleSelectChange = async (event) => {
    try {
      const selectedType = event.target.value;
      setParticularType(selectedType);
      setGroupBy(PARTICULAR_TYPE_GROUP_KEY[selectedType] || 'companyRate');
    } catch (error) {
      console.log('Error : api of particular type', error);
    }
  };

  useEffect(() => {
    async function fetchCabProviderDetails() {
      // TODO : Fetch cab provider details from API
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const res = {
        cabProviderLegalName: 'User01 Travels',
        PAN: 'ABCTY1234D',
        GSTIN: '22AAAAA0000A1Z5',
        contactPersonName: 'Suresh Yadav',
        workEmail: 'user123@gmail.com',
        workMobileNumber: 9988776655,
        officeAddress: 'NSP Pitampura Delhi',
        officePinCode: '110035',
        officeState: 'Delhi',
        address: 'Netaji Subhash Place Delhi,110034',
        city: 'Kolkata',
        state: 'West Bengal',
        postal_code: 700098
      };
      formik.setFieldValue('customerInfo', res);
    }

    if (userType === USERTYPE.isVendor) {
      fetchCabProviderDetails();
    }
  }, [userType]);

  const calculateTotals = (invoiceData, additionalRates) => {
    const { guardRate, tollCharges, additonalCharges, penalty, mcdCharge } = additionalRates;

    console.log({ guardRate });
    const totals = invoiceData.reduce(
      (acc, item) => ({
        total: acc.subTotal + item.amount,
        subTotal: acc.subTotal + item.amount,
        totalTaxAmount: acc.totalTaxAmount + item.Tax_amount,
        totalDiscountAmount: acc.totalDiscountAmount + item.discount
      }),
      { total: 0, subTotal: 0, totalTaxAmount: 0, totalDiscountAmount: 0 }
    );

    // Incorporate additional rates into subTotal
    totals.subTotal += penalty;

    totals.grandTotal = totals.subTotal + totals.totalTaxAmount + tollCharges + additonalCharges + mcdCharge + -totals.totalDiscountAmount;

    return totals;
  };

  useEffect(() => {
    if (tripData && tripData.length > 0) {
      console.log({ tripData });
      const { guardRate, additonalRate, mcdCharges, tollCharges, penalties } = tripData.reduce(
        (totals, item) => ({
          guardRate: totals.guardRate + item.companyGuardPrice,
          additonalRate: totals.additonalRate + item.addOnRate,
          mcdCharges: totals.mcdCharges + item.mcdCharge,
          tollCharges: totals.tollCharges + item.tollCharge,
          penalties: totals.penalties - item.companyPenalty // Subtract for negative penalties
        }),
        { guardRate: 0, additonalRate: 0, mcdCharges: 0, tollCharges: 0, penalties: 0 }
      );

      console.log({ guardRate, additonalRate, mcdCharges, tollCharges, penalties });
      setAdditonalRates({
        guardRate: guardRate,
        tollCharges: tollCharges,
        additonalCharges: additonalRate,
        penalty: penalties,
        mcdCharge: mcdCharges
      });
    }
  }, [tripData]);

  const { total, subTotal, totalTaxAmount, totalDiscountAmount, grandTotal } = calculateTotals(formik.values.invoiceData, additionalRates);

  console.log({ subTotal, totalTaxAmount, totalDiscountAmount, grandTotal });

  if (loading) return <CustomCircularLoader />;

  return (
    <>
      {showCreatePage && (
        <MainCard>
          <FormikProvider value={formik}>
            <Form onSubmit={formik.handleSubmit} noValidate>
              <Grid container spacing={2}>
                {/* Invoice Id */}
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Stack spacing={1}>
                        <InputLabel>Invoice Id</InputLabel>
                        <FormControl sx={{ width: '100%' }}>
                          <TextField
                            required
                            name="invoice_id"
                            id="invoice_id"
                            value={invoiceId} // Controlled value
                            onChange={handleInvoiceIdChange}
                            InputProps={{
                              readOnly: selectedOption === 'auto', // Editable only if 'manual' is selected
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={handleSettingClick} size="small">
                                    <Setting color="rgb(91,107,121)" />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                            sx={{
                              borderColor: isEditable ? 'primary.main' : 'default',
                              '& .MuiOutlinedInput-root': {
                                '& input': {
                                  padding: '8px'
                                },
                                '& fieldset': {
                                  borderColor: isEditable ? 'primary.main' : 'default'
                                },
                                '&:hover fieldset': {
                                  borderColor: isEditable ? 'primary.main' : 'default'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main'
                                }
                              }
                            }}
                          />
                        </FormControl>
                      </Stack>

                      {/* Dialog for pop-up (Invoice Id)*/}
                      <Dialog
                        open={openDialog}
                        onClose={handleCloseDialog}
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
                        <DialogTitle sx={{ fontWeight: 'bold' }}>Configure Invoice Number Preferences</DialogTitle>
                        <DialogContent>
                          <Typography variant="subtitle2" gutterBottom>
                            Are you sure about changing this setting?
                          </Typography>
                          <RadioGroup value={selectedOption} onChange={handleOptionChange}>
                            <FormControlLabel
                              value="auto"
                              control={<Radio />}
                              label="Continue auto-generating invoice numbers"
                              sx={{
                                backgroundColor: selectedOption === 'auto' ? '#e3f2fd' : 'transparent',
                                borderRadius: '8px',
                                padding: '8px',
                                transition: 'background-color 0.3s'
                              }}
                            />
                            {selectedOption === 'auto' && (
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '16px',
                                  marginTop: '8px'
                                }}
                              >
                                <TextField
                                  label="Prefix"
                                  value={prefix}
                                  variant="standard"
                                  onChange={(e) => setPrefix(e.target.value)}
                                  fullWidth
                                  margin="dense"
                                />
                                <TextField
                                  label="Next Number"
                                  value={nextNumber}
                                  variant="standard"
                                  onChange={(e) => setNextNumber(e.target.value)}
                                  fullWidth
                                  margin="dense"
                                />
                              </div>
                            )}
                            <FormControlLabel
                              value="manual"
                              control={<Radio />}
                              label="Enter invoice numbers manually"
                              sx={{
                                backgroundColor: selectedOption === 'manual' ? '#e3f2fd' : 'transparent',
                                borderRadius: '8px',
                                padding: '8px',
                                transition: 'background-color 0.3s'
                              }}
                            />
                          </RadioGroup>
                        </DialogContent>
                        <DialogActions>
                          <Button color="primary" variant="contained" onClick={handleSave}>
                            Save
                          </Button>
                          <Button onClick={handleCloseDialog} color="primary">
                            Close
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    {/* Invoice Date */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack spacing={1}>
                        <InputLabel>Invoice Date</InputLabel>
                        <FormControl sx={{ width: '100%' }} error={Boolean(touched.date && errors.date)}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              format="dd/MM/yyyy"
                              value={values.date}
                              onChange={(newValue) => setFieldValue('date', newValue)}
                              sx={{
                                '& .MuiInputBase-input': {
                                  padding: '8px'
                                }
                              }}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </Stack>
                      {touched.date && errors.date && <FormHelperText error={true}>{errors.date}</FormHelperText>}
                    </Grid>

                    {/* Invoice Due Date */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack spacing={1}>
                        <InputLabel>Invoice Due Date</InputLabel>
                        <FormControl sx={{ width: '100%' }} error={Boolean(touched.due_date && errors.due_date)}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              format="dd/MM/yyyy"
                              value={values.due_date}
                              onChange={(newValue) => setFieldValue('due_date', newValue)}
                              sx={{
                                '& .MuiInputBase-input': {
                                  padding: '8px'
                                }
                              }}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </Stack>
                      {touched.due_date && errors.due_date && <FormHelperText error={true}>{errors.due_date}</FormHelperText>}
                    </Grid>

                    {/* <Grid item xs={12} sm={6} md={3}></Grid>
                <Grid item xs={12} sm={6} md={3}></Grid> */}

                    {/* Service Start Date */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack spacing={1}>
                        <InputLabel>Service Start Date</InputLabel>
                        <FormControl sx={{ width: '100%' }} error={Boolean(touched.start_date && errors.start_date)}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              format="dd/MM/yyyy"
                              value={values.start_date}
                              onChange={(newValue) => setFieldValue('start_date', newValue)}
                              sx={{
                                '& .MuiInputBase-input': {
                                  padding: '8px'
                                }
                              }}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </Stack>
                      {touched.start_date && errors.start_date && <FormHelperText error={true}>{errors.start_date}</FormHelperText>}
                    </Grid>

                    {/* Service End Date */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack spacing={1}>
                        <InputLabel>Service End Date</InputLabel>
                        <FormControl sx={{ width: '100%' }} error={Boolean(touched.end_date && errors.end_date)}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              format="dd/MM/yyyy"
                              value={values.end_date}
                              onChange={(newValue) => setFieldValue('end_date', newValue)}
                              sx={{
                                '& .MuiInputBase-input': {
                                  padding: '8px'
                                }
                              }}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </Stack>
                      {touched.end_date && errors.end_date && <FormHelperText error={true}>{errors.end_date}</FormHelperText>}
                    </Grid>
                  </Grid>
                </Grid>

                {/* Bill by */}
                <Grid item xs={12} sm={6}>
                  <MainCard sx={{ minHeight: 168 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <Stack spacing={2}>
                          <Typography variant="h5">Billed By:</Typography>
                          <Stack sx={{ width: '100%' }}>
                            {editMode ? (
                              <>
                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <TextField
                                      label="Company Name"
                                      value={formValues.cabProviderLegalName || 'N/A'}
                                      name="cabProviderLegalName"
                                      onChange={handleChangeCashierDetails}
                                      fullWidth
                                      sx={{
                                        '& .MuiInputBase-input': {
                                          padding: '8px'
                                        }
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextField
                                      label="Address"
                                      value={formValues.address || 'N/A'}
                                      name="address"
                                      onChange={handleChangeCashierDetails}
                                      fullWidth
                                      sx={{
                                        '& .MuiInputBase-input': {
                                          padding: '8px'
                                        }
                                      }}
                                    />
                                  </Grid>

                                  <Grid item xs={6}>
                                    <TextField
                                      label="City"
                                      value={formValues.city || 'N/A'}
                                      name="city"
                                      onChange={handleChangeCashierDetails}
                                      fullWidth
                                      sx={{
                                        '& .MuiInputBase-input': {
                                          padding: '8px'
                                        }
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextField
                                      label="State"
                                      value={formValues.state || 'N/A'}
                                      name="state"
                                      onChange={handleChangeCashierDetails}
                                      fullWidth
                                      sx={{
                                        '& .MuiInputBase-input': {
                                          padding: '8px'
                                        }
                                      }}
                                    />
                                  </Grid>

                                  <Grid item xs={6}>
                                    <TextField
                                      label="Postal Code"
                                      value={formValues.postal_code || 'N/A'}
                                      name="postal_code"
                                      onChange={handleChangeCashierDetails}
                                      fullWidth
                                      sx={{
                                        '& .MuiInputBase-input': {
                                          padding: '8px'
                                        }
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextField
                                      label="GSTIN"
                                      value={formValues.GSTIN || 'N/A'}
                                      name="GSTIN"
                                      onChange={handleChangeCashierDetails}
                                      fullWidth
                                      sx={{
                                        '& .MuiInputBase-input': {
                                          padding: '8px'
                                        }
                                      }}
                                    />
                                  </Grid>

                                  <Grid item xs={6}>
                                    <TextField
                                      label="PAN"
                                      value={formValues.PAN || 'N/A'}
                                      name="PAN"
                                      onChange={handleChangeCashierDetails}
                                      fullWidth
                                      sx={{
                                        '& .MuiInputBase-input': {
                                          padding: '8px'
                                        }
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                              </>
                            ) : (
                              <>
                                <Typography variant="subtitle1">{formValues.cabProviderLegalName || 'N/A'}</Typography>
                                <Typography color="secondary">
                                  {`${formValues.address || 'N/A'}, ${formValues.city || 'N/A'}, ${formValues.state || 'N/A'}-${
                                    formValues.postal_code || 'N/A'
                                  }`}
                                </Typography>
                                <Typography color="secondary">
                                  <strong>GSTIN:</strong> {formValues.GSTIN || 'N/A'}
                                </Typography>
                                <Typography color="secondary">
                                  <strong>PAN:</strong> {formValues.PAN || 'N/A'}
                                </Typography>
                              </>
                            )}
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box textAlign={{ xs: 'left', sm: 'right' }} color="secondary.200">
                          {editMode ? (
                            <Button variant="outlined" color="secondary" onClick={handleSaveCashierDetails} size="small">
                              Save
                            </Button>
                          ) : (
                            <Button
                              variant="outlined"
                              startIcon={<Edit />}
                              color="secondary"
                              onClick={handleEditCashierDetails}
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

                {/* Bill To */}
                <Grid item xs={12} sm={6}>
                  <MainCard sx={{ minHeight: 168 }}>
                    {userType === USERTYPE.iscabProvider && (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Stack spacing={2}>
                            <Typography variant="h5">Billed To:</Typography>
                            <Stack sx={{ width: '100%' }}>
                              <Typography variant="subtitle1">{values?.customerInfo?.company_name || ''}</Typography>
                              {values?.customerInfo?.address && (
                                <Typography color="secondary">
                                  {values?.customerInfo?.address}
                                  {values?.customerInfo?.city && `, ${values?.customerInfo?.city}`}
                                  {values?.customerInfo?.state &&
                                    values?.customerInfo?.postal_code &&
                                    `, ${values?.customerInfo?.state}-${values?.customerInfo?.postal_code}`}
                                </Typography>
                              )}
                              {values?.customerInfo?.GSTIN && (
                                <Typography color="secondary">
                                  <strong>GSTIN:</strong> {values?.customerInfo?.GSTIN}
                                </Typography>
                              )}
                              {values?.customerInfo?.PAN && (
                                <Typography color="secondary">
                                  <strong>PAN:</strong> {values?.customerInfo?.PAN}
                                </Typography>
                              )}
                            </Stack>
                          </Stack>
                        </Grid>
                      </Grid>
                    )}

                    {userType === USERTYPE.isVendor && (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Stack spacing={2}>
                            <Typography variant="h5">Billed To:</Typography>
                            <Stack sx={{ width: '100%' }}>
                              <Typography variant="subtitle1">{values?.customerInfo?.cabProviderLegalName || 'N/A'}</Typography>
                              <Typography variant="subtitle1">{values?.customerInfo?.contactPersonName || 'N/A'}</Typography>
                              <Typography variant="subtitle1">{values?.customerInfo?.workEmail || 'N/A'}</Typography>
                              <Typography variant="subtitle1">{values?.customerInfo?.workMobileNumber || 'N/A'}</Typography>
                              <Typography variant="subtitle1">{values?.customerInfo?.officeAddress || 'N/A'}</Typography>
                              <Typography variant="subtitle1">{values?.customerInfo?.officePinCode || 'N/A'}</Typography>
                              <Typography variant="subtitle1">{values?.customerInfo?.officeState || 'N/A'}</Typography>
                              <Typography variant="subtitle1">{values?.customerInfo?.address || 'N/A'}</Typography>
                              <Typography variant="subtitle1">{values?.customerInfo?.postal_code || 'N/A'}</Typography>
                              <Typography variant="subtitle1">{values?.customerInfo?.GSTIN || 'N/A'}</Typography>
                              <Typography variant="subtitle1">{values?.customerInfo?.PAN || 'N/A'}</Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                      </Grid>
                    )}
                  </MainCard>
                  {touched.customerInfo && errors.customerInfo && (
                    <FormHelperText error={true}>{errors?.customerInfo?.name}</FormHelperText>
                  )}
                </Grid>

                {/* Details */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} justifyContent={'space-between'} alignItems={'center'}>
                    <Typography variant="h5">Details</Typography>
                    <Typography variant="caption" sx={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'text.secondary' }}>
                      Generating Invoice for{' '}
                      <Typography component="span" sx={{ fontWeight: 'bold', fontStyle: 'normal', color: 'primary.main' }}>
                        {tripData?.length} trips
                      </Typography>
                      .
                    </Typography>

                    <Box sx={{ width: '20%' }}>
                      <GenericSelect
                        label="Group By"
                        name="particularType"
                        options={optionsForParticularType}
                        value={particularType}
                        onChange={handleSelectChange}
                        fullWidth
                      />
                    </Box>
                  </Stack>
                </Grid>

                {/* Particular Table (Invoice) */}
                {loadingTable ? (
                  <Grid item xs={12} sx={{ textAlign: 'center', height: '100px' }} alignContent={'center'}>
                    <CircularProgress size={30} />
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <FieldArray
                      name="invoiceData"
                      render={(arrayHelpers) => (
                        <>
                          <TableContainer component={Paper}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Item Name</TableCell>
                                  <TableCell>Rate</TableCell>
                                  <TableCell>Quantity</TableCell>
                                  <TableCell>HSN/SAC Code</TableCell> {/* HSN/SAC column */}
                                  <TableCell>Tax (%)</TableCell> {/* Always show tax header */}
                                  {/* <TableCell>Discount (%)</TableCell>{" "} */}
                                  {settings?.discount?.apply !== DISCOUNT_TYPE.NO && (
                                    <TableCell>{getDiscountLabel(settings?.discount)}</TableCell>
                                  )}
                                  {/* Always show discount header */}
                                  <TableCell>Tax</TableCell> {/* Always show tax header */}
                                  <TableCell>Discount</TableCell> <TableCell>Amount</TableCell>
                                  {/* Always show discount header */}
                                  <TableCell>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {values.invoiceData.map((item, index) => {
                                  return (
                                    <TableRow key={index}>
                                      {/* Item Name */}
                                      <TableCell>
                                        <TextField
                                          label="Item Name"
                                          name={`invoiceData[${index}].itemName`}
                                          value={item.itemName}
                                          onChange={handleChange}
                                          fullWidth
                                        />
                                      </TableCell>

                                      {/* Rate */}
                                      <TableCell>
                                        <TextField
                                          label="Rate"
                                          type="number"
                                          name={`invoiceData[${index}].rate`}
                                          value={item.rate}
                                          // onChange={handleChange}
                                          onChange={(e) => {
                                            const rateValue = e.target.value;
                                            const qty = formik.getFieldProps(`invoiceData[${index}].quantity`).value;
                                            const itemTax = formik.getFieldProps(`invoiceData[${index}].itemTax`).value;
                                            const itemDiscount = formik.getFieldProps(`invoiceData[${index}].itemDiscount`).value;
                                            const amount = rateValue * qty;

                                            const taxAmount =
                                              settings?.tax?.apply === 'Individual' ? (amount * itemTax) / 100 : (amount * groupTax) / 100; // Apply groupTax for group settings

                                            setFieldValue(`invoiceData[${index}].rate`, Number(rateValue));
                                            setFieldValue(`invoiceData[${index}].Tax_amount`, Number(taxAmount));
                                            setFieldValue(`invoiceData[${index}].amount`, Number(amount));

                                            let itemDiscountAmount = 0;
                                            if (settings?.discount?.apply === 'Individual') {
                                              if (settings?.discount?.by === 'Percentage') {
                                                itemDiscountAmount = (amount * itemDiscount) / 100;
                                              } else if (settings?.discount?.by === 'Amount') {
                                                itemDiscountAmount = itemDiscount;
                                              }
                                            } else if (settings?.discount?.apply === 'Group') {
                                              if (settings?.discount?.by === 'Percentage') {
                                                itemDiscountAmount = (amount * itemDiscount) / 100;
                                              } else if (settings?.discount?.by === 'Amount') {
                                                itemDiscountAmount = itemDiscount;
                                              }
                                            }

                                            setFieldValue(`invoiceData[${index}].discount`, Number(itemDiscountAmount));
                                          }}
                                          fullWidth
                                        />
                                      </TableCell>

                                      {/* Quantity */}
                                      <TableCell>
                                        <TextField
                                          label="Quantity"
                                          type="number"
                                          name={`invoiceData[${index}].quantity`}
                                          value={item.quantity}
                                          // onChange={handleChange}
                                          onChange={(e) => {
                                            const qtyValue = e.target.value;
                                            const rate = formik.getFieldProps(`invoiceData[${index}].rate`).value;
                                            const itemTax = formik.getFieldProps(`invoiceData[${index}].itemTax`).value;
                                            const itemDiscount = formik.getFieldProps(`invoiceData[${index}].itemDiscount`).value;

                                            const amount = rate * qtyValue;
                                            const taxAmount =
                                              settings?.tax?.apply === 'Individual' ? (amount * itemTax) / 100 : (amount * groupTax) / 100; // Apply groupTax for group settings

                                            setFieldValue(`invoiceData[${index}].quantity`, Number(qtyValue));
                                            setFieldValue(`invoiceData[${index}].Tax_amount`, Number(taxAmount));
                                            setFieldValue(`invoiceData[${index}].amount`, Number(amount));

                                            let itemDiscountAmount = 0;
                                            if (settings?.discount?.apply === 'Individual') {
                                              if (settings?.discount?.by === 'Percentage') {
                                                itemDiscountAmount = (amount * itemDiscount) / 100;
                                              } else if (settings?.discount?.by === 'Amount') {
                                                itemDiscountAmount = itemDiscount;
                                              }
                                            } else if (settings?.discount?.apply === 'Group') {
                                              if (settings?.discount?.by === 'Percentage') {
                                                itemDiscountAmount = (amount * itemDiscount) / 100;
                                              } else if (settings?.discount?.by === 'Amount') {
                                                itemDiscountAmount = itemDiscount;
                                              }
                                            }

                                            setFieldValue(`invoiceData[${index}].discount`, Number(itemDiscountAmount));
                                          }}
                                          fullWidth
                                        />
                                      </TableCell>

                                      {/* Code */}
                                      <TableCell>
                                        <TextField
                                          label="HSN/SAC Code"
                                          name={`invoiceData[${index}].HSN_SAC_code`} // HSN/SAC field
                                          value={item.HSN_SAC_code}
                                          onChange={handleChange}
                                          fullWidth
                                        />
                                      </TableCell>

                                      {/* Item Tax */}
                                      <TableCell>
                                        <TextField
                                          label="Tax (%)"
                                          type="number"
                                          name={`invoiceData[${index}].itemTax`} // Tax for individual items
                                          value={item.itemTax}
                                          // onChange={handleChange}
                                          onChange={(e) => {
                                            const taxValue = e.target.value;
                                            const rate = formik.getFieldProps(`invoiceData[${index}].rate`).value;
                                            const qty = formik.getFieldProps(`invoiceData[${index}].quantity`).value;
                                            const amount = rate * qty;
                                            const taxAmount =
                                              settings?.tax?.apply === 'Individual' ? (amount * taxValue) / 100 : (amount * groupTax) / 100; // Apply groupTax for group settings
                                            setFieldValue(`invoiceData[${index}].itemTax`, Number(taxValue));
                                            setFieldValue(`invoiceData[${index}].Tax_amount`, Number(taxAmount));
                                          }}
                                          fullWidth
                                          disabled={settings?.tax?.apply === 'Group'} // Disable if tax applies at group level
                                        />
                                      </TableCell>

                                      {/* Item Discount */}
                                      {settings?.discount?.apply !== DISCOUNT_TYPE.NO && (
                                        <TableCell>
                                          <TextField
                                            // label="Discount (%)"
                                            label={getDiscountLabel(settings?.discount)}
                                            type="number"
                                            name={`invoiceData[${index}].itemDiscount`} // Discount for individual items
                                            value={item.itemDiscount}
                                            // onChange={handleChange}
                                            onChange={(e) => {
                                              const discountValue = e.target.value;
                                              let itemDiscountAmount = 0;

                                              const rate = formik.getFieldProps(`invoiceData[${index}].rate`).value;
                                              const qty = formik.getFieldProps(`invoiceData[${index}].quantity`).value;
                                              const amount = rate * qty;

                                              if (settings?.discount?.apply === 'Individual') {
                                                if (settings?.discount?.by === 'Percentage') {
                                                  itemDiscountAmount = (amount * discountValue) / 100;
                                                } else if (settings?.discount?.by === 'Amount') {
                                                  itemDiscountAmount = discountValue;
                                                }
                                              } else if (settings?.discount?.apply === 'Group') {
                                                if (settings?.discount?.by === 'Percentage') {
                                                  itemDiscountAmount = (amount * discountValue) / 100;
                                                } else if (settings?.discount?.by === 'Amount') {
                                                  itemDiscountAmount = discountValue;
                                                }
                                              }

                                              setFieldValue(`invoiceData[${index}].itemDiscount`, Number(discountValue));
                                              setFieldValue(`invoiceData[${index}].discount`, Number(itemDiscountAmount));
                                            }}
                                            fullWidth
                                            disabled={settings?.discount?.apply === 'Group'} // Disable if discount applies at group level
                                          />
                                        </TableCell>
                                      )}

                                      <TableCell>
                                        <Typography variant="body1">{item.Tax_amount.toFixed(2)}</Typography>{' '}
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body1">{item.discount.toFixed(2)}</Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body1">{item.amount.toFixed(2)}</Typography>
                                      </TableCell>
                                      <TableCell>
                                        <IconButton onClick={() => arrayHelpers.remove(index)} color="secondary">
                                          <Trash color="red" />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>

                          <Divider />
                          <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
                            {/* Left Side */}
                            <Grid item xs={12} md={8}>
                              {/* <Stack direction="row" gap={2} sx={{ pt: 2.5, pr: 2.5, pb: 2.5, pl: 0 }}> */}
                              <Grid container gap={2}>
                                <Grid item xs={12} md={2}>
                                  <Button
                                    color="primary"
                                    startIcon={<Add />}
                                    fullWidth
                                    onClick={() =>
                                      arrayHelpers.push({
                                        ...item,
                                        ...(settings?.tax?.apply === TAX_TYPE.GROUP
                                          ? {
                                              itemTax: groupTax
                                            }
                                          : {}),
                                        ...(settings?.discount?.apply === DISCOUNT_TYPE.GROUP &&
                                        settings?.discount?.by === DISCOUNT_BY.PERCENTAGE
                                          ? {
                                              itemDiscount: groupDiscount
                                            }
                                          : {}),
                                        ...(settings?.discount?.apply === DISCOUNT_TYPE.GROUP &&
                                        settings?.discount?.by === DISCOUNT_BY.AMOUNT
                                          ? {
                                              itemDiscount: groupDiscount,
                                              discount: groupDiscount
                                            }
                                          : {})
                                      })
                                    }
                                    variant="dashed"
                                    sx={{ bgcolor: 'transparent !important' }}
                                  >
                                    Add Item
                                  </Button>
                                </Grid>
                              </Grid>
                              {/* </Stack> */}
                            </Grid>

                            {/* Right Side */}
                            <Grid item xs={12} md={4}>
                              <Grid container justifyContent="space-between" spacing={2} sx={{ pt: 2.5, pb: 2.5 }}>
                                {/* Tax Group */}
                                {settings?.tax?.apply === TAX_TYPE.GROUP && (
                                  <Grid item xs={6}>
                                    <Grid item xs={12}>
                                      <TextField
                                        label="Group Tax (%)"
                                        type="number"
                                        value={groupTax}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          const data = formik.getFieldProps('invoiceData').value;
                                          const updatedData = data.map((item) => {
                                            return {
                                              ...item,
                                              amount: item.rate * item.quantity,
                                              itemTax: val,
                                              Tax_amount: (item.rate * item.quantity * val) / 100
                                            };
                                          });
                                          formik.setFieldValue('invoiceData', updatedData);
                                          setGroupTax(val);
                                        }}
                                        fullWidth
                                      />
                                    </Grid>
                                  </Grid>
                                )}

                                {/* Discount Group */}
                                {settings?.discount?.apply === DISCOUNT_TYPE.GROUP && (
                                  <Grid item xs={6}>
                                    <Grid item xs={12}>
                                      <TextField
                                        //   label="Group Discount (%)"
                                        label={getDiscountLabel(settings?.discount)}
                                        type="number"
                                        value={groupDiscount}
                                        // onChange={(e) => setGroupDiscount(Number(e.target.value))}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);

                                          const data = formik.getFieldProps('invoiceData').value;

                                          const updatedData = data.map((item) => {
                                            const rate = item.rate;
                                            const qty = item.quantity;
                                            const amount = rate * qty;
                                            let itemDiscountAmount = 0;

                                            if (settings?.discount?.apply === 'Individual') {
                                              if (settings?.discount?.by === 'Percentage') {
                                                itemDiscountAmount = (amount * val) / 100;
                                              } else if (settings?.discount?.by === 'Amount') {
                                                itemDiscountAmount = val;
                                              }
                                            } else if (settings?.discount?.apply === 'Group') {
                                              if (settings?.discount?.by === 'Percentage') {
                                                itemDiscountAmount = (amount * val) / 100;
                                              } else if (settings?.discount?.by === 'Amount') {
                                                itemDiscountAmount = val;
                                              }
                                            }
                                            return {
                                              ...item,
                                              // amount: item.rate * item.quantity,
                                              itemDiscount: val,
                                              discount: itemDiscountAmount
                                            };
                                          });
                                          formik.setFieldValue('invoiceData', updatedData);
                                          setGroupDiscount(val);
                                        }}
                                        fullWidth
                                      />
                                    </Grid>
                                  </Grid>
                                )}

                                <Grid item xs={12}>
                                  <MainCard content={false} border={false} sx={{ p: 2, bgcolor: 'background.default' }}>
                                    <Stack spacing={2}>
                                      <Stack direction="row" justifyContent="space-between">
                                        <Typography color={theme.palette.secondary.main}>Total:</Typography>
                                        <GenericPriceDisplay
                                          // total={formik.values?.subTotal}
                                          total={total}
                                          roundOff={settings.roundOff}
                                          prefix={country?.prefix}
                                        />
                                      </Stack>
                                      <Divider sx={{ borderStyle: 'dashed' }} />
                                      <Stack direction="row" justifyContent="space-between">
                                        <Typography color={theme.palette.secondary.main}>Penalties:</Typography>
                                        <GenericPriceDisplay
                                          // total={formik.values?.subTotal}
                                          total={additionalRates.penalty}
                                          roundOff={settings.roundOff}
                                          prefix={country?.prefix}
                                        />
                                      </Stack>
                                      <Stack direction="row" justifyContent="space-between">
                                        <Typography color={theme.palette.secondary.main}>Discount:</Typography>
                                        <GenericPriceDisplay
                                          // total={formik.values?.totalDiscount}
                                          total={totalDiscountAmount}
                                          roundOff={settings.roundOff}
                                          prefix={country?.prefix}
                                        />
                                      </Stack>

                                      <Divider sx={{ borderStyle: 'dashed' }} />

                                      <Stack direction="row" justifyContent="space-between">
                                        <Typography color={theme.palette.secondary.main}>Sub Total:</Typography>
                                        <GenericPriceDisplay
                                          // total={formik.values?.subTotal}
                                          total={subTotal}
                                          roundOff={settings.roundOff}
                                          prefix={country?.prefix}
                                        />
                                      </Stack>

                                      <Stack direction="row" justifyContent="space-between">
                                        <Typography color={theme.palette.secondary.main}>GST:</Typography>
                                        <GenericPriceDisplay
                                          // total={formik.values?.totalTax}
                                          total={totalTaxAmount}
                                          roundOff={settings.roundOff}
                                          prefix={country?.prefix}
                                        />
                                      </Stack>
                                      <Stack direction="row" justifyContent="space-between">
                                        <Typography color={theme.palette.secondary.main}>MCD Charges:</Typography>
                                        <GenericPriceDisplay
                                          // total={formik.values?.subTotal}
                                          total={additionalRates.mcdCharge}
                                          roundOff={settings.roundOff}
                                          prefix={country?.prefix}
                                        />
                                      </Stack>
                                      <Stack direction="row" justifyContent="space-between">
                                        <Typography color={theme.palette.secondary.main}>Toll Charges:</Typography>
                                        <GenericPriceDisplay
                                          // total={formik.values?.subTotal}
                                          total={additionalRates.tollCharges}
                                          roundOff={settings.roundOff}
                                          prefix={country?.prefix}
                                        />
                                      </Stack>
                                      <Stack direction="row" justifyContent="space-between">
                                        <Typography color={theme.palette.secondary.main}>Additonal Charges:</Typography>
                                        <GenericPriceDisplay
                                          // total={formik.values?.subTotal}
                                          total={additionalRates.additonalCharges}
                                          roundOff={settings.roundOff}
                                          prefix={country?.prefix}
                                        />
                                      </Stack>

                                      <Divider />

                                      <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="subtitle1">Grand Total:</Typography>
                                        <GenericPriceDisplay
                                          // total={formik.values?.grandTotal}
                                          total={grandTotal}
                                          roundOff={settings.roundOff}
                                          prefix={country?.prefix}
                                          variant="subtitle1" // Optional
                                        />
                                      </Stack>
                                    </Stack>
                                  </MainCard>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </>
                      )}
                    />
                  </Grid>
                )}

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {/* Bank Details Section */}
                  <Grid item xs={12} sm={6}>
                    <MainCard sx={{ minHeight: 168 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Stack spacing={2}>
                            {/* Header with Alignment */}
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="h5">Bank Details:</Typography>
                              <Button variant="outlined" startIcon={<Edit />} color="secondary" onClick={handleBankDetailsEditToggle}>
                                {isBankDetailsEditing ? 'Save' : 'Change'}
                              </Button>
                            </Stack>

                            {/* Bank Details Fields */}
                            {isBankDetailsEditing ? (
                              <Grid container spacing={2}>
                                {/* Account Holder Name */}
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    label="Account Holder Name"
                                    variant="outlined"
                                    fullWidth
                                    value={values.bank_details?.accountHolderName || ''}
                                    onChange={(e) => setFieldValue('bank_details.accountHolderName', e.target.value)}
                                    sx={{
                                      '& .MuiInputBase-input': {
                                        padding: '8px',
                                        height: '2.5em',
                                        boxSizing: 'border-box'
                                      },
                                      '& .MuiInputLabel-root': {
                                        top: '-1px',
                                        transform: 'translate(14px, 12px) scale(1)'
                                      },
                                      '& .MuiInputLabel-shrink': {
                                        transform: 'translate(14px, -6px) scale(0.75)'
                                      }
                                    }}
                                    placeholder="Enter account holder name"
                                  />
                                </Grid>

                                {/* Account Number */}
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    label="Account Number"
                                    variant="outlined"
                                    fullWidth
                                    value={values.bank_details?.accountNumber || ''}
                                    onChange={(e) => setFieldValue('bank_details.accountNumber', e.target.value)}
                                    sx={{
                                      '& .MuiInputBase-input': {
                                        padding: '8px',
                                        height: '2.5em',
                                        boxSizing: 'border-box'
                                      },
                                      '& .MuiInputLabel-root': {
                                        top: '-1px',
                                        transform: 'translate(14px, 12px) scale(1)'
                                      },
                                      '& .MuiInputLabel-shrink': {
                                        transform: 'translate(14px, -6px) scale(0.75)'
                                      }
                                    }}
                                    placeholder="Enter account number"
                                  />
                                </Grid>

                                {/* IFSC Code */}
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    label="IFSC Code"
                                    variant="outlined"
                                    fullWidth
                                    value={values.bank_details?.IFSCCode || ''}
                                    onChange={(e) => setFieldValue('bank_details.IFSCCode', e.target.value)}
                                    sx={{
                                      '& .MuiInputBase-input': {
                                        padding: '8px',
                                        height: '2.5em',
                                        boxSizing: 'border-box'
                                      },
                                      '& .MuiInputLabel-root': {
                                        top: '-1px',
                                        transform: 'translate(14px, 12px) scale(1)'
                                      },
                                      '& .MuiInputLabel-shrink': {
                                        transform: 'translate(14px, -6px) scale(0.75)'
                                      }
                                    }}
                                    placeholder="Enter IFSC code"
                                  />
                                </Grid>

                                {/* Bank Name */}
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    label="Bank Name"
                                    variant="outlined"
                                    fullWidth
                                    value={values.bank_details?.bankName || ''}
                                    onChange={(e) => setFieldValue('bank_details.bankName', e.target.value)}
                                    sx={{
                                      '& .MuiInputBase-input': {
                                        padding: '8px',
                                        height: '2.5em',
                                        boxSizing: 'border-box'
                                      },
                                      '& .MuiInputLabel-root': {
                                        top: '-1px',
                                        transform: 'translate(14px, 12px) scale(1)'
                                      },
                                      '& .MuiInputLabel-shrink': {
                                        transform: 'translate(14px, -6px) scale(0.75)'
                                      }
                                    }}
                                    placeholder="Enter bank name"
                                  />
                                </Grid>
                              </Grid>
                            ) : (
                              <Stack spacing={2}>
                                {/* Display Account Holder Name */}
                                <Typography variant="body1">
                                  <strong>Account Holder Name:</strong> {values.bank_details?.accountHolderName || 'N/A'}
                                </Typography>

                                {/* Display Account Number */}
                                <Typography variant="body1">
                                  <strong>Account Number:</strong> {values.bank_details?.accountNumber || 'N/A'}
                                </Typography>

                                {/* Display IFSC Code */}
                                <Typography variant="body1">
                                  <strong>IFSC Code:</strong> {values.bank_details?.IFSCCode || 'N/A'}
                                </Typography>

                                {/* Display Bank Name */}
                                <Typography variant="body1">
                                  <strong>Bank Name:</strong> {values.bank_details?.bankName || 'N/A'}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    </MainCard>
                  </Grid>

                  {/* Notes and Terms Section */}
                  <Grid item xs={12} sm={6}>
                    <MainCard sx={{ minHeight: 168 }}>
                      <Stack spacing={2}>
                        {/* Notes Section */}
                        <Typography variant="h5">Notes:</Typography>
                        <TextField
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={3}
                          value={values?.notes || ''}
                          onChange={(e) => setFieldValue('notes', e.target.value)}
                          sx={{
                            '& .MuiInputBase-input': {
                              padding: '8px'
                            }
                          }}
                          placeholder="Enter your notes here..."
                        />
                        {/* Terms and Conditions Section */}
                        <Typography variant="h5">Terms and Conditions:</Typography>
                        <TextField
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={3}
                          value={values?.terms || ''}
                          onChange={(e) => setFieldValue('terms', e.target.value)}
                          sx={{
                            '& .MuiInputBase-input': {
                              padding: '8px'
                            }
                          }}
                          placeholder="Enter terms and conditions here..."
                        />
                      </Stack>
                    </MainCard>
                  </Grid>
                </Grid>

                {/* Set Currency */}
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel>Set Currency*</InputLabel>
                    <FormControl sx={{ width: { xs: '100%', sm: 250 } }}>
                      <Autocomplete
                        id="country-select-demo"
                        fullWidth
                        options={countries}
                        defaultValue={countries[2]}
                        value={countries.find((option) => option.code === country?.code)}
                        sx={{
                          '& .MuiInputBase-input': {
                            padding: '8px'
                          }
                        }}
                        onChange={(event, value) => {
                          dispatch(
                            selectCountry({
                              country: value
                            })
                          );
                        }}
                        autoHighlight
                        getOptionLabel={(option) => option.label}
                        renderOption={(props, option) => (
                          <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                            {option.code && (
                              <img
                                loading="lazy"
                                width="20"
                                src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                alt=""
                              />
                            )}
                            {option.label}
                          </Box>
                        )}
                        renderInput={(params) => {
                          const selected = countries.find((option) => option.code === country?.code);
                          return (
                            <TextField
                              {...params}
                              name="phoneCode"
                              placeholder="Select"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    {selected && selected.code !== '' && (
                                      <img
                                        style={{ marginRight: 6 }}
                                        loading="lazy"
                                        width="20"
                                        src={`https://flagcdn.com/w20/${selected.code.toLowerCase()}.png`}
                                        srcSet={`https://flagcdn.com/w40/${selected.code.toLowerCase()}.png 2x`}
                                        alt=""
                                      />
                                    )}
                                  </>
                                )
                              }}
                              inputProps={{
                                ...params.inputProps,
                                autoComplete: 'new-password' // disable autocomplete and autofill
                              }}
                            />
                          );
                        }}
                      />
                    </FormControl>
                  </Stack>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" spacing={2} sx={{ height: '100%' }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      disabled={values.status === '' || !isValid}
                      sx={{ color: 'secondary.dark' }}
                      onClick={() =>
                        dispatch(
                          reviewInvoicePopup({
                            isOpen: true
                          })
                        )
                      }
                    >
                      Preview
                    </Button>
                    {/* save data to database */}
                    {/* <Button variant="outlined" color="secondary" sx={{ color: 'secondary.dark' }}>
                      Create
                    </Button> */}
                    {/* send mail */}
                    <Button color="primary" variant="contained" type="submit">
                      Create & Send
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Form>
          </FormikProvider>
        </MainCard>
      )}
    </>
  );
};

export default Create3;

const GenericPriceDisplay = ({ total, roundOff, prefix, variant }) => {
  return (
    <Typography {...(variant && { variant })}>
      {roundOff === STATUS.NO ? prefix + total?.toFixed(2) || 0 : prefix + Math.ceil(total) || 0}
    </Typography>
  );
};

function validateFields(fields) {
  const missingFields = [];

  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      missingFields.push(key);
    }
  }

  if (missingFields.length === 0) {
    return 'All fields are filled.';
  }

  const lastField = missingFields.pop();
  const formattedMessage =
    missingFields.length > 0 ? `Please fill ${missingFields.join(', ')} and ${lastField} fields.` : `Please fill ${lastField} field.`;

  return formattedMessage;
}

const findMinMaxDates = (data, dateKey = 'tripDate') => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Input data must be a non-empty array');
  }

  // Filter valid dates using moment's validation
  const validDates = data
    .map((item) => moment(item[dateKey], moment.ISO_8601, true))
    .filter((date) => date.isValid())
    .map((date) => date.toISOString());

  if (validDates.length === 0) {
    return { minDate: null, maxDate: null };
  }

  // Find min and max dates
  const minDate = moment.min(validDates.map((date) => moment(date))).toISOString();
  const maxDate = moment.max(validDates.map((date) => moment(date))).toISOString();

  return { minDate, maxDate };
};
