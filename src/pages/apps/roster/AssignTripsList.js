import PropTypes from 'prop-types';
import { useMemo, useEffect, Fragment, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

// material-ui
import {
  Box,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
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
import Loader from 'components/Loader';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { HeaderSort, IndeterminateCheckbox, TablePagination } from 'components/third-party/ReactTable';
import AlertColumnDelete from 'sections/apps/kanban/Board/AlertColumnDelete';

import { dispatch, useSelector } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { alertPopupToggle, getInvoiceDelete } from 'store/reducers/invoice';
import { renderFilterTypes, GlobalFilter, DateColumnFilter } from 'utils/react-table';

// assets
import { Edit, Eye, InfoCircle } from 'iconsax-react';
import { APP_DEFAULT_PATH } from 'config';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import axiosServices from 'utils/axios';
import AssignTripsDialog from './components/dialog/AssignTripsDialog';
import TableSkeleton from 'components/tables/TableSkeleton';
import WrapperButton from 'components/common/guards/WrapperButton';
import { MODULE, PERMISSIONS } from 'constant';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, selectedData, handleSetSelectedData, handleAssignDialogOpen }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const defaultColumn = useMemo(() => ({ Filter: DateColumnFilter }), []);
  const filterTypes = useMemo(() => renderFilterTypes, []);
  const initialState = useMemo(
    () => ({
      filters: [{ id: 'status', value: '' }],
      hiddenColumns: ['remarks', 'addOnRate', 'vehicleRate', 'vehicleNumber', 'guard', 'location'], // These may need to be updated or removed based on your new data structure
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
    setFilter,
    selectedFlatRows
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
  const groups = ['All', 'verified', 'unverified', 'Trips', 'Discarded'];
  const countGroup = data.map((item) => item.status);
  const counts = {
    verified: countGroup.filter((status) => status === 1).length,
    unverified: countGroup.filter((status) => status === 0).length,
    Trips: countGroup.filter((status) => status === 3).length,
    Discarded: countGroup.filter((status) => status === 2).length
  };

  const [activeTab, setActiveTab] = useState(groups[0]);

  useEffect(() => {
    setFilter(
      'status',
      activeTab === 'All' ? '' : activeTab === 'verified' ? 1 : activeTab === 'Trips' ? 3 : activeTab === 'unverified' ? 0 : 2
    );
  }, [activeTab]);

  useEffect(() => {
    const selectedRowsData = selectedFlatRows.filter((row) => row.original.status !== 3).map((row) => row.original);
    handleSetSelectedData(selectedRowsData); // Pass selected rows data to the parent or manage it here
  }, [selectedFlatRows, handleSetSelectedData]);

  return (
    <>
      <Box sx={{ p: 1, pb: 0, width: '100%' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {/* Tabs Section */}
          <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)} sx={{ flexGrow: 1 }}>
            {groups.map((status, index) => (
              <Tab
                key={index}
                label={status}
                value={status}
                icon={
                  <Chip
                    label={status === 'All' ? data.length : counts[status]}
                    color={
                      status === 'All'
                        ? 'primary'
                        : status === 'Trips'
                        ? 'success'
                        : status === 'Discarded'
                        ? 'error'
                        : status === 'verified'
                        ? 'info'
                        : 'warning'
                    }
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
      <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1} justifyContent="space-between" alignItems="center" sx={{ p: 1, pb: 1 }}>
        <GlobalFilter preGlobalFilteredRows={preGlobalFilteredRows} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        {/* Button Section */}
        {selectedData.length > 0 && (
          <WrapperButton moduleName={MODULE.ROSTER} permission={PERMISSIONS.CREATE}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAssignDialogOpen} // Replace this with your actual onClick function
            >
              Assign Trips ({selectedData.filter((data) => data.status !== 3).length})
            </Button>
          </WrapperButton>
        )}
      </Stack>
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
            <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
              <TableCell sx={{ p: 2, py: 3 }} colSpan={9}>
                <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
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
export function formatIndianDate(isoDateString) {
  const date = new Date(isoDateString);

  // Extract day, month, and year
  const day = String(date.getDate()).padStart(2, '0'); // Ensure two digits for the day
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two digits for the month (getMonth() is 0-based)
  const year = date.getFullYear();

  // Format as dd/mm/yyyy
  return `${day}/${month}/${year}`;
}

const AssignTripList = () => {
  const [loading, setLoading] = useState(false);
  const { alertPopup } = useSelector((state) => state.invoice);
  const location = useLocation();
  const [rosterData, setRosterData] = useState([]);
  const { rosterData: stateData, fileData } = location.state || {};
  const [selectedData, setSelectedData] = useState([]);
  const [initateRender, setInitateRender] = useState(0);

  const handleSetSelectedData = useCallback((selectedRows) => {
    setSelectedData(selectedRows);
  }, []);

  useEffect(() => {
    if (stateData) {
      setRosterData(stateData);
    }
  }, []);

  useEffect(() => {
    let isMounted = true; // Flag to handle component unmounting

    const fetchRosterData = async (id) => {
      setLoading(true);
      try {
        const response = await axiosServices.post('/tripData/trip/requests/company', {
          data: { rosterFileId: id }
        });
        if (isMounted) {
          setRosterData(response.data.data);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching roster data:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (fileData?._id) {
      fetchRosterData(fileData._id);
    }

    return () => {
      isMounted = false; // Cleanup to avoid state updates on unmounted component
    };
  }, [fileData?._id, initateRender]);

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: ({ getToggleAllPageRowsSelectedProps }) => <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} />,
        accessor: 'selection',
        Cell: ({ row }) => {
          return <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />;
        },
        disableSortBy: true,
        disableFilters: true
      },
      {
        Header: 'Trip Id',
        accessor: 'rosterTripId',
        disableFilters: true
      },
      {
        Header: 'Trip Date',
        accessor: 'tripDate',
        className: 'cell-center',
        Cell: ({ value }) => {
          return formatIndianDate(value); // Adjust as per your type definitions
        }
      },
      {
        Header: 'Trip Time',
        accessor: 'tripTime',
        disableFilters: true
      },
      {
        Header: 'Trip Type',
        accessor: 'tripType',
        disableFilters: true,
        Cell: ({ value }) => {
          return value == '1' ? 'Pickup' : value == '2' ? 'Drop' : 'N/A'; // Adjust as per your type definitions
        }
      },
      {
        Header: 'Zone Name',
        accessor: 'zoneName',
        disableFilters: true,
        Cell: ({ row }) => {
          const { zoneName, zoneNameArray, status } = row.original;
          const hasError = !zoneNameArray || zoneNameArray.length !== 1;
          const errorMessage =
            zoneNameArray.length > 1 ? `multiple zone with name : ${zoneName} found` : `zone name : ${zoneName} not found`;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {zoneName}
              {hasError && status !== 3 && (
                <Tooltip title={errorMessage}>
                  <IconButton size="small" color="error">
                    <InfoCircle />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          );
        }
      },
      {
        Header: 'Zone Type',
        accessor: 'zoneType',
        disableFilters: true,

        Cell: ({ row }) => {
          const { zoneType, zoneTypeArray } = row.original;
          const hasError = !zoneTypeArray || zoneTypeArray.length !== 1;
          const errorMessage =
            zoneTypeArray.length > 1 ? `multiple zone with name : ${zoneType} found` : `zone name : ${zoneType} not found`;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {zoneType}
              {hasError && (
                <Tooltip title={errorMessage}>
                  <IconButton size="small" color="error">
                    <InfoCircle />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          );
        }
      },
      {
        Header: 'Location',
        accessor: 'location',
        disableFilters: true
      },
      {
        Header: 'Guard',
        accessor: 'guard',
        disableFilters: true
      },
      {
        Header: 'Vehicle Type',
        accessor: 'vehicleType',
        disableFilters: true,
        Cell: ({ row }) => {
          const { vehicleType, vehicleTypeArray } = row.original;
          const hasError = !vehicleTypeArray || vehicleTypeArray.length !== 1;
          const errorMessage =
            vehicleTypeArray.length > 1
              ? `multiple vehicle type with name : ${vehicleType} found`
              : `vehicle type name : ${vehicleType} not found`;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {vehicleType}
              {hasError && (
                <Tooltip title={errorMessage}>
                  <IconButton size="small" color="error">
                    <InfoCircle />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          );
        }
      },
      {
        Header: 'Vehicle Number',
        accessor: 'vehicleNumber',
        disableFilters: true
      },
      {
        Header: 'Vehicle Rate',
        accessor: 'vehicleRate',
        disableFilters: true
      },
      {
        Header: 'Add-On Rate',
        accessor: 'addOnRate',
        disableFilters: true
      },
      {
        Header: 'Remarks',
        accessor: 'remarks',
        disableFilters: true
      },
      {
        Header: 'Status',
        accessor: 'status',
        disableFilters: true,
        Cell: ({ value }) => {
          switch (value) {
            case 0:
              return <Chip color="warning" label="Unverified" size="small" variant="light" />; // Change as needed
            case 1:
              return <Chip color="info" label="Verified" size="small" variant="light" />; // Change as needed
            case 3:
              return <Chip color="success" label="Trip generated" size="small" variant="light" />; // Change as needed
            default:
              return <Chip color="error" label="Discarded" size="small" variant="light" />;
          }
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initateRender]
  );
  let breadcrumbLinks = [
    { title: 'Home', to: APP_DEFAULT_PATH },
    { title: 'Roster', to: '/apps/roster' },
    { title: `${fileData?.companyId?.company_name}`, to: `/management/company/overview/${fileData?.companyId?._id}` },
    { title: 'Generate Trips' }
  ];

  const [openAssignTripDialog, setOpenAssignTripDialog] = useState(false);

  const handleAssignDialogOpen = () => {
    setOpenAssignTripDialog(true);
  };

  const handleAssignDialogClose = () => {
    setOpenAssignTripDialog(false);
  };

  return (
    <>
      <Breadcrumbs custom links={breadcrumbLinks} sx={{ mb: 0 }} />
      <MainCard content={false}>
        <ScrollX>
          {loading ? (
            <TableSkeleton rows={10} columns={8} />
          ) : (
            rosterData && (
              <ReactTable
                columns={columns}
                data={rosterData}
                selectedData={selectedData}
                handleSetSelectedData={handleSetSelectedData}
                handleAssignDialogOpen={handleAssignDialogOpen}
              />
            )
          )}
        </ScrollX>
      </MainCard>
      <AssignTripsDialog
        setSelectedData={setSelectedData}
        data={selectedData}
        open={openAssignTripDialog}
        handleClose={handleAssignDialogClose}
        setInitateRender={setInitateRender}
        fileData={fileData}
      />
    </>
  );
};

AssignTripList.propTypes = {
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

export default AssignTripList;
