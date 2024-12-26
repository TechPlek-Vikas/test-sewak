// eslint-disable-next-line no-unused-vars
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import ScrollX from 'components/ScrollX';
import PaginationBox from 'components/tables/Pagination';
import ReactTable from 'components/tables/reactTable/ReactTable';
import PropTypes from 'prop-types';
import { useCallback, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { formattedDate } from 'utils/helper';
import MainCard from 'components/MainCard';
import { Link, useNavigate } from 'react-router-dom';
import TableSkeleton from 'components/tables/TableSkeleton';
import EmptyTableDemo from 'components/tables/EmptyTable';
import AssignVehiclePopup from './driverOverview/assignVehiclePopup/AssignVehiclePopup';
import ReassignVehicle from './driverOverview/reassignVehiclePopup/ReassignVehicle';
import axiosServices from 'utils/axios';
import { openSnackbar } from 'store/reducers/snackbar';
import { dispatch, useSelector } from 'store';
import { Edit, Eye, Trash } from 'iconsax-react';
import { ThemeMode } from 'config';
import { ACTION, FUEL_TYPE, MODULE, PERMISSIONS, USERTYPE } from 'constant';
import {
  deleteDriver,
  fetchDriverDetails,
  fetchDrivers,
  handleClose,
  handleOpen,
  setDeletedName,
  setGetSingleDetails,
  setSelectedID
} from 'store/slice/cabProvidor/driverSlice';
import AlertDelete from 'components/alertDialog/AlertDelete';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { Base64 } from 'js-base64';
import WrapperButton from 'components/common/guards/WrapperButton';

const DriverTable = ({ data, page, setPage, limit, setLimit, lastPageNo, loading, setUpdateKey, updateKey }) => {
  const theme = useTheme();
  // const selectedID = useSelector((state) => state.drivers.selectedID);
  // console.log('selectedID', selectedID);
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const mode = theme.palette.mode;
  const [driverId, setDriverId] = useState(null);
  const [assignedVehicle, setAssignedVehicle] = useState([]);
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const userType = useSelector((state) => state.auth.userType);

  const { remove, deletedName, selectedID } = useSelector((state) => state.drivers);

  //assignedVehicle
  const handleClosePendingDialog = () => {
    setPendingDialogOpen(false);
    setDriverId(null);
  };

  const handleOpenPendingDialog = (id) => {
    setAssignedVehicle(id.assignedVehicle);
    // console.log(id);
    setDriverId(id);
    setPendingDialogOpen(true);
  };

  const handleOpenReassignDialog = (row) => {
    setDriverId(row);
    setAssignedVehicle(row?.assignedVehicle || []);
    setReassignDialogOpen(true);
  };

  const handleCloseReassignDialog = () => {
    setReassignDialogOpen(false);
    setDriverId(null);
  };

  const handleCloseDialog = useCallback(async (e, flag = false) => {
    // console.log(`🚀 ~ handleCloseDialog ~ flag:`, flag, selectedID);

    if (typeof flag === 'boolean' && flag) {
      const response = await dispatch(deleteDriver()).unwrap();

      // console.log('res = ', response);

      if (response.status === 200) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Driver Delete Successfully',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        dispatch(handleClose());
        setUpdateKey(updateKey + 1);
        // dispatch(fetchDrivers());
      }
    } else {
      dispatch(handleClose());
      return;
    }
  }, []);

  // const handleEditDriver = (e, row) => {
  //   e.stopPropagation();
  //   console.log('Id = ', row.values._id);
  //   dispatch(setSelectedID(row.values._id));
  //   navigate(`/management/driver/edit/${row.values._id}`);
  //   // dispatch(handleOpen(ACTION.EDIT));
  //   // (async () => {
  //   //   try {
  //   //     if (row.values._id) {
  //   //       console.log('API Calling .......');

  //   //       const result = await dispatch(fetchDriverDetails(row.values._id)).unwrap();
  //   //       console.log(`🚀 ~ Manage ~ result:`, result);
  //   //       dispatch(setGetSingleDetails(result));
  //   //     }
  //   //   } catch (error) {
  //   //     console.log(`🚀 ~ Manage ~ error:`, error);
  //   //   }
  //   // })();
  // };

  const columns = useMemo(
    () => {
      const generateLinkState = (isCabProviderDriver, userType) => {
        // Encapsulate logic for queryParams based on userType
        const queryParams = userType === USERTYPE.iscabProvider ? { CabProvider: isCabProviderDriver > 0 } : null;
        return queryParams;
      };

      return [
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
          Header: 'Driver Name',
          accessor: 'userName',
          Cell: ({ row, value }) => {
            const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
            const isCabProviderDriver = row.original.isCabProviderDriver;
            // console.log('isCabProviderDriver', isCabProviderDriver);
            // const queryParams = generateLinkState(isCabProviderDriver, userType);

            // const encodedParams = Base64.encode(JSON.stringify({ cabProvider: isCabProviderDriver > 0 }));
            // console.log(`🚀 ~ DriverTable ~ encodedParams:`, encodedParams);
            // const queryParams = userType === USERTYPE.iscabProvider ? `?cabProvider=${isCabProviderDriver > 0}&data=${encodedParams}` : ''; // Conditional query params
            const queryParams = userType === USERTYPE.iscabProvider ? `?cabProvider=${isCabProviderDriver > 0}` : ''; // Conditional query params
            // console.log(`🚀 ~ DriverTable ~ queryParams:`, queryParams);

            return (
              <Typography>
                <Link
                  to={`/management/driver/overview/${row.original._id}${queryParams}`}
                  // state={{ CabProvider: isCabProviderDriver > 0 }} // Correct way to pass state in v6
                  onClick={(e) => e.stopPropagation()} // Prevent interfering with row expansion
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {formattedValue  || 'N/A'}
                  {isCabProviderDriver > 0 && (
                    <Tooltip title="Cabprovider" arrow>
                      <span style={{ color: 'green', fontSize: '0.9rem', cursor: 'pointer' }}>✔</span>
                    </Tooltip>
                  )}
                </Link>
              </Typography>
            );
          }
        },
        {
          Header: 'Email',
          accessor: 'userEmail',
          Cell: ({ value }) => value || 'N/A'
          // disableSortBy: true
        },
        {
          Header: 'Contact Number',
          accessor: 'contactNumber',
          Cell: ({ value }) => value || 'N/A'
          // disableSortBy: true
        },
        {
          Header: 'Office Charge',
          accessor: 'officeChargeAmount',
          Cell: ({ value }) => value || 'N/A'
        },
        {
          Header: 'Vehicles',
          accessor: 'assignedVehicle',
          Cell: ({ row }) => {
            // console.log("row.original",row.original);

            const assignedVehicle = row.original.assignedVehicle;
            const cabNo = assignedVehicle ? assignedVehicle.vehicleId.vehicleNumber : null; // accessing vehicleNumber if assigned

            if (!assignedVehicle) {
              return (
                <Chip
                  color="error"
                  variant="light"
                  size="small"
                  label="Not Assigned"
                  sx={{
                    ':hover': {
                      backgroundColor: 'rgba(255, 0, 0, 0.3)',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => handleOpenPendingDialog(row.original)}
                />
              );
            } else {
              return (
                <Chip
                  color="success"
                  label={cabNo}
                  size="small"
                  variant="light"
                  sx={{
                    ':hover': {
                      backgroundColor: 'rgba(36, 140, 106 ,.5)',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => handleOpenReassignDialog(row.original)}
                />
              );
            }
          }
        },
        {
          Header: 'Created At',
          accessor: 'createdAt',
          // disableSortBy: true,
          Cell: ({ row }) => {
            const { values } = row;
            const time = values['createdAt'];
            return (
              <Typography
                sx={{
                  width: 'fit-content', // Dynamically adjusts to the content
                  minWidth: '60px', // Ensures enough space for minimum display
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' // Prevents text from wrapping
                }}
              >
                {' '}
                {time ? formattedDate(time, 'DD/MM/YYYY') : 'N/A'}
              </Typography>
            );
          }
        },
        {
          Header: 'Status',
          accessor: 'isActive',
          Cell: ({ row, value }) => {
            const [status, setStatus] = useState(value);
            const [openDialog, setOpenDialog] = useState(false); // To control the visibility of the dialog
            const [newStatus, setNewStatus] = useState(null); // To store the status to be toggled

            const handleToggleStatus = () => {
              // Determine new status based on current status
              const toggledStatus = status === 1 ? 0 : 1;
              setNewStatus(toggledStatus);
              setOpenDialog(true); // Open the confirmation dialog
            };

            const handleConfirmStatusUpdate = async () => {
              try {
                // Make PUT request to update status
                await axiosServices.put('/driver/updateActiveStatus', {
                  data: {
                    driverId: row.original._id,
                    status: newStatus
                  }
                });

                // Update local status
                setStatus(newStatus);
                setOpenDialog(false); // Close the dialog after successful update
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
              setOpenDialog(false); // Close the dialog without making any change
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
                  <DialogContent>Are you sure you want to {newStatus === 1 ? 'activate' : 'deactivate'} this driver?</DialogContent>
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
          }
        },
        {
          Header: 'Compliance Progress',
          accessor: 'progress',
          Cell: ({ row, value }) => {
            const progessValue = Math.floor(Math.random() * 101);
            return <LinearWithLabel value={progessValue} sx={{ minWidth: 75 }} />;
          }
        },
        {
          Header: 'Actions',
          className: 'cell-center',
          disableSortBy: true,
          Cell: ({ row }) => {
            const driverID = row.original._id;
            const isCabProviderDriver = row.original.isCabProviderDriver;
            return (
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
                {isCabProviderDriver === USERTYPE.iscabProvider && (
                  <WrapperButton moduleName={MODULE.DRIVER} permission={PERMISSIONS.READ}>
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
                          navigate(`/management/driver/view-driver-rate?driverID=${driverID}`);
                        }}
                      >
                        <Eye />
                      </IconButton>
                    </Tooltip>
                  </WrapperButton>
                )}

                <WrapperButton moduleName={MODULE.DRIVER} permission={PERMISSIONS.UPDATE}>
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
                        // console.log('Id = ', row.values._id);
                        dispatch(setSelectedID(row.values._id));
                        navigate(`/management/driver/edit/${row.values._id}`);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                </WrapperButton>

                <WrapperButton moduleName={MODULE.DRIVER} permission={PERMISSIONS.DELETE}>
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
                        // console.log(`🚀 ~ row.values.id:`, row.values);
                        dispatch(handleOpen(ACTION.DELETE));
                        dispatch(setDeletedName(row.values['userName']));
                        dispatch(setSelectedID(row.values._id)); //setDeletedName
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
      ];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  return (
    <>
      <Stack gap={1} spacing={1}>
        <ScrollX>
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
        </ScrollX>
        <Box>
          {data.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <PaginationBox pageIndex={page} gotoPage={setPage} pageSize={limit} setPageSize={setLimit} lastPageIndex={lastPageNo} />
            </div>
          )}
        </Box>
      </Stack>
      {/* Delete Dialog */}
      {remove && <AlertDelete title={deletedName} open={remove} handleClose={handleCloseDialog} />}
      {/* Pending Dialog */}
      <Dialog open={pendingDialogOpen} onClose={handleClosePendingDialog}>
        <AssignVehiclePopup
          handleClose={handleClosePendingDialog}
          driverId={driverId}
          setUpdateKey={setUpdateKey}
          updateKey={updateKey}
          assignedVehicle={assignedVehicle}
        />
      </Dialog>
      <Dialog open={reassignDialogOpen} onClose={handleCloseReassignDialog}>
        <ReassignVehicle
          handleClose={handleCloseReassignDialog}
          driverId={driverId}
          setUpdateKey={setUpdateKey}
          updateKey={updateKey}
          assignedVehicle={assignedVehicle}
        />
      </Dialog>
    </>
  );
};

DriverTable.propTypes = {
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

export default DriverTable;
