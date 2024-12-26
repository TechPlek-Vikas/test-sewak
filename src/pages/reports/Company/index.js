import { Autocomplete, Box, Button, Stack } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { useSelector, dispatch } from 'store';
import Analytic from './Analytic';
import Table from './Table';
import DateRangeSelect from 'pages/trips/filter/DateFilter';
import useDateRange, { TYPE_OPTIONS } from 'hooks/useDateRange';
import { formatDateForApi, formatDateUsingMoment } from 'utils/helper';
import { fetchCompanyWiseReports } from 'store/slice/cabProvidor/reportSlice';
import CustomCircularLoader from 'components/CustomCircularLoader';
import { DocumentDownload } from 'iconsax-react';
import axios from 'utils/axios';
import MultipleAutocomplete from 'components/autocomplete/MultipleAutocomplete';
import CompanySelection from 'SearchComponents/CompanySelectionAutocomplete';
import { minWidth } from '@mui/system';
import TableSkeleton from 'components/tables/TableSkeleton';
import { downloadCompanyWiseReport } from '../utils/DownloadCompanyWiseReport';
import { downloadCabWiseReport } from '../utils/DownloadCabWIserReport';
import WrapperButton from 'components/common/guards/WrapperButton';
import { MODULE, PERMISSIONS } from 'constant';

const CompanyReports = () => {
  const [company, setCompany] = useState(null);
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const { loading, companyReportData } = useSelector((state) => state.report);

  const { startDate, endDate, range, setRange, handleRangeChange, prevRange } = useDateRange(TYPE_OPTIONS.LAST_30_DAYS);

  useEffect(() => {
    console.log({ selectedCompanies });

    let companyID = null;
    if (selectedCompanies.length > 0) {
      companyID = selectedCompanies.map((company) => company._id);
    }
    const payload = {
      data: {
        startDate: formatDateUsingMoment(startDate),
        endDate: formatDateUsingMoment(endDate),
        companyId: companyID
      }
    };

    dispatch(fetchCompanyWiseReports(payload));
  }, [startDate, endDate, selectedCompanies]);

  // useEffect(() => {
  //   const fetchCompanyData = async () => {
  //     try {
  //       const response = await axios.get('/company/all');
  //       setCompany(response.data.companies);
  //     } catch (error) {
  //       console.error('Error fetching company data:', error);
  //     }
  //   };
  //   fetchCompanyData();
  // }, []);

  const downloadReports = useCallback(() => {
    console.log('Data = ', companyReportData);
    downloadCompanyWiseReport(companyReportData, 'companyWiseReport');
  }, [companyReportData]);

  // const handleSelectionChange = useCallback((event, value) => {
  //   console.log(`🚀 ~ handleSelectionChange ~ value:`, value);
  //   setSelectedCompanies(value);
  // }, []);

  return (
    <>
      <Stack gap={1}>
        {/* Filter */}
        <Stack direction={'row'} justifyContent={'Space-between'} gap={2} alignItems={'center'}>
          {/* Company Filter */}

          <Stack>
            <Box sx={{ minWidth: '300px' }}>
              {/* <MultipleAutocomplete
                options={company || []}
                label="Select Companies"
                placeholder="Start typing..."
                value={selectedCompanies}
                onChange={handleSelectionChange}
                getOptionLabel={(option) => option.company_name}
                renderOption={(props, option) => (
                  <li {...props}>
                    <strong>{option.company_name}</strong>
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                disableCloseOnSelect
              /> */}
              <CompanySelection
                value={selectedCompanies}
                setSelectedOptions={setSelectedCompanies}
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

export default CompanyReports;
