import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Autocomplete, Checkbox, CircularProgress, Grid, List, ListItem, Skeleton, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import { debounce } from 'lodash';
import { fetchZoneData } from 'store/cacheSlice/zoneCacheSlice';
import { dispatch } from 'store';

const ZoneSelection = ({ sx, value = [], setSelectedOptions }) => {
  const { cache, loading } = useSelector((state) => state.zoneCache); // Access Redux state
  const [filteredOptions, setFilteredOptions] = useState([]); // Filtered options for search
  const [query, setQuery] = useState(''); // Tracks search input
  const [selectAllChecked, setSelectAllChecked] = useState(false); // Tracks Select All state

  // Fetch zones on open if not already in cache
  useEffect(() => {
    if (!cache.default) {
      dispatch(fetchZoneData());
    } else {
      setFilteredOptions(cache.default);
    }
  }, [cache.default, dispatch]);

  // Update filtered options when search query changes
  const filterOptions = useCallback(
    debounce((inputQuery) => {
      const lowerQuery = inputQuery.toLowerCase();
      const filtered = (cache.default || []).filter((option) => option.zoneName.toLowerCase().includes(lowerQuery));
      setFilteredOptions(filtered);
    }, 500),
    [cache.default]
  );

  useEffect(() => {
    filterOptions(query);
  }, [query, filterOptions]);

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
  
  return (
    <Grid item xs={12}>
      <Autocomplete
        multiple
        id="zone-selection"
        options={filteredOptions} // Use filtered options
        disableCloseOnSelect
        openOnFocus
        getOptionLabel={(option) => option.zoneName}
        value={value}
        loading={loading} // Show loading indicator
        onChange={(event, newValue) => setSelectedOptions(newValue || [])} // Update selected options
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox style={{ marginRight: 8 }} checked={selected} />
            {option.zoneName}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search or Select Zones"
            onChange={(e) => setQuery(e.target.value)} // Update search query
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
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

export default ZoneSelection;
