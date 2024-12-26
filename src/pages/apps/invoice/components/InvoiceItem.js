import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Stack, TableCell, Tooltip, Typography } from '@mui/material';

// project-imports
import InvoiceField from './InvoiceField';
import AlertProductDelete from './AlertProductDelete';
import { dispatch, useSelector } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { ThemeMode } from 'config';

// assets
import { Trash } from 'iconsax-react';

// ==============================|| INVOICE - ITEMS ||============================== //

const InvoiceItem = ({
  id,
  name,
  description,
  qty,
  price,
  discount,
  tax,
  onDeleteItem,
  onEditItem,
  inLineTaxDeduction,
  inlineDiscountDeduction,
  discountByTax
}) => {
  const { country } = useSelector((state) => state.invoice);
  const theme = useTheme();
  const mode = theme.palette.mode;

  const [open, setOpen] = useState(false);

  const handleModalClose = (status) => {
    setOpen(false);
    if (status) {
      onDeleteItem(id);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Item Deleted successfully',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: false
        })
      );
    }
  };

  const textFieldItem = [
    { placeholder: 'Item name', label: 'Item Name', name: 'name', type: 'text', id: `${id}_name`, value: name, itemId: id },
    {
      placeholder: 'Description',
      label: 'Description',
      name: 'description',
      type: 'text',
      id: `${id}_description`,
      value: description,
      itemId: id
    },
    { placeholder: '', label: 'Qty', name: 'qty', type: 'number', id: `${id}_qty`, value: qty, itemId: id },
    { placeholder: '', label: 'Price', name: 'price', type: 'number', id: `${id}_price`, value: price, itemId: id },
    { placeholder: '', label: 'GST', name: 'tax', type: 'number', id: `${id}_gst`, value: tax, itemId: id },
    { placeholder: '', label: 'Discount', name: 'discount', type: 'number', id: `${id}_discount`, value: discount, itemId: id }
  ];
  const filteredFields = textFieldItem.filter((item) => {
    // Include 'tax' only if inLineTaxDeduction is true
    if (item.name === 'tax') {
      return inLineTaxDeduction;
    }

    // Include 'discount' only if inlineDiscountDeduction is true
    if (item.name === 'discount') {
      return inlineDiscountDeduction;
    }

    // Include all other items
    return true;
  });

  return (
    <>
      {filteredFields.map(({ placeholder, name, type, id, value, itemId }) => (
        <InvoiceField
          key={id}
          onEditItem={onEditItem}
          cellData={{
            placeholder,
            name,
            type,
            id,
            value,
            itemId
          }}
          discountByTax={discountByTax}
        />
      ))}
      <TableCell>
        <Stack direction="column" justifyContent="flex-end" alignItems="flex-end" spacing={2}>
          <Box sx={{ pr: 2, pl: 2 }}>
            <Typography>{country?.prefix + '' + (price * qty).toFixed(2)}</Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Tooltip
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                opacity: 0.9
              }
            }
          }}
          title="Remove Item"
        >
          <Button color="error" onClick={() => setOpen(true)}>
            <Trash />
          </Button>
        </Tooltip>
      </TableCell>
      <AlertProductDelete title={name} open={open} handleClose={handleModalClose} />
    </>
  );
};

InvoiceItem.propTypes = {
  id: PropTypes.number,
  name: PropTypes.string,
  description: PropTypes.string,
  qty: PropTypes.number,
  price: PropTypes.number,
  onDeleteItem: PropTypes.func,
  onEditItem: PropTypes.func,
  index: PropTypes.number,
  Blur: PropTypes.func,
  errors: PropTypes.object,
  touched: PropTypes.object
};

export default InvoiceItem;
