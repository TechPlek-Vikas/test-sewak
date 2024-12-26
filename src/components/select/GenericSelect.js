import PropTypes from 'prop-types';
import { TextField, MenuItem, FormHelperText, FormControl } from '@mui/material';
import { useField } from 'formik';

const GenericSelect = ({
  label,
  name,
  options = [],
  formik = false, // Boolean flag to know if it's in Formik or not
  value,
  onChange,
  error,
  helperText,
  fullWidth = false,
  renderOption, // New prop to allow custom rendering of MenuItem
  placeholder,
  ...rest
}) => {
  // If Formik is being used, fetch the field and meta from Formik
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [field, meta, helpers] = formik ? useField(name) : [];

  const isError = formik ? Boolean(meta?.touched && meta?.error) : Boolean(error);

  // Determine the current value
  const currentValue = formik ? field?.value : value;
  // console.log(`🚀 ~ currentValue:`, currentValue);

  // Handle the change for Formik and non-Formik forms
  const handleChange = (event) => {
    if (formik) {
      helpers.setValue(event.target.value);
    } else {
      onChange(event);
    }
  };

  return (
    <FormControl fullWidth={fullWidth} error={isError}>
      <TextField
        select
        label={label}
        name={name}
        value={currentValue ?? ''}
        onChange={handleChange}
        {...rest}
        SelectProps={{
          displayEmpty: true
        }}
        InputProps={{
          style: { color: currentValue ? 'inherit' : 'gray' } // Placeholder styling
        }}
      >
        {/* Add a placeholder as the first option if provided */}
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((option) =>
          renderOption ? (
            renderOption(option) // If renderOption is provided, use it
          ) : (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem> // Default rendering
          )
        )}
      </TextField>
      {isError && <FormHelperText>{formik ? meta?.error : helperText}</FormHelperText>}
    </FormControl>
  );
};

// PropTypes validation
GenericSelect.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      // value: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  formik: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  fullWidth: PropTypes.bool,
  renderOption: PropTypes.func
};

export default GenericSelect;

/** SUMMARY :
 * GenericSelect Component
 *
 * - A reusable dropdown component built with Material-UI.
 * - Integrates seamlessly with Formik for form management and validation.
 * - Supports non-Formik usage, providing flexibility in form handling.
 *
 * Props:
 * - `label`: The label for the select input.
 * - `name`: The name of the field, used for Formik integration.
 * - `options`: An array of options to be displayed in the dropdown.
 * - `formik`: A boolean flag to indicate if Formik is being used.
 * - `value`: The current value of the select input for non-Formik usage.
 * - `onChange`: A function to handle changes for non-Formik forms.
 * - `error`: An error state for custom error handling.
 * - `helperText`: Custom helper text to display error messages.
 * - `fullWidth`: A boolean to make the component full width.
 * - `renderOption`: A custom render function for menu items.
 *
 * Functionality:
 * - Uses Formik's `useField` hook to manage field state, value, and validation errors.
 * - Handles change events differently based on whether Formik is in use or not.
 * - Displays validation errors using Material-UI's `FormHelperText`.
 * - Provides default rendering of options, with support for custom rendering through `renderOption`.
 *
 * Emphasizes reusability, flexibility, and clean code for various use cases.
 */
