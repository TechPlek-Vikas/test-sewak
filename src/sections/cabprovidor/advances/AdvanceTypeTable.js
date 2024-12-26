import PropTypes from 'prop-types';
import {
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
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
import { PopupTransition } from 'components/@extended/Transitions';
import { Add, Edit, Trash } from 'iconsax-react';
import AdvanceTypeForm from './AdvanceTypeForm';
import CustomAlertDelete from './CustomAlertDelete';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { deleteAdvanceType } from 'store/slice/cabProvidor/advanceTypeSlice';
import WrapperButton from 'components/common/guards/WrapperButton';
import { MODULE, PERMISSIONS, USERTYPE } from 'constant';
import TableSkeleton from 'components/tables/TableSkeleton';
import EmptyTableDemo from 'components/tables/EmptyTable';
import { useSelector } from 'react-redux';
import { HeaderSort } from 'components/third-party/ReactTable';

const AdvanceTypeTable = ({ data, page, setPage, limit, setLimit, lastPageNo, updateKey, setUpdateKey, loading }) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [add, setAdd] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [alertopen, setAlertOpen] = useState(false);
  const userType = useSelector((state) => state.auth.userType);

  const handleAdvanceType = (actionType) => {
    if (actionType === 'add') {
      setCustomer(null); // Reset for add
    }
    setAdd(!add); // Toggle dialog
  };

  // Function to close the dialog
  // const handleAdd = () => {
  //   setAdd(!add);
  //   if (customer && !add) setCustomer(null);
  // };

  const handleAdd = () => {
    setAdd(!add);
    // Reset customer to null when closing the dialog
    if (!add) {
      setCustomer(null);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await dispatch(deleteAdvanceType(deleteId));

      if (deleteAdvanceType.fulfilled.match(response)) {
        setUpdateKey(updateKey + 1);
        setAlertOpen(false);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Advance Type deleted successfully',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
      } else {
        const errorMessage = response.payload || 'Error deleting item';
        dispatch(
          openSnackbar({
            open: true,
            message: errorMessage,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: false
          })
        );
      }
    } catch (error) {
      console.log('error', error);

      console.error('Error deleting advance type:', error.response?.data || error.message);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to delete item',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
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
        disableSortBy: true,
        Cell: ({ row }) => <span>{row.index + 1}</span> // Use row.index to display incremental number
      },
      {
        Header: 'Advance Type',
        accessor: 'advanceTypeName',
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Interest Rate',
        accessor: 'interestRate',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Actions',
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <Stack direction="row" alignItems="left" justifyContent="left" spacing={0}>
              <WrapperButton moduleName={MODULE.ADVANCE_TYPE} permission={PERMISSIONS.UPDATE}>
                <Tooltip
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                        opacity: 0.9
                      }
                    }
                  }}
                  title="Edit"
                >
                  <IconButton
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents the event from affecting parent components

                      setCustomer(row.values);
                      handleAdvanceType('edit'); // Open the dialog for editing
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              </WrapperButton>

              <WrapperButton moduleName={MODULE.ADVANCE_TYPE} permission={PERMISSIONS.DELETE}>
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
                    onClick={(e) => {
                      e.stopPropagation();

                      setDeleteId(row.values._id);
                      setAlertOpen(true);
                    }}
                  >
                    <Trash />
                  </IconButton>
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
          {USERTYPE.iscabProvider === userType && (
            <WrapperButton moduleName={MODULE.ADVANCE_TYPE} permission={PERMISSIONS.CREATE}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
                onClick={() => handleAdvanceType('add')}
                size="small"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Add Advance Type'}
              </Button>
            </WrapperButton>
          )}
        </Stack>
      </Stack>

      <MainCard content={false}>
        <ScrollX>
          {loading ? (
            <TableSkeleton rows={10} columns={5} />
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

      {/* Dialog for adding Advance Type */}
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
        <AdvanceTypeForm customer={customer} onCancel={handleAdd} updateKey={updateKey} setUpdateKey={setUpdateKey} />
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

AdvanceTypeTable.propTypes = {
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

export default AdvanceTypeTable;

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns: userColumns, data }) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns: userColumns,
      data,
      initialState: {
        hiddenColumns: ['_id']
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
