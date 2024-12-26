import {
  Button,
  Chip,
  Dialog,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import EmptyTableWithoutButton from 'components/tables/EmptyTableWithoutButton';
import PaginationBox from 'components/tables/Pagination';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpanded, useSortBy, useTable } from 'react-table';
import axiosServices from 'utils/axios';
import { Add, Eye, Trash } from 'iconsax-react';
import { useDrawer } from 'contexts/DrawerContext';
import RosterTemplateDialog from './dialog/RosterTemplateDialog';
import { useTheme } from '@mui/material/styles';
import { ThemeMode } from 'config';
import WrapperButton from 'components/common/guards/WrapperButton';
import { MODULE, PERMISSIONS } from 'constant';
import { HeaderSort } from 'components/third-party/ReactTable';

const RosterFileTable = ({ data, page, setPage, limit, setLimit, lastPageNo, handleFileUploadOpen, fileData: fileInfo, openTemplate }) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [isReadyToNavigate, setIsReadyToNavigate] = useState(false);
  const theme = useTheme();
  const mode = theme.palette.mode;

  const { openDrawer } = useDrawer();
  const columns = useMemo(
    () => {
      const handleMapClick = (rowData) => {
        console.log({ rowData });
        handleClickOpen(rowData);
      };

      const handleViewClick = (rowData) => {
        navigate('/apps/roster/assign-trip', { state: { fileData: rowData } });
      };

      return [
        {
          Header: '#',
          className: 'cell-center',
          accessor: 'id',
          Cell: ({ row }) => {
            return <Typography>{row.index + 1}</Typography>;
          }
        },
        {
          Header: 'Company Name',
          accessor: 'companyId',
          Cell: ({ row }) => {
            return <Typography>{row.original.companyId?.company_name || 'N/A'}</Typography>;
          }
        },
        {
          Header: 'Start Date',
          accessor: (row) => (row.startDate ? new Date(row.startDate).toLocaleDateString('en-IN') : 'N/A')
        },
        {
          Header: 'End Date',
          accessor: (row) => (row.endDate ? new Date(row.endDate).toLocaleDateString('en-IN') : 'N/A')
        },
        {
          Header: 'Added By',
          accessor: 'addedBy',
          Cell: ({ row }) => {
            return <Typography>{row.original.addedBy?.userName || 'N/A'}</Typography>;
          }
        },
        {
          Header: 'Upload Date',
          accessor: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : 'N/A')
        },
        {
          Header: 'sTATUS',
          accessor: 'isVisited',
          //   Cell: ({ row }) => {

          //     return (
          //       <Stack direction="row" alignItems="center" justifyContent="left" spacing={0}>
          //         <Tooltip
          //           componentsProps={{
          //             tooltip: {
          //               sx: {
          //                 backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
          //                 opacity: 0.9
          //               }
          //             }
          //           }}
          //           title="View Roster"
          //         >
          //           <IconButton color="secondary" onClick={() => handleViewClick(row.original)}>
          //             <Eye />
          //           </IconButton>
          //         </Tooltip>

          //         <Tooltip
          //           componentsProps={{
          //             tooltip: {
          //               sx: {
          //                 backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
          //                 opacity: 0.9
          //               }
          //             }
          //           }}
          //           title="Delete"
          //         >
          //           <IconButton
          //             color="error"
          //             onClick={() => {
          //               setRemove(true);
          //               setDeleteID(row.original._id);
          //             }}
          //           >
          //             <Trash />
          //           </IconButton>
          //         </Tooltip>
          //       </Stack>
          //     );
          //   }
          // }
          Cell: ({ row }) => {
            const isVisited = row.original.isVisited;

            const getChip = () => {
              switch (isVisited) {
                case 1:
                  return (
                    <Chip
                      color="success"
                      label="View Roster"
                      size="small"
                      variant="light"
                      onClick={() => handleViewClick(row.original)}
                      sx={{
                        ':hover': {
                          backgroundColor: 'rgba(0, 255, 5, 0.3)',
                          cursor: 'pointer'
                        }
                      }}
                    />
                  );
                case 0:
                  return (
                    <Chip
                      color="info"
                      label="Generate Roster"
                      size="small"
                      variant="light"
                      onClick={() => handleMapClick(row.original)}
                      sx={{
                        ':hover': {
                          backgroundColor: 'rgba(0, 255, 255, 0.3)',
                          cursor: 'pointer'
                        }
                      }}
                    />
                  );
                case 2:
                  return <Chip color="error" label="Invalid File" size="small" variant="light" />;
                default:
                  return null; // Return null if isVisited doesn't match any case
              }
            };

            return getChip();
          }
        }
      ];
    },
    [navigate] // Use 'navigate' as a dependency
  );
  useEffect(() => {
    const fetchRosterTemplate = async () => {
      const response = await axiosServices.get('/tripData/list/roster/settings');
      setTemplates(response.data.data.RosterTemplates);
    };
    fetchRosterTemplate();
  }, []);

  const [open, setOpen] = useState(false);

  const handleClickOpen = (rowData) => {
    setFileData(rowData);
    console.log({ rowData });
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    setSelectedValue(value);
    setIsReadyToNavigate(true); // trigger navigation once states are updated
  };

  useEffect(() => {
    if (openTemplate && fileInfo) handleClickOpen(fileInfo);
  }, []);
  useEffect(() => {
    if (fileData && selectedValue && isReadyToNavigate) {
      // Both states are updated, now navigate to the next page
      navigate('/apps/roster/preview', { state: { fileData, selectedValue } });
    }
  }, [fileData, selectedValue, isReadyToNavigate, navigate]);

  return (
    <>
      {data.length === 0 ? (
        <EmptyTableWithoutButton />
      ) : (
        <>
          <Stack direction={'row'} spacing={1} justifyContent="flex-end" alignItems="center" sx={{ p: 0, pb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <WrapperButton moduleName={MODULE.ROSTER} permission={PERMISSIONS.CREATE}>
                <Button
                  variant="contained"
                  startIcon={<Add />} // Show loading spinner if loading
                  onClick={handleFileUploadOpen}
                  size="small"
                  // color="info"
                  color="inherit"
                >
                  {/* {loading ? 'Loading...' : 'Add Branch'} */}
                  {'Upload File'}
                </Button>
              </WrapperButton>

              <WrapperButton moduleName={MODULE.ROSTER} permission={PERMISSIONS.CREATE}>
                <Button
                  variant="contained"
                  startIcon={<Add />} // Show loading spinner if loading
                  onClick={() => openDrawer()}
                  size="small"
                  color="success"
                >
                  {/* {loading ? 'Loading...' : 'Add Branch'} */}
                  {'Create Template'}
                </Button>
              </WrapperButton>
            </Stack>
          </Stack>
          <MainCard content={false}>
            <ScrollX>
              <ReactTable columns={columns} data={data} />
            </ScrollX>
          </MainCard>
          <div style={{ marginTop: '10px' }}>
            <PaginationBox pageIndex={page} gotoPage={setPage} pageSize={limit} setPageSize={setLimit} lastPageIndex={lastPageNo} />
          </div>
        </>
      )}

      <RosterTemplateDialog selectedValue={selectedValue} open={open} onClose={handleClose} templates={templates} />
    </>
  );
};

RosterFileTable.propTypes = {
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

export default RosterFileTable;

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
