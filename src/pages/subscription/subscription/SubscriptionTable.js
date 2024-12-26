// eslint-disable-next-line no-unused-vars
import { Chip, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import ScrollX from 'components/ScrollX';
import { Edit, Trash } from 'iconsax-react';
import { Fragment, useMemo, useState } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import MainCard from 'components/MainCard';
import EmptyTableDemo from 'components/tables/EmptyTable';
import TableSkeleton from 'components/tables/TableSkeleton';
import { useDispatch } from 'store';
import { deleteSubscription } from 'store/slice/cabProvidor/subscriptionSlice';
import AlertDelete1 from 'components/alertDialog/AlertDelete1';
import { openSnackbar } from 'store/reducers/snackbar';
import { useExpanded, useFilters, useGlobalFilter, usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { TablePagination } from 'components/third-party/ReactTable';
import { renderFilterTypes } from 'utils/react-table';

const SubscriptionTable = ({ data, page, setPage, limit, setLimit, lastPageNo, loading, handleAdd, refreshTable }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // State for AlertDelete visibility and subscription details
  const [remove, setRemove] = useState(false);
  const [deletedName, setDeletedName] = useState('');
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);

  const handleOpenAlert = (subscriptionId, subscriptionName) => {
    setSelectedSubscriptionId(subscriptionId);
    setDeletedName(subscriptionName);
    setRemove(true);
  };

  const handleCloseDialog = () => {
    setRemove(false);
    setDeletedName('');
    setSelectedSubscriptionId(null);
  };

  const handleConfirmDelete = () => {

    if (selectedSubscriptionId) {
      dispatch(deleteSubscription(selectedSubscriptionId))
        .unwrap()
        .then((response) => {
          // console.log('Response from backend:', response);

          // Assuming the backend sends the message in response.message
          const successMessage = response?.data || 'Subscription plan deleted successfully!';

          dispatch(
            openSnackbar({
              open: true,
              message: successMessage, // Use the message from backend
              variant: 'alert',
              alert: { color: 'success' },
              close: true
            })
          );

          refreshTable();
        })

        .catch((error) => {
          console.error('Error deleting subscription:', error);

          dispatch(
            openSnackbar({
              open: true,
              message: error?.message || 'Something went wrong',
              variant: 'alert',
              alert: { color: 'error' },
              close: true
            })
          );
        })
        .finally(() => handleCloseDialog());
    }
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
        Header: 'Name',
        accessor: 'name',
        disableSortBy: true,
        Cell: ({ value }) => <span style={{ textDecoration: 'none', color: 'rgb(70,128,255)' }}>{value}</span>
      },
      {
        Header: 'Price',
        accessor: 'cost'
      },
      {
        Header: 'Maximum Cabs',
        accessor: 'maxCabs'
      },
      {
        Header: 'Maximum Drivers',
        accessor: 'maxDrivers'
      },
      {
        Header: 'Maximum Vendor Users',
        accessor: 'maxUsersOnEachVendors'
      },
      {
        Header: 'Maximum Company Users',
        accessor: 'maxUsersOnEachCompany'
      },
      {
        Header: 'Maximum CabProvider Users',
        accessor: 'maxUsersOnEachCabProviders'
      },
      {
        Header: 'Duration',
        accessor: 'expiresInMonths'
      },
      {
        Header: 'Status',
        accessor: 'isActive',
        Cell: ({ value }) => <Chip variant="light" size="small" label={value ? 'Active' : 'Inactive'} color={value ? 'success' : 'error'} />
      },
      {
        Header: 'Actions',
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => {
          const { id: subscriptionId, name: subscriptionName, ...rest } = row.original;

          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <Tooltip title="Edit">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd({ id: subscriptionId, name: subscriptionName, ...rest }); // Pass subscription data
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenAlert(subscriptionId, subscriptionName);
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  return (
    <>
      <Stack gap={1} spacing={1}>
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
      </Stack>

      <AlertDelete1
        handleClose={handleCloseDialog}
        title={`${deletedName} will be permanently deleted`}
        handleConfirm={handleConfirmDelete}
        open={remove}
      />
    </>
  );
};

export default SubscriptionTable;

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, renderRowSubComponent }) {
  const theme = useTheme();

  const filterTypes = useMemo(() => renderFilterTypes, []);
  // const sortBy = { id: 'id' };

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
      filterTypes,
      initialState: {
        pageIndex: 0,
        pageSize: 10,
        hiddenColumns: ['_id']
        // sortBy: [sortBy]
      }
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect
  );

  return (
    <>
      <Stack spacing={3}>
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
                      // cursor: 'pointer',
                      bgcolor: row.isSelected ? alpha(theme.palette.primary.lighter, 0.35) : 'inherit'
                    }}
                  >
                    {row.cells.map((cell) => (
                      <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])}>
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
              <TableCell sx={{ p: 2, py: 3 }} colSpan={12}>
                <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Stack>
    </>
  );
}
