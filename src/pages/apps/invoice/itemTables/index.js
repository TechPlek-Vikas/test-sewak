import {
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
const { FieldArray } = require('formik');
import { v4 as UIDV4 } from 'uuid';
import InvoiceItem from '../components/InvoiceItem';
import { Add, ArrowSquare, ArrowSquareDown, DirectDown } from 'iconsax-react';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

const DefaultItemTable = ({
  isSameState,
  invoiceSetting,
  setAmountSummary,
  amountSummary,
  handleOpenDialog,
  recieversDetails,
  setTripData
}) => {
  console.log('DefaultItemTable render .............');
  const theme = useTheme();
  const [inLineTaxDeduction, setInlineTaxDeduction] = useState(false);
  const [inlineDiscountDeduction, setInlineDiscountDeduction] = useState(false);
  const [discountDeduction, setDiscountDeduction] = useState(false);
  const [discountByTax, setDiscountByTax] = useState(true);

  useEffect(() => {
    if (invoiceSetting) {
      //   setInlineTaxDeduction(false);
      setInlineTaxDeduction(invoiceSetting && invoiceSetting.tax && invoiceSetting.tax.apply === 'Individual');
      //   setDiscountDeduction(false);
      setDiscountDeduction(invoiceSetting && invoiceSetting.discount && invoiceSetting.discount.apply !== 'No');
      //   setInlineDiscountDeduction(false);
      setInlineDiscountDeduction(invoiceSetting && invoiceSetting.discount && invoiceSetting.discount.apply === 'Individual');

      setDiscountByTax(invoiceSetting && invoiceSetting.discount && invoiceSetting.discount.by !== 'Amount');
    }
  }, [invoiceSetting]);
  const [itemData, setItemData] = useState([
    {
      id: UIDV4(),
      name: '',
      description: '',
      qty: 1,
      tax: 0,
      discount: 0,
      price: '1.00'
    }
  ]);

  const [taxAndDiscount, setTaxAndDiscount] = useState({
    tax: 0,
    discount: 0
  });

  const handleItemChange = (id, fieldName, value) => {
    setItemData((prevItemData) => prevItemData.map((item) => (item.id === id ? { ...item, [fieldName]: value } : item)));
  };
  const deleteItem = (id) => {
    setItemData((prevItemData) => prevItemData.filter((item) => item.id !== id));
  };
  const addItem = () => {
    const newItem = {
      id: UIDV4(),
      name: '',
      description: '',
      qty: 1,
      price: '1.00',
      discount: 0,
      tax: 0
    };
    setItemData((prevItemData) => [...prevItemData, newItem]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert the value to a float (if it's a number)
    const updatedValue = parseFloat(value) || 0;

    // Update tax or discount based on the name of the input field
    if (name === 'tax' || name === 'discount') {
      setItemData((prevItemData) =>
        prevItemData.map((item) => ({
          ...item,
          [name]: updatedValue // Update tax or discount based on the field name
        }))
      );

      setTaxAndDiscount((prevItemData) => ({
        ...prevItemData,
        [name]: updatedValue
      }));
    }
  };

  useEffect(() => {
    setAmountSummary((prev) => {
      const totalDiscount = discountByTax ? (prev.total * taxAndDiscount.discount) / 100 : prev.total - taxAndDiscount.discount;
      const totalTax = ((prev.total - totalDiscount) * taxAndDiscount.tax) / 100;

      const { totalTax1 } = itemData.reduce(
        (totals, item) => {
          const qty = isNaN(Number(item.qty)) ? 0 : Number(item.qty);
          const price = isNaN(Number(item.price)) ? 0 : Number(item.price);
          const tax = isNaN(Number(item.tax)) ? 0 : Number(item.tax);

          return {
            totalTax1: totals.totalTax1 + (qty * price * tax) / 100 // Assuming tax is a percentage
          };
        },
        { totalTax1: 0 }
      );

      const { totalDiscount1 } = itemData.reduce(
        (totals, item) => {
          const qty = isNaN(Number(item.qty)) ? 0 : Number(item.qty);
          const price = isNaN(Number(item.price)) ? 0 : Number(item.price);
          const discount = isNaN(Number(item.discount)) ? 0 : Number(item.discount);
          return {
            // totalTax1: totals.totalTax1 + (qty * price * tax) / 100 // Assuming tax is a percentage
            totalDiscount1: discountByTax ? totals.totalDiscount1 + (qty * price * discount) / 100 : totals.totalDiscount1 + discount // Assuming tax is a percentage
          };
        },
        { totalDiscount1: 0 }
      );

      const { total } = itemData.reduce(
        (totals, item) => {
          const qty = isNaN(Number(item.qty)) ? 0 : Number(item.qty);
          const price = isNaN(Number(item.price)) ? 0 : Number(item.price);
          return {
            // totalTax1: totals.totalTax1 + (qty * price * tax) / 100 // Assuming tax is a percentage
            total: totals.total + qty * price // Assuming tax is a percentage
          };
        },
        { total: 0 }
      );

      let finalTaxAmount = inLineTaxDeduction ? totalTax1 : totalTax;
      let finalDiscountAmount = inlineDiscountDeduction ? totalDiscount1 : totalDiscount;

      const grandTotal = prev.total - finalDiscountAmount + finalTaxAmount + prev.mcdCharges + prev.tollCharges + prev.additionalCharges;

      return {
        ...prev,
        total: total,
        totalTax: finalTaxAmount,
        totalDiscount: finalDiscountAmount,
        subTotal: total - finalDiscountAmount, // Ensure subTotal is always total - totalDiscount
        grandTotal
      };
    });
  }, [taxAndDiscount, itemData, inLineTaxDeduction, inlineDiscountDeduction]);

  return (
    <Grid item xs={12}>
      <>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Price</TableCell>
                {inLineTaxDeduction && <TableCell sx={{ width: '100px' }}>GST</TableCell>}
                {inlineDiscountDeduction && <TableCell sx={{ width: '100px' }}>Discount</TableCell>}
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itemData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <InvoiceItem
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    qty={item.qty}
                    price={item.price}
                    discount={item.discount}
                    tax={item.tax}
                    onDeleteItem={deleteItem} // Simplified inline function
                    onEditItem={handleItemChange}
                    inLineTaxDeduction={inLineTaxDeduction}
                    inlineDiscountDeduction={inlineDiscountDeduction}
                    discountDeduction={discountDeduction}
                  />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />

        <Grid container justifyContent="space-between">
          <Grid item xs={12} md={8}>
            <Stack direction={'row'}>
              <Box sx={{ pt: 2.5, pr: 2.5, pb: 2.5, pl: 0 }}>
                <Button color="primary" startIcon={<Add />} onClick={addItem} variant="dashed" sx={{ bgcolor: 'transparent !important' }}>
                  Add Item
                </Button>
              </Box>

              <Box sx={{ pt: 2.5, pr: 2.5, pb: 2.5, pl: 0 }}>
                <Button
                  color="info"
                  startIcon={<ArrowSquareDown />}
                  disabled={!recieversDetails._id}
                  onClick={handleOpenDialog}
                  variant="dashed"
                  sx={{ bgcolor: 'transparent !important' }}
                >
                  Import Trips
                </Button>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Grid container justifyContent="flex-end" spacing={2} sx={{ pt: 2.5, pb: 2.5 }}>
              {discountDeduction && !inlineDiscountDeduction && (
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <InputLabel>Discount</InputLabel>
                    <TextField
                      type="number"
                      style={{ width: '100%' }}
                      name="discount"
                      id="discount"
                      placeholder="0.0"
                      value={0}
                      onChange={handleChange}
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

                        return discountByTax
                          ? {
                              ...defaultInputProps,
                              endAdornment: '%'
                            }
                          : {
                              ...defaultInputProps,
                              startAdornment: '₹'
                            };
                      })()}
                    />
                  </Stack>
                </Grid>
              )}
              {!inLineTaxDeduction && (
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <InputLabel>Tax(%)</InputLabel>
                    <TextField
                      type="number"
                      style={{ width: '100%' }}
                      name="tax"
                      id="tax"
                      placeholder="0.0"
                      value={0}
                      onChange={handleChange}
                    />
                    {/* {touched.tax && errors.tax && <FormHelperText error={true}>{errors.tax}</FormHelperText>} */}
                  </Stack>
                </Grid>
              )}
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Total:</Typography>
                  <Typography variant="h6">{`₹ ${amountSummary.total?.toFixed(2)}`}</Typography>
                </Stack>
                <Divider />
                {discountDeduction && (
                  <>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Discount:</Typography>
                      <Typography variant="h6" color={'error'}>{`₹ ${amountSummary.totalDiscount?.toFixed(2)}`}</Typography>
                    </Stack>
                    <Divider />
                  </>
                )}
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Sub Total:</Typography>
                  <Typography variant="h6">{`₹ ${amountSummary.subTotal?.toFixed(2)}`}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Total GST:</Typography>
                  <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.totalTax?.toFixed(2)}`}</Typography>
                </Stack>
                {isSameState ? (
                  <>
                    <Stack direction="row" justifyContent="flex-end" gap={30}>
                      <Typography color={theme.palette.grey[500]}>CGST:</Typography>
                      <Typography color={theme.palette.success.main}>{`₹ ${(amountSummary.totalTax / 2)?.toFixed(2)}`}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="flex-end" gap={30}>
                      <Typography color={theme.palette.grey[500]}>SGST:</Typography>
                      <Typography color={theme.palette.success.main}>{`₹ ${(amountSummary.totalTax / 2)?.toFixed(2)}`}</Typography>
                    </Stack>
                  </>
                ) : (
                  <Stack direction="row" justifyContent="flex-end" gap={30}>
                    <Typography color={theme.palette.grey[500]}>IGST:</Typography>
                    <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.totalTax?.toFixed(2)}`}</Typography>
                  </Stack>
                )}
                {amountSummary.mcdCharges > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>MCD Charges:</Typography>
                    <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.mcdCharges?.toFixed(2)}`}</Typography>
                  </Stack>
                )}

                {amountSummary.tollCharges > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Toll Charges:</Typography>
                    <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.tollCharges?.toFixed(2)}`}</Typography>
                  </Stack>
                )}

                {amountSummary.additionalCharges > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Additional Charges:</Typography>
                    <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.additionalCharges?.toFixed(2)}`}</Typography>
                  </Stack>
                )}

                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle1">Grand Total:</Typography>
                  <Typography variant="h5">{`₹ ${amountSummary.grandTotal?.toFixed(2)}`}</Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Grid>
      </>
    </Grid>
  );
};

export default DefaultItemTable;
