import PropTypes from 'prop-types';

// material-ui
import { TableCell, TextField } from '@mui/material';

// ==============================|| INVOICE - TEXT FIELD ||============================== //

const InvoiceField = ({ onEditItem, cellData, discountByTax }) => {
  const { type, placeholder, name, id, value, label, itemId } = cellData;
  return (
    <TableCell sx={{ '& .MuiFormHelperText-root': { position: 'absolute', bottom: -24, ml: 0 } }}>
      <TextField
        type={type}
        placeholder={placeholder}
        name={name}
        id={id}
        value={type === 'number' && name === 'price' ? value : type === 'number' ? (value >= 0 ? value : '') : value}
        onChange={(e) => {
          console.log(e.target.value);
          onEditItem(itemId, name, e.target.value);
        }} // Trigger parent handler
        label={label}
        inputProps={type === 'number' && name !== 'price' ? { min: 0 } : {}}
        InputProps={(() => {
          // Default inputProps for number fields
          const defaultInputProps = {
            inputProps: {
              sx: {
                '::-webkit-outer-spin-button': { display: 'none' },
                '::-webkit-inner-spin-button': { display: 'none' },
                '-moz-appearance': 'textfield' // Firefox
              }
            }
          };

          // Handle special cases for 'tax' and 'discount'
          if (type === 'number' && name === 'tax') {
            return {
              ...defaultInputProps,
              endAdornment: '%'
            };
          }

          if (type === 'number' && name === 'discount') {
            return discountByTax
              ? {
                  ...defaultInputProps,
                  endAdornment: '%'
                }
              : {
                  ...defaultInputProps,
                  startAdornment: '₹'
                };
          }

          return defaultInputProps; // Default case
        })()}
      />
    </TableCell>
  );
};

InvoiceField.propTypes = {
  onEditItem: PropTypes.func,
  cellData: PropTypes.object,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.number,
  value: PropTypes.string,
  label: PropTypes.string,
  errors: PropTypes.bool,
  touched: PropTypes.bool
};

export default InvoiceField;
