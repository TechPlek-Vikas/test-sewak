import Error500 from 'pages/maintenance/error/500';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies } from 'store/slice/cabProvidor/companySlice';
import PropTypes from 'prop-types';
import CompanyTable from 'sections/cabprovidor/companyManagement/CompanyTable';

const Company = () => {
  const dispatch = useDispatch();
  const { companies = [], metaData = {}, loading = false, error = null } = useSelector((state) => state.companies || {});

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [lastPageNo, setLastPageNo] = useState(Math.ceil(metaData.totalCount / metaData.limit) || 1);
  const [query, setQuery] = useState(null);

  console.log('metaData', metaData);

  useEffect(() => {
    dispatch(fetchCompanies({ page: page, limit: limit, query: query }));
  }, [dispatch, page, limit, query]);

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

  if (error) return <Error500 />;
  return (
    <CompanyTable
      data={companies}
      metaData={metaData}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={handleLimitChange}
      lastPageNo={lastPageNo}
      setLastPageNo={setLastPageNo}
      loading={loading}
      setQuery={handleSearch} // Pass the debounced function
    />
  );
};

Company.propTypes = {
  value: PropTypes.string
};

export default Company;
