import { useEffect, useState } from 'react';
import axios from 'axios';
// assets
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, InputLabel, Stack } from '@mui/material';
import CompanyRateReactTable from './CompanyRateReactTable';
import Header from 'components/tables/genericTable/Header';
import WrapperButton from 'components/common/guards/WrapperButton';
import { Add } from 'iconsax-react';
import CompanyRate from './CompanyRate';
// import SearchComponent from 'pages/apps/test/CompanySearch';
import axiosServices from 'utils/axios';
import SearchComponent from 'pages/apps/roster/components/CompanySearch';
import { dispatch } from 'store';
import { fetchCompanyRates } from 'store/cacheSlice/companyRatesSlice';

// ==============================|| REACT TABLE - EDITABLE CELL ||============================== //

const AddCompanyRateDialog = ({ open, onClose, setSelectedCompany }) => {
  const [selectedCompany, setSelectedCompanyLocal] = useState(null);

  const handleSave = () => {
    if (!selectedCompany) {
      return;
    }
    setSelectedCompany(selectedCompany);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      keepMounted
      scroll="paper"
      sx={{ '& .MuiDialog-paper': { width: '400px', maxWidth: '400px' } }}
    >
      <DialogTitle>Select Company</DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ padding: '8px' }}>
          {' '}
          {/* Reduced spacing */}
          <Grid item xs={12}>
            <InputLabel sx={{ marginBottom: '4px' }}>Company Name</InputLabel> {/* Reduced margin */}
            <SearchComponent setSelectedCompany={setSelectedCompanyLocal} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: '8px' }}>
        {' '}
        {/* Adjust padding for DialogActions */}
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CompanyRateListing = () => {
  const [data, setData] = useState([]);
  const [skipPageReset, setSkipPageReset] = useState(false);
  const [companyRate, setCompanyRate] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [updateKey, setUpdateKey] = useState(0);

  const [showCompanyList, setShowCompanyList] = useState(false); // State to manage which component to show
  const [selectedCompany, setSelectedCompany] = useState(null); // Selected company state
  const [dialogOpen, setDialogOpen] = useState(true); // Dialog state

  const { cache, loading, error } = useSelector((state) => state.companyRates); // Access Redux state

  // Fetch company rates based on selectedCompany
  useEffect(() => {
    if (selectedCompany?._id && !cache[selectedCompany._id]) {
      dispatch(fetchCompanyRates(selectedCompany._id));
    }
  }, [dispatch, selectedCompany?._id, cache]);

  // Update local state when cache changes
  useEffect(() => {
    if (selectedCompany?._id && cache[selectedCompany._id]) {
      setCompanyList(cache[selectedCompany._id]);
    }
  }, [cache, selectedCompany?._id]);

  const handleAddRate = () => {
    setShowCompanyList(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    setSkipPageReset(false);
  }, [data]);
  useEffect(() => {}, [companyRate]);

  const handleBackToList = () => {
    setShowCompanyList(false);
  };

  return (
    <>
      {/* Company selection dialog */}
      <AddCompanyRateDialog open={dialogOpen} onClose={handleDialogClose} setSelectedCompany={setSelectedCompany} />

      {/* Render CompanyRateListing once a company is selected */}
      {!dialogOpen && selectedCompany && !showCompanyList ? (
        <Stack gap={1} spacing={1}>
          <Header OtherComp={({ loading }) => <ButtonComponent loading={loading} onAddRate={handleAddRate} />} />

          {/* {companyList.length !== 0 && ( */}
          <CompanyRateReactTable
            data={companyList}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            updateKey={updateKey}
            setUpdateKey={setUpdateKey}
            loading={loading}
          />
          {/* )} */}
        </Stack>
      ) : (
        <CompanyRate id={selectedCompany?._id} companyName={selectedCompany?.company_name} onBackToList={handleBackToList} />
      )}
    </>
  );
};

export default CompanyRateListing;

const ButtonComponent = ({ loading, onAddRate }) => {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <WrapperButton>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
          onClick={onAddRate} // Call the onAddRate function when button is clicked
          size="small"
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Loading...' : ' Add Rate'}
        </Button>
      </WrapperButton>
    </Stack>
  );
};
