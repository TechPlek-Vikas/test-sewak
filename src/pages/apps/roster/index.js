import PropTypes from 'prop-types';
import { useMemo, useEffect, Fragment, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import {
  Box,
  Chip,
  LinearProgress,
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
  Button
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

// third-party
import { useExpanded, useFilters, useGlobalFilter, usePagination, useRowSelect, useSortBy, useTable } from 'react-table';

// project-imports
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { HeaderSort } from 'components/third-party/ReactTable';

import { useSelector } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { renderFilterTypes, DateColumnFilter } from 'utils/react-table';

// assets
import { Add, DocumentUpload, Eye, Trash } from 'iconsax-react';
import PaginationBox from 'components/tables/Pagination';
import { useDispatch } from 'react-redux';
import { fetchCompaniesRosterFile } from 'store/slice/cabProvidor/rosterFileSlice';
import TableSkeleton from 'components/tables/TableSkeleton';
import Error500 from 'pages/maintenance/error/500';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';
import { ThemeMode } from 'config';
import axiosServices from 'utils/axios';
import CustomAlertDelete from 'sections/cabprovidor/advances/CustomAlertDelete';
import TableWidgetCard from './components/RosterCard';
import CompanyFilter from 'pages/trips/filter/CompanyFilter';
import DateRangeSelect from 'pages/trips/filter/DateFilter';
import useDateRange, { TYPE_OPTIONS } from 'hooks/useDateRange';
import EmptyTableDemo from 'components/tables/EmptyTable';
import { formatDateUsingMoment } from 'utils/helper';
import FileUploadDialog from './components/dialog/FileUploadDialog';
import WrapperButton from 'components/common/guards/WrapperButton';
import { MODULE, PERMISSIONS } from 'constant';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data }) {
  const theme = useTheme();
  const defaultColumn = useMemo(() => ({ Filter: DateColumnFilter }), []);
  const filterTypes = useMemo(() => renderFilterTypes, []);
  const initialState = useMemo(
    () => ({
      filters: [{ id: 'status', value: '' }],
      hiddenColumns: ['avatar', 'email'],
      pageIndex: 0,
      pageSize: 10
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

  // ================ Tab ================
  return (
    <>
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
            {page.map((row, i) => {
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

const AllRosters = () => {
  const [remove, setRemove] = useState(false);
  const [deleteID, setDeleteID] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [refetch, setRefetch] = useState(false);

  const { rosterFiles, metaData, loading, error } = useSelector((state) => state.rosterFile);
  const { metaData: rosterStat } = metaData;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const lastPageIndex = metaData.lastPageNo;

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

  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  useEffect(() => {
    dispatch(
      fetchCompaniesRosterFile({
        page: page,
        limit: limit,
        startDate: formatDateUsingMoment(startDate),
        endDate: formatDateUsingMoment(endDate),
        companyID: filterOptions?.selectedCompany?._id
      })
    );
  }, [dispatch, page, limit, refetch, startDate, endDate, filterOptions]);

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
      navigate('/apps/roster/assign-trip', { state: { fileData: rowData } });
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
          return <Typography>{row.original.totalCount ?? 'N/A'}</Typography>;
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
                <WrapperButton moduleName={MODULE.ROSTER} permission={PERMISSIONS.READ}>
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
                </WrapperButton>
                <WrapperButton moduleName={MODULE.ROSTER} permission={PERMISSIONS.DELETE}>
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
                </WrapperButton>
              </Stack>
            );
          }
          return null;
        }
      }
    ];
  }, [navigate, handleDelete, mode, theme]);

  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const widgetsData = [
    {
      title: 'Roster',
      count: rosterStat?.totalDataCount ?? 0,
      percentage: (((rosterStat?.sumOfTotalCount || 0) / (rosterStat?.sumOfTotalCount || 1)) * 100).toFixed(2),
      isLoss: false,
      even: true,
      entries: rosterStat?.sumOfTotalCount ?? 0,
      color: theme.palette.primary,
      chartData: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      title: 'Completed',
      count: rosterStat?.countOfEqualTotal ?? 0,
      percentage: (((rosterStat?.sumOfEqualCount || 0) / (rosterStat?.sumOfTotalCount || 1)) * 100).toFixed(2),
      isLoss: false,
      even: false,
      entries: rosterStat?.sumOfEqualCount ?? 0,
      color: theme.palette.success,
      chartData: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      title: 'Pending',
      count: (rosterStat?.totalDataCount ?? 0) - (rosterStat?.countOfEqualTotal ?? 0),
      percentage: (
        (((rosterStat?.sumOfTotalCount || 0) - (rosterStat?.sumOfEqualCount || 0)) / (rosterStat?.sumOfTotalCount || 1)) *
        100
      ).toFixed(2),
      isLoss: true,
      even: false,
      entries: (rosterStat?.sumOfTotalCount ?? 0) - (rosterStat?.sumOfEqualCount ?? 0),
      color: theme.palette.warning,
      chartData: [0, 0, 0, 0, 0, 0, 0]
    }
  ];

  let breadcrumbLinks = [
    { title: 'Home', to: APP_DEFAULT_PATH },
    { title: 'Roster', to: '/apps/roster/all-roster' }
  ];

  // fileUpload Dialog
  const [openFileUploadDialog, setOpenFileUploadDialog] = useState(false);

  const handleFileUploadOpen = () => {
    setOpenFileUploadDialog(true);
  };
  const handleFileUploadClose = () => {
    setOpenFileUploadDialog(false);
  };

  if (error) return <Error500 />;

  return (
    <>
      <Breadcrumbs custom links={breadcrumbLinks} sx={{ pb: 0, mb: 0 }} />

      <Grid container direction={matchDownSM ? 'column' : 'row'} spacing={2} sx={{ pb: 2 }}>
        <Grid item md={8}>
          <Grid container direction="row" spacing={2}>
            {widgetsData.map((widget, index) => (
              <Grid item sm={4} xs={12} key={index}>
                <MainCard>
                  <TableWidgetCard
                    title={widget.title}
                    count={widget.count}
                    percentage={widget.percentage}
                    isLoss={widget.isLoss}
                    entries={widget.entries}
                    color={widget.color.main}
                    even={widget.even}
                  ></TableWidgetCard>
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
                    Total Rosters
                  </Typography>
                  <Typography variant="body1" color="white">
                    {rosterStat?.totalDataCount ?? 0}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="white">
                  Trips Assigned
                </Typography>
                <Typography variant="body1" color="white">
                  {rosterStat?.sumOfEqualCount ?? 0}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ pt: 1, zIndex: 1 }}>
              <Typography variant="body2" color="white">
                Pending
              </Typography>
              <Typography variant="body1" color="white">
                {(rosterStat?.totalDataCount ?? 0) - (rosterStat?.countOfEqualTotal ?? 0)}
              </Typography>
            </Stack>

            <Box sx={{ maxWidth: '100%' }}>
              <LinearWithLabel
                value={
                  (((rosterStat?.sumOfTotalCount ?? 0) - (rosterStat?.sumOfEqualCount ?? 0)) / (rosterStat?.sumOfTotalCount || 1)) * 100
                }
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* filter & button */}

      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        {/* Left-aligned filters and date range selector */}
        <Stack direction="row" alignItems="center" gap={1}>
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

        {/* Right-aligned buttons */}
        <Stack direction="row" gap={1}>
          <WrapperButton moduleName={MODULE.ROSTER} permission={PERMISSIONS.CREATE}>
            <Button variant="contained" size="medium" color="success" startIcon={<Add />} onClick={handleFileUploadOpen}>
              Upload
            </Button>
          </WrapperButton>

          <WrapperButton moduleName={MODULE.ROSTER} permission={PERMISSIONS.CREATE}>
            <Button
              variant="contained"
              size="medium"
              color="secondary"
              startIcon={<DocumentUpload />}
              onClick={() => navigate('/apps/roster/files')}
            >
              Files
            </Button>
          </WrapperButton>
        </Stack>
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

      <FileUploadDialog open={openFileUploadDialog} handleOpen={handleFileUploadOpen} handleClose={handleFileUploadClose} />
    </>
  );
};

AllRosters.propTypes = {
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

export default AllRosters;
