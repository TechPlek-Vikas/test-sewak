import PropTypes from 'prop-types';
import {
  alpha,
  Chip,
  IconButton,
  Link,
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
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
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
import { fetchCompaniesRosterFile } from 'store/slice/cabProvidor/rosterFileSlice';
import { Eye, Trash } from 'iconsax-react';
import { useSelector } from 'store';
import { dispatch } from 'store';
import { useNavigate } from 'react-router';
import { ThemeMode } from 'config';
import CustomAlertDelete from 'sections/cabprovidor/advances/CustomAlertDelete';

const ViewRoster = ({ companyId }) => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [remove, setRemove] = useState(false);
  const navigate = useNavigate();
  const mode = theme.palette.mode;
  // const [loading, setLoading] = useState(false);
  const { rosterFiles, metaData, loading, error } = useSelector((state) => state.rosterFile);

  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const lastPageIndex = metaData.lastPageNo;
  const [refetch, setRefetch] = useState(false);
  const [deleteID, setDeleteID] = useState(null);

  const [filterOptions, setFilterOptions] = useState({
    selectedCompany: {},
    selectedVendor: {},
    selectedDiver: {},
    selectedVehicle: {}
  });

  const handleCloseForRemove = useCallback(() => {
    setRemove(false);
    setDeleteID(null);
  }, []);

  const handleRefetch = useCallback(() => {
    setRefetch((prev) => !prev);
  }, []);

  useEffect(() => {
    dispatch(
      fetchCompaniesRosterFile({
        page: page,
        limit: limit,
        startDate: formatDateUsingMoment(startDate),
        endDate: formatDateUsingMoment(endDate),
        companyID: companyId
      })
    );
  }, [dispatch, page, limit, refetch, startDate, endDate]);

  const handleLimitChange = useCallback((event) => {
    setLimit(+event.target.value);
    setPage(1);
  }, []);

  const filteredData = useMemo(() => {
    return rosterFiles.filter((row) => row.isVisited === 1); // Filter where isVisited is 1
  }, [rosterFiles]);

  const handleDelete = useCallback(async () => {
    try {
      if (!deleteID) return;

      await axiosServices.delete(`/tripData/delete/roster?Id=${deleteID}`);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Roster deleted successfully',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );
      setRemove(false);
      setDeleteID(null);
      handleRefetch();
    } catch (error) {
      console.log('Error in delete roster = ', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error?.message || 'Something went wrong',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  }, [deleteID, dispatch, handleRefetch]);

  const columns = useMemo(() => {
    const handleViewClick = (rowData) => {
      navigate('/apps/roster/test-view-1', { state: { fileData: rowData } });
    };

    return [
      {
        Header: '#',
        className: 'cell-center',
        accessor: 'id',
        Cell: ({ row }) => {
          return <Typography>{row.index + 1}</Typography>;
        }
      },
      {
        Header: 'Company Name',
        accessor: 'companyId',
        Cell: ({ row }) => {
          return <Typography>{row.original.companyId?.company_name || 'N/A'}</Typography>;
        }
      },
      {
        Header: 'Start Date',
        accessor: (row) => (row.startDate ? new Date(row.startDate).toLocaleDateString('en-IN') : 'N/A')
      },
      {
        Header: 'End Date',
        accessor: (row) => (row.endDate ? new Date(row.endDate).toLocaleDateString('en-IN') : 'N/A')
      },
      {
        Header: 'Entries',
        accessor: 'totalCount',
        Cell: ({ row }) => {
          return <Typography>{row.original.totalCount ?? 'N/A' }</Typography>;
        }
      },
      {
        Header: 'Trips',
        accessor: 'totalCountWithStatus3',
        Cell: ({ row }) => {
          return <Typography>{row.original.totalCountWithStatus3 ?? 'N/A'}</Typography>;
        }
      },
      {
        Header: 'Added By',
        accessor: 'addedBy',
        Cell: ({ row }) => {
          return <Typography>{row.original.addedBy?.userName || 'N/A'}</Typography>;
        }
      },
      {
        Header: 'Upload Date',
        accessor: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : 'N/A')
      },
      {
        Header: 'Status',
        accessor: 'vendorDetails',
        Cell: ({ row }) => {
          // console.log({ row });

          return (
            <>
              <Chip
                label={
                  row.original.totalCount === row.original.totalCountWithStatus3
                    ? 'Completed'
                    : `${row.original.totalCount - row.original.totalCountWithStatus3} Pending`
                }
                color={row.original.totalCount === row.original.totalCountWithStatus3 ? 'success' : 'error'}
                variant="light"
                size="small"
              />
            </>
          );
        }
      },
      {
        Header: 'Action',
        accessor: 'isVisited',
        disableSortBy: true,
        className: 'cell-center',
        Cell: ({ row }) => {
          const isVisited = row.original.isVisited;

          if (isVisited === 1) {
            return (
              <Stack direction="row" alignItems="center" justifyContent="left" spacing={0}>
                <Tooltip
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                        opacity: 0.9
                      }
                    }
                  }}
                  title="View Roster"
                >
                  <IconButton color="secondary" onClick={() => handleViewClick(row.original)}>
                    <Eye />
                  </IconButton>
                </Tooltip>

                <Tooltip
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                        opacity: 0.9
                      }
                    }
                  }}
                  title="Delete"
                >
                  <IconButton
                    color="error"
                    onClick={() => {
                      setRemove(true);
                      setDeleteID(row.original._id);
                    }}
                  >
                    <Trash />
                  </IconButton>
                </Tooltip>
              </Stack>
            );
          }
          return null;
        }
      }
    ];
  }, [navigate, handleDelete, mode, theme]);

  return (
    <>
      <Stack direction={'row'} spacing={1} justifyContent="flex-end" alignItems="center" sx={{ p: 0, pb: 3 }}>
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
      <MainCard content={false}>
        <ScrollX>
          {loading ? (
            <TableSkeleton rows={10} columns={6} />
          ) : filteredData?.length > 0 ? (
            <ReactTable
              columns={columns}
              data={filteredData}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={handleLimitChange}
              lastPageNo={lastPageIndex}
            />
          ) : (
            <EmptyTableDemo />
          )}
        </ScrollX>
      </MainCard>
      <div style={{ marginTop: '20px' }}>
        <PaginationBox pageIndex={page} gotoPage={setPage} pageSize={limit} setPageSize={setLimit} lastPageIndex={lastPageIndex} />
      </div>
      {remove && (
        <CustomAlertDelete
          title={'This action is irreversible. Please check before deleting.'}
          open={remove}
          handleClose={handleCloseForRemove}
          handleDelete={handleDelete}
        />
      )}
    </>
  );
};

ViewRoster.propTypes = {
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  setLimit: PropTypes.func.isRequired,
  lastPageNo: PropTypes.number.isRequired,
  vendorId: PropTypes.string.isRequired
};

export default ViewRoster;

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
            {/* <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
              <TableCell sx={{ p: 2}} colSpan={10}>
                <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
              </TableCell>
            </TableRow> */}
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
