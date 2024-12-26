import { Button, CircularProgress, Stack } from '@mui/material';
import { Add } from 'iconsax-react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Header from 'components/tables/genericTable/Header';
import SubscriptionTable from './SubscriptionTable';
import { fetchsubscriptionPlan } from 'store/slice/cabProvidor/subscriptionSlice';
import SubscriptionAdd from './SubscriptionAdd';

const SubscriptionAdmin = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [error, setError] = useState(false);
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await dispatch(fetchsubscriptionPlan({ all: 1 }));
        if (result?.payload?.success) {
          setData(result.payload.data);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleLimitChange = useCallback((event) => {
    setLimit(+event.target.value);
    setPage(1);
  }, []);

  const handleAdd = useCallback((subscription = null) => {
    
    setCurrentSubscription(subscription); // Set data for editing or null for adding
    setOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpen(false);
    setCurrentSubscription(null); // Clear current subscription on close
  }, []);

  const refreshTable = async () => {
    // Re-fetch subscription data
    const result = await dispatch(fetchsubscriptionPlan());
    if (result?.payload?.success) {
      setData(result.payload.data);
    }
  };

  return (
    <>
      <Stack gap={1} spacing={1}>
        <Header OtherComp={() => <ButtonComponent handleAdd={handleAdd} loading={loading} />} />

        <SubscriptionTable
          data={data}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={handleLimitChange}
          lastPageNo={Math.ceil(data.length / limit)}
          loading={loading}
          handleAdd={handleAdd}
          refreshTable={refreshTable}
        />
      </Stack>

      {open && (
        <SubscriptionAdd
          open={open}
          handleClose={handleCloseDialog}
          data={data}
          currentSubscription={currentSubscription}
          refreshTable={refreshTable}
        />
      )}
    </>
  );
};


export default SubscriptionAdmin;

const ButtonComponent = ({ handleAdd, loading }) => {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
        onClick={handleAdd}
        size="small"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Add Subscription Plan'}
      </Button>
    </Stack>
  );
};
