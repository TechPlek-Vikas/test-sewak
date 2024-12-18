import PropTypes from 'prop-types';
import React, { useState, useEffect, memo, useRef } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import moment from 'moment';
import { Calendar } from 'iconsax-react';
import DateRangePickerDialog from 'components/DateRange/DateRangePickerDialog';
import CustomDateRangePickerDialog from 'components/DateRange/CustomDateRangePickerDialog';

// Enum to define different date range options
export const DATE_RANGE_OPTIONS = Object.freeze({
  ALL_TIME: 'allTime',
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS: 'last30days',
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  CUSTOM: 'custom'
});

const FORMAT_DATE = 'MMM DD, YY';

const DateRangeSelect = memo(
  ({
    startDate,
    endDate,
    onRangeChange,
    showLabel = false,
    showSelectedRangeLabel = false, // Configurable prop to show/hide selected range label
    selectedRange,
    setSelectedRange,
    prevRange,
    availableRanges
  }) => {
    // console.log('DateRangeSelect render');

    // console.log('range', selectedRange);
    // console.log('prevRange', prevRange);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const currentRef = useRef('custom');

    // Predefined date range objects based on the above enum
    const predefinedDateRanges = {
      [DATE_RANGE_OPTIONS.ALL_TIME]: {
        label: 'All Time',
        start: moment(0),
        // end: moment().endOf('day')
        end: moment()
      },
      [DATE_RANGE_OPTIONS.TODAY]: {
        label: 'Today',
        start: moment().startOf('day'),
        // end: moment().endOf('day')
        end: moment()
      },
      [DATE_RANGE_OPTIONS.YESTERDAY]: {
        label: 'Yesterday',
        start: moment().subtract(1, 'day').startOf('day'),
        end: moment().subtract(1, 'day').endOf('day')
      },
      [DATE_RANGE_OPTIONS.LAST_7_DAYS]: {
        label: 'Last 7 Days',
        start: moment().subtract(7, 'days').startOf('day'),
        // end: moment().endOf('day')
        end: moment()
      },
      [DATE_RANGE_OPTIONS.LAST_30_DAYS]: {
        label: 'Last 30 Days',
        start: moment().subtract(30, 'days').startOf('day'),
        // end: moment().endOf('day')
        end: moment()
      },
      [DATE_RANGE_OPTIONS.THIS_MONTH]: {
        label: 'Current Month',
        start: moment().startOf('month'),
        end: moment()
      },
      [DATE_RANGE_OPTIONS.LAST_MONTH]: {
        label: 'Last Month',
        start: moment().subtract(1, 'month').startOf('month'),
        end: moment().subtract(1, 'month').endOf('month')
      },
      [DATE_RANGE_OPTIONS.CUSTOM]: { label: 'Custom Range' }
    };

    // Helper to determine which range the current start and end dates fall into
    const determineRange = (startDate, endDate) => {
      for (const [key, range] of Object.entries(predefinedDateRanges)) {
        if (range.start && range.end && moment(startDate).isSame(range.start, 'day') && moment(endDate).isSame(range.end, 'day')) {
          return key;
        }
      }
      return DATE_RANGE_OPTIONS.CUSTOM; // Default to "Custom" if no match is found
    };

    useEffect(() => {
      console.table({ startDate, endDate, selectedRange });
      // Automatically set the range based on the initial dates
      if (startDate && endDate && !selectedRange) {
        const initialRange = determineRange(startDate, endDate);
        // console.log(`🚀 ~ useEffect ~ initialRange:`, initialRange);
        setSelectedRange(initialRange);
        currentRef.current = initialRange;
      }
    }, [startDate, endDate, selectedRange, setSelectedRange]);

    const filteredDateRanges = availableRanges
      ? Object.entries(predefinedDateRanges).filter(([key]) => availableRanges.includes(key))
      : Object.entries(predefinedDateRanges);

    const handleRangeSelection = (event) => {
      const range = event.target.value;
      // console.log('🚀 ~ handleRangeSelection ~ range:', range);
      setSelectedRange(range);
      currentRef.current = range;

      if (range === DATE_RANGE_OPTIONS.CUSTOM) {
        setDialogOpen(true);
      } else {
        const selectedRangeDetails = predefinedDateRanges[range];
        const rangeStart = selectedRangeDetails?.start ? selectedRangeDetails.start.toDate() : null;
        const rangeEnd = selectedRangeDetails?.end ? selectedRangeDetails.end.toDate() : null;

        onRangeChange({
          startDate: rangeStart,
          endDate: rangeEnd
        });
      }
    };

    const handleDialogClose = (e, flag = false) => {
      setDialogOpen(false);
      if (flag === 'backdropClick') {
        setSelectedRange(prevRange);
        currentRef.current = prevRange;
        return;
      }
      setSelectedRange(!flag ? prevRange : DATE_RANGE_OPTIONS.CUSTOM);
    };

    const selectedRangeLabel =
      selectedRange && startDate && endDate
        ? `${predefinedDateRanges[selectedRange]?.label} (${moment(startDate).format(FORMAT_DATE)} - ${moment(endDate).format(
            FORMAT_DATE
          )})`
        : predefinedDateRanges[selectedRange]?.label || 'Select Date Range';

    return (
      <>
        <FormControl variant="outlined">
          {showLabel && <InputLabel>Date Range</InputLabel>}

          <Select
            value={selectedRange}
            onChange={handleRangeSelection}
            onClick={(e) => {
              e.stopPropagation();
              // console.log('onClick');
              // console.log('range == ', selectedRange);
              // console.log('prevRange == ', currentRef.current);

              if (currentRef.current === DATE_RANGE_OPTIONS.CUSTOM) {
                setDialogOpen(true);
              }
            }}
            label={showLabel ? 'Date Range' : ''}
            displayEmpty
            sx={{
              backgroundColor: 'primary.main',
              color: '#fff',
              '& .MuiSelect-select': {
                padding: '0.5rem',
                pr: '2rem'
              },
              '& .MuiSelect-icon': {
                color: '#fff' // Set the down arrow color to white
              }
            }}
            // renderValue={() => (
            //   <Box display="flex" alignItems="center">
            //     <Calendar fontSize="small" style={{ marginRight: 8 }} />
            //     {selectedRangeLabel}
            //   </Box>
            // )}
            renderValue={() =>
              showSelectedRangeLabel ? (
                <Box display="flex" alignItems="center">
                  <Calendar fontSize="small" style={{ marginRight: 8 }} color="#fff" />
                  {selectedRangeLabel}
                </Box>
              ) : (
                <Box display="flex" alignItems="center">
                  <Calendar fontSize="small" style={{ marginRight: 8 }} color="#fff" />
                  {predefinedDateRanges[selectedRange]?.label || 'Select Date Range'}
                </Box>
              )
            }
          >
            {filteredDateRanges.map(([key, { label }]) => (
              <MenuItem key={key} value={key}>
                <Box display="flex" alignItems="center">
                  {label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* <DateRangePickerDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onDateRangeChange={(newRange) => {
            onRangeChange(newRange);
            handleDialogClose();
          }}
          initialStartDate={startDate}
          initialEndDate={endDate}
        /> */}

        {isDialogOpen && (
          <CustomDateRangePickerDialog
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
            onDateRangeChange={(newRange, flag) => {
              onRangeChange(newRange);
              handleDialogClose(null, flag);
            }}
            prevRange={prevRange}
            selectedRange={selectedRange}
            initialStartDate={startDate}
            initialEndDate={endDate}
          />
        )}
      </>
    );
  }
);

DateRangeSelect.displayName = 'DateRangeSelect';

// Prop validation using PropTypes
DateRangeSelect.propTypes = {
  startDate: PropTypes.instanceOf(Date), // Ensures startDate is a Date object
  endDate: PropTypes.instanceOf(Date), // Ensures endDate is a Date object
  onRangeChange: PropTypes.func.isRequired, // Callback function to handle range changes
  showLabel: PropTypes.bool, // Determines whether to show the label
  showSelectedRangeLabel: PropTypes.bool, // Prop for controlling selectedRangeLabel visibility
  selectedRange: PropTypes.string, // The currently selected date range key
  prevRange: PropTypes.string, // The previously selected date range key
  setSelectedRange: PropTypes.func.isRequired, // Function to update the selected range state
  availableRanges: PropTypes.arrayOf(PropTypes.string) // Array of available date range keys to be displayed
};

export default DateRangeSelect;
