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
        accessor: 'vendorCompanyName',
        Cell: ({ row, value }) => {
          const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
          return (
            <Typography>
              <Link
                to={`/management/vendor/overview/${row.original.vendorId}`}
                onClick={(e) => e.stopPropagation()} // Prevent interfering with row expansion
                style={{ textDecoration: 'none' }}
              >
                {formattedValue || 'N/A'}
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
        Header: 'Vehicles',
        accessor: 'totalVehicle',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Drivers',
        accessor: 'totalDrivers',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Status',
        accessor: 'vendorDetails',
        Cell: ({ row, value }) => {
          console.log(row);
          const [status, setStatus] = useState(row.original.isActive);
          const [openDialog, setOpenDialog] = useState(false);
          const [newStatus, setNewStatus] = useState(null);

          const handleToggleStatus = () => {
            const toggledStatus = status === 1 ? 0 : 1;
            setNewStatus(toggledStatus);
            setOpenDialog(true);
            const id = row.original.vendorId;
            console.log(`🚀 ~ row.values.id:`, row);
            dispatch(setSelectedID(id));
          };

          const handleConfirmStatusUpdate = async () => {
            try {
              // // Make PUT request to update status
              // await axiosServices.put('/vehicle/updateActiveStatus', {
              //   data: {
              //     vehicleId: row.original._id,
              //     status: newStatus
              //   }
              // });

              const response = await dispatch(updateVendorStatus(newStatus));
              console.log(response);
              if (response.payload.success) {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: response.payload.message,
                    variant: 'alert',
                    alert: {
                      color: 'success'
                    },
                    close: true
                  })
                );
                // dispatch(fetchDrivers());
              }

              setStatus(newStatus);
              setOpenDialog(false);
            } catch (error) {
              console.error('Error updating status:', error);
              dispatch(
                openSnackbar({
                  open: true,
                  message: error.response.data?.error || 'Something went wrong',
                  variant: 'alert',
                  alert: {
                    color: 'error'
                  },
                  close: true
                })
              );
            }
          };

          const handleCancel = () => {
            setOpenDialog(false);
          };

          return (
            <>
              <Chip
                label={status === 1 ? 'Active' : 'Inactive'}
                color={status === 1 ? 'success' : 'error'}
                variant="light"
                size="small"
                onClick={handleToggleStatus}
                sx={{
                  ':hover': {
                    backgroundColor: status === 1 ? 'rgba(36, 140, 106, 0.5)' : 'rgba(255, 0, 0, 0.3)',
                    cursor: 'pointer'
                  }
                }}
              />

              {/* Confirmation Dialog */}
              <Dialog open={openDialog} onClose={handleCancel}>
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>Are you sure you want to {newStatus === 1 ? 'activate' : 'deactivate'} this cab?</DialogContent>
                <DialogActions>
                  <Button onClick={handleCancel} color="error">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmStatusUpdate} variant="contained">
                    Confirm
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          );

          // switch (value.userStatus) {
          //   case 0:
          //     return <Chip color="error" label="Inactive" size="small" variant="light" />;
          //   case 1:
          //     return <Chip color="success" label="Active" size="small" variant="light" />;
          //   default:
          //     return <Chip color="info" label="Not Defined" size="small" variant="light" />;
          // }
        }
      },
      {
        Header: 'Actions',
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => {
          const vendorID = row.original.vendorId;
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              {/* <Tooltip
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                      opacity: 0.9
                    }
                  }
                }}
                title="View"
              >
                <IconButton
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/driver-overview/${driverID}`);
                  }}
                >
                  <Eye />
                </IconButton>
              </Tooltip> */}

              <WrapperButton moduleName={MODULE.VENDOR} permission={PERMISSIONS.READ}>
                <Tooltip
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                        opacity: 0.9
                      }
                    }
                  }}
                  title="View Rate"
                >
                  <IconButton
                    color="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/management/vendor/view-vendor-rate?vendorID=${vendorID}`);
                    }}
                  >
                    <Eye />
                  </IconButton>
                </Tooltip>
              </WrapperButton>

              <WrapperButton moduleName={MODULE.VENDOR} permission={PERMISSIONS.UPDATE}>
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
                      const id = row.original.vendorId;
                      console.log('Id = ', id);
                      navigate(`/management/vendor/edit/${id}`);
                      // dispatch(setSelectedID(row.values._id));
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              </WrapperButton>

              {/* <Tooltip
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
                    const id = row.original.vendorId;
                    console.log(`🚀 ~ row.values.id:`, row);
                    dispatch(handleOpen(ACTION.DELETE));
                    dispatch(setDeletedName(row.original['vendorCompanyName']));
                    dispatch(setSelectedID(id));
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip> */}
            </Stack>
          );
        }
      }
      // {
      //   Header: 'Actions',
      //   className: 'cell-center',
      //   disableSortBy: true,
      //   Cell: ({ row }) => {
      //     const vendorID = row.original.vendorId;
      //     return (
      //       <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
      //         <Tooltip
      //           componentsProps={{
      //             tooltip: {
      //               sx: {
      //                 backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
      //                 opacity: 0.9
      //               }
      //             }
      //           }}
      //           title="View Rate"
      //         >
      //           <IconButton
      //             color="secondary"
      //             onClick={(e) => {
      //               e.stopPropagation();
      //               navigate(`/management/vendor/view-vendor-rate?vendorID=${vendorID}`);
      //             }}
      //           >
      //             <Eye />
      //           </IconButton>
      //         </Tooltip>
      //       </Stack>
      //     );
      //   }
      // }
    ],
    []
  );

  // const handleCloseDialog = useCallback(async (e, flag = false) => {
  //   console.log(`🚀 ~ handleCloseDialog ~ flag:`, selectedID);

  //   if (typeof flag === 'boolean' && flag) {
  //     // const payload = { data: { vendorId: selectedID, status: 0 } };
  //     const response = await dispatch(updateVendorStatus(0)).unwrap();

  //     console.log('res = ', response);

  //     if (response.success) {
  //       dispatch(
  //         openSnackbar({
  //           open: true,
  //           message: response.message,
  //           variant: 'alert',
  //           alert: {
  //             color: 'success'
  //           },
  //           close: true
  //         })
  //       );
  //       dispatch(handleClose());
  //       setUpdateKey(updateKey + 1);
  //       // dispatch(fetchDrivers());
  //     }
  //   } else {
  //     dispatch(handleClose());
  //     return;
  //   }
  // }, []);

  return (
    <>
      <Stack gap={1} spacing={1}>
        {/* <Header
          OtherComp={({ loading, search, setQuery }) => (
            <ButtonComponent loading={loading} search={search} setQuery={setQuery} onSearchChange={onSearchChange} />
          )}
        /> */}
        <Stack
          direction={'row'}
          spacing={1}
          justifyContent="space-between" // Distribute space between left and right
          alignItems="center"
          sx={{ p: 0, pb: 1, width: '100%' }} // Make the container take the full width
        >
          {/* DebouncedSearch on the left */}
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

          {/* Button container on the right */}
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
        </Stack>
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
      {/* {remove && <AlertDelete title={deletedName} open={remove} handleClose={handleCloseDialog} />} */}

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

// const ButtonComponent = ({ loading, search, onSearchChange, setQuery }) => {
//   const navigate = useNavigate();
//   return (
//     <>
//       <Stack
//         direction={'row'}
//         spacing={1}
//         justifyContent="space-between" // Distribute space between left and right
//         alignItems="center"
//         sx={{ p: 0, pb: 3, width: '100%' }} // Make the container take the full width
//       >
//         {/* DebouncedSearch on the left */}
//         <DebouncedSearch
//           search={search}
//           onSearchChange={onSearchChange}
//           handleSearch={setQuery}
//           sx={{
//             color: '#fff',
//             '& .MuiSelect-select': {
//               // padding: '0.5rem',
//               pr: '2rem'
//             },
//             '& .MuiSelect-icon': {
//               color: '#fff' // Set the down arrow color to white
//             },
//             width: '180px' // Set desired width for search input
//           }}
//         />

//         {/* Button container on the right */}
//         <Stack direction="row" alignItems="center" spacing={2}>
//           <WrapperButton moduleName={MODULE.VENDOR} permission={PERMISSIONS.CREATE}>
//             <Button
//               variant="contained"
//               startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
//               onClick={() => navigate('/management/vendor/add-vendor')}
//               size="small"
//               disabled={loading} // Disable button while loading
//             >
//               {loading ? 'Loading...' : 'Add Vendor'}
//             </Button>
//           </WrapperButton>
//           <WrapperButton moduleName={MODULE.VENDOR} permission={PERMISSIONS.CREATE}>
//             <Button
//               variant="contained"
//               startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
//               onClick={() => navigate('/management/vendor/add-vendor-rate')}
//               size="small"
//               color="success"
//               disabled={loading} // Disable button while loading
//             >
//               {loading ? 'Loading...' : 'Add Vendor Rate'}
//             </Button>
//           </WrapperButton>
//         </Stack>
//       </Stack>
//     </>
//   );
// };
