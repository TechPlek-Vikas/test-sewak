import PropTypes from 'prop-types';
import { useMemo, useEffect, Fragment, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import {
  Box,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Grid,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

// third-party
import { useExpanded, useFilters, useGlobalFilter, usePagination, useRowSelect, useSortBy, useTable } from 'react-table';

// project-imports
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import InvoiceCard from 'components/cards/invoice/InvoiceCard';
import { HeaderSort, TablePagination } from 'components/third-party/ReactTable';

import { useSelector } from 'store';
import { renderFilterTypes, DateColumnFilter } from 'utils/react-table';

// assets
import axiosServices from 'utils/axios';
import CompanyFilter from 'pages/trips/filter/CompanyFilter';
import DateRangeSelect from 'pages/trips/filter/DateFilter';
import useDateRange, { TYPE_OPTIONS } from 'hooks/useDateRange';
import TableSkeleton from 'components/tables/TableSkeleton';
import EmptyTableDemo from 'components/tables/EmptyTable';
import VendorFilter from 'pages/trips/filter/VendorFilter';
import DriverFilter from 'pages/trips/filter/DriverFilter';
import { formatDateUsingMoment } from 'utils/helper';
import { Eye } from 'iconsax-react';
import { ThemeMode } from 'config';

const TRANSACTION_TYPE = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE'
};

const getTabName = (type) => {
  switch (type) {
    case TRANSACTION_TYPE.INCOME:
      return 'Income';
    case TRANSACTION_TYPE.EXPENSE:
      return 'Expense';
    default:
      return 'All';
  }
};

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const defaultColumn = useMemo(() => ({ Filter: DateColumnFilter }), []);
  const filterTypes = useMemo(() => renderFilterTypes, []);
  const initialState = useMemo(
    () => ({
      filters: [{ id: 'transactionsType', value: '' }],
      hiddenColumns: ['avatar', 'email'],
      pageIndex: 0,
      pageSize: 5
    }),
    []
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    gotoPage,
    setPageSize,
    state: { globalFilter, selectedRowIds, pageIndex, pageSize },
    preGlobalFilteredRows,
    setGlobalFilter,
    setFilter
  } = useTable(
    {
      columns,
      data,
      filterTypes,
      defaultColumn,
      initialState
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect
  );

  const componentRef = useRef(null);
  const navigate = useNavigate();

  // =============================== Tab Logic ===============================

  // Create groups and counts based on transactionType
  const groups = ['All', TRANSACTION_TYPE.INCOME, TRANSACTION_TYPE.EXPENSE];

  const countGroup = data.map((item) => item.transactionsType);

  const counts = {
    Income: countGroup.filter((type) => type === TRANSACTION_TYPE.INCOME).length,
    Expense: countGroup.filter((type) => type === TRANSACTION_TYPE.EXPENSE).length
  };

  const [activeTab, setActiveTab] = useState(groups[0]);

  useEffect(() => {
    setFilter('transactionsType', activeTab === 'All' ? '' : activeTab);
  }, [activeTab, setFilter]);

  const filterData = rows.filter((row) => {
    if (activeTab === 'All') {
      return true;
    } else {
      return row.original.transactionsType === activeTab;
    }
  });

  return (
    <>
      <Box sx={{ p: 1, pb: 0, width: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            {groups.map((type, index) => (
              <Tab
                key={index}
                label={getTabName(type)}
                value={type}
                icon={
                  <Chip
                    label={type === 'All' ? data.length : type === TRANSACTION_TYPE.INCOME ? counts.Income : counts.Expense}
                    color={type === 'All' ? 'primary' : type === TRANSACTION_TYPE.INCOME ? 'success' : 'warning'}
                    variant="light"
                    size="small"
                  />
                }
                iconPosition="end"
              />
            ))}
          </Tabs>
        </Stack>
      </Box>

      <Box ref={componentRef}>
        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup} {...headerGroup.getHeaderGroupProps()} sx={{ '& > th:first-of-type': { width: '58px' } }}>
                {headerGroup.headers.map((column) => (
                  <TableCell key={column} {...column.getHeaderProps([{ className: column.className }])}>
                    <HeaderSort column={column} sort />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {filterData.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize).map((row, i) => {
              prepareRow(row);
              return (
                <Fragment key={i}>
                  <TableRow
                    {...row.getRowProps()}
                    onClick={() => {
                      row.toggleRowSelected();
                    }}
                    sx={{ cursor: 'pointer', bgcolor: row.isSelected ? alpha(theme.palette.primary.lighter, 0.35) : 'inherit' }}
                  >
                    {row.cells.map((cell) => (
                      <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])}>
                        {cell.render('Cell')}
                      </TableCell>
                    ))}
                  </TableRow>
                </Fragment>
              );
            })}
            <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
              <TableCell sx={{ p: 2, py: 3 }} colSpan={9}>
                <TablePagination
                  gotoPage={gotoPage}
                  rows={filterData}
                  setPageSize={setPageSize}
                  pageSize={pageSize}
                  pageIndex={pageIndex}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array
};

// ==============================||Transaction - LIST ||============================== //

const Transaction = () => {
  const [loading, setLoading] = useState(true);
  const userType = useSelector((state) => state.auth.userType);
  console.log(`🚀 ~ List ~ userType:`, userType);

  const [data, setData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [refetch, setRefetch] = useState(false);

  console.log('data', data);
  console.log('incomeData', incomeData);
  console.log('expenseData', expenseData);

  const handleRefetch = useCallback(() => {
    setRefetch((prev) => !prev);
  }, []);

  console.log({ metadata });

  const [filterOptions, setFilterOptions] = useState({
    selectedCompany: {},
    selectedVendor: {},
    selectedDriver: {}
  });

  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axiosServices.get('/invoice/all/transactions', {
          params: {
            // page: page,
            // limit: limit,
            startDate: formatDateUsingMoment(startDate),
            endDate: formatDateUsingMoment(endDate),
            companyId: filterOptions.selectedCompany._id,
            vendorId: filterOptions.selectedVendor._id,
            driverId: filterOptions.selectedDriver._id
          }
        });
        console.log('response', response);

        setData(response.data.data); // Assuming data comes in `response.data.data`
        setIncomeData(response.data.incomeData);
        setExpenseData(response.data.expenseData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [refetch, startDate, endDate, filterOptions]);

  const columns = useMemo(
    () => [
      // {
      //   title: 'Row Selection',
      //   Header: ({ getToggleAllPageRowsSelectedProps }) => <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} />,
      //   accessor: 'selection',
      //   Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
      //   disableSortBy: true,
      //   disableFilters: true
      // },
      {
        Header: '#',
        accessor: '',
        disableFilters: true,
        Cell: ({ row }) => {
          const serialNo = row.index + 1;
          return <Typography>{serialNo}</Typography>;
        }
      },
      {
        Header: 'Transaction ID',
        accessor: 'transactionsId',
        disableFilters: true,
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Transaction Type',
        accessor: 'transactionsType',
        Cell: ({ value }) => <Chip label={value} color={value === 'INCOME' ? 'success' : 'error'} size="small" variant="light" />
      },
      {
        Header: 'Amount',
        accessor: 'receivedAmount',
        Cell: ({ value }) => <Typography>₹ {(value === null || value === undefined ? 'N/A' : value)}</Typography>
      },
      {
        Header: 'Category', // This is the static header
        accessor: (row) => row.invoiceId || row.advanceId, // This conditionally picks either invoiceId or advanceId
        Cell: ({ value }) => <Typography>{value ? (value.includes('advance') ? 'Advance' : 'Invoice') : 'N/A'}</Typography>
      },
      {
        Header: 'Actions',
        disableSortBy: true,
        className: 'cell-left',
        Cell: ({ row }) => {
          const theme = useTheme();
          const mode = theme.palette.mode;

          // Check if invoiceId exists
          if (!row.original.invoiceId) {
            return null; // Render nothing if invoiceId is not present
          }

          return (
            <Stack direction="row" alignItems="left" justifyContent="left" spacing={0}>
              <Tooltip
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                      opacity: 0.9
                    }
                  }
                }}
                title="View"
              >
                <IconButton
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/apps/invoices/details/${row.original.invoiceId}`, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <Eye />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    []
  );

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  // Calculate total count
  const totalCount = (incomeData?.totalCount ?? 0) + (expenseData?.totalCount ?? 0);

  const widgetsData = [
    {
      title: 'Revenue',
      count: incomeData?.totalCount ?? 0,
      amount: incomeData?.totalReceivedAmount ?? 0,
      percentage: (((incomeData?.totalCount ?? 0) / (totalCount || 1)) * 100).toFixed(2),
      isLoss: false,
      invoice: metadata?.paid?.paidCount ?? 0,
      color: { main: '#4caf50' },
      chartData: [] // Add your chart metadata if necessary
    },
    {
      title: 'Expense',
      count: expenseData?.totalCount ?? 0,
      amount: expenseData?.totalReceivedAmount ?? 0,
      percentage: (((expenseData?.totalCount ?? 0) / (totalCount || 1)) * 100).toFixed(2),
      isLoss: true,
      invoice: metadata?.unpaid?.unpaidCount ?? 0,
      color: { main: '#f44336' },
      chartData: [] // Add your chart metadata if necessary
    },
    {
      title: 'Taxes',
      count: metadata?.overDue?.overDueCount ?? 0,
      amount: metadata?.overDue?.overDueAmount ?? 0,
      percentage: (
        ((metadata?.overDue?.overDueCount ?? 0) /
          ((metadata?.paid?.paidCount ?? 0) + (metadata?.unpaid?.unpaidCount ?? 0) + (metadata?.overDue?.overDueCount ?? 0) || 1)) *
        100
      ).toFixed(2),
      isLoss: true,
      invoice: metadata?.overDue?.overDueCount ?? 0,
      color: { main: '#ff9800' },
      chartData: [] // Add your chart metadata if necessary
    }
  ];

  return (
    <>
      <Grid container direction={matchDownSM ? 'column' : 'row'} spacing={2} sx={{ pb: 2 }}>
        <Grid item md={8}>
          <Grid container direction="row" spacing={2}>
            {widgetsData.map((widget, index) => (
              <Grid item sm={4} xs={12} key={index}>
                <MainCard>
                  <InvoiceCard
                    title={widget.title}
                    count={widget.count}
                    amount={widget.amount} // Pass amount if needed
                    percentage={widget.percentage}
                    isLoss={widget.isLoss}
                    invoice={widget.invoice}
                    color={widget.color.main}
                    subtitle={'payments'}
                  ></InvoiceCard>
                </MainCard>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item md={4} sm={12} xs={12}>
          <Box
            sx={{
              background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              borderRadius: 1,
              p: 1.75
            }}
          >
            <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="white">
                    Revenue
                  </Typography>
                  <Typography variant="body1" color="white">
                    ₹ {parseFloat((incomeData?.totalReceivedAmount ?? 0).toFixed(2))}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="white">
                  Expense
                </Typography>
                <Typography variant="body1" color="white">
                  ₹ {parseFloat((expenseData?.totalReceivedAmount ?? 0).toFixed(2))}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ pt: 1, zIndex: 1 }}>
              <Typography variant="body2" color="white">
                Income
              </Typography>
              <Typography variant="body1" color="white">
                ₹ {parseFloat(((incomeData?.totalReceivedAmount ?? 0) - (expenseData?.totalReceivedAmount ?? 0)).toFixed(2))}
              </Typography>
            </Stack>

            <Box sx={{ maxWidth: '100%' }}>
              <LinearWithLabel
                value={((incomeData?.totalReceivedAmount ?? 0) !== 0
                  ? (((incomeData?.totalReceivedAmount ?? 0) - (expenseData?.totalReceivedAmount ?? 0)) /
                      (incomeData?.totalReceivedAmount ?? 0)) *
                    100
                  : 0
                ).toFixed(2)}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* filter */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" justifyContent="flex-start" gap={1}>
          <CompanyFilter
            setFilterOptions={setFilterOptions}
            sx={{
              color: '#fff',
              '& .MuiSelect-select': {
                padding: '0.5rem',
                pr: '2rem'
              },
              '& .MuiSelect-icon': {
                color: '#fff' // Set the down arrow color to white
              },
              width: '200px',
              pb: 1
            }}
            value={filterOptions.selectedCompany}
          />
          <VendorFilter
            setFilterOptions={setFilterOptions}
            sx={{
              color: '#fff',
              '& .MuiSelect-select': {
                padding: '0.5rem',
                pr: '2rem'
              },
              '& .MuiSelect-icon': {
                color: '#fff' // Set the down arrow color to white
              },
              width: '200px',
              pb: 1
            }}
            value={filterOptions.selectedVendor}
          />
          <DriverFilter
            setFilterOptions={setFilterOptions}
            sx={{
              color: '#fff',
              '& .MuiSelect-select': {
                padding: '0.5rem',
                pr: '2rem'
              },
              '& .MuiSelect-icon': {
                color: '#fff' // Set the down arrow color to white
              },
              width: '200px',
              pb: 1
            }}
            value={filterOptions.selectedDriver}
          />

          <DateRangeSelect
            startDate={startDate}
            endDate={endDate}
            selectedRange={range}
            prevRange={prevRange}
            setSelectedRange={setRange}
            onRangeChange={handleRangeChange}
            showSelectedRangeLabel
          />
        </Stack>
      </Stack>
      <MainCard content={false}>
        <ScrollX>
          {loading ? (
            <TableSkeleton rows={10} columns={6} />
          ) : data?.length > 0 ? (
            <ReactTable columns={columns} data={data} />
          ) : (
            <EmptyTableDemo />
          )}
        </ScrollX>
      </MainCard>
      {/* <AlertColumnDelete title={`${getInvoiceId}`} open={alertPopup} handleClose={handleClose} /> */}
    </>
  );
};

Transaction.propTypes = {
  row: PropTypes.object,
  values: PropTypes.object,
  email: PropTypes.string,
  avatar: PropTypes.node,
  customer_name: PropTypes.string,
  invoice_id: PropTypes.string,
  id: PropTypes.number,
  value: PropTypes.object,
  toggleRowExpanded: PropTypes.func,
  isExpanded: PropTypes.bool,
  getToggleAllPageRowsSelectedProps: PropTypes.func,
  getToggleRowSelectedProps: PropTypes.func
};

function LinearWithLabel({ value, ...others }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress color="warning" variant="determinate" value={value} {...others} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="white">{`${Math.round(value)}%`}</Typography>
      </Box>
    </Box>
  );
}

LinearWithLabel.propTypes = {
  value: PropTypes.number,
  others: PropTypes.any
};

export default Transaction;
