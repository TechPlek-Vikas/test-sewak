// material-ui
import styled from '@emotion/styled';
import {
  Button,
  Divider,
  CardContent,
  Modal,
  Stack,
  Typography,
  Box,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton
} from '@mui/material';
// project-imports
import MainCard from 'components/MainCard';
import { DocumentDownload, Warning2 } from 'iconsax-react';
import { useCallback, useEffect, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
// import VendorSelection from './VendorSelection';
import * as XLSX from 'xlsx';
import axiosServices from 'utils/axios';
import { openSnackbar } from 'store/reducers/snackbar';
import { useSelector } from 'store';
import { USERTYPE } from 'constant';
import ZoneSelection from 'SearchComponents/ZoneSelectionAutocomplete';
import VehicleTypeSelection from 'SearchComponents/VehicleTypeSelectionAutoComplete';
import { StructurePayload } from '../utils/mapCompanyRateData';
import { dispatch } from 'store';
import { fetchCompanyRates } from 'store/cacheSlice/companyRatesSlice';
import { useDispatch } from 'react-redux';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
});

function removeDuplicates(arr) {
  // Create a map to track the unique combinations
  const uniqueItems = new Map();
  let duplicateCount = 0;

  // Iterate over the array
  const result = arr.filter((item) => {
    const key = `${item.ZONENAME}-${item.ZONETYPE}-${item.VEHICLETYPE}`;

    // If the key already exists, it's a duplicate
    if (uniqueItems.has(key)) {
      duplicateCount++;
      return false; // Skip the duplicate item
    } else {
      uniqueItems.set(key, true);
      return true; // Keep the unique item
    }
  });

  // If there were duplicates, return an error message with the count
  if (duplicateCount > 0) {
    return {
      error: `Found ${duplicateCount} duplicate(s)`,
      data: result
    };
  }

  // If no duplicates were found, return the filtered array
  return {
    message: 'No duplicates found',
    data: result
  };
}

const TemplateSelectDialog = ({ id, open, handleClose, setKey }) => {
  const [files, setFiles] = useState(null);
  const [driverData, setDriverData] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    setFiles(selectedFiles);
  };

  const handleExcelDataExtraction = (files) => {
    const file = files[0]; // Get the first selected file
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result; // Get the file data
      setLoading(true); // Set loading to true before processing

      // Parse the file with XLSX
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0]; // Assuming first sheet is "Driver Data"
      const sheet = workbook.Sheets[sheetName];

      // Convert the sheet data to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Filter out empty rows and map to desired format
      const mappedData = jsonData.slice(1).reduce((acc, row) => {
        const [SNO, ZONENAME, ZONETYPE, VEHICLETYPE, COMPANYRATE, DUALTRIPRATE, COMPANYGUARDRATE] = row;

        // Validate that necessary fields are not empty
        if (
          ZONENAME &&
          ZONETYPE &&
          VEHICLETYPE &&
          COMPANYRATE !== undefined &&
          DUALTRIPRATE !== undefined &&
          COMPANYGUARDRATE !== undefined
        ) {
          acc.push({
            ZONENAME: ZONENAME,
            ZONETYPE: ZONETYPE,
            VEHICLETYPE: VEHICLETYPE,
            COMPANYRATE: COMPANYRATE,
            DUALTRIPRATE: DUALTRIPRATE,
            COMPANYGUARDRATE: COMPANYGUARDRATE
          });
        }

        return acc;
      }, []);

      // Remove duplicates if any
      const { error, data: filteredData, message } = removeDuplicates(mappedData);

      // Handle the result
      if (error) {
        alert(error);
      } else {
        console.log({ filteredData });
      }

      // Set the state with the filtered data
      setDriverData(filteredData); // Use filteredData instead of mappedData

      setLoading(false); // Set loading to false after processing is done
    };

    reader.readAsBinaryString(file); // Read the file as binary string
  };

  useEffect(() => {
    if (files) {
      handleExcelDataExtraction(files); // Only run when files change
    }
  }, [files]); // Dependency array contains `files`, not `driverData`

  const handleSave = async () => {
    // Helper to display snackbar messages
    const showSnackbar = (message, variant = 'success') => {
      dispatch(
        openSnackbar({
          open: true,
          message: message,
          variant: 'alert',
          alert: { color: variant },
          close: true,
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' }
        })
      );
    };

    if (!driverData || driverData.length === 0) {
      alert('Empty Data Sheet');
      return;
    }

    setLoading(true);

    try {
      const { success, finalPayload } = await StructurePayload(driverData);

      if (!success) {
        showSnackbar('Encountered an Error, cross check name must match refernce names', 'error');
        return;
      }

      const response = await axiosServices.post('/company/upload/company/rate', {
        data: {
          companyID: id,
          ratesForCompany: finalPayload
        }
      });

      if (response.status === 200) {
        setKey((prev) => prev + 1);
        showSnackbar('Company Rates Uploaded Successfully');
      }
    } catch (error) {
      console.error('Error uploading company rates:', error);
      showSnackbar('Failed to upload company rates', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="parent-modal-title" aria-describedby="parent-modal-description">
      <MainCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Typography variant="h5">Upload Company Rate</Typography>
            <ChildModal id={id} />
          </Box>
        }
        modal
        darkTitle
        content={false}
        sx={{
          padding: 0 // Optional: Padding inside the card
        }}
      >
        <CardContent>
          <Typography id="modal-modal-description">
            Upload Excel sheet with required headers to upload Company Rate.Download Excel Template to streamline the process.
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="center" sx={{ px: 2.5, py: 1 }}>
            <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<FaCloudUploadAlt />}>
              Upload files
              <VisuallyHiddenInput type="file" onChange={(event) => handleFileChange(event)} />
            </Button>
            {files && (
              <Typography variant="caption" sx={{ pl: 0.5, pt: 1 }}>
                {files[0].name}
              </Typography>
            )}
          </Stack>
        </CardContent>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
          <Button
            color="error"
            size="small"
            onClick={() => {
              setFiles(null);
              handleClose();
            }}
          >
            Cancel
          </Button>
          <Button color="success" size="small" variant="contained" onClick={handleSave} disabled={!files || loading}>
            Save
          </Button>
        </Stack>
      </MainCard>
    </Modal>
  );
};

function ChildModal({ id }) {
  const [open, setOpen] = useState(false);
  const userType = useSelector((state) => state.auth.userType);
  console.log({ open, userType });
  const dispatch = useDispatch();
  // console.log('userType', userType);
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const [selectedZones, setSelectedZones] = useState([]);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState([]);
  const [existingCompanyRates, setExistingCompanyRates] = useState([]);
  const { cache, loading, error } = useSelector((state) => state.companyRates); // Access Redux state

  useEffect(() => {
    if (id && !cache[id]) {
      dispatch(fetchCompanyRates({ companyId: id, userType: userType }));
    }
  }, [dispatch, id, cache]);

  useEffect(() => {
    if (id && cache[id]) {
      const unwindedRates = cache[id].map((item) => ({
        ZONENAME: item.zoneNameID?.zoneName || '', // Safely access zoneName
        ZONETYPE: item.zoneTypeID?.zoneTypeName || '', // Handle null zoneTypeID
        VEHICLETYPE: item.VehicleTypeName?.vehicleTypeName || '', // Safely access vehicleTypeName
        COMPANYRATE: item.cabAmount?.amount || '', // Safely access companyRate
        DUALTRIPRATE: item.dualTripAmount?.amount || '', // Safely access dualTripRate
        COMPANYGUARDRATE: item.guardPrice || '' // Default guardPrice if undefined
      }));

      setExistingCompanyRates(unwindedRates);
    }
  }, [cache, id]);

  const handleDownload = useCallback(() => {
    // **Sheet 1: Company Rates Data**
    const companyHeaders = ['SNO', 'ZONENAME*', 'ZONETYPE', 'VEHICLETYPE*', 'RATE', 'DUALTRIPRATE', 'GUARDRATE'];
    const companyData = existingCompanyRates.map((rate, index) => [
      index + 1,
      rate.ZONENAME || '',
      rate.ZONETYPE || '',
      rate.VEHICLETYPE || '',
      rate.COMPANYRATE || '',
      rate.DUALTRIPRATE || '',
      rate.COMPANYGUARDRATE || ''
    ]);
    const companySheetData = [companyHeaders, ...companyData];
    const companySheet = XLSX.utils.aoa_to_sheet(companySheetData);

    // **Sheet 2: zoneType Data**
    const zoneHeaders = ['SNO', 'ZONENAME', 'ZONETYPE'];

    const zoneData = selectedZones
      .map((zone, i) => {
        // Ensure zone and zone.zoneTypes are valid, fallback to an empty array if null/undefined
        const zoneName = zone?.zoneName || 'N/A'; // Use 'N/A' or another placeholder for null zoneName
        const zoneTypes = Array.isArray(zone?.zoneTypes) && zone.zoneTypes.length > 0 ? zone.zoneTypes : [null]; // Include a single empty entry if zoneTypes is null or empty

        // Flatten the zoneTypes array for each zoneName
        return zoneTypes.map((zoneType, index) => [
          index === 0 ? i + 1 : '', // Serial number for the first row
          index === 0 ? zoneName : '', // Show ZONENAME only for the first zoneType
          zoneType?.zoneTypeName || '' // Leave ZONETYPE empty if zoneTypeName is null/undefined
        ]);
      })
      .flat();

    const zoneSheetData = [zoneHeaders, ...zoneData];
    const zoneSheet = XLSX.utils.aoa_to_sheet(zoneSheetData);

    // **Sheet 3: VehicleType Data**
    const VehicleTypeHeaders = ['SNO', 'VEHICLETYPE'];
    const vehicleTypeData = selectedVehicleTypes.map((type, index) => [
      index + 1,
      type?.vehicleTypeName // Fallback to 'N/A' if vehicleTypeName is null/undefined
    ]);
    console.log({ selectedVehicleTypes });

    console.log({ vehicleTypeData });

    const vehicleTypeSheetData = [VehicleTypeHeaders, ...vehicleTypeData];
    const vehicleTypeSheet = XLSX.utils.aoa_to_sheet(vehicleTypeSheetData);
    // **Create Workbook and Append Sheets**
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, companySheet, 'Company Rate Data');
    XLSX.utils.book_append_sheet(workbook, zoneSheet, 'Zone Data');
    XLSX.utils.book_append_sheet(workbook, vehicleTypeSheet, 'Vehicle Type Data');

    // **Export the Workbook**
    XLSX.writeFile(workbook, 'CompanyRateUpload.xlsx');
  }, [existingCompanyRates, selectedZones, selectedVehicleTypes]);

  const handleClick = useCallback(() => {
    if (userType === USERTYPE.iscabProvider) {
      handleOpen();
    } else {
      handleDownload();
    }
  }, [handleOpen, handleDownload, userType]);

  return (
    <>
      <Button onClick={handleClick} size="small" color="secondary" endIcon={<DocumentDownload />} variant="contained">
        Download Template
      </Button>

      <Modal open={open} onClose={handleClose} aria-labelledby="child-modal-title" aria-describedby="child-modal-description">
        <MainCard title="Download Template" modal darkTitle content={false}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems={'center'} justifyContent="space-around" sx={{ py: 1, mb: 1 }}>
              <Typography id="modal-modal-description">Select Zones </Typography>
              {/* {<ZoneSelection sx={{ minWidth: 250 }} value={selectedZones} setSelectedOptions={setSelectedZones} />} */}
            </Stack>
            <Stack direction="row" spacing={1} alignItems={'center'} justifyContent="space-around" sx={{ py: 1, mb: 1 }}>
              <Typography id="modal-modal-description">Select Vehicle Type </Typography>
              <VehicleTypeSelection sx={{ minWidth: 250 }} value={selectedVehicleTypes} setSelectedOptions={setSelectedVehicleTypes} />
            </Stack>
          </CardContent>
          <Divider />
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
            <Button
              color="error"
              size="small"
              onClick={() => {
                setSelectedVehicleTypes([]);
                setSelectedZones([]);
                handleClose();
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" size="small" disabled={loading} onClick={handleDownload}>
              Download
            </Button>
          </Stack>
        </MainCard>
      </Modal>
    </>
  );
}

export default TemplateSelectDialog;
