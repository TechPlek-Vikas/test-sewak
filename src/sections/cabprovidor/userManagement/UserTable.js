// eslint-disable-next-line no-unused-vars
import { Box, Button, Chip, CircularProgress, Dialog, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ScrollX from 'components/ScrollX';
import PaginationBox from 'components/tables/Pagination';
import ReactTable from 'components/tables/reactTable/ReactTable';
// eslint-disable-next-line no-unused-vars
import { Add, Edit, Eye, Setting3, Setting5, Trash } from 'iconsax-react';
import PropTypes from 'prop-types';
import { useCallback, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { formattedDate } from 'utils/helper';
import MainCard from 'components/MainCard';
import { Link, useNavigate } from 'react-router-dom';
import { MODULE, PERMISSIONS, USERTYPE } from 'constant';
import { useSelector } from 'react-redux';
import ManagePermissionModal from './ManagePermissionModal';
import { dispatch } from 'store';
import { clearUserDetails } from 'store/slice/cabProvidor/userSlice';
import TableSkeleton from 'components/tables/TableSkeleton';
import EmptyTableDemo from 'components/tables/EmptyTable';
import Header from 'components/tables/genericTable/Header';
import WrapperButton from 'components/common/guards/WrapperButton';

const KEYS = {
  [USERTYPE.iscabProvider]: {
    CREATED_AT: 'cabProviderUserId',
    UPDATED_AT: 'cabProviderUserId',
    USERNAME: 'cabProviderUserId',
    ROLE_NAME: 'cabProviderUserRoleId',
    PERMISSION: 'cabProviderUserId'
  },
  [USERTYPE.isVendor]: {
    CREATED_AT: 'vendorUserId',
    UPDATED_AT: 'vendorUserId',
    USERNAME: 'vendorUserId',
    ROLE_NAME: 'vendorUserRoleId',
    PERMISSION: 'vendorUserId'
  }
};

const UserTable = ({ data, page, setPage, limit, setLimit, lastPageNo, loading }) => {
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleModalOpen = useCallback(() => {
    setOpen(true);
    setUserId(null);
  }, []);

  const handleModalClose = useCallback(() => {
    setOpen(false);
    setUserId(null);
    // dispatch(clearUserDetails());
  }, []);

  const handleChangeUserId = useCallback((id) => {
    setOpen(true);
    setUserId(id);
  }, []);

  // eslint-disable-next-line no-unused-vars
  const mode = theme.palette.mode;
  const userType = useSelector((state) => state.auth.userType);

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
        Header: 'User Name',
        accessor: 'userName',
        Cell: ({ row }) => {
          // const formattedUserName = userName?.charAt(0).toUpperCase() + userName?.slice(1);
          const val = KEYS?.[userType].CREATED_AT;
          const key = row.original[val];
          const userName = key?.['userName'];

          //   return <>{userName}</>;
          return (
            <Typography>
              <Link
                // to={`/user/overview/${row.original._id}`}
                // onClick={(e) => e.stopPropagation()}
                style={{ textDecoration: 'none' }}
              >
                {userName || 'N/A'}
              </Link>
            </Typography>
          );
        }
      },
      {
        Header: 'Role Name',
        accessor: 'role_name',
        Cell: ({ row }) => {
          const val = KEYS?.[userType].ROLE_NAME;
          const key = row.original[val];
          const roleName = key?.['role_name'];
          return <>{roleName || 'N/A'}</>;
        }
      },
      // {
      //   Header: 'Manage Permission',
      //   accessor: 'manage_permission',
      //   Cell: ({ row }) => {
      //     return (
      //       <>
      //         {/* <Button variant="outlined" size="small" color="info" onClick={() => alert(`Manage Permission = ${row.original._id}`)}> */}
      //         <Button
      //           variant="outlined"
      //           size="small"
      //           color="info"
      //           onClick={() => {
      //             alert(`Manage Permission = ${row.original._id}`);
      //             const val = KEYS?.[userType].PERMISSION;
      //             const key = row.original[val];
      //             const uid = key?.['_id'];

      //             // handleChangeUserId(row.original._id);
      //             handleChangeUserId(uid);
      //           }}
      //         >
      //           Manage Permission
      //         </Button>
      //       </>
      //     );
      //   }
      // },
      {
        Header: 'Created At',
        accessor: 'createdAt',
        disableSortBy: true,
        Cell: ({ row }) => {
          const val = KEYS?.[userType].CREATED_AT;
          const key = row.original[val];
          const time = key?.['createdAt'];
          return <>{time ? formattedDate(time, 'DD MMMM YYYY, hh:mm A') : 'N/A'}</>;
        }
      },
      {
        Header: 'Updated At',
        accessor: 'updatedAt',
        disableSortBy: true,
        Cell: ({ row }) => {
          const val = KEYS?.[userType].UPDATED_AT;
          const key = row.original[val];
          const time = key?.['updatedAt'];
          return <>{time ? formattedDate(time, 'DD MMMM YYYY, hh:mm A') : 'N/A'}</>;
        }
      },
      {
        Header: 'Manage Permission',
        accessor: 'manage_permission',
        className: 'cell-center',
        Cell: ({ row }) => {
          return (
            <WrapperButton moduleName={MODULE.USER_SETTING} permission={PERMISSIONS.CREATE}>
              <IconButton
                size="medium"
                color="error"
                title="Manage Permission"
                onClick={() => {
                  // alert(`Manage Permission = ${row.original._id}`);
                  const val = KEYS?.[userType].PERMISSION;
                  const key = row.original[val];
                  const uid = key?.['_id'];

                  // handleChangeUserId(row.original._id);
                  handleChangeUserId(uid);
                }}
              >
                <Setting3 />
              </IconButton>
            </WrapperButton>
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
        {/* <ScrollX>
          <MainCard content={false}>
            <ReactTable columns={columns} data={data} hiddenColumns={['userName']} />
            <ReactTable columns={columns} data={data} />
          </MainCard>
        </ScrollX> */}
        <Header OtherComp={({ loading }) => <ButtonComponent loading={loading} />} />
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
          {data.length > 0 && (
            <PaginationBox pageIndex={page} gotoPage={setPage} pageSize={limit} setPageSize={setLimit} lastPageIndex={lastPageNo} />
          )}
        </Box>
      </Stack>

      {open && (
        <Dialog
          open={open}
          onClose={handleModalClose}
          scroll="body"
          maxWidth="md"
          fullWidth
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
        >
          <ManagePermissionModal handleClose={handleModalClose} userId={userId} />
        </Dialog>
      )}
    </>
  );
};

UserTable.propTypes = {
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

export default UserTable;

// ==============================|| REACT TABLE ||============================== //

const ButtonComponent = ({ loading }) => {
  const navigate = useNavigate();
  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <WrapperButton moduleName={MODULE.USER_SETTING} permission={PERMISSIONS.CREATE}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />} // Show loading spinner if loading
            onClick={() => navigate('/management/user/add-user')}
            size="small"
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Loading...' : ' Add User'}
          </Button>
        </WrapperButton>
      </Stack>
    </>
  );
};
