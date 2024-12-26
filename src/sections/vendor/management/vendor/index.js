import Error500 from 'pages/maintenance/error/500';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import VendorTable from './VendorTable';
import { fetchVendor1 } from 'store/slice/cabProvidor/vendorSlice';

const Vendor = () => {
  const dispatch = useDispatch();
  const { vendor1, metaData, loading, error } = useSelector((state) => state.vendors);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const lastPageIndex = metaData.lastPageNo;
  const [query, setQuery] = useState(null);

  console.log("vendor1",vendor1);
  

  useEffect(() => {
    dispatch(fetchVendor1());
  }, [dispatch, page, limit, query]);

  const handleLimitChange = useCallback((event) => {
    setLimit(+event.target.value);
    setPage(1);
  }, []);

  // Debounced function to handle search input
  const handleSearch = useCallback(
    _.debounce((searchQuery) => {
      setQuery(searchQuery); // Update the query state
    }, 500),
    []
  );

  if (error) return <Error500 />;

  return (
    <VendorTable
      data={vendor1}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={handleLimitChange}
      lastPageNo={lastPageIndex}
      loading={loading}
      setQuery={handleSearch} // Pass the debounced function
    />
  );
};

export default Vendor;
