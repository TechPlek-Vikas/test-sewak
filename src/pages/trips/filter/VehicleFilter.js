import React, { useEffect, useState } from 'react';
import { Autocomplete, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import axiosServices from 'utils/axios';
import { SearchNormal1 } from 'iconsax-react';

const VehicleFilter = ({ setFilterOptions, sx, value }) => {
  const [options, setOptions] = useState([]); // Stores fetched options
  const [loading, setLoading] = useState(false); // Tracks loading state
  const [open, setOpen] = useState(false); // Tracks dropdown open state
  const [query, setQuery] = useState(''); // Tracks input query
  const [cache, setCache] = useState({}); // Cache for query results

  console.log("options",options);

  // Fetch default options when the dropdown is opened
  // useEffect(() => {
  //   const fetchDefaultOptions = async () => {
  //     if (cache.default) {
  //       // Use cached default options if available
  //       setOptions(cache.default);
  //       return;
  //     }

  //     setLoading(true);
  //     try {
  //       const response = await axiosServices.get('/vehicle/all/linked/drivers');
  //       const vehicles = response.data.data;
  //       console.log("vehicles",vehicles);
        
  //       setOptions(vehicles);
  //       setCache((prevCache) => ({ ...prevCache, default: vehicles })); // Cache default results
  //     } catch (error) {
  //       console.error('Error fetching default options:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (open) {
  //     fetchDefaultOptions();
  //   }
  // }, [open, cache.default]);

  // Fetch options based on query with caching
  // useEffect(() => {
  //   if (!query) return;

  //   if (cache[query]) {
  //     // Use cached results if available
  //     setOptions(cache[query]);
  //     return;
  //   }

  //   const fetchOptions = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await axiosServices.get(`/vehicle/search?filter=${query}`);
  //       const vehicles = response.data.data;

  //       setOptions(vehicles);
  //       setCache((prevCache) => ({ ...prevCache, [query]: vehicles })); // Cache query results
  //     } catch (error) {
  //       console.error('Error fetching options:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const debounceFetch = setTimeout(fetchOptions, 300); // Debounce API call

  //   return () => clearTimeout(debounceFetch); // Cleanup debounce timer
  // }, [query, cache]);

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
        id="vehicle-filter"
        open={open}
        value={value}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        isOptionEqualToValue={(option, value) => option.vehicleNumber === value.vehicleNumber}
        getOptionLabel={(option) => option.vehicleNumber || ''}
        options={options}
        loading={loading}
        // onInputChange={(event, newInputValue) => setQuery(newInputValue)} // Update query state
        sx={sx}
        onChange={(event, newValue) => {
          setFilterOptions((prevState) => ({
            ...prevState,
            selectedVehicle: newValue || {} // Reset to an empty object if cleared
          }));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Filter Vehicle"
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
              {option.vehicleNumber || 'N/A'}
              <br />
              <span style={{ fontSize: 'smaller', color: 'gray' }}>
                {option?.vehicleTypeName || 'N/A'}
              </span>
            </div>
          </li>
        )}
      />
    </Grid>
  );
};


export default VehicleFilter;
