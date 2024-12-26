import PropTypes from 'prop-types';
import { useCallback, useMemo, Fragment, useState, useEffect } from 'react';

// material-ui
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  useTheme
} from '@mui/material';

// third-party
import { useExpanded, useSortBy, useTable } from 'react-table';

// project-imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

// assets
import { ArrowDown2, ArrowRight2, Eye } from 'iconsax-react';
import WrapperButton from 'components/common/guards/WrapperButton';
import { MODULE, PERMISSIONS } from 'constant';
import { ThemeMode } from 'config';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { dispatch } from 'store';
import { fetchAdvances } from 'store/slice/cabProvidor/advanceSlice';
import { PopupTransition } from 'components/@extended/Transitions';
import TableSkeleton from 'components/tables/TableSkeleton';
import EmptyTableDemo from 'components/tables/EmptyTable';
import PaginationBox from 'components/tables/Pagination';
import DateRangeSelect from 'pages/trips/filter/DateFilter';
import useDateRange, { TYPE_OPTIONS } from 'hooks/useDateRange';
import { formatDateUsingMoment } from 'utils/helper';
import AdvanceForm from 'sections/cabprovidor/advances/AdvanceForm';
import ExpandingUserDetail from 'sections/cabprovidor/testAdvance/ExpandingUserDetail';
import { HeaderSort } from 'components/third-party/ReactTable';

// ==============================|| REACT TABLE ||============================== //

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
        hiddenColumns: ['requestedById._id']
      }
    },
    useSortBy,
    useExpanded
  );

  return (
    <Table {...getTableProps()}>
      {/* <TableHead>
        {headerGroups.map((headerGroup) => (
          <TableRow key={headerGroup} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <TableCell key={column} {...column.getHeaderProps([{ className: column.className }])}>
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

// ==============================|| REACT TABLE - EXPANDING DETAILS ||============================== //

const AdvanceDriver = ({driverId}) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const navigate = useNavigate();
  const { advances, metaData, loading, error } = useSelector((state) => state.advances);
  const [advanceData, setAdvanceData] = useState(null);
  const [add, setAdd] = useState(false);
  const [key, setKey] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const lastPageIndex = metaData.lastPageNo;

  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  const handleAdvanceType = () => {
    navigate('/apps/invoices/advance-type');
  };

  const handleAdd = () => {
    setAdd(!add);
    if (advanceData && !add) setAdvanceData(null);
  };

  useEffect(() => {
    dispatch(
      fetchAdvances({
        page: page,
        limit: limit,
        startDate: formatDateUsingMoment(startDate),
        endDate: formatDateUsingMoment(endDate),
        filterbyUid: driverId
      })
    );
  }, [dispatch, page, limit, startDate, endDate]);

  const handleLimitChange = useCallback((event) => {
    setLimit(+event.target.value);
    setPage(1);
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: () => null,
        id: 'expander',
        disableSortBy: true,
        className: 'cell-center',
        Cell: ({ row }) => {
          const collapseIcon = row.isExpanded ? <ArrowDown2 size={14} /> : <ArrowRight2 size={14} />;
          return (
            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center' }} {...row.getToggleRowExpandedProps()}>
              {collapseIcon}
            </Box>
          );
        },
        SubCell: () => null
      },
      {
        Header: 'Advance Type',
        accessor: 'advanceTypeId.advanceTypeName',
        Cell: ({ value }) => (value && value.trim() !== '' ? value : 'N/A')
      },
      {
        Header: 'Requested Amount',
        accessor: 'requestedAmount',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Interest Rate',
        accessor: 'advanceTypeId.interestRate',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Remarks',
        accessor: 'remarks',
        Cell: ({ value }) => (value && value.trim() !== '' ? value : 'N/A')
      },
      {
        Header: 'Status',
        accessor: 'isApproved',
        Cell: ({ row }) => {
          const isApproved = row.original.isApproved;

          if (isApproved == 1) {
            return <Chip color="success" label="Transferred" size="small" variant="light" />;
          } else if (isApproved == 2) {
            return <Chip color="error" label="Rejected" size="small" variant="light" />;
          } else {
            return <Chip color="warning" label="Pending" size="small" variant="light" />;
          }
        }
      },
      {
        Header: 'Approved Amount',
        accessor: 'approvedAmount',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      // {
      //   Header: 'Actions',
      //   disableSortBy: true,
      //   Cell: ({ row }) => {
      //     const handleToggle = () => {
      //       setAdvanceData(row.original);
      //       handleAdd();
      //     };

      //     const getSwitchColor = () => {
      //       if (row.original.isApproved === 1) return 'success'; // Green when approved
      //       if (row.original.isApproved === 2) return 'error'; // Red when rejected
      //       return 'default'; // Default color for pending
      //     };

      //     return (
      //       <Stack direction="row" alignItems="center" justifyContent="left" spacing={0}>
      //         <WrapperButton moduleName={MODULE.ADVANCE} permission={PERMISSIONS.UPDATE}>
      //           <Tooltip
      //             componentsProps={{
      //               tooltip: {
      //                 sx: {
      //                   backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
      //                   opacity: 0.9
      //                 }
      //               }
      //             }}
      //             title={row.original.isApproved === 1 ? 'Reject' : 'Approve'}
      //           >
      //             <Switch
      //               checked={row.original.isApproved === 1 || row.original.isApproved === 2}
      //               onChange={handleToggle}
      //               color={getSwitchColor()}
      //             />
      //           </Tooltip>
      //         </WrapperButton>
      //       </Stack>
      //     );
      //   }
      // }
      // {
      //   Header: 'Actions',
      //   disableSortBy: true,
      //   Cell: ({ row }) => {
      //     const handleToggle = () => {
      //       // Only open the dialog if the status is not approved or rejected
      //       if (row.original.isApproved !== 1 && row.original.isApproved !== 2) {
      //         setAdvanceData(row.original);
      //         handleAdd();
      //       }
      //     };

      //     const getSwitchColor = () => {
      //       if (row.original.isApproved === 1) return 'success'; // Green when approved
      //       if (row.original.isApproved === 2) return 'error'; // Red when rejected
      //       return 'default'; // Default color for pending
      //     };

      //     const getTooltipTitle = () => {
      //       // Only show "Approve" if it's not already approved or rejected
      //       if (row.original.isApproved === 1) return 'Approved'; // No action for already approved
      //       if (row.original.isApproved === 2) return 'Rejected'; // No action for rejected
      //       return 'Approve'; // Default for pending state
      //     };

      //     return (
      //       <Stack direction="row" alignItems="center" justifyContent="left" spacing={0}>
      //         <WrapperButton moduleName={MODULE.ADVANCE} permission={PERMISSIONS.UPDATE}>
      //           <Tooltip
      //             componentsProps={{
      //               tooltip: {
      //                 sx: {
      //                   backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
      //                   opacity: 0.9
      //                 }
      //               }
      //             }}
      //             title={getTooltipTitle()} // Conditional tooltip title
      //           >
      //             <Switch
      //               checked={row.original.isApproved === 1 || row.original.isApproved === 2}
      //               onChange={handleToggle}
      //               color={getSwitchColor()}
      //               disabled={row.original.isApproved === 1 || row.original.isApproved === 2} // Disable switch for approved/rejected
      //             />
      //           </Tooltip>
      //         </WrapperButton>
      //       </Stack>
      //     );
      //   }
      // }
      {
        Header: 'Actions',
        disableSortBy: true,
        Cell: ({ row }) => {
          const handleToggle = () => {
            // Open the dialog only for pending or rejected statuses
            if (row.original.isApproved === 0 || row.original.isApproved === 2) {
              setAdvanceData(row.original);
              handleAdd();
            }
          };

          const getSwitchColor = () => {
            if (row.original.isApproved === 1) return 'success'; // Green when approved
            if (row.original.isApproved === 2) return 'error'; // Red when rejected
            return 'default'; // Default color for pending
          };

          const getTooltipTitle = () => {
            if (row.original.isApproved === 1) return 'Approved'; // Approved status
            if (row.original.isApproved === 2) return 'Rejected'; // Rejected status
            return 'Approve'; // Default for pending state
          };

          return (
            <Stack direction="row" alignItems="center" justifyContent="left" spacing={0}>
              <WrapperButton moduleName={MODULE.ADVANCE} permission={PERMISSIONS.UPDATE}>
                <Tooltip
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                        opacity: 0.9
                      }
                    }
                  }}
                  title={getTooltipTitle()} // Conditional tooltip title
                >
                  <Switch
                    checked={row.original.isApproved === 1 || row.original.isApproved === 2}
                    onChange={handleToggle}
                    color={getSwitchColor()}
                    disabled={row.original.isApproved === 1} // Disable switch for approved
                  />
                </Tooltip>
              </WrapperButton>
            </Stack>
          );
        }
      }
    ],
    []
  );

  // const renderRowSubComponent = useCallback(
  //   ({ row: { requestedById } }) => <ExpandingUserDetail data={advances[Number(requestedById)]} />,
  //   [advances]
  // );

  const renderRowSubComponent = useCallback(
    ({ row }) => (
      <ExpandingUserDetail requestedById={row.original.requestedById} isDriver={row.original.isDriver} isVendor={row.original.isVendor} />
    ),
    []
  );

  return (
    <>
      <Stack direction={'row'} spacing={1} justifyContent="flex-end" alignItems="center" sx={{ p: 0, pb: 2 }}>
        <Stack direction={'row'} alignItems="center" spacing={2}>
          {/* <WrapperButton moduleName={MODULE.ADVANCE_TYPE} permission={PERMISSIONS.READ}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Eye />}
              onClick={handleAdvanceType}
              size="small"
              disabled={loading}
              sx={{ height: '36px' }} 
            >
              {loading ? 'Loading...' : 'View Advance Type'}
            </Button>
          </WrapperButton> */}
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
        <ScrollX>
          {loading ? (
            <TableSkeleton rows={10} columns={8} />
          ) : advances?.length === 0 ? (
            <EmptyTableDemo />
          ) : (
            <ReactTable
              columns={columns}
              data={advances}
              renderRowSubComponent={renderRowSubComponent}
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
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <AdvanceForm advanceData={advanceData} onCancel={handleAdd} key={key} setKey={setKey} />
      </Dialog>
    </>
  );
};

AdvanceDriver.propTypes = {
  data: PropTypes.array,
  row: PropTypes.object,
  isExpanded: PropTypes.bool,
  getToggleRowExpandedProps: PropTypes.func,
  value: PropTypes.string
};

export default AdvanceDriver;
