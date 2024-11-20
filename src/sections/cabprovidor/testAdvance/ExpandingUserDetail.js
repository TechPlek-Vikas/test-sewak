import PropTypes from 'prop-types';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  useMediaQuery,
  Grid,
  Chip,
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TableCell,
  TableRow,
  Typography,
  CircularProgress
} from '@mui/material';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import ReactTable from 'components/tables/reactTable1/ReactTable';
import { useEffect, useState } from 'react';
import axiosServices from 'utils/axios';
import { openSnackbar } from 'store/reducers/snackbar';
import { dispatch } from 'store';

// ==============================|| EXPANDING TABLE - USER DETAILS ||============================== //

const ExpandingUserDetail = ({ requestedById, isDriver, isVendor }) => {
  const theme = useTheme();

  // State for API data
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [personalDetails, setPersonalDetails] = useState(null);
  const [tripAnalysisData, setTripAnalysisData] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);

  console.log('apiData', apiData);
  console.log('requestedById', requestedById);
  console.log('isDriver', isDriver);
  console.log('isVendor', isVendor);
  console.log('personalDetails', personalDetails);
  console.log('tripAnalysisData', tripAnalysisData);
  console.log('vehicleData', vehicleData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosServices.post(`/advance/trip/analysis`, {
          data: {
            requestedById,
            isDriver,
            isVendor
          }
        });
        setApiData(response.data);
        setPersonalDetails(response.data.personalDetails);
        setTripAnalysisData(response.data.tripAnalysisData);
        const vehicleList = Array.isArray(response.data.vehicleData.totalVehicleList) ? response.data.vehicleData.totalVehicleList : [];
        setVehicleData(vehicleList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (requestedById) {
      fetchData();
    }
  }, [requestedById, isDriver, isVendor]);

  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={12} sx={{ textAlign: 'center' }}>
          <CircularProgress size={20} color="inherit" />
        </TableCell>
      </TableRow>
    );
  }

  if (error) {
    // Dispatch the snackbar action
    dispatch(
      openSnackbar({
        open: true,
        message: error || 'Something went wrong',
        variant: 'alert',
        alert: {
          color: 'error'
        },
        close: true
      })
    );

    // Render the error message in the table row
    return (
      <TableRow>
        <TableCell colSpan={12} sx={{ textAlign: 'center', color: 'red' }}>
          {error || 'Something went wrong'}
        </TableCell>
      </TableRow>
    );
  }

  // Columns for the "Personal Details" table
  const personalDetailsColumns = [
    { Header: 'Transaction Id', accessor: 'id' },
    { Header: 'Date', accessor: 'date' },
    { Header: 'Amount', accessor: 'amount' }
    // { Header: 'Approved Remark', accessor: 'approvedRemark' }
  ];

  // Dummy data for the "Personal Details" table
  const personalDetailsData = [
    {
      id: 'TXN12345',
      date: '2024-11-18',
      amount: '₹150.00',
      approvedRemark: 'Payment for services'
    },
    {
      id: 'TXN67890',
      date: '2024-11-19',
      amount: '₹200.00',
      approvedRemark: 'Approved for project'
    },
    {
      id: 'TXN54321',
      date: '2024-11-20',
      amount: '₹350.00',
      approvedRemark: 'Reimbursement'
    }
  ];

  // Columns for the "About Me" table
  const aboutMeColumns = [
    { Header: 'Vehicle No.', accessor: 'vehicleNumber' },
    { Header: 'Vehicle Name', accessor: 'vehicleName' },
    {
      Header: 'Driver Name',
      accessor: (row) => {
        const driver = row.linkedDriver?.[0]?.driverId;
        return driver ? driver.userName : 'Not Linked';
      }
    },
    {
      Header: 'Driver Contact',
      accessor: (row) => {
        const driver = row.linkedDriver?.[0]?.driverId;
        return driver ? driver.contactNumber : 'Not Available';
      }
    }
  ];

  const backColor = alpha(theme.palette.primary.lighter, 0.1);

  return (
    <TableRow
      sx={{
        bgcolor: backColor,
        width: '100%', // Ensure it takes the full width of the table
        '&:hover': { bgcolor: `${backColor} !important` }
      }}
    >
      <TableCell colSpan={12} sx={{ p: 2 }}>
        <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 }, pr: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 } }}>
          <Grid item xs={12} sm={4} md={5} lg={5}>
            <Stack spacing={0} sx={{ width: '100%' }}>
              <MainCard>
                <Chip
                  label={isDriver === 1 ? 'Driver' : isVendor === 1 ? 'Vendor' : 'Unknown'}
                  size="small"
                  sx={{
                    position: 'absolute',
                    right: -1,
                    top: -1,
                    borderRadius: '0 4px 0 4px'
                  }}
                />
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={2.5} alignItems="center">
                      <Avatar alt="Avatar 1" size="xl" src={personalDetails.userImage} />
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h5">{personalDetails.userName}</Typography>
                        <Typography color="secondary">+91-{personalDetails.contactNumber}</Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-around" alignItems="center">
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h6" color="primary">
                          {tripAnalysisData.totalTrips}
                        </Typography>
                        <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                          Trips
                        </Typography>
                      </Stack>
                      <Divider orientation="vertical" flexItem />
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h6" color="primary">
                          ₹{tripAnalysisData.totalIncome}
                        </Typography>
                        <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                          Total Income
                        </Typography>
                      </Stack>
                      <Divider orientation="vertical" flexItem />
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h6" color="primary">
                          ₹{tripAnalysisData.totalPayment}
                        </Typography>
                        <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                          Total Payment
                        </Typography>
                      </Stack>
                      <Divider orientation="vertical" flexItem />
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h6" color="primary">
                          ₹{tripAnalysisData.totalIncome - tripAnalysisData.totalPayment}
                        </Typography>
                        <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                          Balance
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" sx={{ pb: 1 }}>
                      Bank Details
                    </Typography>
                    <Stack gap={2} sx={{pt: '4px'}}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                          Bank Name
                        </Typography>
                        <Typography
                          title={personalDetails.bankName}
                          sx={{
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            // maxWidth: '200px',
                            textAlign: 'right' // Ensures it aligns to the end
                          }}
                        >
                          {personalDetails.bankName}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack gap={2} sx={{pt: '4px'}}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                          Branch Name
                        </Typography>
                        <Typography
                          title={personalDetails.branchName}
                          sx={{
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            // maxWidth: '200px',
                            textAlign: 'right' // Ensures it aligns to the end
                          }}
                        >
                          {personalDetails.branchName}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack gap={2} sx={{pt: '4px'}}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                          IFSC Code
                        </Typography>
                        <Typography
                          title={personalDetails.IFSC_code}
                          sx={{
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            // maxWidth: '200px',
                            textAlign: 'right' // Ensures it aligns to the end
                          }}
                        >
                          {personalDetails.IFSC_code}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack gap={2} sx={{pt: '4px'}}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                          Account Number
                        </Typography>
                        <Typography
                          title={personalDetails.accountNumber}
                          sx={{
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            // maxWidth: '200px',
                            textAlign: 'right' // Ensures it aligns to the end
                          }}
                        >
                          {personalDetails.accountNumber}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack gap={2} sx={{pt: '4px'}}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                        Account Holder Name
                        </Typography>
                        <Typography
                          title={personalDetails.accountHolderName}
                          sx={{
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            // maxWidth: '200px',
                            textAlign: 'right' // Ensures it aligns to the end
                          }}
                        >
                          {personalDetails.accountHolderName}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack gap={2} sx={{pt: '4px'}}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                        Address
                        </Typography>
                        <Typography
                          title={personalDetails.bankAddress}
                          sx={{
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            maxWidth: '150px',
                            textAlign: 'right' // Ensures it aligns to the end
                          }}
                        >
                          {personalDetails.bankAddress}
                        </Typography>
                      </Stack>
                    </Stack>
                    {/* <List
                      component="nav"
                      aria-label="main mailbox folders"
                      sx={{ py: 0, '& .MuiListItem-root': { p: 0 }, '& .MuiListItemIcon-root': { minWidth: 28 } }}
                    >
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                              Bank Name
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Typography align="right">{personalDetails.bankName}</Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                              Branch Name
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Typography align="right">{personalDetails.branchName}</Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                              IFSC Code
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Typography align="right">{personalDetails.IFSC_code}</Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                              Account Number
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Typography align="right">{personalDetails.accountNumber}</Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                              Account Holder Name
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Typography align="right">{personalDetails.accountHolderName}</Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography color="#6d6e6e" sx={{ fontWeight: 700 }}>
                              Address
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Typography align="right" >{personalDetails.bankAddress}</Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List> */}
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={8} md={7} lg={7}>
            <Stack spacing={0} sx={{ width: '100%' }}>
              <MainCard title="Payment History" sx={{ width: '100%' }}>
                <div style={{ height: 'auto' }}>
                  <ReactTable columns={personalDetailsColumns} data={personalDetailsData} defaultPageSize={5} hideHeader />
                </div>
              </MainCard>
              <MainCard title="Vehicle Details" sx={{ width: '100%' }}>
                <div style={{ height: 'auto' }}>
                  <ReactTable columns={aboutMeColumns} data={vehicleData} showPagination={false} defaultPageSize={5} hideHeader />
                </div>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>
  );
};

ExpandingUserDetail.propTypes = {
  data: PropTypes.any
};

export default ExpandingUserDetail;
