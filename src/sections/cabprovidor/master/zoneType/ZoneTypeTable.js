import PropTypes from 'prop-types';
import {
  alpha,
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
import { useExpanded, useFilters, useGlobalFilter, usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { ThemeMode } from 'config';
import { PopupTransition } from 'components/@extended/Transitions';
import { Add, Edit, Trash } from 'iconsax-react';
import { formattedDate } from 'utils/helper';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import CustomAlertDelete from 'sections/cabprovidor/advances/CustomAlertDelete';
import ZonetypeAddForm from './ZonetypeAddForm';
import { deleteZoneType } from 'store/slice/cabProvidor/zoneTypeSlice';
import WrapperButton from 'components/common/guards/WrapperButton';
import { MODULE, PERMISSIONS } from 'constant';
import TableSkeleton from 'components/tables/TableSkeleton';
import EmptyTableDemo from 'components/tables/EmptyTable';
import { renderFilterTypes } from 'utils/react-table';
import { HeaderSort, TablePagination } from 'components/third-party/ReactTable';

const ZoneTypeTable = ({ data, updateKey, setUpdateKey, loading }) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [, setAdvanceData] = useState(null);
  const [add, setAdd] = useState(false);
  const [alertopen, setAlertOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [zoneType, setZoneType] = useState(null);

  const handleZone = (actionType) => {
    if (actionType === 'add') {
      setZoneType(null);
    }
    setAdd(!add); // Open the dialog
  };

  const handleAdd = () => {
    setAdd(!add);
    if (!add) setAdvanceData(null);
  };

  const handleDelete = async () => {
    try {
      const resultAction = await dispatch(deleteZoneType(deleteId));

      setAlertOpen(false);
      if (deleteZoneType.fulfilled.match(resultAction)) {
        // If the action was fulfilled
        // setUpdateKey(updateKey + 1);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Zone Type deleted successfully.',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Error deleting Zone Type',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: false
          })
        );
      }

      // const response = await axios.delete(
      //   `${process.env.REACT_APP_API_URL}zoneType?zoneTypeId=${deleteId}`,
      //   {
      //     headers: {
      //       Authorization: `${token}`
      //     }
      //   }
      // );

      // if (response.status === 200) {
      //   setUpdateKey(updateKey + 1);
      //   setAlertOpen(false);
      //   dispatch(
      //     openSnackbar({
      //       open: true,
      //       message: response.data.data || 'Deleted successfully',
      //       variant: 'alert',
      //       alert: {
      //         color: 'success'
      //       },
      //       close: false
      //     })
      //   );
      // } else {
      //   dispatch(
      //     openSnackbar({
      //       open: true,
      //       message: response.data.message || 'Error deleting item',
      //       variant: 'alert',
      //       alert: {
      //         color: 'error'
      //       },
      //       close: false
      //     })
      //   );
      // }
    } catch (error) {
      console.log('error', error);

      // console.error('Error deleting advance type:', error.response?.data || error.message);
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
        Cell: ({ row }) => <span>{row.index + 1}</span> // Use row.index to display incremental number
      },
      {
        Header: 'Zone Type',
        accessor: 'zoneTypeName',
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Zone',
        accessor: 'zoneId.zoneName',
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'ZoneId',
        accessor: 'zoneId._id',
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Zone Type Description',
        accessor: 'zoneTypeDescription',
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Created At',
        accessor: 'createdAt',
        disableSortBy: true,
        Cell: ({ row }) => {
          const { values } = row;
          const time = values['createdAt'];
          return <>{time ? formattedDate(time, 'DD MMMM YYYY, hh:mm A') : 'N/A'}</>;
        }
      },
      {
        Header: 'Updated At',
        accessor: 'updatedAt',
        disableSortBy: true,
        Cell: ({ row }) => {
          const { values } = row;
          const time = values['updatedAt'];
          return <>{time ? formattedDate(time, 'DD MMMM YYYY, hh:mm A') : 'N/A'}</>;
        }
      },
      {
        Header: 'Actions',
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <WrapperButton moduleName={MODULE.ZONE_TYPE} permission={PERMISSIONS.UPDATE}>
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
                      e.stopPropagation();

                      setZoneType(row.values);
                      handleAdd('edit'); // Open the dialog for editing
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              </WrapperButton>

              <WrapperButton moduleName={MODULE.ZONE_TYPE} permission={PERMISSIONS.DELETE}>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  return (
    <>
      <Stack direction={'row'} spacing={1} justifyContent="flex-end" alignItems="center" sx={{ p: 0, pb: 3 }}>
        <WrapperButton moduleName={MODULE.ZONE_TYPE} permission={PERMISSIONS.CREATE}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
            onClick={() => handleZone('add')}
            size="small"
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Loading...' : '  Add Zone Type'}
          </Button>
        </WrapperButton>
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

      {add && (
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
          <ZonetypeAddForm zoneType={zoneType} onCancel={handleAdd} updateKey={updateKey} setUpdateKey={setUpdateKey} />
        </Dialog>
      )}

      <CustomAlertDelete
        title={'This action is irreversible. Please check before deleting.'}
        open={alertopen}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />
    </>
  );
};

ZoneTypeTable.propTypes = {
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

export default ZoneTypeTable;

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, renderRowSubComponent }) {
  const theme = useTheme();

  const filterTypes = useMemo(() => renderFilterTypes, []);
  const sortBy = { id: 'id', desc: false };

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
        hiddenColumns: ['_id', 'zoneTypeDescription', 'zoneId._id'],
        sortBy: [sortBy]
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
              <TableCell sx={{ p: 2, py: 3 }} colSpan={9}>
                <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
              </TableCell>
            </TableRow>
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
