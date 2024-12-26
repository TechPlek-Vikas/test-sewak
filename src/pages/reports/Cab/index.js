import { Autocomplete, Box, Button, Stack } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { useSelector, dispatch } from 'store';
import Analytic from './Analytic';
import Table from './Table';
import DateRangeSelect from 'pages/trips/filter/DateFilter';
import useDateRange, { TYPE_OPTIONS } from 'hooks/useDateRange';
import { formatDateForApi, formatDateUsingMoment } from 'utils/helper';
import { fetchCabWiseReports } from 'store/slice/cabProvidor/reportSlice';
import CustomCircularLoader from 'components/CustomCircularLoader';
import { DocumentDownload } from 'iconsax-react';
import axios from 'utils/axios';
import MultipleAutocomplete from 'components/autocomplete/MultipleAutocomplete';
import CompanySelection from 'SearchComponents/CompanySelectionAutocomplete';
import VehicleSelection from 'SearchComponents/VehicleSelectionAutoComplete';
import { downloadCabWiseReport } from '../utils/DownloadCabWIserReport';
import TableSkeleton from 'components/tables/TableSkeleton';
import VendorSelection from 'SearchComponents/VendorSelectionAutoComplete';
import WrapperButton from 'components/common/guards/WrapperButton';
import { MODULE, PERMISSIONS } from 'constant';

const CabReports = () => {
  const [cab, setCab] = useState(null);
  const [selectedCab, setSelectedCab] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState([]);

  const { loading, cabReportData } = useSelector((state) => state.report);

  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  useEffect(() => {
    let cabID = null;
    if (selectedCab.length > 0) {
      cabID = selectedCab.map((cab) => cab._id);
    }

    const selectedVendorID = selectedVendor.map((vendor) => vendor.vendorId);

    const payload = {
      data: {
        startDate: formatDateUsingMoment(startDate),
        endDate: formatDateUsingMoment(endDate),
        vehicleIDs: cabID || [],
        vendorIds: selectedVendorID || []
      }
    };

    dispatch(fetchCabWiseReports(payload));
  }, [startDate, endDate, selectedCab, selectedVendor]);

  const downloadReports = useCallback(() => {
    console.log('Data = ', cabReportData);
    downloadCabWiseReport(cabReportData, 'cabWiseReport');
  }, [cabReportData]);

  return (
    <>
      <Stack gap={1}>
        {/* Filter */}
        <Stack direction={'row'} justifyContent={'Space-between'} gap={2} alignItems={'center'}>
          <Stack direction={'row'} gap={2} alignItems={'center'}>
            {/* Vehicle Filter */}
            <Box sx={{ minWidth: '300px' }}>
              <VehicleSelection value={selectedCab} setSelectedOptions={setSelectedCab} sx={{ minWidth: '300px', maxWidth: '600px' }} />
            </Box>
            <Box sx={{ minWidth: '300px' }}>
              {/* Vendor Filter */}
              <VendorSelection
                value={selectedVendor}
                setSelectedOptions={setSelectedVendor}
                sx={{ minWidth: '300px', maxWidth: '600px' }}
              />
            </Box>
          </Stack>

          <Stack direction={'row'} gap={2}>
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

            {/* Download Report */}
            <WrapperButton moduleName={MODULE.REPORT} permission={PERMISSIONS.CREATE}>
              <Button
                variant="contained"
                startIcon={<DocumentDownload />}
                color="secondary"
                onClick={downloadReports}
                size="medium"
                title="Download Report"
                disabled={loading}
              >
                Download Report
              </Button>
            </WrapperButton>
          </Stack>
        </Stack>

        {/* Main Part */}
        <Stack spacing={2}>
          {/* Analytic */}
          <Analytic />

          {/* Table */}
          {loading ? <TableSkeleton rows={10} columns={6} /> : <Table />}
        </Stack>
      </Stack>
    </>
  );
};

export default CabReports;
