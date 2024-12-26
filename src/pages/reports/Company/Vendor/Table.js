import { Button, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import EmptyTableDemo from 'components/tables/EmptyTable';
import { TableNoDataMessage } from 'components/tables/reactTable1/ReactTable';
import ReactTable from 'components/tables/reactTable3/ReactTable';
import { IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DocumentDownload } from 'iconsax-react';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'store';

const Table = () => {
  const { companyReportData } = useSelector((state) => state.report);
  const columns = useMemo(
    () => [
      // {
      //   title: 'Row Selection',
      //   Header: ({ getToggleAllPageRowsSelectedProps }) => <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} />,
      //   accessor: 'selection',
      //   Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
      //   disableSortBy: true,
      //   disableFilters: true
      // },
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
        // disableSortBy: true
      },
      {
        Header: 'Trip Count',
        accessor: 'tripCount',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
        // disableSortBy: true
      },
      // {
      //   Header: 'Company Guard Price',
      //   accessor: 'companyGuardPrice'
      //   // disableSortBy: true
      // },
      // {
      //   Header: 'Company Rate',
      //   accessor: 'companyRate'
      //   // disableSortBy: true
      // },
      // {
      //   Header: 'Company Penalty',
      //   accessor: 'companyPenalty'
      //   // disableSortBy: true
      // },
      {
        Header: 'Vendor Rate',
        accessor: 'vendorRate',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
        // disableSortBy: true
      },
      {
        Header: 'Vendor Guard Price',
        accessor: 'vendorGuardPrice',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
        // disableSortBy: true
      },
      {
        Header: 'Vendor Penalty',
        accessor: 'vendorPenalty',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
        // disableSortBy: true
      },
      // {
      //   Header: 'Driver Guard Price',
      //   accessor: 'driverGuardPrice'
      //   // disableSortBy: true
      // },
      // {
      //   Header: 'Driver Rate',
      //   accessor: 'driverRate'
      //   // disableSortBy: true
      // },
      // {
      //   Header: 'Driver Penalty',
      //   accessor: 'driverPenalty'
      //   // disableSortBy: true
      // },
      {
        Header: 'Add On Rate',
        accessor: 'addOnRate',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
        // disableSortBy: true
      },
      {
        Header: 'MCD Charge',
        accessor: 'mcdCharge',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
        // disableSortBy: true
      },
      {
        Header: 'Toll Charge',
        accessor: 'tollCharge',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
        // disableSortBy: true
      }
    ],
    []
  );
  return (
    <>
      {companyReportData && companyReportData.length > 0 ? (
        <MainCard content={false}>
          <Stack gap={2}>
            <ReactTable columns={columns} data={companyReportData} />
          </Stack>
        </MainCard>
      ) : (
        <EmptyTableDemo />
      )}
    </>
  );
};

export default Table;
