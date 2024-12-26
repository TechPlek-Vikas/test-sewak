/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDrivers, handleClose, handleOpen, registerDriver } from 'store/slice/cabProvidor/driverSlice';
// import EmptyTableDemo from 'components/tables/EmptyTable';
// import TableSkeleton from 'components/tables/TableSkeleton';
import Error500 from 'pages/maintenance/error/500';
import DriverTable from 'sections/cabprovidor/driverManagement/DriverTable';
import MainCard from 'components/MainCard';
import { Autocomplete, Box, Button, CircularProgress, Stack, TextField } from '@mui/material';
import Header from 'components/tables/genericTable/Header';
import { Add } from 'iconsax-react';
import { useNavigate } from 'react-router';
import { ACTION, MODULE, PERMISSIONS, USERTYPE } from 'constant';
import DriverRegister from 'sections/cabprovidor/driverManagement/DriverRegister';
import * as Yup from 'yup';
import WrapperButton from 'components/common/guards/WrapperButton';
import BulkUploadDialog from './bulkUpload/Dialog';
import { fetchAllVendors } from 'store/slice/cabProvidor/vendorSlice';
import DebouncedSearch from 'components/textfield/DebounceSearch';
import AccessControlWrapper from 'components/common/guards/AccessControlWrapper';
import { Wrapper } from 'components/common/guards/Wrapper';
import { STRATEGY } from 'components/common/PermissionStrategies';

const OPTION_SET_1 = {
  ALL: {
    label: 'ALL',
    value: 1
  },
  SELF: {
    label: 'SELF',
    value: 2
  },
  OTHER: {
    label: 'OTHER',
    value: 3,
    disabled: true
  }
};

const getInitialValues = (data) => {
  if (data) {
    return {
      _id: data?._id || '',
      stateName: data?.stateName || '',
      taxRateMonthly: data?.taxRateMonthly || '',
      taxRatePerTrip: data?.taxRatePerTrip || ''
    };
  } else {
    return {
      userName: '',
      userEmail: '',
      contactNumber: '',
      vendorId: '',
      officeChargeAmount: ''
    };
  }
};

const Driver = () => {
  const dispatch = useDispatch();
  const { drivers, metaData, loading, error, open } = useSelector((state) => state.drivers);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [updateKey, setUpdateKey] = useState(0);
  const [driverType, setDriverType] = useState(1);
  const lastPageIndex = metaData.lastPageNo;
  const [openBulkUploadDialog, setOpenBulkUploadDialog] = useState(false);
  const [query, setQuery] = useState(null);
  const navigate = useNavigate();

  const handleAdd = useCallback(() => {
    dispatch(handleOpen(ACTION.CREATE));
  }, []);
  const [search, setSearch] = useState('');
  // Search change handler
  const onSearchChange = (value) => {
    setSearch(value); // Update the search state
  };

  useEffect(() => {
    dispatch(fetchDrivers({ page, limit, driverType, query: query }));
    dispatch(fetchAllVendors());
  }, [page, limit, dispatch, driverType, updateKey, query]);

  const handleLimitChange = useCallback((event) => {
    setLimit(+event.target.value);
    setPage(1);
  }, []);

  const handleDriverTypeChange = useCallback((val) => {
    setDriverType(val);
    setPage(1);
    setLimit(10);
  }, []);

  // Debounced function to handle search input
  const handleSearch = useCallback(
    _.debounce((searchQuery) => {
      setQuery(searchQuery); // Update the query state
    }, 500),
    []
  );

  const handleCloseDialog = useCallback(async (e, flag = false) => {
    if (typeof flag === 'boolean' && flag) {
      // const response = await dispatch(deleteDriver()).unwrap();
      // if (response.status === 200) {
      //   dispatch(
      //     openSnackbar({
      //       open: true,
      //       message: messages[sliceName].DELETE,
      //       variant: 'alert',
      //       alert: {
      //         color: 'success'
      //       },
      //       close: true
      //     })
      //   );
      //   dispatch(handleClose());
      //   dispatch(fetchAllDrivers());
      // }
    } else {
      dispatch(handleClose());
      return;
    }
  }, []);

  const handleDriverBulkUploadOpen = () => {
    setOpenBulkUploadDialog(true);
  };
  const handleDriverBulkUploadClose = () => {
    setOpenBulkUploadDialog(false);
  };
  const formikHandleSubmit = async (values, isCreating) => {
    console.log('BIE');

    // eslint-disable-next-line no-useless-catch
    try {
      if (isCreating) {
        const payload = {
          data: {
            userName: values.userName,
            userEmail: values.userEmail || `tripBiller-${values.contactNumber}@gmail.com`,
            contactNumber: values.contactNumber,
            officeChargeAmount: values.officeChargeAmount,
            // vendorId: values.vendorId
            ...([USERTYPE.iscabProvider, USERTYPE.iscabProviderUser].includes(1) && values.vendorId && { vendorId: values.vendorId })
          }
        };

        const response = await dispatch(registerDriver(payload)).unwrap();
        if (response.status === 201) {
          setLimit(10);
          setPage(1);
          setDriverType(1);
          dispatch(fetchDrivers({ page: 1, limit: 10, driverType: 1 }));
        }
        return response;
      } else {
        // console.log('Update API call');
        // console.log({ selectedID });
        // const payload = {
        //   data: {
        //     _id: values._id,
        //     stateName: values.stateName,
        //     taxRateMonthly: values.taxRateMonthly,
        //     taxRatePerTrip: values.taxRatePerTrip,
        //   },
        // };
        // const response = await dispatch(updateStateTax(payload)).unwrap();
        // console.log(`🚀 ~ formikHandleSubmit ~ response:`, response);
      }
    } catch (error) {
      throw error;
    }
  };

  if (error) return <Error500 />;

  return (
    <>
      <Stack gap={1} spacing={1}>
        {/* <Header
          OtherComp={({ loading }) => (
            <ButtonComponent
              driverType={driverType}
              handleDriverTypeChange={handleDriverTypeChange}
              loading={loading}
              handleDriverBulkUploadOpen={handleDriverBulkUploadOpen}
              setQuery={handleSearch}
            />
          )}
        /> */}
        <Stack
          direction={'row'}
          spacing={1}
          justifyContent="space-between" // Distribute space between left and right
          alignItems="center"
          sx={{ p: 0, pb: 1, width: '100%' }} // Make the container take the full width
        >
          {/* DebouncedSearch on the left */}
          <DebouncedSearch
            search={search}
            onSearchChange={onSearchChange}
            handleSearch={handleSearch}
            label="Search Driver"
            sx={{
              color: '#fff',
              '& .MuiSelect-select': {
                // padding: '0.5rem',
                pr: '2rem'
              },
              '& .MuiSelect-icon': {
                color: '#fff' // Set the down arrow color to white
              },
              width: '180px' // Set desired width for search input
            }}
          />
          <Stack direction="row" alignItems="center" spacing={2} sx={{ ml: 'auto' }}>
            <WrapperButton moduleName={MODULE.DRIVER} permission={PERMISSIONS.CREATE}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
                onClick={handleAdd}
                size="small"
                disabled={loading} // Disable button while loading
              >
                {loading ? 'Loading...' : 'Add Driver'}
              </Button>
            </WrapperButton>
            <AccessControlWrapper allowedUserTypes={[USERTYPE.iscabProvider]}>
              <WrapperButton moduleName={MODULE.DRIVER} permission={PERMISSIONS.CREATE}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
                  onClick={() => navigate('/management/driver/add-driver-rate')}
                  size="small"
                  color="success"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? 'Loading...' : 'Add Driver Rate'}
                </Button>
              </WrapperButton>
            </AccessControlWrapper>

            <AccessControlWrapper allowedUserTypes={[USERTYPE.iscabProvider, USERTYPE.isVendor]}>
              <Wrapper
                allowedPermission={{
                  [MODULE.DRIVER]: [PERMISSIONS.CREATE]
                }}
                strategy={STRATEGY.ALL}
              >
                <Button
                  variant="contained"
                  size="small"
                  color="secondary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
                  onClick={handleDriverBulkUploadOpen}
                  disabled={loading} // Disable button while loading
                >
                  {loading ? 'Loading...' : 'Upload Driver List'}
                </Button>
              </Wrapper>
            </AccessControlWrapper>
          </Stack>
        </Stack>
        <DriverTable
          data={drivers}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={handleLimitChange}
          lastPageNo={lastPageIndex}
          loading={loading}
          setUpdateKey={setUpdateKey}
          updateKey={updateKey}
        />
      </Stack>

      {open && (
        <DriverRegister
          open={open}
          handleClose={handleCloseDialog}
          sliceName="drivers"
          title={{ ADD: 'Add Driver', EDIT: 'Edit Driver' }}
          initialValuesFun={getInitialValues}
          onSubmit={formikHandleSubmit}
        />
      )}
      <BulkUploadDialog
        open={openBulkUploadDialog}
        handleOpen={handleDriverBulkUploadOpen}
        handleClose={handleDriverBulkUploadClose}
        setUpdateKey={setUpdateKey}
      />
    </>
  );
};

export default Driver;

const ButtonComponent = ({ driverType, handleDriverTypeChange, loading, handleDriverBulkUploadOpen, setQuery }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAdd = useCallback(() => {
    dispatch(handleOpen(ACTION.CREATE));
  }, []);
  const [search, setSearch] = useState('');
  // Search change handler
  const onSearchChange = (value) => {
    setSearch(value); // Update the search state
  };

  return (
    <>
      <Stack
        direction={'row'}
        spacing={1}
        justifyContent="space-between" // Distribute space between left and right
        alignItems="center"
        sx={{ p: 0, pb: 1, width: '100%' }} // Make the container take the full width
      >
        {/* DebouncedSearch on the left */}
        <DebouncedSearch
          search={search}
          onSearchChange={onSearchChange}
          handleSearch={setQuery}
          sx={{
            color: '#fff',
            '& .MuiSelect-select': {
              // padding: '0.5rem',
              pr: '2rem'
            },
            '& .MuiSelect-icon': {
              color: '#fff' // Set the down arrow color to white
            },
            width: '180px' // Set desired width for search input
          }}
        />
        <Stack direction="row" alignItems="center" spacing={2} sx={{ ml: 'auto' }}>
          <WrapperButton moduleName={MODULE.DRIVER} permission={PERMISSIONS.CREATE}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
              onClick={handleAdd}
              size="small"
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Loading...' : 'Add Driver'}
            </Button>
          </WrapperButton>
          <WrapperButton moduleName={MODULE.DRIVER} permission={PERMISSIONS.CREATE}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
              onClick={() => navigate('/management/driver/add-driver-rate')}
              size="small"
              color="success"
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Loading...' : 'Add Driver Rate'}
            </Button>
          </WrapperButton>
          <WrapperButton moduleName={MODULE.DRIVER} permission={PERMISSIONS.CREATE}>
            <Button variant="contained" size="small" color="secondary" startIcon={<Add />} onClick={handleDriverBulkUploadOpen}>
              Upload Driver List
            </Button>
          </WrapperButton>
        </Stack>
      </Stack>
    </>
  );
};
