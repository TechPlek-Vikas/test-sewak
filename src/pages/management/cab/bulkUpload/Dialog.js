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
  AccordionDetails
} from '@mui/material';
// project-imports
import MainCard from 'components/MainCard';
import { DocumentDownload, Warning2 } from 'iconsax-react';
import { useCallback, useEffect, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
// import VendorSelection from './VendorSelection';
import * as XLSX from 'xlsx';
import axiosServices from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import VendorSelection from 'SearchComponents/VendorSelectionAutoComplete';
import VehicleTypeSelection from 'SearchComponents/VehicleTypeSelectionAutoComplete';
import { isDateInFuture, isRequiredString, isValueInExpectedValues, separateValidAndInvalidItems } from 'pages/management/driver/helper';

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

const EXPECTED_VAL = ['YES', 'NO'];

const MANDATORY_HEADERS = ['vendor ID', 'vehicle Type ID*', 'Vehicle Number*', 'Model Name*'];

const OPTIONAL_HEADERS = [
  'Fitness Date (DD/MM/YYYY)',
  'Insurance Expiry Date (DD/MM/YYYY)',
  'Pollution Expiry Date (DD/MM/YYYY)',
  'Permit Expiry Date (1 Year) (DD/MM/YYYY)',
  "Permit Expiry Date (5 Year's) (DD/MM/YYYY)"
];

const fieldMapping = {
  1: 'Vehicle Type ID',
  2: 'Vehicle Number',
  3: 'Modal Name',

  4: 'Fitness Date',
  5: 'Insurance Expiry Date',
  6: 'Pollution Expiry Date',
  7: `Permit Expiry Date (1 Year)`,
  8: `Permit Expiry Date (5 Year's)`
};

const validationRules = {
  1: isRequiredString,
  2: isRequiredString,
  3: isRequiredString,

  4: isDateInFuture,
  5: isDateInFuture,
  6: isDateInFuture,
  7: isDateInFuture,
  8: isDateInFuture
};

const BulkUploadDialog = ({ open, handleClose }) => {
  const [files, setFiles] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invalidData, setInvalidData] = useState([]);
  const { closeSnackbar } = useSnackbar();

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    setFiles(selectedFiles);
  };

  const handleExcelDataExtraction = (files) => {
    const file = files[0]; // Get the first selected file
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result; // Get the file data

      // Set loading to true before processing
      setLoading(true);

      // Parse the file with XLSX
      const workbook = XLSX.read(data, { type: 'binary' });

      // Get the first sheet (assuming it's "vehicle Data")
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert the sheet data to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      console.log({ jsonData });
      // // Map the data to the desired format
      // const mappedData = jsonData.slice(1).map((row) => {
      //   console.log(row);
      //   const [vendorId, vehicletype, vehicleNumber, vehicleName] = row;
      //   return {
      //     vehicletype: vehicletype,
      //     vehicleNumber: vehicleNumber,
      //     vehicleName: vehicleName,
      //     vendorId: vendorId || null
      //   };
      // });

      // console.log({ mappedData }); // Log the mapped data
      // setVehicleData(mappedData); // Set the mapped data to state

      const { validItems, invalidItems } = separateValidAndInvalidItems(jsonData.slice(1), validationRules, fieldMapping);
      console.log(`🚀 ~ handleExcelDataExtraction ~ invalidItems:`, invalidItems);
      console.log(`🚀 ~ handleExcelDataExtraction ~ validItems:`, validItems);

      if (invalidItems.length > 0) {
        const items = invalidItems.map((entry) => {
          const reasons = Object.entries(entry.errors)
            .map(([field, message], index) => `${index + 1}. ${field} : ${message}`)
            .join('\n');

          return [...entry.item, `Reasons :\n${reasons}`];
        });
        console.log('items = ', items);

        setInvalidData(items);
      }

      const mappedData = validItems.map((row) => {
        return {
          vendorId: row[0],
          vehicletype: row[1],
          vehicleNumber: row[2],
          vehicleName: row[3],

          fitnessDate: row[4],
          insuranceExpiryDate: row[5],
          pollutionExpiryDate: row[6],
          permitOneYrExpiryDate: row[7],
          permitFiveYrExpiryDate: row[8]
        };
      });

      console.log({ mappedData }); // Log the mapped data
      setVehicleData(mappedData); // Set the mapped data to state

      // Set loading to false after processing is done
      setLoading(false);
    };

    reader.readAsBinaryString(file); // Read the file as binary string
  };

  useEffect(() => {
    if (files) {
      handleExcelDataExtraction(files); // Only run when files change
    }
  }, [files]); // Dependency array contains `files`, not `vehicleData`

  // console.log({ vehicleData });

  const [count, setCount] = useState({
    successCount: 0,
    failureCount: 0,
    failureData: []
  });

  const actionTask = (snackbarId, data) => (
    <Stack direction="row" spacing={0.5}>
      <Button
        size="small"
        color="error"
        variant="contained"
        onClick={() => {
          handleViewClick(data);
        }}
      >
        View Data
      </Button>
      <Button size="small" color="secondary" variant="contained" onClick={() => closeSnackbar(snackbarId)}>
        Dismiss
      </Button>
    </Stack>
  );

  const handleViewClick = (data) => {
    // Headers for "vehicle Data" sheet

    const vehicleHeaders = ['vendor ID', 'vehicle Type ID*', 'Vehicle Number*', 'Model Name*'];

    let vehicleData = [];

    // Check if the data is not empty, then populate "ID Reference" data
    if (data && data.length > 0) {
      vehicleData = data.map((item) => [item.vendorId, item.vehicletype, item.vehicleNumber, item.vehicleName]);
    }

    // Create the second sheet (headers + data if available)
    const vehicleSheet = XLSX.utils.aoa_to_sheet([
      vehicleHeaders,
      ...vehicleData // Will be empty if no data
    ]);
    // Create a workbook and append the sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, vehicleSheet, 'Failed Vehicle Data');

    // Export the Excel file
    XLSX.writeFile(workbook, 'failedVehicleData.xlsx');
  };

  const handleViewClickForInvalid = useCallback((data) => {
    // alert(`handleViewClickForInvalid ${data.length}`);
    console.log('DATA = ', data);

    const driverHeaders = [...MANDATORY_HEADERS, ...OPTIONAL_HEADERS, 'Reasons'];

    const HeaderLength = driverHeaders.length;

    const output = data.map((row) => {
      // Add `null` to the end of the row until its length matches the required length
      while (row.length < HeaderLength) {
        row.splice(-1, 0, null); // Add nulls before the last item
      }
      return row;
    });

    console.log('output = ', output);

    // Create the second sheet (headers + data if available)
    const vendorSheet = XLSX.utils.aoa_to_sheet([
      driverHeaders,
      ...data // Will be empty if no data
    ]);
    // Create a workbook and append the sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, vendorSheet, 'Invalid Cab Data');

    // Export the Excel file
    XLSX.writeFile(workbook, 'InvalidCabData.xlsx');
  }, []);

  const actionTaskForInvalidData = useCallback(
    (snackbarId, data) => (
      <Stack direction="row" spacing={0.5}>
        <Button
          size="small"
          color="error"
          variant="contained"
          onClick={() => {
            handleViewClickForInvalid(data);
          }}
        >
          View Invalid Data
        </Button>
        <Button size="small" color="secondary" variant="contained" onClick={() => closeSnackbar(snackbarId)}>
          Dismiss
        </Button>
      </Stack>
    ),
    [closeSnackbar, handleViewClickForInvalid]
  );

  const handleSave = async () => {
    try {
      if (!vehicleData || vehicleData.length === 0) {
        alert('Excel Sheet Empty');
        return;
      }
      setLoading(true);

      let successCount = 0;
      let failureCount = 0;
      let failureData = [];

      // Loop through the vehicleData array and send the requests
      for (const item of vehicleData) {
        try {
          console.log({ item });
          const formData = new FormData();

          // Append each field from the item object to FormData
          formData.append('vehicletype', item.vehicletype);
          formData.append('vehicleNumber', item.vehicleNumber);
          formData.append('vehicleName', item.vehicleName);
          formData.append('vendorId', item.vendorId || null);
          item.fitnessDate && formData.append('fitnessDate', item.fitnessDate);
          item.insuranceExpiryDate && formData.append('insuranceExpiryDate', item.insuranceExpiryDate);
          item.pollutionExpiryDate && formData.append('pollutionExpiryDate', item.pollutionExpiryDate);
          item.permitOneYrExpiryDate && formData.append('permitOneYrExpiryDate', item.permitOneYrExpiryDate);
          item.permitFiveYrExpiryDate && formData.append('permitFiveYrExpiryDate', item.permitFiveYrExpiryDate);

          const response = await axiosServices.post('/vehicle/add', formData);
          console.log(response.data);

          // If the response indicates success, increment successCount
          if (response.status === 201) {
            successCount++;
          }
        } catch (error) {
          console.error('Error registering vehicle:', error);

          // On failure, increment failureCount and add failure data
          failureCount++;
          failureData.push(item); // Store failed item
        }
      }

      setCount({
        successCount,
        failureCount,
        failureData
      });

      // Show success or failure messages based on results
      if (successCount > 0) {
        dispatch(
          openSnackbar({
            open: true,
            message: `${successCount} vehicles Saved Successfully`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right'
            }
          })
        );
      }

      if (failureCount > 0) {
        enqueueSnackbar(`${failureCount} vehicles Failed to Save`, {
          action: (key) => actionTask(key, failureData),
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right'
          }
        });
      }

      // Reset states and close dialog
      setFiles(null);
      setVehicleData(null);
      setLoading(false);
      handleClose();
    } catch (error) {
      console.log('error', error);
      dispatch(
        openSnackbar({
          open: true,
          message: error.message || 'Something went wrong',
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
    } finally {
      if (invalidData.length > 0) {
        enqueueSnackbar(`${invalidData.length} Vendors Invalid Data`, {
          action: (key) => actionTaskForInvalidData(key, invalidData),
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right'
          }
        });
      }
    }
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="parent-modal-title" aria-describedby="parent-modal-description">
      <MainCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Typography variant="h5">Upload Vehicle Data</Typography>
            <ChildModal />
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
            Upload Excel sheet with required headers to upload Vehicle in bulk.Download Excel Template to streamline the process.
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
          <Button color="error" size="small" onClick={handleClose}>
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

function ChildModal() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const [selectedVendorOptions, setSelectedVendorOptions] = useState([]);
  const [selectedVehicleTypeOptions, setSelectedVehicleTypeOptions] = useState([]);

  const handleDownload = () => {
    // Headers for "vehicle Data" sheet
    // const vehicleData = ['vendor ID', 'vehicle Type ID*', 'Vehicle Number*', 'Model Name*']; // No data, just headers
    const vehicleData = [...MANDATORY_HEADERS, ...OPTIONAL_HEADERS]; // No data, just headers

    // Create the first sheet (headers only)
    const vehicleSheet = XLSX.utils.aoa_to_sheet([vehicleData]);

    // Prepare "ID Reference" sheet data (only if data exists)
    const idReferenceHeaders = ['ID', 'vendorName', 'Phone'];
    const vehicleTypeIdReferenceHeaders = ['ID', 'vehicle Type'];

    let idReferenceData = [];
    let vehicleTypeIdReferenceData = [];

    // Check if the data is not empty, then populate "ID Reference" data
    if (selectedVendorOptions && selectedVendorOptions.length > 0) {
      idReferenceData = selectedVendorOptions.map((item) => [item.vendorId, item.vendorCompanyName, item.workMobileNumber]);
    }
    if (selectedVehicleTypeOptions && selectedVehicleTypeOptions.length > 0) {
      vehicleTypeIdReferenceData = selectedVehicleTypeOptions.map((item) => [item._id, item.vehicleTypeName, item.workMobileNumber]);
    }

    // Create the second sheet (headers + data if available)
    const idReferenceSheet = XLSX.utils.aoa_to_sheet([
      idReferenceHeaders,
      ...idReferenceData // Will be empty if no data
    ]);

    // Create the third sheet (headers + data if available)
    const vehicleTypeIdReferenceSheet = XLSX.utils.aoa_to_sheet([
      vehicleTypeIdReferenceHeaders,
      ...vehicleTypeIdReferenceData // Will be empty if no data
    ]);

    // Create a workbook and append the sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, vehicleSheet, 'Vehicle Data');

    // Only add "ID Reference" sheet if there's data
    if (idReferenceData.length > 0) {
      XLSX.utils.book_append_sheet(workbook, idReferenceSheet, 'Vendor ID Reference');
    }
    // Only add "ID Reference" sheet if there's data
    if (vehicleTypeIdReferenceData.length > 0) {
      XLSX.utils.book_append_sheet(workbook, vehicleTypeIdReferenceSheet, 'vehicle Type ID Reference');
    }

    // Export the Excel file
    XLSX.writeFile(workbook, 'BulkCabUploadSheet.xlsx');
  };

  return (
    <>
      <Button onClick={handleOpen} size="small" color="secondary" endIcon={<DocumentDownload />} variant="contained">
        Download Template
      </Button>
      <Modal open={open} onClose={handleClose} aria-labelledby="child-modal-title" aria-describedby="child-modal-description">
        <MainCard title="Download Template" modal darkTitle content={false}>
          <CardContent>
            <Stack direction="column" spacing={1} alignItems={'center'} justifyContent="center" sx={{ p: 0, m: 0 }}>
              <Typography id="modal-modal-description">Select Vendors & Vehicle Type to register Vehicle </Typography>
              <Stack direction="row" spacing={1} alignItems={'center'} justifyContent="center" sx={{ py: 1, mb: 1 }}>
                <VendorSelection sx={{ minWidth: 250 }} value={selectedVendorOptions} setSelectedOptions={setSelectedVendorOptions} />
                <VehicleTypeSelection
                  sx={{ minWidth: 250 }}
                  value={selectedVehicleTypeOptions}
                  setSelectedOptions={setSelectedVehicleTypeOptions}
                />
              </Stack>
              {/* <Alert color="warning" icon={<Warning2 variant="Bold" />}>
              In case of registering Driver with self no need to add any IDs. and for registering Drivers under any vendors select vendors
              from above and copy vendor Id from ID reference sheet and paste in Id column in Driver Data sheet.
            </Alert> */}
              <Accordion>
                <AccordionSummary>
                  <Typography variant="h6">Instructions for Bulk Vehicle Upload</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">
                    <ol>
                      <li>
                        <strong>Self-Registration of Vehicle:</strong>
                        If you wish to register a vehicle under your own name, <strong>do not fill in the Vendor ID column</strong> in the
                        &ldquo;vehicle Data&rdquo; sheet. Leave the ID column empty for these vehicles.
                      </li>
                      <li>
                        <strong>Registering vehicles Under a Vendor:</strong>
                        <ul>
                          <li>Select a vendor from the options above to associate the vehicle with a vendor.</li>
                          <li>
                            Navigate to the <strong>&ldquo;ID Reference&rdquo;</strong> sheet to find the corresponding{' '}
                            <strong>Vendor ID</strong> for the selected vendor.
                          </li>
                          <li>Copy the Vendor ID from the &ldquo;ID Reference&rdquo; sheet.</li>
                          <li>
                            Paste the Vendor ID into the <strong>ID column</strong> of the &ldquo;vehicle Data&rdquo; sheet where the
                            vehicle&rsquo;s information is listed.
                          </li>
                        </ul>
                      </li>
                      <li>
                        <strong>File Upload:</strong> Once you&rsquo;ve filled in the necessary details, you can upload the completed sheet
                        to register your vehicles in bulk.
                      </li>
                    </ol>
                    <br />
                    <strong>Note:</strong> Ensure that you have selected a vendor before entering the Vendor ID. If no vendor is selected,
                    leave the ID column empty.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </CardContent>
          <Divider />
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
            <Button
              color="error"
              size="small"
              onClick={() => {
                setSelectedVehicleTypeOptions([]);
                setSelectedVendorOptions([]);
                handleClose();
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" size="small" onClick={handleDownload}>
              Download
            </Button>
          </Stack>
        </MainCard>
      </Modal>
    </>
  );
}

export default BulkUploadDialog;
