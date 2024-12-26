import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { Fragment, useMemo, useState } from 'react';
import { useExpanded, useSortBy, useTable } from 'react-table';
import { Link, useNavigate } from 'react-router-dom';
import PaginationBox from 'components/tables/Pagination';
import Header from 'components/tables/genericTable/Header';
import { Add, Eye, Edit } from 'iconsax-react';
import WrapperButton from 'components/common/guards/WrapperButton';
import { ACTION, MODULE, PERMISSIONS, USERTYPE } from 'constant';
import EmptyTableDemo from 'components/tables/EmptyTable';
import TableSkeleton from 'components/tables/TableSkeleton';
import { ThemeMode } from 'config';
import { dispatch, useSelector } from 'store';
import { handleClose, handleOpen, setDeletedName, setSelectedID, updateVendorStatus } from 'store/slice/cabProvidor/vendorSlice';
import AlertDelete from 'components/alertDialog/AlertDelete';
import { openSnackbar } from 'store/reducers/snackbar';
import DebouncedSearch from 'components/textfield/DebounceSearch';
import AccessControlWrapper from 'components/common/guards/AccessControlWrapper';
import { BulkUploadDialog } from 'pages/management/vendor/bulkUpload/Dialog';
import { HeaderSort } from 'components/third-party/ReactTable';

const VendorTable = ({ data, page, setPage, limit, setLimit, lastPageNo, loading, setQuery }) => {
  const { remove, deletedName, selectedID } = useSelector((state) => state.vendors);

  const navigate = useNavigate();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [search, setSearch] = useState('');
  const [openBulkUploadDialog, setOpenBulkUploadDialog] = useState(false);

  // Search change handler
  const onSearchChange = (value) => {
    setSearch(value); // Update the search state
  };

  const handleDriverBulkUploadOpen = () => {
    setOpenBulkUploadDialog(true);
  };
  const handleDriverBulkUploadClose = () => {
    setOpenBulkUploadDialog(false);
  };

  const columns = useMemo(
    () => [
      {
        Header: '#',
        className: 'cell-center',
        accessor: 'id',
        Cell: ({ row }) => {
          return <Typography>{row.index + 1}</Typography>;
        }
      },
      {
        Header: 'Name',
        accessor: 'cabProviderLegalName',
        Cell: ({ row, value }) => {
        //   const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
          return (
            <Typography>
              <Link
                // to={`/management/vendor/overview/${row.original.vendorId}`}
                onClick={(e) => e.stopPropagation()} // Prevent interfering with row expansion
                style={{ textDecoration: 'none' }}
              >
                {value || 'N/A'}
              </Link>
            </Typography>
          );
        }
      },
      {
        Header: 'Address',
        accessor: 'officeAddress',
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'State',
        accessor: 'officeState',
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Mobile Number',
        accessor: 'workMobileNumber',
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Email',
        accessor: 'workEmail',
        Cell: ({ value }) => value || 'N/A'
      },
    ],
    []
  );


  return (
    <>
      <Stack gap={1} spacing={1}>
        {/* <Stack
          direction={'row'}
          spacing={1}
          justifyContent="space-between" // Distribute space between left and right
          alignItems="center"
          sx={{ p: 0, pb: 1, width: '100%' }} // Make the container take the full width
        >
         
          <DebouncedSearch
            search={search}
            onSearchChange={onSearchChange}
            handleSearch={setQuery}
            label="Search Vendor"
            sx={{
              color: '#fff',
              '& .MuiSelect-select': {
                // padding: '0.5rem',
                pr: '2rem'
              },
              '& .MuiSelect-icon': {
                color: '#fff' // Set the down arrow color to white
              },
              width: '180px' // Set desired width for search input
            }}
          />

         
          <Stack direction="row" alignItems="center" spacing={2}>
            <WrapperButton moduleName={MODULE.VENDOR} permission={PERMISSIONS.CREATE}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
                onClick={() => navigate('/management/vendor/add-vendor')}
                size="small"
                disabled={loading} // Disable button while loading
              >
                {loading ? 'Loading...' : 'Add Vendor'}
              </Button>
            </WrapperButton>

            <WrapperButton moduleName={MODULE.VENDOR} permission={PERMISSIONS.CREATE}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
                onClick={() => navigate('/management/vendor/add-vendor-rate')}
                size="small"
                color="success"
                disabled={loading} // Disable button while loading
              >
                {loading ? 'Loading...' : 'Add Vendor Rate'}
              </Button>
            </WrapperButton>

            <AccessControlWrapper allowedUserTypes={[USERTYPE.iscabProvider]}>
              <WrapperButton moduleName={MODULE.VENDOR} permission={PERMISSIONS.CREATE}>
                <Button
                  variant="contained"
                  size="small"
                  color="secondary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
                  onClick={handleDriverBulkUploadOpen}
                  disabled={loading} // Disable button while loading
                >
                  {loading ? 'Loading...' : 'Upload Vendor List'}
                </Button>
              </WrapperButton>
            </AccessControlWrapper>
          </Stack>
        </Stack> */}
        <MainCard content={false}>
          <ScrollX>
            {loading ? (
              <TableSkeleton rows={10} columns={6} />
            ) : data?.length === 0 ? (
              <EmptyTableDemo />
            ) : (
              <ReactTable columns={columns} data={data} />
            )}
          </ScrollX>
        </MainCard>
        <Box>
          {data.length > 0 && !loading && (
            <PaginationBox pageIndex={page} gotoPage={setPage} pageSize={limit} setPageSize={setLimit} lastPageIndex={lastPageNo} />
          )}
        </Box>
      </Stack>

      {openBulkUploadDialog && (
        <BulkUploadDialog open={openBulkUploadDialog} handleOpen={handleDriverBulkUploadOpen} handleClose={handleDriverBulkUploadClose} />
      )}
    </>
  );
};

VendorTable.propTypes = {
  data: PropTypes.array,
  row: PropTypes.object,
  isExpanded: PropTypes.bool,
  getToggleRowExpandedProps: PropTypes.func,
  value: PropTypes.string,
  page: PropTypes.number,
  setPage: PropTypes.func,
  limit: PropTypes.number,
  setLimit: PropTypes.func,
  lastPageNo: PropTypes.number
};

export default VendorTable;

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns: userColumns, data }) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns: userColumns,
      data
    },
    useSortBy,
    useExpanded
  );

  return (
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
        {rows.map((row, i) => {
          prepareRow(row);

          return (
            <Fragment key={i}>
              <TableRow {...row.getRowProps()}>
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
  );
}
ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  renderRowSubComponent: PropTypes.any
};
