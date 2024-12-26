import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { SearchNormal1 } from 'iconsax-react';
import { useCallback, useEffect, useState } from 'react';
import { dispatch } from 'store';
import { useSelector } from 'store';
import { useTheme } from '@mui/material/styles';
import EmptyTableDemo from 'components/tables/EmptyTable';
import { fetchVendor1 } from 'store/slice/cabProvidor/vendorSlice';
import { checkGSTtype } from 'utils/helper';
import { debounce } from 'lodash';

const DEBOUNCE_DELAY = 500;

const CabProviderSelection = ({ open: modelOpen, setOpen: setModelOpen, setFilterOptions, setIsSameState, sendersDetails }) => {
  const theme = useTheme();
  const [query, setQuery] = useState(''); // Tracks input query

  function closeAddressModal() {
    setModelOpen(false);
  }

  const { loading, vendor1: cabProvidersList } = useSelector((state) => state.vendors);
  console.log(`🚀 ~ CabProviderSelection ~ cabProvidersList:`, cabProvidersList, loading);

  useEffect(() => {
    console.log('useEffect called CabProviderSelection');
    dispatch(fetchVendor1());
  }, []);

  const handleQueryChange = debounce((value) => setQuery(value), DEBOUNCE_DELAY);

  const filteredCabProviders = useCallback(() => {
    return cabProvidersList.filter(
      (item) =>
        item.cabProviderLegalName.toLowerCase().includes(query.toLowerCase()) || // Filter by legal name
        item.GSTIN.toLowerCase().includes(query.toLowerCase()) // Filter by GSTIN
    );
  }, [cabProvidersList, query]);

  return (
    <>
      <Dialog
        maxWidth="sm"
        open={modelOpen}
        onClose={closeAddressModal}
        sx={{ '& .MuiDialog-paper': { p: 0 }, '& .MuiBackdrop-root': { opacity: '0.5 !important' } }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Select CabProvider</Typography>
            <Button color="error" onClick={closeAddressModal}>
              Cancel
            </Button>
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
              //   onChange={(e) => {
              //     setQuery(e.target.value);
              //   }}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={loading ? 'Loading...' : 'Search by name or GSTIN'}
              fullWidth
              autoComplete="off"
            />
          </FormControl>

          <Stack spacing={2} alignItems={'center'}>
            {loading ? (
              <CircularProgress sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
            ) : cabProvidersList && cabProvidersList.length === 0 ? (
              <EmptyTableDemo />
            ) : (
              filteredCabProviders().map((item) => {
                return (
                  <Box
                    key={item.cabProviderId}
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
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      console.log({ item });
                      setFilterOptions({
                        _id: item.cabProviderId,
                        name: item.cabProviderLegalName,
                        email: item.workEmail,
                        mobile: item.workMobileNumber,
                        PAN: item.PAN,
                        GSTIN: item.GSTIN,
                        postal_code: item.officePinCode,
                        address: item.officeAddress,
                        state: item.officeState
                      });
                      const isSameState1 = checkGSTtype(sendersDetails.GSTIN, item.GSTIN);
                      setIsSameState(isSameState1);
                      setModelOpen(false);
                    }}
                  >
                    <Typography textAlign="left" variant="subtitle1">
                      {item.cabProviderLegalName}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Typography textAlign="left" variant="body2" color="secondary">
                        {item.GSTIN}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })
            )}
          </Stack>
        </DialogContent>

        {/* <DialogActions sx={{ p: 2.5 }}>
          <Button color="error" onClick={closeAddressModal}>
            Cancel
          </Button>
          <Button onClick={closeAddressModal} color="primary" variant="contained" disabled={loading}>
            Add
          </Button>
        </DialogActions> */}
      </Dialog>
    </>
  );
};

export default CabProviderSelection;
