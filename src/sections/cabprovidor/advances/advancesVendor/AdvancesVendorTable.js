import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { PopupTransition } from 'components/@extended/Transitions';
import AdvanceVendorForm from './AdvanceVendorForm';
import CustomAlertDelete from '../CustomAlertDelete';
import { TableNoDataMessage } from 'components/tables/reactTable1/ReactTable';
import axiosServices from 'utils/axios';
import { fetchAdvanceList } from 'store/slice/cabProvidor/advanceSlice';
import { formatDateUsingMoment } from 'utils/helper';
import useDateRange, { TYPE_OPTIONS } from 'hooks/useDateRange';
import { useSelector } from 'react-redux';
import TableSkeleton from 'components/tables/TableSkeleton';
import EmptyTableDemo from 'components/tables/EmptyTable';
import PaginationBox from 'components/tables/Pagination';
import PropTypes from 'prop-types';
import { useExpanded, useTable } from 'react-table';
import DateRangeSelect from 'pages/trips/filter/DateFilter';
import { Add } from 'iconsax-react';

function ReactTable({ columns: userColumns, data, renderRowSubComponent, page, setPage, limit, setLimit, lastPageNo }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    visibleColumns
    // gotoPage,
    // setPageSize,
    // state: { pageIndex, pageSize }
  } = useTable(
    {
      columns: userColumns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: 10,
        hiddenColumns: ['_id', 'advanceTypeId._id']
      }
    },
    useExpanded
  );

  return (
    <Table {...getTableProps()}>
      <TableHead>
        {headerGroups.map((headerGroup) => (
          <TableRow key={headerGroup} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <TableCell key={column} {...column.getHeaderProps([{ className: column.className }])}>
                {column.render('Header')}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          const rowProps = row.getRowProps();

          return (
            <Fragment key={i}>
              <TableRow {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])}>
                    {cell.render('Cell')}
                  </TableCell>
                ))}
              </TableRow>
              {row.isExpanded && renderRowSubComponent({ row, rowProps, visibleColumns })}
            </Fragment>
          );
        })}
        <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
          <TableCell sx={{ p: 2, py: 3 }} colSpan={12}>
            <PaginationBox pageIndex={page} gotoPage={setPage} pageSize={limit} setPageSize={setLimit} lastPageIndex={lastPageNo} />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  renderRowSubComponent: PropTypes.any
};

const AdvancesVendorTable = () => {
  const [key, setKey] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [alertopen, setAlertOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [customer, setCustomer] = useState(null);
  // const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [fetchAllAdvance, setFetchAllAdvance] = useState(null);
  const { advancesList, metaData, loading, error } = useSelector((state) => state.advances);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const lastPageIndex = metaData.lastPageNo;

  console.log('metaData', metaData);

  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  // useEffect(() => {
  //   const fetchdata = async () => {
  //     const response = await axiosServices.get(`/advance/my/list`);
  //     if (response.status === 200) {
  //       setLoading(false);
  //     }

  //     setFetchAllAdvance(response.data.data);
  //   };

  //   fetchdata();
  // }, [key]);

  useEffect(() => {
    dispatch(
      fetchAdvanceList({
        page: page,
        limit: limit,
        startDate: formatDateUsingMoment(startDate),
        endDate: formatDateUsingMoment(endDate)
      })
    );
  }, [dispatch, page, limit, startDate, endDate, key]);

  const handleLimitChange = useCallback((event) => {
    setLimit(+event.target.value);
    setPage(1);
  }, []);

  const handleAdd = () => {
    setAdd(!add);
    if (customer && !add) setCustomer(null);
  };

  const handleDelete = async () => {
    try {
      const response = await axiosServices.delete(`/advance?advanceId=${deleteId}`);
      if (response.status === 200) {
        setAlertOpen(false);
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
        setKey(key + 2);
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: false
          })
        );
      }
      console.log('Delete response:', response.data);
    } catch (error) {
      console.error('Error deleting advance type:', error);
    }
  };

  const handleClose = () => {
    setAlertOpen(false);
  };

  const columns = useMemo(
    () => [
      {
        Header: '_id',
        accessor: '_id',
        className: 'cell-center',
        disableSortBy: true
      },
      {
        Header: '#',
        accessor: 'id',
        className: 'cell-center',
        Cell: ({ row }) => <span>{row.index + 1}</span> // Use row.index to display incremental number
      },
      {
        Header: 'Cab Provider',
        accessor: 'cabProviderId.userName'
      },
      {
        Header: 'Requested Amount',
        className: 'cell-center',
        accessor: 'requestedAmount',
        Cell: ({ value }) => (
          <Typography
            sx={{
              // width: 'fit-content',
              minWidth: '20px', // Ensures enough space for minimum display
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap' // Prevents text from wrapping
            }}
          >
            {value}
          </Typography>
        )
      },
      {
        Header: 'Advance Type',
        accessor: 'advanceTypeId.advanceTypeName'
      },
      {
        Header: 'Advance Type Id',
        accessor: 'advanceTypeId._id'
      },
      {
        Header: 'Approved Amount',
        className: 'cell-center',
        accessor: 'approvedAmount'
      },
      {
        Header: 'Final Amount',
        className: 'cell-center',
        accessor: 'finalAmount'
      },
      {
        Header: 'Remarks',
        accessor: 'remarks',
        Cell: ({ value }) => (value && value.trim() !== '' ? value : 'None')
      },
      {
        Header: 'Status',
        accessor: 'isApproved',
        Cell: ({ row }) => {
          const isApproved = row.original.isApproved;

          if (isApproved == 1) {
            return <Chip color="success" label="Approved" size="small" variant="light" />;
          } else if (isApproved == 2) {
            return <Chip color="error" label="Rejected" size="small" variant="light" />;
          } else {
            return <Chip color="warning" label="Pending" size="small" variant="light" />;
          }
        }
      }
      // {
      //   Header: 'Actions',
      //   className: 'cell-center',
      //   disableSortBy: true,
      //   Cell: ({ row }) => {
      //     const isApproved = row.original.isApproved;

      //     if (isApproved == 1) {
      //       return null;
      //     } else {
      //       return (
      //         <Stack direction="row" alignItems="left" justifyContent="left" spacing={0}>
      //           <Tooltip
      //             componentsProps={{
      //               tooltip: {
      //                 sx: {
      //                   backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
      //                   opacity: 0.9
      //                 }
      //               }
      //             }}
      //             title="Edit"
      //           >
      //             <IconButton
      //               color="primary"
      //               onClick={(e) => {
      //                 e.stopPropagation();
      //                 console.log('rowr', row.values);

      //                 setCustomer(row.values);
      //                 handleAdd();
      //               }}
      //             >
      //               <Edit />
      //             </IconButton>
      //           </Tooltip>

      //           <Tooltip
      //             componentsProps={{
      //               tooltip: {
      //                 sx: {
      //                   backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
      //                   opacity: 0.9
      //                 }
      //               }
      //             }}
      //             title="Delete"
      //           >
      //             <IconButton
      //               color="error"
      //               onClick={(e) => {
      //                 e.stopPropagation();
      //                 console.log('row.values', row.values);

      //                 setDeleteId(row.values._id);
      //                 setAlertOpen(true);
      //               }}
      //             >
      //               <Trash />
      //             </IconButton>
      //           </Tooltip>
      //         </Stack>
      //       );
      //     }
      //   }
      // }
    ],
    [theme]
  );

  return (
    <>
      <Stack direction={'row'} spacing={1} justifyContent="flex-end" alignItems="center" sx={{ p: 0, pb: 2 }}>
        <Stack direction={'row'} alignItems="center" spacing={2}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
            onClick={handleAdd}
            size="small"
            disabled={loading}
            sx={{ height: '36px' }}
          >
            {loading ? 'Loading...' : 'Request Advance'}
          </Button>

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
        </Stack>
      </Stack>
      <MainCard content={false}>
        {/* <ScrollX>
          {loading ? (
            <Box
              sx={{
                height: '100vh',
                width: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CircularProgress />
            </Box>
          ) : advancesList ? (
            <ReactTable columns={columns} data={advancesList || []} handleAdd={handleAdd} buttonTitle="Request Advance" search />
          ) : (
            <TableNoDataMessage text="No Advance Request Found" />
          )}
        </ScrollX> */}
        <ScrollX>
          {loading ? (
            <TableSkeleton rows={10} columns={8} />
          ) : advancesList?.length === 0 ? (
            <EmptyTableDemo />
          ) : (
            <ReactTable
              columns={columns}
              data={advancesList || []}
              handleAdd={handleAdd}
              // buttonTitle="Request Advance"
              search
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={handleLimitChange}
              lastPageNo={lastPageIndex}
            />
          )}
        </ScrollX>
      </MainCard>

      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleAdd}
        open={add}
        sx={{ transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <AdvanceVendorForm customer={customer} onCancel={handleAdd} key={key} setKey={setKey} />
      </Dialog>

      <CustomAlertDelete
        title={'This action is irreversible. Please check before deleting.'}
        open={alertopen}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />
    </>
  );
};

export default AdvancesVendorTable;
