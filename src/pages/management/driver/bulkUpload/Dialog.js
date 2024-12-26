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
import { DocumentDownload } from 'iconsax-react';
import { useCallback, useEffect, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
// import VendorSelection from './VendorSelection';
import * as XLSX from 'xlsx';
import axiosServices from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import VendorSelection from 'SearchComponents/VendorSelectionAutoComplete';
import { useSelector } from 'store';
import { USERTYPE } from 'constant';
import {
  isMobileNumber,
  isNumber,
  isRequiredString,
  isString,
  isValidEmail,
  separateValidAndInvalidItems
} from 'pages/management/driver/helper';

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

const MANDATORY_HEADERS = ['ID', 'Name*', 'Email*', 'Phone*'];

const OPTIONAL_HEADERS = [
  'Office Charge',
  'Father Name',
  "Experience (In Year's)",
  'PAN',
  'Bank Name',
  'Branch Name',
  'Account Holder Name',
  'Account Number',
  'IFSC Code',
  'Bank Address'
];

// Add field mapping
const fieldMapping = {
  1: 'Name',
  2: 'Email',
  3: 'Phone',
  4: 'Office Charge',
  5: 'Father Name',
  6: 'Experience',
  7: 'PAN',
  8: 'Bank Name',
  9: 'Branch Name',
  10: 'Account Holder Name',
  11: 'Account Number',
  12: 'IFSC Code',
  13: 'Bank Address'
};

const validationRules = {
  // 0: isString, // ID
  1: isRequiredString, // Name*
  2: (value) => isRequiredString(value) && isValidEmail(value), // Email*
  3: isMobileNumber, // Phone*
  4: isNumber, //Office Charge
  5: isString, // Father Name
  6: isNumber, // Experience (In Year's)
  7: isString, // PAN
  8: isString, // Bank Name
  9: isString, // Branch Name
  10: isString, // Account Holder Name
  11: isNumber, // Account Number
  12: isString, // IFSC Code
  13: isString // Bank Address
};

const BulkUploadDialog = ({ open, handleClose, setUpdateKey }) => {
  const [files, setFiles] = useState(null);
  const [driverData, setDriverData] = useState(null);
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

      // Get the first sheet (assuming it's "Driver Data")
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert the sheet data to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      console.log(`🚀 ~ handleExcelDataExtraction ~ jsonData:`, jsonData);

      // // Map the data to the desired format
      // const mappedData = jsonData.slice(1).map((row) => {
      //   const [id, name, email, phone] = row;
      //   return {
      //     data: {
      //       userName: name,
      //       userEmail: email,
      //       contactNumber: phone,
      //       vendorId: id || null
      //     }
      //   };
      // });

      // console.log(mappedData); // Log the mapped data
      // setDriverData(mappedData); // Set the mapped data to state

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
          userName: row[1],
          userEmail: row[2],
          contactNumber: row[3],
          officeChargeAmount: row[4],
          fatherName: row[5],
          experience: row[6],
          pan: row[7],
          bankName: row[8],
          branchName: row[9],
          accountHolderName: row[10],
          accountNumber: row[11],
          ifscCode: row[12],
          bankAddress: row[13]
        };
      });

      console.log('mappedData = ', mappedData); // Log the mapped data
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

    const driverHeaders = [...MANDATORY_HEADERS, ...OPTIONAL_HEADERS, 'Reasons'];

    const HeaderLength = driverHeaders.length;

    let driverData = [];

    // Check if the data is not empty, then populate "ID Reference" data
    if (data && data.length > 0) {
      driverData = data.map((item) => [
        item.vendorId,
        item.userName,
        item.userEmail,
        item.contactNumber,
        item.officeChargeAmount,
        item.fatherName,
        item.experience,
        item.pan,
        item.bankName,
        item.branchName,
        item.accountHolderName,
        item.accountNumber,
        item.ifscCode,
        item.bankAddress
      ]);
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
    XLSX.utils.book_append_sheet(workbook, vendorSheet, 'Invalid Driver Data');

    // Export the Excel file
    XLSX.writeFile(workbook, 'InvalidDriverData.xlsx');
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
      console.log('driverData', driverData);
      if (!driverData || driverData.length === 0) {
        dispatch(
          openSnackbar({
            open: true,
            message: `Empty Excel Sheet`,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
        return;
      }
      setLoading(true);

      let successCount = 0;
      let failureCount = 0;
      let failureData = [];

      // Loop through the driverData array and send the requests
      for (const item of driverData) {
        try {
          const response = await axiosServices.post('/driver/register', { data: item });
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
        // Trigger table refresh
        setUpdateKey((prevKey) => prevKey + 1);
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
  const userType = useSelector((state) => state.auth.userType);
  // console.log('userType', userType);
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);
  const handleClose = () => {
    setOpen(false);
  };
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleDownload = useCallback(() => {
    // Headers for "Driver Data" sheet
    // const driverHeaders = ['ID', 'Name*', 'Email*', 'Phone*'];
    const driverHeaders = [...MANDATORY_HEADERS, ...OPTIONAL_HEADERS];
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
  }, [selectedOptions]);

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
