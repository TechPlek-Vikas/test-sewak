/* eslint-disable no-unused-vars */
import { Button, CircularProgress, Stack } from '@mui/material';
import WrapperButton from 'components/common/guards/WrapperButton';
import Header from 'components/tables/genericTable/Header';
import { MODULE, PERMISSIONS, USERTYPE } from 'constant';
import { Add } from 'iconsax-react';
import Error500 from 'pages/maintenance/error/500';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CabTable from 'sections/cabprovidor/cabManagement/CabTable';
import { fetchCabs } from 'store/slice/cabProvidor/cabSlice';
import BulkUploadDialog from './bulkUpload/Dialog';
import DebouncedSearch from 'components/textfield/DebounceSearch';
import { useNavigate } from 'react-router';
import AccessControlWrapper from 'components/common/guards/AccessControlWrapper';

const Cab = () => {
  const dispatch = useDispatch();
  const { cabs, metaData, loading, error } = useSelector((state) => state.cabs);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const lastPageIndex = metaData.lastPageNo;
  const [query, setQuery] = useState(null);
  const [openBulkUploadDialog, setOpenBulkUploadDialog] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  // Search change handler
  const onSearchChange = (value) => {
    setSearch(value); // Update the search state
  };

  const handleVehicleBulkUploadOpen = () => {
    setOpenBulkUploadDialog(true);
  };
  const handleVehicleBulkUploadClose = () => {
    setOpenBulkUploadDialog(false);
  };

  useEffect(() => {
    dispatch(fetchCabs({ page, limit, query: query }));
  }, [page, limit, dispatch, query]);

  // Debounced function to handle search input
  const handleSearch = useCallback(
    _.debounce((searchQuery) => {
      setQuery(searchQuery); // Update the query state
    }, 500),
    []
  );

  const handleLimitChange = useCallback((event) => {
    setLimit(+event.target.value);
    setPage(1);
  }, []);

  // if (loading) return <TableSkeleton rows={10} columns={5} />;
  if (error) return <Error500 />;
  // if (cabs.length === 0) return <EmptyTableDemo />;

  return (
    <>
      <Stack gap={1} spacing={1}>
        {/* <Header
          OtherComp={({ loading }) => <ButtonComponent loading={loading} handleVehicleBulkUploadOpen={handleVehicleBulkUploadOpen} />}
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
            label="Search Cab"
            sx={{
              color: '#fff',
              '& .MuiSelect-select': {
                // padding: '0.5rem',
                pr: '2rem'
              },
              '& .MuiSelect-icon': {
                color: '#fff' // Set the down arrow color to white
              },
              width: '180px'
            }}
          />
          <Stack direction="row" alignItems="center" spacing={2} sx={{ ml: 'auto' }}>
            <WrapperButton moduleName={MODULE.CAB} permission={PERMISSIONS.CREATE}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
                onClick={() => navigate('/management/cab/add-cab')}
                size="small"
                disabled={loading} // Disable button while loading
              >
                {loading ? 'Loading...' : 'Add Cab'}
              </Button>
            </WrapperButton>
            <AccessControlWrapper allowedUserTypes={[USERTYPE.iscabProvider]}>
              <WrapperButton moduleName={MODULE.CAB} permission={PERMISSIONS.CREATE}>
                <Button
                  variant="contained"
                  size="small"
                  color="secondary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
                  onClick={handleVehicleBulkUploadOpen}
                  disabled={loading} // Disable button while loading
                >
                  {loading ? 'Loading...' : 'Upload Vehicle List'}
                </Button>
              </WrapperButton>
            </AccessControlWrapper>
          </Stack>
        </Stack>
        <CabTable
          data={cabs}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={handleLimitChange}
          lastPageNo={lastPageIndex}
          loading={loading}
        />
      </Stack>

      <BulkUploadDialog open={openBulkUploadDialog} handleOpen={handleVehicleBulkUploadOpen} handleClose={handleVehicleBulkUploadClose} />
    </>
  );
};

export default Cab;

const ButtonComponent = ({ loading, handleVehicleBulkUploadOpen }) => {
  const navigate = useNavigate();
  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <WrapperButton moduleName={MODULE.CAB} permission={PERMISSIONS.CREATE}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
            onClick={() => navigate('/management/cab/add-cab')}
            size="small"
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Loading...' : 'Add Cab'}
          </Button>
        </WrapperButton>
        <WrapperButton moduleName={MODULE.DRIVER} permission={PERMISSIONS.CREATE}>
          <Button variant="contained" size="small" color="secondary" startIcon={<Add />} onClick={handleVehicleBulkUploadOpen}>
            Upload Vehicle List
          </Button>
        </WrapperButton>
      </Stack>
    </>
  );
};
