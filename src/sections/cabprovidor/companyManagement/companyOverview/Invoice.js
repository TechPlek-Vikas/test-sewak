import PropTypes from 'prop-types';
import {
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useExpanded, useFilters, useGlobalFilter, usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import PaginationBox from 'components/tables/Pagination';
import axiosServices from 'utils/axios';
import { formatDateUsingMoment, formattedDate } from 'utils/helper';
import TableSkeleton from 'components/tables/TableSkeleton';
import EmptyTableDemo from 'components/tables/EmptyTable';
import DateRangeSelect from 'pages/trips/filter/DateFilter';
import useDateRange, { TYPE_OPTIONS } from 'hooks/useDateRange';
import { HeaderSort, TablePagination } from 'components/third-party/ReactTable';
import { renderFilterTypes } from 'utils/react-table';
import { useSelector } from 'react-redux';
import { Eye, More } from 'iconsax-react';
import FormDialog from 'components/alertDialog/FormDialog';
import { USERTYPE } from 'constant';
import { useNavigate } from 'react-router';
import { ThemeMode } from 'config';

const API_URL = {
  [USERTYPE.iscabProvider]: '/invoice/by/cabProviderId',
  [USERTYPE.isVendor]: '/invoice/all/vendor'
};

const Invoice = ({ page, setPage, limit, setLimit, lastPageNo, companyId }) => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const userType = useSelector((state) => state.auth.userType);
  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axiosServices.get(API_URL[userType], {
          params: {
            companyId: companyId
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
  }, [userType]);

  const columns = useMemo(
    () => [
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
                <Typography variant="subtitle1">{values.billedTo.company_name || 'N/A'}</Typography>
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
          if (value === 3) {
            return <Chip color="error" label="Cancelled" size="small" variant="light" />;
          } else if (value === 2) {
            return <Chip color="success" label="Paid" size="small" variant="light" />;
          } else {
            return <Chip color="info" label="Unpaid" size="small" variant="light" />;
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
          const [remarks, setRemarks] = useState('');
          const token = localStorage.getItem('serviceToken');
          const theme = useTheme();
          const mode = theme.palette.mode;
          const navigate = useNavigate();

          const handleMenuClick = (event) => {
            setAnchorEl(event.currentTarget);
          };

          const handleMenuClose = () => {
            setAnchorEl(null);
          };

          const handleStatusChange = (status) => {
            setNewStatus(status);
            if (status === 3) {
              // Open FormDialog if "Cancelled"
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

          const confirmStatusChange = async () => {
            try {
              const response = await axiosServices.put(`/invoice/update/paymentStatus`, {
                data: {
                  invoiceId: row.original._id,
                  status: newStatus,
                  remarks: newStatus === 3 ? remarks : undefined // Include remarks if cancelled
                }
              });

              if (response.status === 201) {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: response.data.message,
                    variant: 'alert',
                    alert: {
                      color: 'success'
                    },
                    close: true
                  })
                );
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
            handleMenuClose();
          };

          const openMenu = Boolean(anchorEl);

          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
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
                    navigate(`/apps/invoices/details/${row.original._id}`); // Use navigate for redirection
                  }}
                >
                  <Eye />
                </IconButton>
              </Tooltip>

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
                <MenuItem onClick={() => handleStatusChange(1)}>Unpaid</MenuItem>
                <MenuItem onClick={() => handleStatusChange(2)}>Paid</MenuItem>
                <MenuItem onClick={() => handleStatusChange(3)}>Cancelled</MenuItem>
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
                      Are you sure you want to change the status to {newStatus === 1 ? 'Unpaid' : newStatus === 2 ? 'Paid' : 'Cancelled'}?
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
              />
            </Stack>
          );
        }
      }
    ],
    [userType]
  );

  return (
    <>
      {/* <Stack direction={'row'} spacing={1} justifyContent="flex-end" alignItems="center" sx={{ p: 0, pb: 3 }}>
        <DateRangeSelect
          startDate={startDate}
          endDate={endDate}
          selectedRange={range}
          prevRange={prevRange}
          setSelectedRange={setRange}
          onRangeChange={handleRangeChange}
          showSelectedRangeLabel
          sx={{ height: '36px', width: '180px', mb: '0px' }}
        />
      </Stack> */}
      <MainCard content={false}>
        <Stack gap={2}>
          <MainCard content={false}>
            {loading ? (
              <TableSkeleton rows={10} columns={8} />
            ) : data?.length > 0 ? (
              <ScrollX>
                <ReactTable columns={columns} data={data} loading={loading} />
              </ScrollX>
            ) : (
              <EmptyTableDemo />
            )}
          </MainCard>
        </Stack>
      </MainCard>
    </>
  );
};

Invoice.propTypes = {
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  setLimit: PropTypes.func.isRequired,
  lastPageNo: PropTypes.number.isRequired,
  vendorId: PropTypes.string.isRequired
};

export default Invoice;

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, renderRowSubComponent }) {
  const theme = useTheme();

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    visibleColumns,
    rows,
    page,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize, expanded }
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: 10,
        hiddenColumns: ['_id'] // Keep this to hide specific columns if needed
      }
    },
    useGlobalFilter, // Retain if global filtering is required
    useFilters, // Retain if individual column filtering is needed
    useSortBy,
    useExpanded, // Retain for row expansion
    usePagination, // Retain for pagination functionality
    useRowSelect // Retain if row selection is needed
  );

  return (
    <>
      <Stack spacing={3}>
        <Table {...getTableProps()}>
          {/* <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id} {...headerGroup.getHeaderGroupProps()} sx={{ '& > th:first-of-type': { width: '58px' } }}>
                {headerGroup.headers.map((column) => (
                  <TableCell key={column.id} {...column.getHeaderProps([{ className: column.className }])}>
                    {column.render('Header')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead> */}
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
            {page.map((row, i) => {
              prepareRow(row);
              const rowProps = row.getRowProps();

              return (
                <Fragment key={i}>
                  <TableRow
                    {...row.getRowProps()}
                    onClick={() => {
                      row.toggleRowSelected();
                    }}
                    sx={{
                      bgcolor: row.isSelected ? alpha(theme.palette.primary.lighter, 0.35) : 'inherit'
                    }}
                  >
                    {row.cells.map((cell) => (
                      <TableCell key={cell.column.id} {...cell.getCellProps([{ className: cell.column.className }])}>
                        {cell.render('Cell')}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.isExpanded &&
                    renderRowSubComponent({
                      row,
                      rowProps,
                      visibleColumns,
                      expanded
                    })}
                </Fragment>
              );
            })}
            <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
              <TableCell sx={{ p: 2 }} colSpan={10}>
                <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Stack>
    </>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  getHeaderProps: PropTypes.func,
  handleAdd: PropTypes.func.isRequired,
  renderRowSubComponent: PropTypes.any,
  search: PropTypes.bool,
  csvExport: PropTypes.bool,
  buttonTitle: PropTypes.string.isRequired
};
