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
import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { formattedDate } from 'utils/helper';
import MainCard from 'components/MainCard';
import { Link, useNavigate } from 'react-router-dom';
import EmptyTableDemo from 'components/tables/EmptyTable';
import TableSkeleton from 'components/tables/TableSkeleton';
import axiosServices from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { ThemeMode } from 'config';
import { Edit } from 'iconsax-react';
import WrapperButton from 'components/common/guards/WrapperButton';
import { MODULE, PERMISSIONS } from 'constant';

const CabTable = ({ data, page, setPage, limit, setLimit, lastPageNo, loading }) => {
  const theme = useTheme();
  // eslint-disable-next-line no-unused-vars
  const mode = theme.palette.mode;
  const navigate = useNavigate();

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
        Cell: ({ row }) => <span>{row.index + 1}</span>
      },
      {
        Header: 'Cab Name',
        accessor: 'vehicleName',
        // disableSortBy: true,
        Cell: ({ row, value }) => {
          const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
          return (
            <Typography>
              <Link
                to={`/management/cab/overview/${row.original._id}`}
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
        Header: 'Cab Type',
        accessor: 'vehicleTypeName',
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Cab Number',
        accessor: 'vehicleNumber',
        Cell: ({ value }) => value || 'N/A'
        // disableSortBy: true
      },
      {
        Header: 'Driver',
        accessor: 'assignedDriver',
        Cell: ({ row }) => {
          const assignedDrivers = row.original.assignedDriver;

          if (!assignedDrivers || assignedDrivers.length === 0) {
            return <Chip color="error" variant="light" size="small" label="Not Assigned" />;
          } else {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {assignedDrivers.map((driver, index) => (
                  <Chip
                    key={index}
                    color="success"
                    label={driver.driverId?.userName || 'Unknown'} // show individual driver name
                    size="small"
                    variant="light"
                    sx={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', width: '100%' }}
                  />
                ))}
              </div>
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
          return <>{time ? formattedDate(time, 'DD MMMM YYYY, hh:mm A') : 'N/A'}</>;
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
              await axiosServices.put('/vehicle/updateActiveStatus', {
                data: {
                  vehicleId: row.original._id,
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
        }
      },
      {
        Header: 'Compliance Progress',
        accessor: 'progress',
        disableSortBy: true,
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
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <WrapperButton moduleName={MODULE.CAB} permission={PERMISSIONS.CREATE}>
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
                      navigate(`/management/cab/edit/${row.values._id}`);
                      // dispatch(handleOpen(ACTION.EDIT));
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
                      console.log(`🚀 ~ row.values.id:`, row.values);
                      dispatch(handleOpen(ACTION.DELETE));
                      dispatch(setDeletedName(row.values['vehicleName']));
                      dispatch(setSelectedID(row.values._id));
                    }}
                  >
                    <Trash />
                  </IconButton>
                </Tooltip> */}
            </Stack>
          );
        }
      }
    ],
    []
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
        <Box>
          {data.length > 0 && (
            <PaginationBox pageIndex={page} gotoPage={setPage} pageSize={limit} setPageSize={setLimit} lastPageIndex={lastPageNo} />
          )}
        </Box>
      </Stack>
    </>
  );
};

CabTable.propTypes = {
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

export default CabTable;

// ==============================|| REACT TABLE ||============================== //
