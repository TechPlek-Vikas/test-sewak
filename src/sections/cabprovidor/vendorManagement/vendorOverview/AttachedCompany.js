import PropTypes from 'prop-types';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  AppBar,
  Dialog,
  DialogTitle,
  IconButton,
  Skeleton,
  Slide,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';

// third-party
import { useTable } from 'react-table';

// project-imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Avatar from 'components/@extended/Avatar';

import makeData from 'data/react-table';
import mockData from 'utils/mock-data';

// assets
import { Add, Eye } from 'iconsax-react';
import { ThemeMode } from 'config';
import ReactTable, { TableNoDataMessage } from 'components/tables/reactTable1/ReactTable';
import { CSVExport } from 'components/tables/reactTable2/ReactTable';
import VendorRateTable from 'pages/management/vendor/vendorRate/VendorRateTable';
import axiosServices from 'utils/axios';
import TableSkeleton from 'components/tables/TableSkeleton';
import EmptyTableDemo from 'components/tables/EmptyTable';

const avatarImage = require.context('assets/images/users', true);
const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

// ==============================|| SUB TABLE ||============================== //

function ReactSubTable({ columns, data, loading }) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data
  });

  if (loading) {
    return (
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <TableCell key={column} {...column.getHeaderProps()}>
                  {column.render('Header')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {[0, 1, 2].map((item) => (
            <TableRow key={item}>
              {[0, 1, 2, 3, 4, 5].map((col) => (
                <TableCell key={col}>
                  <Skeleton animation="wave" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
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
        {rows.map((row) => {
          prepareRow(row);
          return (
            <TableRow key={row} {...row.getRowProps()}>
              {row.cells.map((cell) => (
                <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])}>
                  {cell.render('Cell')}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

ReactSubTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  loading: PropTypes.bool
};

// ==============================|| SUB ROW - ASYNC DATA ||============================== //

function SubRowAsync() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const numRows = mockData(1);

  const columns = useMemo(
    () => [
      {
        Header: 'Avatar',
        accessor: 'avatar',
        className: 'cell-center',
        Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarImage(`./avatar-${value}.png`)} />
      },
      {
        Header: 'Name',
        accessor: 'fatherName'
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Role',
        accessor: 'role'
      },
      {
        Header: 'Contact',
        accessor: 'contact',
        className: 'cell-right'
      },
      {
        Header: 'Country',
        accessor: 'country'
      }
    ],
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(makeData(numRows.number.status(1, 5)));
      setLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line
  }, []);

  const backColor = alpha(theme.palette.primary.lighter, 0.1);

  return (
    <TableRow sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` } }}>
      <TableCell colSpan={8} sx={{ p: 2.5 }}>
        <MainCard
          title="Sub Table"
          secondary={<CSVExport data={data} filename={'expanded-sub-table-data.csv'} />}
          content={false}
          sx={{ ml: { xs: 2.5, sm: 5, md: 6, lg: 10, xl: 12 } }}
        >
          <ReactSubTable columns={columns} data={data} loading={loading} />
        </MainCard>
      </TableCell>
    </TableRow>
  );
}

SubRowAsync.propTypes = {
  value: PropTypes.string
};

// ==============================|| REACT TABLE - EXPANDING SUB TABLE ||============================== //

const AttachedCompany = ({ vendorId }) => {
  const [open, setOpen] = useState(false); // State to manage popup
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [vendorList, setVendorList] = useState([]);
  const [updateKey, setUpdateKey] = useState(0);
  const [vendorData, setVendorData] = useState(null);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  //  useEffect: Fetch assigned companies to a vendor by vendor Id

  useEffect(() => {
    if (vendorId) {
      const fetchCompanyData = async () => {
        try {
          const response = await axiosServices.get(`/vendor/companies?vendorId=${vendorId}`);

          if (response.status === 200) {
            setVendorData(response.data.data);
            setLoading(false);
          }

          // Handle the response as needed
        } catch (error) {
          console.error('Error fetching company data:', error);
        }
      };

      fetchCompanyData();
    }
  }, [vendorId]);

  //  useEffect: Fetch rates between vendor and company through companyId and vendorId

  useEffect(() => {
    const fetchdata = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axiosServices.get(`/cabRateMaster/unwind/rate/vendorId?vendorId=${vendorId}&companyID=${companyId}`);
        setVendorList(response.data.data);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false); // Stop loading regardless of success or error
      }
    };

    if (!companyId || !vendorId) return;

    fetchdata();
  }, [vendorId, companyId, updateKey]);

  const columns = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        className: 'cell-center',
        Cell: ({ row }) => <span>{row.index + 1}</span> // Use row.index to display incremental number
      },
      {
        Header: 'Company Name',
        accessor: 'company_name',
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Company Email',
        accessor: 'company_email',
        Cell: ({ value }) => value || 'N/A'
      },

      {
        Header: 'Mobile Number',
        accessor: 'mobile',
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Address',
        accessor: 'address',
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'View Rate',
        className: 'cell-left',
        disableSortBy: true,
        Cell: ({ row }) => {
          const theme = useTheme();
          const mode = theme.palette.mode;
          return (
            <Stack direction="row" alignItems="left" justifyContent="left" spacing={0}>
              <Tooltip
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
                    handleOpen();
                    setCompanyId(row.original._id);
                    setCompanyName(row.original.company_name);
                  }}
                >
                  <Eye />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    []
  );

  // const renderRowSubComponent = useCallback(() => <SubRowAsync />, []);

  return (
    <>
      <MainCard title="Attached Companies List" content={false}>
        <ScrollX>
          {loading ? (
            <TableSkeleton rows={10} columns={6} />
          ) : vendorData.length > 0 ? (
            <ReactTable columns={columns} data={vendorData} hideHeader />
          ) : (
            <EmptyTableDemo />
          )}
        </ScrollX>
      </MainCard>

      {companyId && open && (
        <Dialog
          fullScreen
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="md"
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          TransitionComponent={Transition}
        >
          <AppBar sx={{ position: 'relative', boxShadow: 'none' }}>
            <DialogTitle id="alert-dialog-title">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Vendor Rates with {companyName}</Typography>
                <IconButton onClick={handleClose} color="inherit" aria-label="close">
                  <Add style={{ transform: 'rotate(45deg)' }} />
                </IconButton>
              </Stack>
            </DialogTitle>
          </AppBar>

          <VendorRateTable data={vendorList} updateKey={updateKey} setUpdateKey={setUpdateKey} loading={loading} />
        </Dialog>
      )}
    </>
  );
};

AttachedCompany.propTypes = {
  data: PropTypes.array,
  row: PropTypes.object,
  isExpanded: PropTypes.bool,
  getToggleRowExpandedProps: PropTypes.func,
  value: PropTypes.string
};

export default AttachedCompany;
