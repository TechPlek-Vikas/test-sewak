import PropTypes from 'prop-types';
import {
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
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { Fragment, useMemo, useState } from 'react';
import { useExpanded, useSortBy, useTable } from 'react-table';
import PaginationBox from 'components/tables/Pagination';
import { ThemeMode } from 'config';
import AdvanceForm from './AdvanceForm';
import { PopupTransition } from 'components/@extended/Transitions';
import { Add } from 'iconsax-react';
import { useNavigate } from 'react-router';
import WrapperButton from 'components/common/guards/WrapperButton';
import { MODULE, PERMISSIONS } from 'constant';
import TableSkeleton from 'components/tables/TableSkeleton';
import EmptyTableDemo from 'components/tables/EmptyTable';
import { HeaderSort } from 'components/third-party/ReactTable';

const AdvanceTable = ({ data, page, setPage, limit, setLimit, lastPageNo, key, setKey, loading }) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [advanceData, setAdvanceData] = useState(null);
  const [add, setAdd] = useState(false);
  const navigate = useNavigate();

  const handleAdd = () => {
    setAdd(!add);
    if (advanceData && !add) setAdvanceData(null);
  };

  const handleAdvanceType = () => {
    navigate('/apps/invoices/advance-type');
  };

  const columns = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        className: 'cell-center',
        Cell: ({ row }) => <span>{row.index + 1}</span> // Use row.index to display incremental number
      },
      {
        Header: 'Requested By',
        className: 'cell-center',
        accessor: 'requestedById.userName',
        Cell: ({ value }) => value || 'None'
        // disableSortBy: true,
      },
      {
        Header: 'Advance Type',
        className: 'cell-center',
        accessor: 'advanceTypeId.advanceTypeName',
        Cell: ({ value }) => value || 'None'
      },
      {
        Header: 'Requested',
        className: 'cell-center',
        accessor: 'amount',
        Cell: ({ row }) => {
          return <span>₹ {row.original.amount}</span>;
        }
      },
      {
        Header: 'Approved',
        className: 'cell-center',
        accessor: 'approved_amount',
        Cell: ({ row }) => {
          return row.original.isApproved === 0 ? (
            <Chip color="warning" label="Pending" size="small" variant="light" />
          ) : row.original.isApproved === 2 ? (
            <Chip color="error" label="Rejected" size="small" variant="light" />
          ) : (
            <Chip color="success" label={`₹ ${row.original.approved_amount}`} size="small" variant="light" />
          );
        }
      },
      {
        Header: 'Type',
        className: 'cell-center',
        accessor: 'isDriver',
        Cell: ({ row }) => {
          const isDriver = row.original.isDriver;
          const isVendor = row.original.isVendor;

          if (isDriver) {
            return <Chip color="success" label="Driver" size="small" variant="light" />;
          } else if (isVendor) {
            return <Chip color="primary" label="Vendor" size="small" variant="light" />;
          }
        }
      },
      {
        Header: 'Remarks',
        accessor: 'remarks'
      },
      {
        Header: 'Status',
        className: 'cell-center',
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
      },
      {
        Header: 'Actions',
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => {
          const handleToggle = () => {
            setAdvanceData(row.original);
            handleAdd();
          };

          const getSwitchColor = () => {
            if (row.original.isApproved === 1) return 'success'; // Green when approved
            if (row.original.isApproved === 2) return 'error'; // Red when rejected
            return 'default'; // Default color for pending
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
                  title={row.original.isApproved === 1 ? 'Reject' : 'Approve'}
                >
                  <Switch
                    checked={row.original.isApproved === 1 || row.original.isApproved === 2}
                    onChange={handleToggle}
                    color={getSwitchColor()}
                  />
                </Tooltip>
              </WrapperButton>
            </Stack>
          );
        }
      }
    ],
    [theme]
  );

  return (
    <>
      <Stack direction={'row'} spacing={1} justifyContent="flex-end" alignItems="center" sx={{ p: 0, pb: 3 }}>
        <Stack direction={'row'} alignItems="center" spacing={2}>
          <WrapperButton moduleName={MODULE.ADVANCE_TYPE} permission={PERMISSIONS.READ}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
              onClick={handleAdvanceType}
              size="small"
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Loading...' : ' View Advance Type'}
            </Button>
          </WrapperButton>
        </Stack>
      </Stack>
      <MainCard content={false}>
        <ScrollX>
          {loading ? (
            <TableSkeleton rows={10} columns={8} />
          ) : data?.length === 0 ? (
            <EmptyTableDemo />
          ) : (
            <ReactTable columns={columns} data={data} />
          )}
        </ScrollX>
      </MainCard>
      <div style={{ marginTop: '20px' }}>
        <PaginationBox pageIndex={page} gotoPage={setPage} pageSize={limit} setPageSize={setLimit} lastPageIndex={lastPageNo} />
      </div>
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

AdvanceTable.propTypes = {
  data: PropTypes.array,
  row: PropTypes.object,
  isExpanded: PropTypes.bool,
  getToggleRowExpandedProps: PropTypes.func,
  value: PropTypes.string,
  page: PropTypes.number,
  setPage: PropTypes.func,
  limit: PropTypes.number,
  setLimit: PropTypes.func,
  lastPageNo: PropTypes.number,
  setLastPageNo: PropTypes.func
};

export default AdvanceTable;

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
//
