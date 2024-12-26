import React, { useEffect, useState } from 'react';
import { Autocomplete, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import axiosServices from 'utils/axios';
import { SearchNormal1 } from 'iconsax-react';

const CompanyFilter = ({ setFilterOptions, sx, value, setQuery: setquery }) => {
  const [options, setOptions] = useState([]); // Stores fetched options
  const [loading, setLoading] = useState(false); // Tracks loading state
  const [open, setOpen] = useState(false); // Tracks dropdown open state
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
        const companies = response.data.data.result;

        setOptions(companies);
        setCache((prevCache) => ({ ...prevCache, default: companies })); // Cache default results
      } catch (error) {
        console.error('Error fetching default options:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchDefaultOptions();
    }
  }, [open, cache.default]);

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
    <Grid item xs={12}>
      <Autocomplete
        id="asynchronous-demo"
        open={open}
        value={value}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        isOptionEqualToValue={(option, value) => option.company_name === value.company_name}
        getOptionLabel={(option) => option.company_name || ''}
        options={options}
        loading={loading}
        onInputChange={(event, newInputValue) => {
          setQuery(newInputValue); // Update query state
          // setquery(newInputValue)
        }}
        sx={sx}
        onChange={(event, newValue) => {
          setFilterOptions((prevState) => ({
            ...prevState,
            selectedCompany: newValue || null // Reset to empty object if no selection
          }));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Filter Company"
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchNormal1 size={14} />,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />
    </Grid>
  );
};

export default CompanyFilter;
