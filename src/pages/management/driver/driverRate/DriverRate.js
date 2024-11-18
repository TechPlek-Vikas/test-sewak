import { useEffect, useState } from 'react';
// assets
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputLabel,
  Stack,
  TextField
} from '@mui/material';
import Header from 'components/tables/genericTable/Header';
import WrapperButton from 'components/common/guards/WrapperButton';
import { Add } from 'iconsax-react';
import SearchComponent from 'pages/apps/test/CompanySearch';
import axiosServices from 'utils/axios';
import DriverTable from './DriverTable';
import AddCabRateDriver from 'pages/master/CabRate/Driver';
import { useLocation, useNavigate } from 'react-router';
import { fetchAllDrivers } from 'store/slice/cabProvidor/driverSlice';
import { useDispatch, useSelector } from 'react-redux';
import MainCard from 'components/MainCard';

// ==============================|| REACT TABLE - EDITABLE CELL ||============================== //

const AddDriverRateDialog = ({ open, onClose, setSelectedCompany, setDriverID1, initialDriverID, handleSelectedCompanyName, handleSelectedDriverName }) => {
  const [selectedCompany, setSelectedCompanyLocal] = useState(null);
  const [driverID, setDriverID] = useState(initialDriverID);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const allDrivers = useSelector((state) => state.drivers.allDrivers);
  const userInfo = JSON.parse(localStorage.getItem('userInformation'));

  const CabProviderId = userInfo.userId;

  //   console.log('allDrivers', allDrivers);

  useEffect(() => {
    dispatch(fetchAllDrivers(CabProviderId));
  }, [dispatch]);

  const handleSave = () => {
    if (!selectedCompany || !driverID) {
      return;
    }

     // Fetch company name (assuming selectedCompany contains company object with name)
     const selectedCompanyName = selectedCompany ? selectedCompany.company_name : '';  

     // Fetch vendor name based on vendorID
    const selectedDriver = allDrivers.find((driver) => driver.driverId._id === driverID);
    const selectedDriverName = selectedDriver ? selectedDriver.driverId.userName : ''; 

     handleSelectedCompanyName(selectedCompanyName);
     handleSelectedDriverName(selectedDriverName); 
    setSelectedCompany(selectedCompany); // Save selected company
    setDriverID1(driverID);
    onClose();
  };

  const onCancel = () => {
    onClose();
    navigate('/management/driver/view');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      keepMounted
      scroll="paper"
      sx={{ '& .MuiDialog-paper': { width: '500px', maxWidth: '500px' } }}
    >
      <DialogTitle>Select Company and Driver</DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ padding: '8px' }}>
          <Grid item xs={6}>
            <InputLabel sx={{ marginBottom: '4px' }}>Company Name</InputLabel>
            <SearchComponent setSelectedCompany={setSelectedCompanyLocal} />
          </Grid>
          <Grid item xs={6}>
            <InputLabel sx={{ marginBottom: '4px' }}>Driver</InputLabel>
            <Autocomplete
              id="driverID"
              value={allDrivers.find((item) => item?.driverId?._id === driverID) || null}
              onChange={(event, value) => {
                setDriverID(value?.driverId?._id || '');
              }}
              options={allDrivers}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.driverId?.userName || 'Vikas'}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  {option?.driverId?.userName || 'Vikas'}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Choose a Driver"
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: 'new-password'
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: '8px' }}>
        <Button onClick={onCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
const DriverRate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialDriverID = queryParams.get('driverID');
  const [data, setData] = useState([]);
  const [skipPageReset, setSkipPageReset] = useState(false);
  const [companyRate, setCompanyRate] = useState([]);
  const [driverList, setDriverList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [updateKey, setUpdateKey] = useState(0);
  const [loading, setLoading] = useState('true');
  const [showCompanyList, setShowCompanyList] = useState(false); // State to manage which component to show
  const [selectedCompany, setSelectedCompany] = useState(null); // Selected company state
  const [dialogOpen, setDialogOpen] = useState(true); // Dialog state
  const [driverID1, setDriverID1] = useState(null);

  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [selectedDriverName, setSelectedDriverName] = useState('');

  const handleSelectedCompanyName = (companyName) => {
    setSelectedCompanyName(companyName);
  };

  const handleSelectedDriverName = (vendorName) => {
    setSelectedDriverName(vendorName);
  };

  useEffect(() => {
    const fetchdata = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axiosServices.get(`/driver/unwind/driver/rate?companyId=${selectedCompany._id}&driverId=${driverID1}`);
        setDriverList(response.data.data);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false); // Stop loading regardless of success or error
      }
    };

    if (!selectedCompany || !driverID1) return;

    fetchdata();
  }, [selectedCompany, driverID1]);

  //   console.log('driverList', driverList);

  const handleAddRate = () => {
    navigate('/management/driver/add-driver-rate');
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    setSkipPageReset(false);
  }, [data]);
  useEffect(() => {}, [companyRate]);

  return (
    <>
      {/* Company selection dialog */}
      <AddDriverRateDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        setSelectedCompany={setSelectedCompany}
        setDriverID1={setDriverID1}
        initialDriverID={initialDriverID}
        handleSelectedCompanyName={handleSelectedCompanyName}
        handleSelectedDriverName={handleSelectedDriverName}
      />

      {/* Render CompanyRateListing once a company is selected */}
      {!dialogOpen && selectedCompany && driverID1 && !showCompanyList ? (
        <Stack gap={1} spacing={1}>
          {/* <Header OtherComp={({ loading }) => <ButtonComponent loading={loading} onAddRate={handleAddRate} />} /> */}

          {/* {companyList.length !== 0 && ( */}

          <MainCard
            title={
              <Stack direction="row" alignItems="center" gap={1}>
                Driver Rates between {' '}
                <SearchComponent
                  setSelectedCompany={(company) => {
                    setSelectedCompany(company);
                    setSelectedCompanyName(company?.company_name || '');
                  }}
                  sx={{ width: '200px'}}
                />{' '} and{' '}
                <Chip label={selectedDriverName} color="secondary" />
              </Stack>
            }
          >
            <DriverTable
              data={driverList}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              updateKey={updateKey}
              setUpdateKey={setUpdateKey}
              loading={loading}
            />
          </MainCard>
          {/* )} */}
        </Stack>
      ) : null}
    </>
  );
};

export default DriverRate;

// const ButtonComponent = ({ loading, onAddRate }) => {
//   return (
//     <Stack direction="row" spacing={1} alignItems="center">
//       <WrapperButton>
//         <Button
//           variant="contained"
//           startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
//           onClick={onAddRate} // Call the onAddRate function when button is clicked
//           size="small"
//           disabled={loading} // Disable button while loading
//         >
//           {loading ? 'Loading...' : ' Add Rate'}
//         </Button>
//       </WrapperButton>
//     </Stack>
//   );
// };
