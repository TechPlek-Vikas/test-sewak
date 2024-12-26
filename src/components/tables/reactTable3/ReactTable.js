/* eslint-disable no-unused-vars */
import { Stack, Table, TableBody, TableCell, TableHead, TableRow, useMediaQuery } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ScrollX from 'components/ScrollX';
import { HeaderSort, TablePagination } from 'components/tables/reactTable2/ReactTable';
import PropTypes from 'prop-types';
import { Fragment, useMemo } from 'react';
import { useExpanded, useFilters, useGlobalFilter, usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { renderFilterTypes } from 'utils/react-table';

function ReactTable({ columns, data }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const filterTypes = useMemo(() => renderFilterTypes, []);
  const sortBy = { id: 'id', desc: false };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    gotoPage,
    setPageSize,
    state: { globalFilter, pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      filterTypes,
      initialState: {
        pageIndex: 0,
        pageSize: 5,
        hiddenColumns: ['_id'],
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
        <ScrollX>
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
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </ScrollX>
        <TableCell sx={{ pb: 2 }} colSpan={12}>
          <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
        </TableCell>
      </Stack>
    </>
  );
}

export default ReactTable;

ReactTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  getHeaderProps: PropTypes.func
};
