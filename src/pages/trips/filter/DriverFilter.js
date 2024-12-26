import React, { useEffect, useState } from 'react';
import { Autocomplete, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import axiosServices from 'utils/axios';
import { SearchNormal1 } from 'iconsax-react';

const DriverFilter = ({ setFilterOptions, sx, value }) => {
  const [options, setOptions] = useState([]); // Stores fetched options
  const [loading, setLoading] = useState(false); // Tracks loading state
  const [open, setOpen] = useState(false); // Tracks dropdown open state
  const [query, setQuery] = useState(''); // Tracks input query
  const [cache, setCache] = useState({}); // Cache for query results
  
  // Fetch default options when the dropdown is opened
  useEffect(() => {
    const fetchDefaultOptions = async () => {
      if (cache.default) {
        // Use cached default options if available
        setOptions(cache.default);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosServices.get('/driver/list?drivertype=1&page=1&limit=10');
        const drivers = response.data.data.result;

        setOptions(drivers);
        setCache((prevCache) => ({ ...prevCache, default: drivers })); // Cache default results
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
        const response = await axiosServices.get(`/driver/list?drivertype=1&page=1&limit=50&name=${query}`);
        const drivers = response.data.data.result;

        setOptions(drivers);
        setCache((prevCache) => ({ ...prevCache, [query]: drivers })); // Cache query results
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
        id="driver-filter"
        open={open}
        value={value}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        isOptionEqualToValue={(option, value) => option.userName === value.userName}
        getOptionLabel={(option) => option.userName || ''}
        options={options}
        loading={loading}
        onInputChange={(event, newInputValue) => setQuery(newInputValue)} // Update query state
        sx={sx}
        onChange={(event, newValue) => {
          setFilterOptions((prevState) => ({
            ...prevState,
            selectedDriver: newValue || {} // Reset to an empty object if cleared
          }));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Filter Driver"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <SearchNormal1 size={14} />
            ),
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
              {option.userName || 'N/A'}
              <br />
              <span style={{ fontSize: 'smaller', color: 'gray' }}>{option?.contactNumber ? `+91-${option.contactNumber}` : 'N/A'}</span>
            </div>
          </li>
        )}
      />
    </Grid>
  );
};

export default DriverFilter;
