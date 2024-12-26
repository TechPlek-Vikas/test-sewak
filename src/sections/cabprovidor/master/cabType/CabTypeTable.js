// eslint-disable-next-line no-unused-vars
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ScrollX from 'components/ScrollX';
import PaginationBox from 'components/tables/Pagination';
import ReactTable from 'components/tables/reactTable/ReactTable';
// eslint-disable-next-line no-unused-vars
import { Edit, Eye, Trash } from 'iconsax-react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { formattedDate } from 'utils/helper';
import MainCard from 'components/MainCard';
import { ACTION, FUEL_TYPE, MODULE, PERMISSIONS } from 'constant';
import { ThemeMode } from 'config';
import { useDispatch } from 'react-redux';

import { handleOpen, setDeletedName, setSelectedID } from 'store/slice/cabProvidor/vehicleTypeSlice';
import WrapperButton from 'components/common/guards/WrapperButton';
import EmptyTableDemo from 'components/tables/EmptyTable';
import TableSkeleton from 'components/tables/TableSkeleton';

const CabTypeTable = ({ data, page, setPage, limit, setLimit, lastPageNo,loading }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  // eslint-disable-next-line no-unused-vars
  const mode = theme.palette.mode;

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
        Header: 'Vehicle Type',
        accessor: 'vehicleTypeName',
         Cell: ({ value }) => value || 'N/A'
        // disableSortBy: true
      },
      {
        Header: 'Description',
        accessor: 'vehicleDescription',
        disableSortBy: true,
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Capacity',
        accessor: 'capacity',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Fuel Type',
        accessor: 'fuelType',
        // disableSortBy: true,
        Cell: ({ row }) => {
          const { values } = row;
          const fuelType = values['fuelType'];
          return <>{FUEL_TYPE[fuelType]}</>;
        }
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
              <WrapperButton moduleName={MODULE.CAB_TYPE} permission={PERMISSIONS.UPDATE}>
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
                      dispatch(handleOpen(ACTION.EDIT));
                      dispatch(setSelectedID(row.values._id));
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              </WrapperButton>

              <WrapperButton moduleName={MODULE.CAB_TYPE} permission={PERMISSIONS.DELETE}>
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
                      dispatch(handleOpen(ACTION.DELETE));
                      dispatch(setDeletedName(row.values['vehicleTypeName']));
                      dispatch(setSelectedID(row.values._id));
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

CabTypeTable.propTypes = {
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

export default CabTypeTable;

// ==============================|| REACT TABLE ||============================== //
