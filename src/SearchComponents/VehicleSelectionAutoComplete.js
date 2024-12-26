import React, { useEffect, useState } from 'react';
import { Autocomplete, Checkbox, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import axiosServices from 'utils/axios';

const VehicleSelection = ({ sx, value, setSelectedOptions }) => {
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
        const response = await axiosServices.get(`/vehicle/all?page=1&limit=10`);
        const vehicles = response.data.data.result;
        setOptions(vehicles);
        setCache((prevCache) => ({ ...prevCache, default: vehicles })); // Cache default results
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
        const response = await axiosServices.get(`/vehicle/all?vehicleNumber=${query}`);
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
        multiple
        id="checkboxes-tags-demo"
        options={options}
        disableCloseOnSelect
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        getOptionLabel={(option) => option.vehicleNumber}
        onChange={(event, newValue) => {
          setSelectedOptions(newValue || []); // Set the selected options
        }}
        loading={loading}
        onInputChange={(event, newInputValue) => {
          setQuery(newInputValue); // Update query state
          // setquery(newInputValue)
        }}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox style={{ marginRight: 8 }} checked={selected} />
            <div>
              {option.vehicleNumber}
              <br />
              <span style={{ fontSize: 'smaller', color: 'gray' }}>{option?.vehicleTypeName || 'N/A'}</span>
            </div>
          </li>
        )}
        renderInput={(params) => <TextField {...params} placeholder="Select Vehicles" />}
        sx={{
          '& .MuiOutlinedInput-root': { p: 1 },
          '& .MuiAutocomplete-tag': {
            bgcolor: 'primary.lighter',
            border: '1px solid',
            borderColor: 'primary.light',
            '& .MuiSvgIcon-root': {
              color: 'primary.main',
              '&:hover': { color: 'primary.dark' }
            }
          },
          ...sx // Allow custom styles via props
        }}
      />
    </Grid>
  );
};

export default VehicleSelection;
