import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, Checkbox, Grid, List, ListItem, Skeleton, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import { dispatch } from 'store';
import { fetchVehicleTypes } from 'store/cacheSlice/vehicleTypes';

const VehicleTypeSelection = ({ sx, value = [], setSelectedOptions }) => {
  const { initialized, cache, loading } = useSelector((state) => state.vehicleType); // Access Redux state

  const [filteredOptions, setFilteredOptions] = useState([]); // Filtered options
  const [query, setQuery] = useState(''); // Tracks search input
  const [selectAllChecked, setSelectAllChecked] = useState(false); // Tracks Select All state

  useEffect(() => {
    if (!initialized) {
      dispatch(fetchVehicleTypes()); // Only fetch if not initialized
    } else if (cache.default.length > 0) {
      setFilteredOptions(cache.default); // Use cached data
    }
  }, [initialized, cache, dispatch]);

  // "Select All" Logic
  const handleSelectAllToggle = () => {
    if (selectAllChecked) {
      setSelectedOptions([]); // Clear all selections
    } else {
      setSelectedOptions(filteredOptions); // Select all filtered options
    }
    setSelectAllChecked(!selectAllChecked);
  };

  // Update "Select All" checkbox dynamically
  useEffect(() => {
    setSelectAllChecked(value.length === filteredOptions.length && filteredOptions.length > 0);
  }, [value, filteredOptions]);

  // Debounced Search for Filtering
  const filterOptions = useCallback(
    debounce((inputQuery) => {
      const lowerQuery = inputQuery.toLowerCase();
      const filtered = cache.default.filter((option) => option.vehicleTypeName.toLowerCase().includes(lowerQuery));
      setFilteredOptions(filtered);
    }, 500),
    [cache.default]
  );

  useEffect(() => {
    if (query) {
      filterOptions(query); // Filter options based on search input
    } else {
      setFilteredOptions(cache.default); // Reset filtered options when query is cleared
    }
  }, [query, filterOptions, cache.default]);
  if (!initialized) {
    return <>Loading component</>;
  }

  return (
    <Grid item xs={12}>
      <Autocomplete
        multiple
        id="vehicle-type-selection"
        options={filteredOptions} // Use filtered options
        disableCloseOnSelect
        getOptionLabel={(option) => option.vehicleTypeName}
        value={value}
        onChange={(event, newValue) => setSelectedOptions(newValue || [])} // Update selected options
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox style={{ marginRight: 8 }} checked={selected} />
            {option.vehicleTypeName}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search or Select Vehicle Types"
            onChange={(e) => setQuery(e.target.value)} // Update search query
          />
        )}
        ListboxComponent={(listboxProps) => {
          const { children, ...rest } = listboxProps;
          return (
            <List {...rest}>
              {/* "Select All" Option */}
              <ListItem button onClick={handleSelectAllToggle} style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={selectAllChecked}
                  indeterminate={value.length > 0 && value.length < filteredOptions.length}
                  style={{ marginRight: 8 }}
                />
                <Typography>Select All</Typography>
              </ListItem>
              {/* Render Filtered Options */}
              {children}
            </List>
          );
        }}
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

export default VehicleTypeSelection;
