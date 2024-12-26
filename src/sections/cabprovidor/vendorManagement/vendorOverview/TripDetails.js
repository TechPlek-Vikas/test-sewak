import PropTypes from 'prop-types';
import {
  alpha,
  Box,
  Chip,
  Link,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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

const TripDetail = ({ page, setPage, limit, setLimit, lastPageNo, vendorId }) => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  const TRIP_STATUS = {
    PENDING: 1,
    COMPLETED: 2,
    CANCELLED: 3,
    UNATTENDED: 4
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosServices.get('/assignTrip/all/trips/cabProvider', {
          params: {
            startDate: formatDateUsingMoment(startDate),
            endDate: formatDateUsingMoment(endDate),
            vendorId: vendorId
          }
        });
        setData(response.data.data || []);
      } catch (error) {
        console.error('Error at fetching trips:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vendorId, startDate, endDate]);

  const columns = useMemo(
    () => [
      {
        Header: '#',
        accessor: '',
        disableFilters: true,
        Cell: ({ row }) => <Typography>{row.index + 1}</Typography>
      },
      {
        Header: 'Status',
        accessor: 'assignedStatus',
        id: 'status', // Explicitly set id to 'status' for clarity
        disableFilters: true,
        // filter: 'includes',
        Cell: ({ row, value }) => {
          switch (value) {
            case TRIP_STATUS.PENDING: {
              return <Chip label="Pending" color="warning" variant="light" />;
            }
            case TRIP_STATUS.COMPLETED: {
              return row.original.invoiceId && row.original.invoiceId !== null ? (
                <Chip label="Invoice ✓" color="info" variant="light" />
              ) : (
                <Chip label="Completed" color="success" variant="light" />
              );
            }
            case TRIP_STATUS.CANCELLED: {
              return <Chip label="Cancelled" color="error" variant="light" />;
            }
            default: {
              return <Chip label="Not Defined" color="error" variant="light" />;
            }
          }
        }
      },
      {
        Header: 'Company Name',
        accessor: 'companyID.company_name',
        Cell: ({ row, value }) => (
          <Typography>
            <Link
              to={`/apps/trips/trip-view/${row.original.tripId}?id=${row.original._id}`}
              onClick={(e) => e.stopPropagation()}
              style={{ textDecoration: 'none', color: 'rgb(70,128,255)' }}
            >
              {value || 'N/A'}
            </Link>
          </Typography>
        )
      },
      {
        Header: 'Trip Date',
        accessor: 'tripDate',
        Cell: ({ value }) => formattedDate(value || 'N/A', 'DD/MM/YYYY')
      },
      {
        Header: 'Trip Time',
        accessor: 'tripTime',
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Zone Name',
        accessor: 'zoneNameID.zoneName',
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Zone Type',
        accessor: 'zoneTypeID.zoneTypeName',
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Cab',
        accessor: 'vehicleNumber.vehicleNumber',
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Cab Type',
        accessor: 'vehicleTypeID.vehicleTypeName',
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Driver',
        accessor: 'driverId.userName',
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Vehicle Guard Price',
        accessor: 'guardPrice', // This can be any key; we won't directly use it.
        Cell: ({ row }) => {
          const { driverGuardPrice, vendorGuardPrice } = row.original;
          return driverGuardPrice || vendorGuardPrice || 'N/A';
        }
      },
      {
        Header: 'Vehicle Rates',
        accessor: (row) => row.vendorRate ?? row.driverRate,
        Cell: ({ row }) => {
          const { vendorRate, driverRate } = row.original;
          return vendorRate ?? driverRate ?? 'N/A';
        }
      },
      {
        Header: 'Additional Rate',
        accessor: 'addOnRate',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Penalty',
        accessor: 'penalty',
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Location',
        accessor: 'location',
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Trip Type',
        accessor: 'tripType',
        Cell: ({ value }) => {
          switch (value) {
            case 1: // For Pick Up
              return <Chip label="Pick Up" color="warning" variant="light" />;
            case 2: // For Pick Drop
              return <Chip label="Pick Drop" color="success" variant="light" />;
          }
        }
      },
      {
        Header: 'Remarks',
        accessor: 'remarks',
        Cell: ({ value }) => value || 'N/A'
      }
    ],
    []
  );

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
        <Stack gap={2}>
          <MainCard content={false}>
            {loading ? (
              <TableSkeleton rows={10} columns={8} />
            ) : data?.length > 0 ? (
              <ReactTable columns={columns} data={data} loading={loading} />
            ) : (
              <EmptyTableDemo />
            )}
          </MainCard>
        </Stack>
      </MainCard>
    </>
  );
};

TripDetail.propTypes = {
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  setLimit: PropTypes.func.isRequired,
  lastPageNo: PropTypes.number.isRequired,
  vendorId: PropTypes.string.isRequired
};

export default TripDetail;

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
        <ScrollX>
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
            </TableBody>
          </Table>
        </ScrollX>

        <Box sx={{ p: 2, pt: 0 }}>
          <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
        </Box>
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
