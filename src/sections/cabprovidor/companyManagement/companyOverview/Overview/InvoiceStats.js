import { Box, CircularProgress, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import useDateRange, { TYPE_OPTIONS } from 'hooks/useDateRange';
import { ApexPieChart } from 'pages/reports/components/ApexPieChart';
import DateRangeSelect from 'pages/trips/filter/DateFilter';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import axiosServices from 'utils/axios';
import { formatDateUsingMoment } from 'utils/helper';

const categories = [
  { label: 'Summary', key: 'summary' },
  { label: 'Paid', key: 'paid' },
  { label: 'Unpaid', key: 'unpaid' },
  { label: 'Cancelled', key: 'cancelled' }
];

const categoriesLength = categories.length;

function getInvoiceStatusArrays(data) {
  const statuses = Object.keys(data); // ['paid', 'unpaid', 'cancelled']
  const totals = statuses.map((status) => data[status][`sum${status.charAt(0).toUpperCase() + status.slice(1)}GrandTotal`]);
  console.log(totals);

  return [statuses.map((status) => status.charAt(0).toUpperCase() + status.slice(1)), totals];
}

const InvoiceStats = () => {
  const { id } = useParams();
  console.log(`🚀 ~ InvoiceStats ~ id:`, id);

  const [invoiceStats, setInvoiceStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState([]);
  const [series, setSeries] = useState([]);

  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = {
          companyId: id,
          startDate: formatDateUsingMoment(startDate),
          endDate: formatDateUsingMoment(endDate)
        };

        setLoading(true);
        // await new Promise((resolve) => setTimeout(resolve, 4000));
        const response = await axiosServices.get('/invoice/meta/data', { params: queryParams });
        console.log(`🚀 ~ fetchData ~ response:`, response);
        const data = response.data.data;
        console.log('data = ', data);
        const modifiedData = {
          ...data,
          summary: {
            totalSummaryInvoiceCount: data.summary.totalInvoiceCount,
            sumSummaryGrandTotal: data.summary.sumGrandTotal
          }
        };
        const { summary, ...rest } = data;
        setInvoiceStats(modifiedData);
        const [label, series] = getInvoiceStatusArrays(rest);
        setLabels(label);
        setSeries(series);
      } catch (error) {
        console.log(`🚀 ~ InvoiceStats ~ error:`, error);
        dispatch(openSnackbar({ open: true, message: error.message, variant: 'alert', alert: { color: 'error' }, close: true }));
      } finally {
        setLoading(false);
      }
    };

    if (id && startDate && endDate) {
      fetchData();
    }
  }, [id, startDate, endDate]);

  return (
    <>
      {loading ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={40} />
          </Box>
        </>
      ) : (
        <MainCard
          title="Invoice Stats"
          secondary={
            <>
              <DateRangeSelect
                startDate={startDate}
                endDate={endDate}
                selectedRange={range}
                prevRange={prevRange}
                setSelectedRange={setRange}
                onRangeChange={handleRangeChange}
                showSelectedRangeLabel
              />
            </>
          }
        >
          <Stack gap={2}>
            {/* Pie Chart */}
            <ApexPieChart labels={labels} series={series} />

            {/* Stats */}
            <Box>
              <List disablePadding sx={{ '& .MuiListItem-root': { px: 3, py: 1.5 } }}>
                {/* <ListItem
                divider
                secondaryAction={
                  <Stack spacing={0.25} alignItems="flex-end" direction="row" gap={1}>
                    <Typography variant="subtitle1">Trips : </Typography>
                    <Typography>11</Typography>
                  </Stack>
                }
              >
                <ListItemText
                  primary={<Typography color="text.secondary">Summary</Typography>}
                  secondary={<Typography variant="subtitle1">₹ 1,800</Typography>}
                />
              </ListItem> */}

                {invoiceStats &&
                  categories.map((category, index) => {
                    const { label, key } = category;
                    const categoryData = invoiceStats[key];
                    // Check if this is the last item
                    {
                      /* const isLastItem = index === categories.length - 1; */
                    }

                    return (
                      <ListItem key={key} divider={!isLastItem(index, categoriesLength)}>
                        <ListItemText
                          primary={<Typography color="text.secondary">{label}</Typography>}
                          secondary={
                            <Stack spacing={0.25}>
                              {/* <Typography variant="subtitle1">Total Invoices: {categoryData[`total${label}InvoiceCount`]}</Typography> */}
                              <Typography variant="subtitle1">Grand Total: ₹ {categoryData[`sum${label}GrandTotal`]}</Typography>
                            </Stack>
                          }
                        />
                        <Stack spacing={0.25} alignItems="flex-end" direction="row" gap={1}>
                          <Typography variant="subtitle1">Total Invoices: </Typography>
                          <Typography>{categoryData[`total${label}InvoiceCount`]}</Typography>
                        </Stack>
                      </ListItem>
                    );
                  })}
              </List>
            </Box>
          </Stack>
        </MainCard>
      )}
    </>
  );
};

export default InvoiceStats;

// Utility function to determine if the current item is the last
export const isLastItem = (index, totalItems) => index === totalItems - 1;
