import PropTypes from 'prop-types';
import { Grid, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'store';
import { ApexPieChart } from 'pages/reports/components/ApexPieChart';
import Badge from 'pages/reports/components/Badge';
import Card from 'pages/reports/components/Card';

const labels = [
  'Company Rate',
  'Company Guard Price',
  'Company Penalty',
  'Vendor Rate',
  'Vendor Guard Price',
  'Vendor Penalty',
  'Driver Rate',
  'Driver Guard Price',
  'Driver Penalty',
  'Add On Rate',
  'Toll Charge',
  'MCD Charge'
];

const labelsMapping = {
  'Company Rate': 'companyRate',
  'Company Guard Price': 'companyGuardPrice',
  'Company Penalty': 'companyPenalty',
  'Driver Rate': 'driverRate',
  'Driver Guard Price': 'driverGuardPrice',
  'Driver Penalty': 'driverPenalty',
  'Vendor Rate': 'vendorRate',
  'Vendor Guard Price': 'vendorGuardPrice',
  'Vendor Penalty': 'vendorPenalty',
  'Add On Rate': 'addOnRate',
  'Toll Charge': 'tollCharge',
  'MCD Charge': 'mcdCharge'
};

const Analytic = () => {
  const [overAllData, setOverAllData] = useState({
    advanceCount: 0,
    requestedAmount: 0,
    approvedAmount: 0,
    potentialDifference: 0,
    totalRevenue: 0
  });

  const { advanceReportData } = useSelector((state) => state.report);
  console.log({ overAllData });
  useEffect(() => {
    if (advanceReportData) {
      const totals = advanceReportData.reduce(
        (acc, item) => ({
          advanceCount: acc.advanceCount + 1, // Increment count
          requestedAmount: acc.requestedAmount + (item?.requestedAmount || 0), // Fallback to 0
          approvedAmount: acc.approvedAmount + (item?.approvedAmount || 0), // Fallback to 0
          potentialDifference:
            acc.potentialDifference +
            ((item?.requestedAmount || 0) * (item?.advanceTypeId?.interestRate || 0)) / 100 -
            ((item?.approvedAmount || 0) * (item?.advanceTypeId?.interestRate || 0)) / 100, // Fallback for all terms
          totalRevenue: acc.totalRevenue + ((item?.approvedAmount || 0) * (item?.advanceTypeId?.interestRate || 0)) / 100 // Fallback for approvedAmount and interestRate
        }),
        {
          advanceCount: 0,
          requestedAmount: 0,
          approvedAmount: 0,
          potentialDifference: 0,
          totalRevenue: 0
        }
      );

      setOverAllData(totals);
    }
  }, [advanceReportData]);

  return (
    <>
      <Stack gap={2}>
        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {[
            { title: 'Total Advances', count: overAllData.advanceCount },
            { title: 'Requested Amount', count: overAllData.requestedAmount, currency: true },
            { title: 'Approved Amount', count: overAllData.approvedAmount, currency: true },
            { title: 'Potential Difference', count: overAllData.potentialDifference, currency: true },
            {
              title: 'Total Revenue',
              count: overAllData.totalRevenue,
              currency: true
            }
          ].map((cardData, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <Card title={cardData.title} count={cardData.count} currency={cardData.currency} />
            </Grid>
          ))}
        </Grid>

        {/* <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <ApexPieChart labels={labels} series={data} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Grid container spacing={3}>
              {labels.map((item, i) => (
                <Grid item key={i} xs={12} sm={6} md={4}>
                  <Badge title={item} count={chartData[labelsMapping[item]]} currency />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid> */}
      </Stack>
    </>
  );
};

export default Analytic;
