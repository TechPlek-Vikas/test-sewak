import { Box, Button, Stack } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { useSelector, dispatch } from 'store';
import Analytic from './Analytic';
import Table from './Table';
import DateRangeSelect from 'pages/trips/filter/DateFilter';
import useDateRange, { TYPE_OPTIONS } from 'hooks/useDateRange';
import { formatDateUsingMoment } from 'utils/helper';
import { fetchAdvanceReports } from 'store/slice/cabProvidor/reportSlice';
import { DocumentDownload } from 'iconsax-react';
import VehicleSelection from 'SearchComponents/VehicleSelectionAutoComplete';
import { downloadCabWiseReport } from '../utils/DownloadCabWIserReport';
import TableSkeleton from 'components/tables/TableSkeleton';

const TripReports = () => {
  const [selectedCab, setSelectedCab] = useState([]);

  const { loading, advanceReportData } = useSelector((state) => state.report);

  console.log({advanceReportData})
  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  useEffect(() => {
    let cabID = null;
    if (selectedCab.length > 0) {
      cabID = selectedCab.map((cab) => cab._id);
    }

    const payload = {
      query: {
        startDate: formatDateUsingMoment(startDate),
        endDate: formatDateUsingMoment(endDate)
      },
      body: {
        cabID
      }
    };

    dispatch(fetchAdvanceReports(payload));
  }, [startDate, endDate, selectedCab]);

  const downloadReports = useCallback(() => {
    console.log('Data = ', advanceReportData);
    downloadCabWiseReport(advanceReportData,"cabWiseReport")
  }, [advanceReportData]);


  return (
    <>
      <Stack gap={1}>
        {/* Filter */}
        <Stack direction={'row'} justifyContent={'Space-between'} gap={2} alignItems={'center'}>
          {/* vehicle Filter */}

          <Stack>
            <Box sx={{ minWidth: '300px' }}>
              {/* <VehicleSelection value={selectedCab} setSelectedOptions={setSelectedCab} sx={{ minWidth: '300px',maxWidth: '600px' }} /> */}
            </Box>
          </Stack>

          <Stack direction={'row'} gap={2}>
            {/* Download Report */}

            {/* Date Filter */}
            <DateRangeSelect
              startDate={startDate}
              endDate={endDate}
              selectedRange={range}
              prevRange={prevRange}
              setSelectedRange={setRange}
              onRangeChange={handleRangeChange}
              showSelectedRangeLabel
            />
            <Button
              variant="contained"
              startIcon={<DocumentDownload />}
              color="secondary"
              onClick={downloadReports}
              size="medium"
              title="Download Report"
            >
              Download Report
            </Button>
          </Stack>
        </Stack>

        {/* Main Part */}
        <Stack spacing={2}>
          {/* Analytic */}
          <Analytic />

          {/* Table */}
          {loading ?  <TableSkeleton rows={10} columns={6} /> : <Table />}
        </Stack>
      </Stack>
    </>
  );
};

export default TripReports;
