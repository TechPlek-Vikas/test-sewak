import PropTypes from 'prop-types';
import { Chip, Table, TableBody, TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { Fragment, useMemo } from 'react';
import { useExpanded, useSortBy, useTable } from 'react-table';
import PaginationBox from 'components/tables/Pagination';
import { HeaderSort } from 'components/third-party/ReactTable';

const Transaction = ({ data, page, setPage, limit, setLimit, lastPageNo }) => {
  const theme = useTheme();

  const columns = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        className: 'cell-center',
        Cell: ({ row }) => <span>{row.index + 1}</span>
      },
      {
        Header: 'Date',
        accessor: 'startDate',
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Invoice Number',
        accessor: 'invoiceNumber',
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Balance Due',
        accessor: 'balanceDue',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => {
          switch (value) {
            case 'Active':
              return <Chip color="success" label="Active" size="small" variant="light" />;
            case 'Inactive':
              return <Chip color="error" label="Inactive" size="small" variant="light" />;
            default:
              return <Chip color="info" label="Single" size="small" variant="light" />;
          }
        }
      }
    ],
    [theme]
  );

  return (
    <>
      {/* <Stack direction={'row'} spacing={1} justifyContent="flex-end" alignItems="center" sx={{ p: 0, pb: 3 }}>
        <Button variant="contained" startIcon={<Add />} onClick={handleZone} size="small">
          Add Zone
        </Button>
      </Stack> */}
      <MainCard content={false}>
        <ScrollX>
          <ReactTable columns={columns} data={data} />
        </ScrollX>
      </MainCard>
      <div style={{ marginTop: '20px' }}>
        <PaginationBox pageIndex={page} gotoPage={setPage} pageSize={limit} setPageSize={setLimit} lastPageIndex={lastPageNo} />
      </div>
    </>
  );
};

Transaction.propTypes = {
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

export default Transaction;

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns: userColumns, data }) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns: userColumns,
      data,
      initialState: {
        hiddenColumns: ['_id', 'zoneDescription']
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
