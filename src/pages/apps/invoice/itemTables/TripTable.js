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

const TripItemTable = ({
  isSameState,
  itemData,
  setItemData,
  tripData,
  groupByOption,
  amountSummary,
  setAmountSummary,
  invoiceSetting,
  advanceData,
  officeCharge
}) => {
  console.log('TripItemTable render .............');
  console.log('advanceData', advanceData);

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
    if (tripData && tripData.length > 0) {
      const mappedData = groupDataWithSuffix(tripData, groupByOption, userType);
      const guardItems = groupGuardRates(tripData, userType);
      const penaltyItems = groupPenaltyRates(tripData, userType);

      const combinedData = [...mappedData, ...guardItems, ...penaltyItems];
      setItemData(combinedData);
    }
  }, [tripData]);

  useEffect(() => {
    if (tripData && tripData.length > 0) {
      const { additonalRate, mcdCharges, tollCharges } = tripData.reduce(
        (totals, item) => {
          const addOnRate = isNaN(Number(item.addOnRate)) ? 0 : Number(item.addOnRate);
          const mcdCharge = isNaN(Number(item.mcdCharge)) ? 0 : Number(item.mcdCharge);
          const tollCharge = isNaN(Number(item.tollCharge)) ? 0 : Number(item.tollCharge);
          return {
            additonalRate: totals.additonalRate + addOnRate,
            mcdCharges: totals.mcdCharges + mcdCharge,
            tollCharges: totals.tollCharges + tollCharge
          };
        },
        { additonalRate: 0, mcdCharges: 0, tollCharges: 0 }
      );

      const { total } = itemData.reduce(
        (totals, item) => {
          const qty = isNaN(Number(item.qty)) ? 0 : Number(item.qty);
          const price = isNaN(Number(item.price)) ? 0 : Number(item.price);
          const tax = isNaN(Number(item.tax)) ? 0 : Number(item.tax);

          return {
            total: totals.total + qty * price,
            totalTax: totals.totalTax + (qty * price) / tax
          };
        },
        { total: 0, totalTax: 0 }
      );

      setAmountSummary((prev) => ({
        ...prev,
        total: total,
        subTotal: total,
        mcdCharges: mcdCharges,
        tollCharges: tollCharges,
        additionalCharges: additonalRate,
        grandTotal: total - prev.totalDiscount + prev.totalTax + mcdCharges + tollCharges + additonalRate
      }));

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

        let finalTaxAmount = inLineTaxDeduction ? totalTax1 : totalTax;
        let finalDiscountAmount = inlineDiscountDeduction ? totalDiscount1 : totalDiscount;

        const grandTotal = prev.total - finalDiscountAmount + finalTaxAmount + prev.mcdCharges + prev.tollCharges + prev.additionalCharges;
        console.log('prev.total', prev.total);

        return {
          ...prev,
          totalTax: finalTaxAmount,
          totalDiscount: finalDiscountAmount,
          subTotal: total - finalDiscountAmount, // Ensure subTotal is always total - totalDiscount
          ...(typeof advanceData !== 'object' ? { advanceAmount: advanceData } : {}),
          ...(typeof officeCharge !== 'object' ? { officeCharge } : {}),
          ...(typeof officeCharge !== 'object' ? { grandTotal: grandTotal - advanceData - officeCharge } : { grandTotal })
          // grandTotal
        };
      });
    }
  }, [itemData, tripData, groupByOption, userType, advanceData, officeCharge]);

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
          {/* add item button */}
          <Grid item xs={12} md={8}>
            <Box sx={{ pt: 2.5, pr: 2.5, pb: 2.5, pl: 0 }}>
              <Button color="primary" startIcon={<Add />} onClick={addItem} variant="dashed" sx={{ bgcolor: 'transparent !important' }}>
                Add Item
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            {/* Group tax and discount */}
            <Grid container justifyContent="flex-end" spacing={2} sx={{ pt: 2.5, pb: 2.5 }}>
              {/* Groupo Tax */}
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
              {/* Group Discount */}
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

            {/* Ammount Summary */}
            <Grid item xs={12}>
              <Stack spacing={2}>
                {/* Totoal */}
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Total:</Typography>
                  <Typography variant="h6">{`₹ ${amountSummary.total?.toFixed(2)}`}</Typography>
                </Stack>
                <Divider />
                {/* Discount */}
                {discountDeduction && (
                  <>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Discount:</Typography>
                      <Typography variant="h6" color={'error'}>{`₹ ${amountSummary.totalDiscount?.toFixed(2)}`}</Typography>
                    </Stack>
                    <Divider />
                  </>
                )}
                {/* Subtotal */}
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Sub Total:</Typography>
                  <Typography variant="h6">{`₹ ${amountSummary.subTotal?.toFixed(2)}`}</Typography>
                </Stack>
                {/* Tax */}
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

                {/* MCD */}
                <Stack direction="row" justifyContent="space-between">
                  <Typography>MCD Charges:</Typography>
                  <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.mcdCharges?.toFixed(2)}`}</Typography>
                </Stack>
                {/* Toll */}
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Toll Charges:</Typography>
                  <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.tollCharges?.toFixed(2)}`}</Typography>
                </Stack>
                {/* Addional Charge */}
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Additional Charges:</Typography>
                  <Typography color={theme.palette.success.main}>{`₹ ${amountSummary.additionalCharges?.toFixed(2)}`}</Typography>
                </Stack>
                <Divider />
                {/* Office Charge Amount */}
                {typeof officeCharge === 'number' && officeCharge > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Office Charge:</Typography>
                    <Typography color={theme.palette.error.main}>{`₹ ${amountSummary.officeCharge?.toFixed(2)}`}</Typography>
                  </Stack>
                )}
                {/* Advance Amount */}
                {typeof advanceData === 'number' && advanceData > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Advance:</Typography>
                    <Typography color={theme.palette.error.main}>{`₹ ${amountSummary.advanceAmount?.toFixed(2)}`}</Typography>
                  </Stack>
                )}
                <Divider />
                {/* Grand Total */}
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle1">Grand Total:</Typography>
                  <Typography
                    variant="h5"
                    color={amountSummary.grandTotal?.toFixed(2) < 0 && 'error'}
                  >{`₹ ${amountSummary.grandTotal?.toFixed(2)}`}</Typography>
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
