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
import { useEffect, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
// import VendorSelection from './VendorSelection';
import * as XLSX from 'xlsx';
import axiosServices from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import VendorSelection from 'SearchComponents/VendorSelectionAutoComplete';

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

const BulkUploadDialog = ({ open, handleClose }) => {
  const [files, setFiles] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(false);
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

      // Get the first sheet (assuming it's "Driver Data")
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert the sheet data to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Map the data to the desired format
      const mappedData = jsonData.slice(1).map((row) => {
        const [id, name, email, phone] = row;
        return {
          data: {
            userName: name,
            userEmail: email,
            contactNumber: phone,
            vendorId: id || null
          }
        };
      });

      console.log(mappedData); // Log the mapped data
      setDriverData(mappedData); // Set the mapped data to state

      // Set loading to false after processing is done
      setLoading(false);
    };

    reader.readAsBinaryString(file); // Read the file as binary string
  };

  useEffect(() => {
    if (files) {
      handleExcelDataExtraction(files); // Only run when files change
    }
  }, [files]); // Dependency array contains `files`, not `driverData`

  // console.log({ driverData });

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
    console.log(data);

    const driverHeaders = ['ID', 'Name*', 'Email*', 'Phone*'];

    let driverData = [];

    // Check if the data is not empty, then populate "ID Reference" data
    if (data && data.length > 0) {
      driverData = data.map((item) => [item.data.vendorId, item.data.userName, item.data.userEmail, item.data.contactNumber]);
    }

    // Create the second sheet (headers + data if available)
    const driverSheet = XLSX.utils.aoa_to_sheet([
      driverHeaders,
      ...driverData // Will be empty if no data
    ]);
    // Create a workbook and append the sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, driverSheet, 'Failed Driver Data');

    // Export the Excel file
    XLSX.writeFile(workbook, 'failedDriverData.xlsx');
  };

  const handleSave = async () => {
    if (!driverData || driverData.length === 0) {
      alert('Empty Excel Sheet');
      return;
    }
    setLoading(true);

    let successCount = 0;
    let failureCount = 0;
    let failureData = [];

    // Loop through the driverData array and send the requests
    for (const item of driverData) {
      try {
        const response = await axiosServices.post('/driver/register', item);
        console.log(response.data);

        // If the response indicates success, increment successCount
        if (response.status === 201) {
          successCount++;
        }
      } catch (error) {
        console.error('Error registering driver:', error);

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
          message: `${successCount} Drivers Saved Successfully`,
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
      enqueueSnackbar(`${failureCount} Drivers Failed to Save`, {
        action: (key) => actionTask(key, failureData),
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right'
        }
      });
    }

    // Reset states and close dialog
    setFiles(null);
    setDriverData(null);
    setLoading(false);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="parent-modal-title" aria-describedby="parent-modal-description">
      <MainCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Typography variant="h5">Upload Driver Data</Typography>
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
            Upload Excel sheet with required headers to upload Drivers in bulk.Download Excel Template to streamline the process.
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
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleDownload = () => {
    // Headers for "Driver Data" sheet
    const driverHeaders = ['ID', 'Name*', 'Email*', 'Phone*'];
    const driverData = []; // No data, just headers

    // Create the first sheet (headers only)
    const driverSheet = XLSX.utils.aoa_to_sheet([driverHeaders]);

    // Prepare "ID Reference" sheet data (only if data exists)
    const idReferenceHeaders = ['ID', 'vendorName', 'Phone'];
    let idReferenceData = [];

    // Check if the data is not empty, then populate "ID Reference" data
    if (selectedOptions && selectedOptions.length > 0) {
      idReferenceData = selectedOptions.map((item) => [item.vendorId, item.vendorCompanyName, item.workMobileNumber]);
    }

    // Create the second sheet (headers + data if available)
    const idReferenceSheet = XLSX.utils.aoa_to_sheet([
      idReferenceHeaders,
      ...idReferenceData // Will be empty if no data
    ]);

    // Create a workbook and append the sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, driverSheet, 'Driver Data');

    // Only add "ID Reference" sheet if there's data
    if (idReferenceData.length > 0) {
      XLSX.utils.book_append_sheet(workbook, idReferenceSheet, 'ID Reference');
    }

    // Export the Excel file
    XLSX.writeFile(workbook, 'BulkDriverUploadSheet.xlsx');
  };
  return (
    <>
      <Button onClick={handleOpen} size="small" color="secondary" endIcon={<DocumentDownload />} variant="contained">
        Download Template
      </Button>
      <Modal open={open} onClose={handleClose} aria-labelledby="child-modal-title" aria-describedby="child-modal-description">
        <MainCard title="Download Template" modal darkTitle content={false}>
          <CardContent>
            <Stack direction="column" spacing={1} alignItems={'center'} justifyContent="center" sx={{ py: 1, mb: 1 }}>
              <Typography id="modal-modal-description">Select Vendor / Vendors to register driver </Typography>

              <VendorSelection sx={{ minWidth: 250 }} value={selectedOptions} setSelectedOptions={setSelectedOptions} />
            </Stack>
            {/* <Alert color="warning" icon={<Warning2 variant="Bold" />}>
              In case of registering Driver with self no need to add any IDs. and for registering Drivers under any vendors select vendors
              from above and copy vendor Id from ID reference sheet and paste in Id column in Driver Data sheet.
            </Alert> */}
            <Accordion>
              <AccordionSummary>
                <Typography variant="h6">Instructions for Bulk Driver Upload</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  <ol>
                    <li>
                      <strong>Self-Registration of Drivers:</strong>
                      If you wish to register a driver under your own name, <strong>do not fill in the Vendor ID column</strong> in the
                      &ldquo;Driver Data&rdquo; sheet. Leave the ID column empty for these drivers.
                    </li>
                    <li>
                      <strong>Registering Drivers Under a Vendor:</strong>
                      <ul>
                        <li>Select a vendor from the options above to associate the driver with a vendor.</li>
                        <li>
                          Navigate to the <strong>&ldquo;ID Reference&rdquo;</strong> sheet to find the corresponding{' '}
                          <strong>Vendor ID</strong> for the selected vendor.
                        </li>
                        <li>Copy the Vendor ID from the &ldquo;ID Reference&rdquo; sheet.</li>
                        <li>
                          Paste the Vendor ID into the <strong>ID column</strong> of the &ldquo;Driver Data&rdquo; sheet where the
                          driver&rsquo;s information is listed.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>File Upload:</strong> Once you&rsquo;ve filled in the necessary details, you can upload the completed sheet to
                      register your drivers in bulk.
                    </li>
                  </ol>
                  <br />
                  <strong>Note:</strong> Ensure that you have selected a vendor before entering the Vendor ID. If no vendor is selected,
                  leave the ID column empty.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </CardContent>
          <Divider />
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
            <Button
              color="error"
              size="small"
              onClick={() => {
                setSelectedOptions([]);
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
