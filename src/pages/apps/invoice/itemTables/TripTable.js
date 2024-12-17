import {
  Box,
  Button,
  Divider,
  Grid,
  InputLabel,
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
import { v4 as UIDV4 } from 'uuid';
import InvoiceItem from '../components/InvoiceItem';
import { Add } from 'iconsax-react';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { useSelector } from 'store';
import { USERTYPE } from 'constant';

// Helper function to extract the correct grouping key
const getGroupKey = (item, key) => {
  if (key === 'Zone') {
    // return item['zoneNameID']?.zoneName || 'Unknown'; // Access the name inside the object
    return `${item['zoneNameID']?.zoneName} (${item['vehicleTypeID']?.vehicleTypeName})` || 'Unknown'; // Access the name inside the object
  }
  if (key === 'Zone Type') {
    // return item[key]?.zoneTypeName || 'Unknown'; // Access the name inside the object
    return `${item['zoneTypeID']?.zoneTypeName} (${item['vehicleTypeID']?.vehicleTypeName})` || 'Unknown'; // Access the name inside the object
  }
  if (key === 'Vehicle Type') {
    // return `${item[key]?.vehicleTypeName}` || 'Unknown'; // Access the name inside the object
    return `${item['vehicleTypeID']?.vehicleTypeName} (${item['companyRate']})` || 'Unknown'; // Access the name inside the object
  }
  if (key === 'Company Rate') {
    return `Trip (${item['vehicleTypeID']?.vehicleTypeName})` || 'Unknown'; // Access the name inside the object
  }
  return item[key];
};

const groupDataWithSuffix = (data, groupByKey, userType) => {
  // Group the data
  const grouped = _.groupBy(data, (item) => {
    const primaryKey = getGroupKey(item, groupByKey);
    const secondaryKey = groupByKey !== 'Company Rate' ? item.companyRate : '';
    return `${primaryKey}||${secondaryKey}`;
  });

  // Convert grouped data into unique objects with a suffix for duplicates
  const result = [];
  let suffixCounts = {}; // Tracks suffix for each unique group key

  Object.entries(grouped).forEach(([key, items], i) => {
    const [primaryKey, secondaryKey] = key.split('||');
    // Increment the suffix count for this primaryKey
    suffixCounts[primaryKey] = (suffixCounts[primaryKey] || 0) + 1;

    const ids = items.map((item) => item._id);
    let priceRate = 0;
    if ([USERTYPE.iscabProvider, USERTYPE.iscabProviderUser].includes(userType)) {
      priceRate = items[0].companyRate;
    } else {
      priceRate = items[0].vendorRate;
    }
    // Add the formatted object to the result
    result.push({
      id: UIDV4(),
      name: `${primaryKey}`,
      price: secondaryKey || priceRate || 0,
      qty: items.length,
      ids: ids,
      description: `${items.length} items @  ${secondaryKey || items[0].companyRate || 0}`,
      tax: 0,
      discount: 0
    });
  });

  return result;
};

const groupGuardRates = (tripData, userType) => {
  const groupedRates = tripData.reduce((acc, item) => {
    // const guardPrice = item.companyGuardPrice;
    let guardPrice = 0;

    if ([USERTYPE.iscabProvider, USERTYPE.iscabProviderUser].includes(userType)) {
      guardPrice = item.companyGuardPrice;
    } else {
      guardPrice = item.vendorGuardPrice;
    }

    // Skip items where the guard price is 0
    if (guardPrice === 0) return acc;

    if (!acc[guardPrice]) {
      acc[guardPrice] = {
        id: UIDV4(),
        name: `Guard Price (${guardPrice})`,
        price: guardPrice,
        qty: 0,
        description: '',
        tax: 0,
        discount: 0
      };
    }

    acc[guardPrice].qty += 1;
    acc[guardPrice].description = `${acc[guardPrice].qty} items @ ${guardPrice}`;

    return acc;
  }, {});

  // Convert grouped data into an array format
  return Object.values(groupedRates);
};

const groupPenaltyRates = (tripData, userType) => {
  const groupedRates = tripData.reduce((acc, item) => {
    // const companyPenalty = item.companyPenalty;
    let companyPenalty = 0;
    if ([USERTYPE.iscabProvider, USERTYPE.iscabProviderUser].includes(userType)) {
      companyPenalty = item.companyPenalty;
    } else {
      companyPenalty = item.vendorPenalty;
    }

    // Skip items where the guard price is 0
    if (companyPenalty === 0) return acc;

    if (!acc[companyPenalty]) {
      acc[companyPenalty] = {
        id: UIDV4(),
        name: `Penalty (${companyPenalty})`,
        price: -companyPenalty,
        qty: 0,
        description: '',
        tax: 0,
        discount: 0
      };
    }

    acc[companyPenalty].qty += 1;
    acc[companyPenalty].description = `${acc[companyPenalty].qty} items @ ${companyPenalty}`;

    return acc;
  }, {});

  // Convert grouped data into an array format
  return Object.values(groupedRates);
};

const safeNumber = (value) => (isNaN(Number(value)) ? 0 : Number(value));

const calculateTotals = (data) =>
  data.reduce(
    (totals, item) => ({
      qty: totals.qty + safeNumber(item.qty),
      price: totals.price + safeNumber(item.price),
      tax: totals.tax + safeNumber(item.tax)
    }),
    { qty: 0, price: 0, tax: 0 }
  );

const calculateSums = (data, discountByTax) =>
  data.reduce(
    (totals, item) => {
      const qtyPrice = safeNumber(item.qty) * safeNumber(item.price);
      const discount = discountByTax ? (qtyPrice * safeNumber(item.discount)) / 100 : safeNumber(item.discount);

      return {
        total: totals.total + qtyPrice,
        totalDiscount: totals.totalDiscount + discount,
        totalTax: totals.totalTax + (qtyPrice * safeNumber(item.tax)) / 100
      };
    },
    { total: 0, totalDiscount: 0, totalTax: 0 }
  );

const TripItemTable = ({ itemData, setItemData, tripData, groupByOption, amountSummary, setAmountSummary, invoiceSetting }) => {
  console.log('itemData', tripData);
  const theme = useTheme();

  const [inLineTaxDeduction, setInlineTaxDeduction] = useState(false);
  const [inlineDiscountDeduction, setInlineDiscountDeduction] = useState(false);
  const [discountDeduction, setDiscountDeduction] = useState(false);
  const [discountByTax, setDiscountByTax] = useState(true);
  const userType = useSelector((state) => state.auth.userType);

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

  const [taxAndDiscount, setTaxAndDiscount] = useState({
    tax: 0,
    discount: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert the value to a float (if it's a number)
    const updatedValue = parseFloat(value) || 0;

    // Update tax or discount based on the name of the input field
    if (name === 'tax' || name === 'discount') {
      console.log({ name, value });

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
    if (tripData?.length) {
      const mappedData = groupDataWithSuffix(tripData, groupByOption, userType);
      const guardItems = groupGuardRates(tripData, userType);
      const penaltyItems = groupPenaltyRates(tripData, userType);

      const combinedData = [...mappedData, ...guardItems, ...penaltyItems];
      setItemData(combinedData);

      // Calculate additional charges
      const chargeTotals = tripData.reduce(
        (totals, item) => ({
          additionalRate: totals.additionalRate + safeNumber(item.addOnRate),
          mcdCharges: totals.mcdCharges + safeNumber(item.mcdCharge),
          tollCharges: totals.tollCharges + safeNumber(item.tollCharge)
        }),
        { additionalRate: 0, mcdCharges: 0, tollCharges: 0 }
      );

      // Calculate totals and taxes
      const { total, totalTax } = combinedData.reduce(
        (totals, item) => {
          const qtyPrice = safeNumber(item.qty) * safeNumber(item.price);
          return {
            total: totals.total + qtyPrice,
            totalTax: totals.totalTax + qtyPrice / safeNumber(item.tax)
          };
        },
        { total: 0, totalTax: 0 }
      );

      setAmountSummary((prev) => ({
        ...prev,
        total,
        subTotal: total - prev.totalDiscount,
        ...chargeTotals,
        grandTotal:
          total - prev.totalDiscount + prev.totalTax + chargeTotals.mcdCharges + chargeTotals.tollCharges + chargeTotals.additionalRate
      }));
    }
  }, [tripData, groupByOption, userType]);

  useEffect(() => {
    setAmountSummary((prev) => {
      const { total, totalDiscount, totalTax } = calculateSums(itemData, discountByTax);

      // Determine final tax and discount amounts
      const finalTaxAmount = inLineTaxDeduction ? totalTax : (prev.total * taxAndDiscount.tax) / 100;
      const finalDiscountAmount = inlineDiscountDeduction
        ? totalDiscount
        : discountByTax
        ? (prev.total * taxAndDiscount.discount) / 100
        : taxAndDiscount.discount;

      const grandTotal = prev.total - finalDiscountAmount + finalTaxAmount + prev.mcdCharges + prev.tollCharges + prev.additionalCharges;

      return {
        ...prev,
        total,
        totalTax: finalTaxAmount,
        totalDiscount: finalDiscountAmount,
        subTotal: prev.total - finalDiscountAmount,
        grandTotal
      };
    });
  }, [tripData, taxAndDiscount, itemData, inLineTaxDeduction, inlineDiscountDeduction]);
  useEffect(() => {
    if (invoiceSetting) {
      //   setInlineTaxDeduction(false);
      setInlineTaxDeduction(invoiceSetting && invoiceSetting.tax && invoiceSetting.tax.apply === 'Individual');
      //   setDiscountDeduction(false);
      setDiscountDeduction(invoiceSetting && invoiceSetting.discount && invoiceSetting.discount.apply !== 'No');
      //   setInDiscountDeduction(false);
      setInlineDiscountDeduction(invoiceSetting && invoiceSetting.discount && invoiceSetting.discount.apply === 'Individual');

      setDiscountByTax(invoiceSetting && invoiceSetting.discount && invoiceSetting.discount.by !== 'Amount');
    }
  }, [invoiceSetting]);

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
                    tax={item.tax}
                    discount={item.discount}
                    onDeleteItem={deleteItem} // Simplified inline function
                    onEditItem={handleItemChange}
                    inLineTaxDeduction={inLineTaxDeduction}
                    inlineDiscountDeduction={inlineDiscountDeduction}
                    discountByTax={discountByTax}
                  />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />

        <Grid container justifyContent="space-between">
          <Grid item xs={12} md={8}>
            <Box sx={{ pt: 2.5, pr: 2.5, pb: 2.5, pl: 0 }}>
              <Button color="primary" startIcon={<Add />} onClick={addItem} variant="dashed" sx={{ bgcolor: 'transparent !important' }}>
                Add Item
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            {}
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
                      value={taxAndDiscount.discount}
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
                    {/* {touched.discount && errors.discount && <FormHelperText error={true}>{errors.discount}</FormHelperText>} */}
                  </Stack>
                </Grid>
              )}
              {!inLineTaxDeduction && (
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <InputLabel>GST</InputLabel>
                    <TextField
                      type="number"
                      style={{ width: '100%' }}
                      name="tax"
                      id="tax"
                      placeholder="0.0"
                      value={taxAndDiscount.tax}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: '%', // Use InputAdornment for adornments like "%"
                        inputProps: {
                          sx: {
                            '::-webkit-outer-spin-button': { display: 'none' },
                            '::-webkit-inner-spin-button': { display: 'none' },
                            '-moz-appearance': 'textfield' // Firefox
                          }
                        }
                      }}
                    />
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
                {isSameState ? (
                  <>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>CGST:</Typography>
                      <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.totalTax?.toFixed(2) / 2}`}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>SGST:</Typography>
                      <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.totalTax?.toFixed(2) / 2}`}</Typography>
                    </Stack>
                  </>
                ) : (
                  <>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>GST:</Typography>
                      <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.totalTax?.toFixed(2)}`}</Typography>
                    </Stack>
                  </>
                )}
                <Stack direction="row" justifyContent="space-between">
                  <Typography>MCD Charges:</Typography>
                  <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.mcdCharges?.toFixed(2)}`}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Toll Charges:</Typography>
                  <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.tollCharges?.toFixed(2)}`}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Additional Charges:</Typography>
                  <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.additionalCharges?.toFixed(2)}`}</Typography>
                </Stack>
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

export default TripItemTable;
