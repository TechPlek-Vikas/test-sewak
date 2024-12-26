import PropTypes from 'prop-types';
import { useMemo, useEffect, Fragment, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ThemeMode } from 'config';

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
  Tooltip,
  Menu,
  MenuItem,
  Fade,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Dialog,
  Button
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

// third-party
import { useExpanded, useFilters, useGlobalFilter, usePagination, useRowSelect, useSortBy, useTable } from 'react-table';

// project-imports
import Loader from 'components/Loader';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import InvoiceCard from 'components/cards/invoice/InvoiceCard';
import InvoiceChart from 'components/cards/invoice/InvoiceChart';
import { CSVExport, HeaderSort, IndeterminateCheckbox, TablePagination, TableRowSelection } from 'components/third-party/ReactTable';
import AlertColumnDelete from 'sections/apps/kanban/Board/AlertColumnDelete';

import { dispatch, useSelector } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { alertPopupToggle, getInvoiceDelete, getInvoiceList } from 'store/reducers/invoice';
import { renderFilterTypes, GlobalFilter, DateColumnFilter } from 'utils/react-table';

// assets
import { Add, Edit, Eye, InfoCircle, More, ProfileTick, Trash } from 'iconsax-react';
import { formatDateUsingMoment, formattedDate } from 'utils/helper';
import FormDialog from 'components/alertDialog/FormDialog';
import axiosServices from 'utils/axios';
import { MODULE, PERMISSIONS, USERTYPE } from 'constant';
import CompanyFilter from 'pages/trips/filter/CompanyFilter';
import VendorFilter from 'pages/trips/filter/VendorFilter';
import DriverFilter from 'pages/trips/filter/DriverFilter';
import VehicleFilter from 'pages/trips/filter/VehicleFilter';
import DateRangeSelect from 'pages/trips/filter/DateFilter';
import useDateRange, { TYPE_OPTIONS } from 'hooks/useDateRange';
import TableSkeleton from 'components/tables/TableSkeleton';
import EmptyTableDemo from 'components/tables/EmptyTable';
import PaidModal from '../others/PaidModal';
import WrapperButton from 'components/common/guards/WrapperButton';

const avatarImage = require.context('assets/images/users', true);

const API_URL = {
  [USERTYPE.iscabProvider]: '/invoice/by/cabProviderId',
  [USERTYPE.isVendor]: '/invoice/all/vendor',
  [USERTYPE.iscabProviderUser]: '/invoice/by/cabProviderId',
  [USERTYPE.isVendorUser]: '/invoice/all/vendor'
};

export const INVOICE_STATUS = {
  UNPAID: 0,
  PAID: 1,
  CANCELLED: 2,
  PENDING: 3
};

export const getTabName = (status) => {
  switch (status) {
    case INVOICE_STATUS.PAID:
      return 'Paid';
    case INVOICE_STATUS.UNPAID:
      return 'Unpaid';
    case INVOICE_STATUS.CANCELLED:
      return 'Cancelled';
    case INVOICE_STATUS.PENDING:
      return 'PENDING';
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
      filters: [{ id: 'status', value: '' }],
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

  // ================ Tab ================

  // Map status codes to labels and colors

  // Create groups and counts
  const groups = ['All', INVOICE_STATUS.PAID, INVOICE_STATUS.UNPAID, INVOICE_STATUS.CANCELLED, INVOICE_STATUS.PENDING];

  const countGroup = data.map((item) => item.status);

  const counts = {
    Paid: countGroup.filter((status) => status === INVOICE_STATUS.PAID).length,
    Unpaid: countGroup.filter((status) => status === INVOICE_STATUS.UNPAID).length,
    Cancelled: countGroup.filter((status) => status === INVOICE_STATUS.CANCELLED).length,
    Pending: countGroup.filter((status) => status === INVOICE_STATUS.PENDING).length
  };

  const [activeTab, setActiveTab] = useState(groups[0]);

  useEffect(() => {
    setFilter('status', activeTab === 'All' ? '' : activeTab);
  }, [activeTab, setFilter]);

  const filterData = rows.filter((row) => {
    if (activeTab === 'All') {
      return true;
    } else {
      return row.original.status === activeTab;
    }
  });

  return (
    <>
      <Box sx={{ p: 1, pb: 0, width: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            {groups.map((status, index) => (
              <Tab
                key={index}
                label={getTabName(status)}
                value={status}
                icon={
                  <Chip
                    label={
                      status === 'All'
                        ? data.length
                        : status === INVOICE_STATUS.PAID
                        ? counts.Paid
                        : status === INVOICE_STATUS.UNPAID
                        ? counts.Unpaid
                        : status === INVOICE_STATUS.PENDING
                        ? counts.Pending
                        : counts.Cancelled
                    }
                    color={
                      status === 'All'
                        ? 'primary'
                        : status === INVOICE_STATUS.PAID
                        ? 'success'
                        : status === INVOICE_STATUS.UNPAID
                        ? 'warning'
                        : status === INVOICE_STATUS.PENDING
                        ? 'info'
                        : 'error'
                    }
                    variant="light"
                    size="small"
                  />
                }
                iconPosition="end"
              />
            ))}
          </Tabs>
          {/* <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Button
              variant="contained"
              size="small"
              color="secondary"
              startIcon={<Add />}
              onClick={() => navigate('/apps/invoices/create')}
            >
              Create Invoice
            </Button>
          </Stack> */}
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

// ==============================|| INVOICE - LIST ||============================== //

const List = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const { alertPopup } = useSelector((state) => state.invoice);
  const userType = useSelector((state) => state.auth.userType);

  const [data, setData] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [refetch, setRefetch] = useState(false);

  const handleRefetch = useCallback(() => {
    setRefetch((prev) => !prev);
  }, []);

  const [filterOptions, setFilterOptions] = useState({
    selectedCompany: {}
  });

  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axiosServices.get(API_URL[userType], {
          params: {
            // page: page,
            // limit: limit,
            invoiceStartDate: formatDateUsingMoment(startDate),
            invoiceEndDate: formatDateUsingMoment(endDate)
            // companyId: filterOptions?.selectedCompany?._id
          }
        });

        setData(response.data.data);
        setMetadata(response.data?.metaData || {});
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [userType, filterOptions, startDate, endDate, refetch]);

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: ({ getToggleAllPageRowsSelectedProps }) => <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} />,
        accessor: 'selection',
        Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
        disableSortBy: true,
        disableFilters: true
      },
      {
        Header: '#',
        accessor: '',
        disableFilters: true,
        Cell: ({ row }) => {
          const serialNo = row.index + 1; // The serial number will be the row index + 1
          return (
            <>
              <Typography>{serialNo}</Typography>
            </>
          );
        }
      },
      {
        Header: 'Invoice Id',
        accessor: 'invoiceNumber',
        disableFilters: true,
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Billed To',
        accessor: 'billedTo',
        disableFilters: true,
        Cell: ({ row }) => {
          const { values } = row;

          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* <Avatar alt="Avatar" size="sm" src={avatarImage(`./avatar-${!values.avatar ? 1 : values.avatar}.png`)} /> */}
              <Stack spacing={0}>
                <Typography variant="subtitle1">{values.billedTo.name || 'N/A'}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {values.billedTo.company_email || 'N/A'}
                </Typography>
              </Stack>
            </Stack>
          );
        }
      },
      {
        Header: 'Invoice Date',
        accessor: 'invoiceDate',
        Cell: ({ value }) => {
          return formattedDate(value || 'N/A', 'DD/MM/YYYY');
        }
      },
      {
        Header: 'Due Date',
        accessor: 'dueDate',
        Cell: ({ value }) => {
          return formattedDate(value || 'N/A', 'DD/MM/YYYY');
        }
      },
      {
        Header: 'Amount',
        accessor: 'grandTotal',
        Cell: ({ value }) => {
          return <Typography>₹ {(value === null || value === undefined ? 'N/A' : value)}</Typography>;
        }
      },
      {
        Header: 'Status',
        accessor: 'status',
        disableFilters: true,
        Cell: ({ value }) => {
          if (value === 2) {
            return <Chip color="error" label="Cancelled" size="small" variant="light" />;
          } else if (value === 1) {
            return <Chip color="success" label="Paid" size="small" variant="light" />;
          } else if (value === 0) {
            return <Chip color="warning" label="Unpaid" size="small" variant="light" />;
          } else if (value === 3) {
            return <Chip color="info" label="Pending" size="small" variant="light" />;
          }
        }
      },
      {
        Header: 'Actions',
        disableSortBy: true,
        Cell: ({ row }) => {
          const [anchorEl, setAnchorEl] = useState(null);
          const [dialogOpen, setDialogOpen] = useState(false);
          const [formDialogOpen, setFormDialogOpen] = useState(false);
          const [newStatus, setNewStatus] = useState(null);
          const theme = useTheme();
          const mode = theme.palette.mode;
          const [paidModalOpen, setPaidModalOpen] = useState(false);
          const [paidAmount, setPaidAmount] = useState(0);

          const handleMenuClick = (event) => {
            setAnchorEl(event.currentTarget);
          };

          const handleMenuClose = () => {
            setAnchorEl(null);
          };

          const handleStatusChange = (status) => {
            setNewStatus(status);
            if (status === 2) {
              setFormDialogOpen(true);
            } else {
              setDialogOpen(true); // Open confirmation dialog for other statuses
            }
          };

          const handleDialogClose = () => {
            setDialogOpen(false);
          };

          const handleFormDialogClose = () => {
            setFormDialogOpen(false);
          };

          const handleTextChange = (event) => {
            setRemarks(event.target.value);
          };

          const handleOpenPaidModal = useCallback((val) => {
            setPaidAmount(val);
            setPaidModalOpen(true);
          }, []);

          const handleClosePaidModal = useCallback(() => {
            setPaidModalOpen(false);
            setPaidAmount(0);
          }, []);

          const confirmStatusChange = async (type, data) => {
            try {
              const response = await axiosServices.put(`/invoice/update/paymentStatus`, {
                data: {
                  invoiceId: row.original._id,

                  status: newStatus,
                  remarks: newStatus === 2 ? remarks : undefined, // Include remarks if cancelled
                  ...(type === 'Paid' && { ...data })
                }

                // data: {
                //   invoiceId: row.original._id,
                //   transactionsId: 'VADE0B248932',
                //   transactionsType: 'EXPENSE',
                //   receivedAmount: 5000,
                //   TDSRate: 10,
                //   TDSAmount: 500,
                //   status: 0
                // }
              });

              if (response.status >= 200 && response.status < 300) {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: 'Invoice Status Changed',
                    variant: 'alert',
                    alert: {
                      color: 'success'
                    },
                    close: true
                  })
                );

                handleRefetch();
              }

              row.original.status = newStatus;
              // fetchInvoice();
            } catch (error) {
              console.error('Failed to update status:', error);
              dispatch(
                openSnackbar({
                  open: true,
                  message: error.response.data?.error || 'Something went wrong',
                  variant: 'alert',
                  alert: {
                    color: 'error'
                  },
                  close: true
                })
              );
            }

            setDialogOpen(false);
            setFormDialogOpen(false);
            handleClosePaidModal();
            handleMenuClose();
          };

          const openMenu = Boolean(anchorEl);

          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <WrapperButton moduleName={MODULE.INVOICE} permission={PERMISSIONS.READ}>
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
                      window.open(`/apps/invoices/details/${row.original._id}`, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <Eye />
                  </IconButton>
                </Tooltip>
              </WrapperButton>

              {userType === USERTYPE.iscabProvider && (
                <IconButton edge="end" aria-label="more actions" color="secondary" onClick={handleMenuClick}>
                  <More style={{ fontSize: '1.15rem' }} />
                </IconButton>
              )}

              <Menu
                id="fade-menu"
                MenuListProps={{ 'aria-labelledby': 'fade-button' }}
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                TransitionComponent={Fade}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => handleStatusChange(0)}>Unpaid</MenuItem>
                <MenuItem
                  onClick={() => {
                    handleOpenPaidModal(row.original.grandTotal);
                  }}
                >
                  Paid
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange(2)}>Cancelled</MenuItem>
              </Menu>

              {/* Confirmation Dialog */}
              <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <Box sx={{ p: 1, py: 1.5 }}>
                  <DialogTitle id="alert-dialog-title">Confirm Status Change</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                      Are you sure you want to change the status to {newStatus === 0 ? 'Unpaid' : newStatus === 1 ? 'Paid' : 'Cancelled'}?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button color="error" onClick={handleDialogClose}>
                      Disagree
                    </Button>
                    <Button variant="contained" onClick={confirmStatusChange} autoFocus>
                      Agree
                    </Button>
                  </DialogActions>
                </Box>
              </Dialog>

              {/* FormDialog for "Cancelled" Status */}
              <FormDialog
                open={formDialogOpen}
                handleClose={handleFormDialogClose}
                handleConfirm={confirmStatusChange}
                handleTextChange={handleTextChange}
                title="Provide Remarks for Cancellation"
                content="Please provide a reason for cancelling this invoice."
                placeholder="Enter your remarks"
                cancelledButtonTitle="Disagree"
                confirmedButtonTitle="Confirm Cancellation"
                showError
              />

              {paidModalOpen && (
                <Dialog
                  open={paidModalOpen}
                  onClose={handleClosePaidModal}
                  maxWidth="sm"
                  fullWidth
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <PaidModal open={paidModalOpen} amount={paidAmount} onClose={handleClosePaidModal} onConfirm={confirmStatusChange} />
                </Dialog>
              )}
            </Stack>
          );
        }
      }
    ],
    [userType]
  );

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const widgetsData = [
    {
      title: 'Paid',
      count: metadata?.paid?.paidCount ?? 0,
      amount: metadata?.paid?.paidAmount ?? 0,
      percentage: (
        ((metadata?.paid?.paidCount ?? 0) /
          ((metadata?.paid?.paidCount ?? 0) + (metadata?.unpaid?.unpaidCount ?? 0) + (metadata?.overDue?.overDueCount ?? 0) || 1)) *
        100
      ).toFixed(2),
      isLoss: false,
      invoice: metadata?.paid?.paidCount ?? 0,
      color: { main: '#4caf50' },
      chartData: [] // Add your chart metadata if necessary
    },
    {
      title: 'Unpaid',
      count: metadata?.unpaid?.unpaidCount ?? 0,
      amount: metadata?.unpaid?.unpaidAmount ?? 0,
      percentage: (
        ((metadata?.unpaid?.unpaidCount ?? 0) /
          ((metadata?.paid?.paidCount ?? 0) + (metadata?.unpaid?.unpaidCount ?? 0) + (metadata?.overDue?.overDueCount ?? 0) || 1)) *
        100
      ).toFixed(2),
      isLoss: true,
      invoice: metadata?.unpaid?.unpaidCount ?? 0,
      color: { main: '#f44336' },
      chartData: [] // Add your chart metadata if necessary
    },
    {
      title: 'Overdue',
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
                    Total
                  </Typography>
                  <Typography variant="body1" color="white">
                    ₹{' '}
                    {parseFloat(
                      (
                        (metadata?.paid?.paidAmount ?? 0) +
                        (metadata?.unpaid?.unpaidAmount ?? 0) +
                        (metadata?.overDue?.overDueAmount ?? 0)
                      ).toFixed(2)
                    )}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="white">
                  Pending
                </Typography>
                <Typography variant="body1" color="white">
                  ₹ {parseFloat(((metadata?.unpaid?.unpaidAmount ?? 0) + (metadata?.overDue?.overDueAmount ?? 0)).toFixed(2))}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ pt: 1, zIndex: 1 }}>
              <Typography variant="body2" color="white">
                Recieved
              </Typography>
              <Typography variant="body1" color="white">
                ₹ {parseFloat((metadata?.paid?.paidAmount ?? 0).toFixed(2))}
              </Typography>
            </Stack>

            <Box sx={{ maxWidth: '100%' }}>
              <LinearWithLabel
                value={
                  (
                    ((metadata?.paid?.paidAmount ?? 0) /
                      ((metadata?.paid?.paidAmount ?? 0) +
                        (metadata?.unpaid?.unpaidAmount ?? 0) +
                        (metadata?.overDue?.overDueAmount ?? 0) || 1)) *
                    100
                  ).toFixed(2) || 0
                }
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
          {/* <VendorFilter
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
          value={filterOptions.selectedDiver}
        />
        <VehicleFilter
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
            width: '220px',
            pb: 1
          }}
          value={filterOptions.selectedVehicle}
        /> */}

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

        <WrapperButton moduleName={MODULE.INVOICE} permission={PERMISSIONS.CREATE}>
          <Button variant="contained" size="small" color="secondary" startIcon={<Add />} onClick={() => navigate('/apps/invoices/create')}>
            Create Invoice
          </Button>
        </WrapperButton>
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

List.propTypes = {
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

export default List;
