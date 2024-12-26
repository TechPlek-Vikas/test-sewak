import React, { useEffect, useState } from 'react';
import { Autocomplete, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import axiosServices from 'utils/axios';
import { SearchNormal1 } from 'iconsax-react';

const VendorFilter = ({ setFilterOptions, sx, value }) => {
  const [options, setOptions] = useState([]); // Stores fetched options
  const [loading, setLoading] = useState(false); // Tracks loading state
  const [open, setOpen] = useState(false); // Tracks dropdown open state
  const [query, setQuery] = useState(''); // Tracks input query
  const [cache, setCache] = useState({}); // Cache for query results

  // Fetch default options when dropdown is opened
  useEffect(() => {
    const fetchDefaultOptions = async () => {
      if (cache.default) {
        setOptions(cache.default);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosServices.get('/vendor/list?page=1&limit=10');
        const vendors = response.data.data.results;

        setOptions(vendors);
        setCache((prevCache) => ({ ...prevCache, default: vendors })); // Cache default results
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

  // Fetch options based on query with caching
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
        const response = await axiosServices.get(`/vendor/getVendorByName?filter=${query}&page=1&limit=10`);
        const vendors = response.data.data.result;

        setOptions(vendors);
        setCache((prevCache) => ({ ...prevCache, [query]: vendors })); // Cache query results
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchOptions, 300); // Debounce API call

    return () => clearTimeout(debounceFetch); // Cleanup debounce timer
  }, [query, cache]);

  return (
    <Grid item xs={12}>
      <Autocomplete
        id="vendor-filter"
        open={open}
        value={value}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        isOptionEqualToValue={(option, value) => option.vendorCompanyName === value.vendorCompanyName}
        getOptionLabel={(option) => option.vendorCompanyName || ''}
        options={options}
        loading={loading}
        // onInputChange={(event, newInputValue) => setQuery(newInputValue)} // Update query state
        sx={sx}
        onChange={(event, newValue) => {
          setFilterOptions((prevState) => ({
            ...prevState,
            selectedVendor: newValue || {} // Reset to empty object if cleared
          }));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Filter Vendor"
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
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <div>
              {option.vendorCompanyName || 'N/A'}
              <br />
              <span style={{ fontSize: 'smaller', color: 'gray' }}>{option?.workMobileNumber ? `+91-${option.workMobileNumber}` : 'N/A'}</span>
            </div>
          </li>
        )}
      />
    </Grid>
  );
};

export default VendorFilter;
