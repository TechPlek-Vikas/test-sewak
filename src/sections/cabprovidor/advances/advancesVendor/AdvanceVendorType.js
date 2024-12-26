import { Box, CircularProgress } from '@mui/material';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import axiosServices from 'utils/axios';
import ReactTable from 'components/tables/reactTable1/ReactTable';
import EmptyTableDemo from 'components/tables/EmptyTable';

const AdvanceVendorType = () => {
  const [key, setKey] = useState(0);
  const [add, setAdd] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const [advanceProvider, setAdvanceProvider] = useState(null);

  //Cab Provider Id fetch

  useEffect(() => {
    const providerId = localStorage.getItem('providerId');

    const fetchdata = async () => {
      const response = await axiosServices.get(`/advanceType/cab/providerId`);
      if (response.status === 200) {
        setLoading(false);
      }
      localStorage.setItem('providerId', JSON.stringify(response.data.cabProviderId));
      setAdvanceProvider(response.data.cabProviderId);
    };

    if (!providerId) {
      fetchdata();
    } else {
      setAdvanceProvider(JSON.parse(providerId));
    }
  }, []);

  //Advace Type listing showcase

  const [fetchAllAdvanceType, setFetchAllAdvanceType] = useState(null);

  useEffect(() => {
    const fetchdata = async () => {
        const providerId = JSON.parse(localStorage.getItem('providerId'));
        
      const response = await axiosServices.get(`${process.env.REACT_APP_API_URL}advanceType/all?cabProviderId=${providerId}`);
      if (response.status === 200) {
        setLoading(false);
      }
      setFetchAllAdvanceType(response.data.dataList);
    };

    fetchdata();
  }, [key]);

  const handleAdd = () => {
    setAdd(!add);
    if (customer && !add) setCustomer(null);
  };

  const columns = useMemo(
    () => [
      {
        Header: '_id',
        accessor: '_id',
        className: 'cell-center',
        disableSortBy: true
      },
      {
        Header: '#',
        accessor: 'id',
        className: 'cell-center',
        Cell: ({ row }) => <span>{row.index + 1}</span> // Use row.index to display incremental number
      },
      {
        Header: 'Advance Type',
        accessor: 'advanceTypeName'
      },
      {
        Header: 'Interest Rate',
        accessor: 'interestRate'
      },
    ],
    [theme]
  );


  return (
    <>
      <MainCard content={false}>
        <ScrollX>
          {loading ? (
            <Box
              sx={{
                height: '100vh',
                width: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CircularProgress />
            </Box>
          ) : fetchAllAdvanceType ? (
            <ReactTable
              columns={columns}
              data={fetchAllAdvanceType || []}
              search
            />
          ) : (
            <EmptyTableDemo />
          )}
        </ScrollX>
      </MainCard>
    </>
  );
};

export default AdvanceVendorType;
