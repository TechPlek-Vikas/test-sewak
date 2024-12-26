import PropTypes from 'prop-types';
import { alpha, Stack, Table, TableBody, TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { Fragment, useMemo } from 'react';
import { useExpanded, useFilters, useGlobalFilter, usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import EmptyTableDemo from 'components/tables/EmptyTable';
import TableSkeleton from 'components/tables/TableSkeleton';
import { HeaderSort, TablePagination } from 'components/third-party/ReactTable';
import { renderFilterTypes } from 'utils/react-table';

const CompanyRateReactTable = ({ data, page, setPage, limit, setLimit, loading }) => {

  const columns = useMemo(
    () => [
      {
        Header: 'Zone Name',
        accessor: 'zoneNameID.zoneName',
         Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Zone Type',
        accessor: 'zoneTypeID.zoneTypeName',
        Cell: ({ row }) => row.original.zoneTypeID?.zoneTypeName ?? 'N/A'
      },
      {
        Header: 'Vehicle Type',
        accessor: (row) => row.VehicleTypeName?.vehicleTypeName || 'N/A'
      },
      {
        Header: 'Amount',
        accessor: 'cabAmount.amount',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Dual Trip Amount',
        accessor: 'dualTripAmount.amount',
        dataType: 'text',
        Cell: ({ row }) => row.original.dualTripAmount?.amount ?? 'N/A'
      },
      {
        Header: 'Guard Price',
        accessor: 'guardPrice',
        dataType: 'text',
        Cell: ({ row }) => {
          const guardValue = row.original.guard;
          return guardValue === 0 ? '0' : row.original.guardPrice;
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
      </Stack>
    </>
  );
};

CompanyRateReactTable.propTypes = {
  data: PropTypes.array,
  row: PropTypes.object,
  isExpanded: PropTypes.bool,
  getToggleRowExpandedProps: PropTypes.func,
  value: PropTypes.string,
  page: PropTypes.number,
  setPage: PropTypes.func,
  limit: PropTypes.number,
  setLimit: PropTypes.func
};

export default CompanyRateReactTable;

// ==============================|| REACT TABLE ||============================== //

function ReactTable({
  columns,
  data,
  renderRowSubComponent,
}) {
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
    state: { pageIndex, pageSize, expanded },
  } = useTable(
    {
      columns,
      data,
      filterTypes,
      initialState: {
        pageIndex: 0,
        pageSize: 10,
        hiddenColumns: ['_id', 'zoneDescription'],
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
