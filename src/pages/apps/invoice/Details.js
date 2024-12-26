import { useEffect, useState, useRef } from 'react';
import { useLocation, useParams } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Grid,
  IconButton,
  Chip,
  FormControl,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Divider
} from '@mui/material';

// third-party
import { PDFDownloadLink } from '@react-pdf/renderer';

// project-imports
import Loader from 'components/Loader';
import MainCard from 'components/MainCard';
import LogoSection from 'components/logo';
import ExportPDFView from 'sections/apps/invoice/export-pdf';

import { dispatch } from 'store';

// assets
import { DocumentDownload, Share } from 'iconsax-react';
import { openSnackbar } from 'store/reducers/snackbar';
import { getInvoiceDetails } from 'store/slice/cabProvidor/invoiceSlice';
import useAuth from 'hooks/useAuth';
import { format } from 'date-fns';

// ==============================|| INVOICE - DETAILS ||============================== //

const Details = () => {
  const theme = useTheme();
  const { id } = useParams();
  const location = useLocation();

  const { state } = location || {}; // Safeguard against undefined location
  const pageData = state?.pageData;
  console.log({ pageData });

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  console.log(data);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps

    if (id) {
      (async () => {
        setLoading(true); // Optional: Set loading state before fetch starts
        try {
          const res = await dispatch(getInvoiceDetails(id)).unwrap();
          console.log({ res });
          setData(res);
        } catch (error) {
          console.log('Error at fetch invoice details', error);
          dispatch(
            openSnackbar({
              open: true,
              message: 'Error at fetch invoice details',
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: false
            })
          );
        } finally {
          setLoading(false);
        }
      })();
    }

    if (pageData) {
      setData(pageData);
      setLoading(false);
    }
  }, [id, pageData]);

  const { accountSetting } = useAuth();
  if (loading) return <Loader />;

  return (
    <MainCard content={false}>
      <Stack spacing={2.5}>
        <Box sx={{ p: 2.5, pb: 0 }}>
          <MainCard content={false} border={false} sx={{ p: 1.25, bgcolor: 'secondary.lighter' }}>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <PDFDownloadLink
                document={<ExportPDFView data={data} logo={accountSetting?.logo} />}
                fileName={`${data?.invoiceNumber}-${data?.billedTo?.name}.pdf`}
              >
                <IconButton>
                  <DocumentDownload color={theme.palette.text.secondary} />
                </IconButton>
              </PDFDownloadLink>
              <IconButton>
                <Share color={theme.palette.text.secondary} />
              </IconButton>
            </Stack>
          </MainCard>
        </Box>
        <Box sx={{ p: 2.5 }} id="print">
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={2}>
                    <LogoSection />
                    <Chip label="Paid" variant="light" color="success" size="small" />
                  </Stack>
                  <Typography color="secondary">#{data?.invoiceNumber}</Typography>
                </Stack>
                <Box>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Typography variant="subtitle1">Date</Typography>
                    <Typography color="secondary">{data?.invoiceDate && format(new Date(data?.invoiceDate), 'dd/MM/yyyy')}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Typography sx={{ overflow: 'hidden' }} variant="subtitle1">
                      Due Date
                    </Typography>
                    <Typography color="secondary">{data?.invoiceDate && format(new Date(data?.dueDate), 'dd/MM/yyyy')}</Typography>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MainCard>
                <Stack spacing={1}>
                  <Typography variant="h5">From:</Typography>
                  <FormControl sx={{ width: '100%' }}>
                    <Typography color="secondary">{data?.billedBy.name}</Typography>
                    <Typography color="secondary">{data?.billedBy.address}</Typography>
                    <Typography color="secondary">{data?.billedBy.mobile}</Typography>
                    <Typography color="secondary">{data?.billedBy.email}</Typography>
                  </FormControl>
                </Stack>
              </MainCard>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MainCard>
                <Stack spacing={1}>
                  <Typography variant="h5">To:</Typography>
                  <FormControl sx={{ width: '100%' }}>
                    <Typography color="secondary">{data?.billedTo.name}</Typography>
                    <Typography color="secondary">{data?.billedTo.address}</Typography>
                    <Typography color="secondary">{data?.billedTo.mobile}</Typography>
                    <Typography color="secondary">{data?.billedTo.email}</Typography>
                  </FormControl>
                </Stack>
              </MainCard>
            </Grid>
            <Grid item xs={12}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.invoiceData?.map((row, index) => (
                      <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.itemName}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell align="right">{row.quantity}</TableCell>
                        <TableCell align="right">{'₹' + '' + Number(row.rate).toFixed(2)}</TableCell>
                        <TableCell align="right">{'₹' + '' + Number(row.rate * row.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ borderWidth: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={8}></Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color={theme.palette.secondary.main}>Sub Total:</Typography>
                  <Typography>{'₹' + '' + data?.totalAmount?.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color={theme.palette.secondary.main}>Discount:</Typography>
                  <Typography variant="h6" color={theme.palette.success.main}>
                    {'₹' + '' + data?.totalDiscount?.toFixed(2)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color={theme.palette.secondary.main}>Tax:</Typography>
                  <Typography>{'₹' + '' + data.totalTax?.toFixed(2)}</Typography>
                </Stack>
                {data.MCDAmount > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color={theme.palette.secondary.main}>MCDAmount:</Typography>
                    <Typography>{'₹' + '' + data.totalTax?.toFixed(2)}</Typography>
                  </Stack>
                )}
                {data.additionalCharges > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color={theme.palette.secondary.main}>Additional Charges:</Typography>
                    <Typography>{'₹' + '' + data.totalTax?.toFixed(2)}</Typography>
                  </Stack>
                )}
                {data.tollParkingCharges > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color={theme.palette.secondary.main}>Toll Charges:</Typography>
                    <Typography>{'₹' + '' + data.totalTax?.toFixed(2)}</Typography>
                  </Stack>
                )}

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle1">Grand Total:</Typography>
                  <Typography variant="subtitle1">
                    {data?.grandTotal % 1 === 0 ? '₹' + '' + data?.grandTotal : '₹' + '' + data?.grandTotal?.toFixed(2)}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Typography color="secondary">Notes: </Typography>
                <Typography>
                  It was a pleasure working with you and your team. We hope you will keep us in mind for future freelance projects. Thank
                  You!
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </MainCard>
  );
};

export default Details;
