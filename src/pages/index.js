/* eslint-disable no-unused-vars */
// material-ui
import { Grid, Stack, Typography } from '@mui/material';

// project-imports
import { useTheme } from '@mui/material/styles';
import ReportCard from 'components/cards/statistics/ReportCard';
import MainCard from 'components/MainCard';
import { AlignBottom, Autonio, Car, Driver, User, UserSquare } from 'iconsax-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchDashboardData } from 'store/slice/cabProvidor/dashboardSlice';
import { fetchAllRoles } from 'store/slice/cabProvidor/roleSlice';

import HoverSocialCard from 'components/cards/statistics/HoverSocialCard';
import ReactTable, { TableNoDataMessage } from 'components/tables/reactTable1/ReactTable';
import { Gps } from 'iconsax-react';
import { useSelector } from 'store';
import { fetchAllVehicleTypes, fetchAllVehicleTypesForAll } from 'store/slice/cabProvidor/vehicleTypeSlice';
import { fetchZoneNames } from 'store/slice/cabProvidor/ZoneNameSlice';
import { fetchAllZoneTypes } from 'store/slice/cabProvidor/zoneTypeSlice';
import { GiReceiveMoney } from 'react-icons/gi';
import { RiMoneyRupeeCircleFill } from 'react-icons/ri';
import { GiPayMoney } from 'react-icons/gi';

import { GiTakeMyMoney } from 'react-icons/gi';
import CustomCircularLoader from 'components/CustomCircularLoader';
import useDateRange, { TYPE_OPTIONS } from 'hooks/useDateRange';
import DateRangeSelect from 'components/DateRange/DateRangeSelect';
import moment from 'moment';
import { formatDateForApi, formatDateUsingMoment } from 'utils/helper';
import { fetchAccountSettings } from 'store/slice/cabProvidor/accountSettingSlice';
import ScrollX from 'components/ScrollX';

// ==============================|| SAMPLE PAGE ||============================== //

const Dashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  // const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);
  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  // console.log('range', range);
  // console.log('prevRange', prevRange);

  const loading = useSelector((state) => state.dashboard.loading);
  const dashboardData = useSelector((state) => state.dashboard.data);
  console.log('dashboardData', dashboardData);

  const companyWiseEarningsData = useSelector((state) => state.dashboard.companyData);
  console.log('companyWiseEarningsData', companyWiseEarningsData);

  useEffect(() => {
    dispatch(fetchAllVehicleTypesForAll());
    dispatch(fetchAllRoles());
    dispatch(fetchAllVehicleTypes());
    dispatch(fetchZoneNames());
    dispatch(fetchAllZoneTypes());
    dispatch(fetchAccountSettings());
  }, [dispatch]);

  useEffect(() => {
    /** DESC :
     *    Payload object passed to the API, ensuring `startDate` and `endDate`
     *    are formatted as strings in the "YYYY-MM-DD" format using `formatDateUsingMoment`.
     */
    const payload = {
      startDate: formatDateUsingMoment(startDate),
      endDate: formatDateUsingMoment(endDate)
    };

    /** DESC :
     *    Payload object to be sent to the API, with `startDate` and `endDate`
     *    formatted as ISO 8601 strings (e.g., 'YYYY-MM-DDTHH:mm:ss') using `formatDateForApi`.
     */
    const payload2 = {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate)
    };

    console.log('payload = ', payload);
    console.log('payload2 = ', payload2);

    // alert(JSON.stringify(payload2, null, 2));

    dispatch(fetchDashboardData(payload));
  }, [dispatch, startDate, endDate]);

  const token = localStorage.getItem('serviceToken') || '';

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
        Header: 'Company Name',
        accessor: 'company_Name',
        Cell: ({ value }) => value || 'N/A'
      },
      {
        Header: 'Total Route',
        accessor: 'totalRoute',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Total Company Revenue',
        accessor: 'totalCompanyRevenue',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Total Vendor Revenue',
        accessor: 'totalVendRevenue',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Total Driver Revenue',
        accessor: 'totalDriverRevenue',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      },
      {
        Header: 'Net Profit',
        accessor: 'netProfit',
        Cell: ({ value }) => (value === null || value === undefined ? 'N/A' : value)
      }
    ],
    []
  );

  // return (
  //   <>
  //     <Stack gap={2}>
  //       <MainCard title="Sample Card">
  //         <Typography variant="body1">
  //           Do you Know? Able is used by more than 2.4K+ Customers worldwide. This new v9 version is the major release of Able Pro Dashboard
  //           Template with having brand new modern User Interface.
  //         </Typography>
  //       </MainCard>

  //       <MainCard
  //         title="Token"
  //         content={false}
  //         secondary={
  //           <CopyToClipboard
  //             text={token}
  //             onCopy={() =>
  //               dispatch(
  //                 openSnackbar({
  //                   open: true,
  //                   message: 'Token Copied',
  //                   variant: 'alert',
  //                   alert: {
  //                     color: 'success'
  //                   },
  //                   close: false,
  //                   anchorOrigin: { vertical: 'top', horizontal: 'right' },
  //                   transition: 'SlideLeft'
  //                 })
  //               )
  //             }
  //           >
  //             <Tooltip title="Copy">
  //               <IconButton size="large">
  //                 <Copy />
  //               </IconButton>
  //             </Tooltip>
  //           </CopyToClipboard>
  //         }
  //       ></MainCard>
  //     </Stack>
  //   </>
  // );

  if (loading || !dashboardData) return <CustomCircularLoader />;

  return (
    <>
      <Stack gap={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4"></Typography>
          <DateRangeSelect
            startDate={startDate}
            endDate={endDate}
            selectedRange={range}
            prevRange={prevRange}
            setSelectedRange={setRange}
            onRangeChange={handleRangeChange}
            showSelectedRangeLabel
          />
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <ReportCard
              primary={`${dashboardData?.totalCompanies}`}
              secondary="Total Companies"
              color={theme.palette.secondary.main}
              iconPrimary={AlignBottom}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ReportCard
              primary={`${dashboardData?.totalVendors}`}
              secondary="Total Vendors"
              color={theme.palette.secondary.main}
              iconPrimary={UserSquare}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ReportCard
              primary={`${dashboardData?.totalVehicles}`}
              secondary="Total Vehicles"
              color={theme.palette.secondary.main}
              iconPrimary={Car}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ReportCard
              primary={`${dashboardData?.totalDriver}`}
              secondary="Total Drivers"
              color={theme.palette.secondary.main}
              iconPrimary={Driver}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ReportCard
              primary={`${dashboardData?.totalZone}`}
              secondary="Total Zones"
              color={theme.palette.secondary.main}
              iconPrimary={Autonio}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ReportCard
              primary={`${dashboardData?.totalUsers}`}
              secondary="Total Users"
              color={theme.palette.secondary.main}
              iconPrimary={User}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ReportCard
              primary={`${dashboardData?.totalRoster}`}
              secondary="Total Roster"
              color={theme.palette.secondary.main}
              iconPrimary={Gps}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <HoverSocialCard
              primary="Total Routes"
              secondary={`${dashboardData?.totalRoute}`}
              color={theme.palette.primary.main}
              iconPrimary={Gps}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <HoverSocialCard
              primary="Total Revenue Of Company"
              secondary={`₹ ${dashboardData?.totalRevenueOfCompany}`}
              color={theme.palette.info.main}
              iconPrimary={GiReceiveMoney}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <HoverSocialCard
              primary="Total Revenue Of Vendor"
              secondary={`₹ ${dashboardData?.totalRevenueOfVendor}`}
              color={theme.palette.warning.main}
              iconPrimary={GiPayMoney}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <HoverSocialCard
              primary="Total Revenue Of Driver"
              secondary={`₹ ${dashboardData?.totalRevenueOfDriver}`}
              color={'#D8125B'}
              iconPrimary={RiMoneyRupeeCircleFill}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <HoverSocialCard
              primary="Profit"
              secondary={`₹ ${dashboardData?.profit}`}
              color={theme.palette.secondary.dark}
              iconPrimary={GiTakeMyMoney}
            />
          </Grid>
        </Grid>

        <MainCard title="Company Wise Recent Earnings">
          {companyWiseEarningsData?.length > 0 ? (
            <ScrollX>
              <ReactTable columns={columns} data={companyWiseEarningsData} hideHeader />
            </ScrollX>
          ) : (
            <TableNoDataMessage text="Company Wise Recent Earnings Not Found" />
          )}
        </MainCard>
      </Stack>
    </>
  );
};

export default Dashboard;
