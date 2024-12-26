import { useEffect, useState } from 'react';
// assets
import { Button, CircularProgress, Stack } from '@mui/material';
import CompanyRateReactTable from './CompanyRateReactTable';
import Header from 'components/tables/genericTable/Header';
import WrapperButton from 'components/common/guards/WrapperButton';
import { Add, Box } from 'iconsax-react';
import CompanyRate from './CompanyRate';
import axiosServices from 'utils/axios';
import { TableNoDataMessage } from 'components/tables/reactTable1/ReactTable';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import TableSkeleton from 'components/tables/TableSkeleton';
import EmptyTableDemo from 'components/tables/EmptyTable';
import AccessControlWrapper from 'components/common/guards/AccessControlWrapper';
import { USERTYPE } from 'constant';
import { useSelector } from 'store';
import TemplateSelectDialog from 'sections/rateUpload/companyRate/TemplateSelectDialog';
import { fetchCompanyRates } from 'store/cacheSlice/companyRatesSlice';
import { dispatch } from 'store';

// ==============================|| REACT TABLE - EDITABLE CELL ||============================== //

const CompanyRateListing = ({ companyName, id }) => {
  const [data, setData] = useState([]);
  const [skipPageReset, setSkipPageReset] = useState(false);
  const [companyRate, setCompanyRate] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [updateKey, setUpdateKey] = useState(0);
  const [showCompanyList, setShowCompanyList] = useState(false);
  const [key, setKey] = useState(0);

  const userType = useSelector((state) => state.auth.userType);

  const { cache, loading, error } = useSelector((state) => state.companyRates); // Access Redux state
  console.log({ cache });

  // Fetch company rates based on selectedCompany
  useEffect(() => {
    if (id && !cache[id]) {
      dispatch(fetchCompanyRates({ companyId: id, userType: userType }));
    }
  }, [userType, dispatch, id, cache]);

  // Update local state when cache changes
  useEffect(() => {
    if (id && cache[id]) {
      setCompanyList(cache[id]);
    }
  }, [userType, cache, id]);

  const handleAddRate = () => {
    setShowCompanyList(true);
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
      {!showCompanyList ? ( // Conditional rendering based on showCompanyList state
        <Stack gap={1} spacing={1}>
          <Header OtherComp={({ loading }) => <ButtonComponent id={id} loading={loading} onAddRate={handleAddRate} setKey={setKey} />} />

          <MainCard title="Company Rates" content={false}>
            <ScrollX>
              {loading ? (
                <TableSkeleton rows={10} columns={6} />
              ) : companyList.length !== 0 ? (
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
              ) : (
                <EmptyTableDemo />
              )}
            </ScrollX>
          </MainCard>
        </Stack>
      ) : (
        <CompanyRate id={id} companyName={companyName} onBackToList={handleBackToList} /> // Render CompanyList1 when the state is true
      )}
    </>
  );
};

export default CompanyRateListing;

const ButtonComponent = ({ id, loading, onAddRate, setKey }) => {
  const [openCompanyRateUploadDialog, setOpenCompanyRateUploadDialog] = useState(false);

  const handleCompanyRateUploadOpen = () => {
    setOpenCompanyRateUploadDialog(true);
  };
  const handleCompanyRateUploadClose = () => {
    setOpenCompanyRateUploadDialog(false);
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <AccessControlWrapper allowedUserTypes={[USERTYPE.iscabProvider]}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
          onClick={onAddRate} // Call the onAddRate function when button is clicked
          size="small"
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Loading...' : ' Add Rate'}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
          onClick={handleCompanyRateUploadOpen}
          size="small"
          disabled={loading}
        >
          {loading ? 'Loading...' : ' Upload'}
        </Button>
      </AccessControlWrapper>
      <TemplateSelectDialog
        id={id}
        open={openCompanyRateUploadDialog}
        handleOpen={handleCompanyRateUploadOpen}
        handleClose={handleCompanyRateUploadClose}
        setKey={setKey}
      />
    </Stack>
  );
};
