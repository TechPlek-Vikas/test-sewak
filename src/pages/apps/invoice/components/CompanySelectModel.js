import PropTypes from 'prop-types';

// material-ui
import {
  Box,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  FormControl,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';

// third-party
import { Add, SearchNormal1 } from 'iconsax-react';
import axiosServices from 'utils/axios';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CustomCircularLoader from 'components/CustomCircularLoader';
import EmptyTableDemo from 'components/tables/EmptyTable';
import { checkGSTtype } from 'utils/helper';

// ==============================|| INVOICE - SELECT ADDRESS ||============================== //

const AddressModal = ({ open: modelOpen, setOpen: setModelOpen, value, setFilterOptions, setIsSameState, sendersDetails }) => {
  function closeAddressModal() {
    setModelOpen(false);
  }
  const [options, setOptions] = useState([]); // Stores fetched options
  const [loading, setLoading] = useState(true); // Tracks loading state
  const [query, setQuery] = useState(''); // Tracks input query
  const [cache, setCache] = useState({}); // Cache for query results

  // Fetch default options when component mounts or when the input is opened
  useEffect(() => {
    const fetchDefaultOptions = async () => {
      if (cache.default) {
        setOptions(cache.default);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosServices.get(`/company?page=1&name=${query}&limit=10`);
        console.log('response.data', response.data.data.result);
        const companies = response.data.data.result;

        setOptions(companies);
        setCache((prevCache) => ({ ...prevCache, default: companies })); // Cache default results
      } catch (error) {
        console.error('Error fetching default options:', error);
      } finally {
        setLoading(false);
      }
    };

    if (modelOpen) {
      fetchDefaultOptions();
    }
  }, [cache.default, modelOpen]);

  // Fetch options based on input query with caching
  useEffect(() => {
    if (!query) return;

    if (cache[query]) {
      // Use cached results if available
      setOptions(cache[query]);
      return;
    }

    const fetchOptions = async () => {
      setLoading(true);
      try {
        const response = await axiosServices.get(`/company/getCompanyByName?filter=${query}&page=1&limit=10`);
        const companies = response.data.data.result;

        setOptions(companies);
        setCache((prevCache) => ({ ...prevCache, [query]: companies })); // Cache query results
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchOptions, 300); // Debounce delay

    return () => clearTimeout(debounceFetch); // Cleanup on unmount or re-render
  }, [query, cache]);

  return (
    <Dialog
      maxWidth="sm"
      open={modelOpen}
      onClose={closeAddressModal}
      sx={{ '& .MuiDialog-paper': { p: 0 }, '& .MuiBackdrop-root': { opacity: '0.5 !important' } }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Select Company</Typography>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5 }}>
        <FormControl sx={{ width: '500px', pb: 2 }}>
          <TextField
            autoFocus
            id="name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={18} />
                </InputAdornment>
              )
            }}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder="Search"
            fullWidth
          />
        </FormControl>
        <Stack spacing={2}>
          <Address
            sendersDetails={sendersDetails}
            setIsSameState={setIsSameState}
            data={options}
            loading={loading}
            handlercompany={setFilterOptions}
            setModelOpen={setModelOpen}
          />
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button color="error" onClick={closeAddressModal}>
          Cancel
        </Button>
        <Button onClick={closeAddressModal} color="primary" variant="contained">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddressModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  handlerAddress: PropTypes.func
};

export default AddressModal;

const Address = ({ setIsSameState, handlercompany, data, loading, sendersDetails, setModelOpen }) => {
  const theme = useTheme();
  return (
    <>
      {loading ? (
        <CircularProgress sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
      ) : data && data.length === 0 ? (
        <EmptyTableDemo />
      ) : (
        data.map((company) => (
          <Box
            onClick={() => {
              console.log({ company });
              handlercompany({
                _id: company._id,
                name: company.company_name,
                email: company.company_email,
                mobile: company.mobile,
                PAN: company.PAN,
                GSTIN: company.GSTIN,
                postal_code: company.postal_code,
                address: company.address,
                state: company.state
              });
              const isSameState1 = checkGSTtype(sendersDetails.GSTIN, company.GSTIN);
              setIsSameState(isSameState1);
              setModelOpen(false);
            }}
            key={company._id}
            sx={{
              minWidth: '500px',
              maxWidth: '500px',
              border: '1px solid',
              borderColor: 'secondary.200',
              justifyContent: 'center',
              borderRadius: 1,
              p: 1.25,
              '&:hover': {
                bgcolor: theme.palette.primary.lighter,
                borderColor: theme.palette.primary.lighter
              }
            }}
          >
            <Typography textAlign="left" variant="subtitle1">
              {company.company_name}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Typography textAlign="left" variant="body2" color="secondary">
                {company.address}
              </Typography>
              <Typography textAlign="left" variant="body2" color="secondary">
                {company.city}
              </Typography>
              <Typography textAlign="left" variant="body2" color="secondary">
                {company.state}
              </Typography>
            </Stack>
          </Box>
        ))
      )}
    </>
  );
};

Address.propTypes = {
  handlerAddress: PropTypes.func
};
