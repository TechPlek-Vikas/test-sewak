import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, Checkbox, Grid, List, ListItem, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import axiosServices from 'utils/axios';
import { debounce } from 'lodash';

const DriverSelection = ({ sx, value = [], setSelectedOptions }) => {
  const [options, setOptions] = useState([]); // Stores all fetched options
  const [filteredOptions, setFilteredOptions] = useState([]); // Filtered options
  const [loading, setLoading] = useState(false); // Tracks loading state
  const [open, setOpen] = useState(false); // Tracks dropdown open state
  const [query, setQuery] = useState(''); // Tracks search input
  const [cache, setCache] = useState({}); // Cache for fetched results
  const [selectAllChecked, setSelectAllChecked] = useState(false); // Tracks Select All state

  // Fetch default options when dropdown is opened
  useEffect(() => {
    const fetchDefaultOptions = async () => {
      if (cache.default) {
        setOptions(cache.default);
        setFilteredOptions(cache.default);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosServices.get('/driver/list?drivertype=1&page=1&limit=50');
        const drivers = response.data.data.result || [];
        const driverList = drivers.map((item) => ({
          _id: item._id,
          userName: item.userName,
          contactNumber: item.contactNumber
        }));
        setOptions(driverList);
        setFilteredOptions(driverList); // Initialize filtered options
        setCache((prevCache) => ({ ...prevCache, default: driverList })); // Cache default results
      } catch (error) {
        console.error('Error fetching default options:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchDefaultOptions();
  }, [open, cache.default]);

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
      const filtered = options.filter((option) => option.userName.toLowerCase().includes(lowerQuery));
      setFilteredOptions(filtered);
    }, 500),
    [options]
  );

  useEffect(() => {
    filterOptions(query);
  }, [query, filterOptions]);

  return (
    <Grid item xs={12}>
      <Autocomplete
        multiple
        id="driver-selection"
        options={filteredOptions} // Use filtered options
        disableCloseOnSelect
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        getOptionLabel={(option) => option.userName}
        value={value}
        onChange={(event, newValue) => setSelectedOptions(newValue || [])} // Update selected options
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox style={{ marginRight: 8 }} checked={selected} />
            <div>
              {option.userName}
              <br />
              <span style={{ fontSize: 'smaller', color: 'gray' }}>{option?.contactNumber ? `+91-${option.contactNumber}` : 'N/A'}</span>
            </div>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search or Select Drivers"
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

export default DriverSelection;
