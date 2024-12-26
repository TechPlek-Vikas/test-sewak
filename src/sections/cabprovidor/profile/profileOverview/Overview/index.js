// material-ui
import { useEffect, useRef, useState } from 'react';
import { Grid, IconButton, List, ListItem, Stack, Typography, TextField, Button, Box } from '@mui/material';
import { FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import { Edit } from 'iconsax-react';
import { dispatch } from 'store';
import {
  addSpecificUserDetails,
  addSpecificUserDetailsCabProvider,
  updateUserBasicDetails,
  updateUserSpecificDetails
} from 'store/slice/cabProvidor/userSlice';
import { openSnackbar } from 'store/reducers/snackbar';
import { useSelector } from 'store';

// ==============================|| ACCOUNT PROFILE - BASIC ||============================== //

const basicDataValidationSchema = Yup.object({
  userName: Yup.string().required('Username is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  pinCode: Yup.string()
    .required('Pin Code is required')
    .matches(/^\d{6}$/, 'Invalid Pin Code'),
  contactNumber: Yup.string()
    .required('Phone Number is required')
    .matches(/^\d{10}$/, 'Invalid Phone Number'),
  alternateContactNumber: Yup.string().matches(/^\d{10}$/, 'Invalid Phone Number')
});

const specificDataValidationSchema = Yup.object({
  cabProviderLegalName: Yup.string().required('Cab Provider Legal Name is required'),
  contactPersonName: Yup.string(),
  PAN: Yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN'),
  GSTIN: Yup.string()
    .required('GSTIN is required')
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/, 'Invalid GSTIN'),
  officeAddress: Yup.string(),
  officeCity: Yup.string(),
  officeState: Yup.string(),
  officePinCode: Yup.string().matches(/^\d{6}$/, 'Invalid Pin Code'),
  workEmail: Yup.string().required('Work Email is required').email('Invalid email'),
  workMobileNumber: Yup.string()
    .required('Mobile Number is required')
    .matches(/^\d{10}$/, 'Invalid Mobile Number'),
  workLandLineNumber: Yup.string().matches(/^\d{10}$/, 'Invalid Landline Number'),
  bankName: Yup.string(),
  accountNumber: Yup.string().matches(/^\d+$/, 'Invalid Account Number'),
  accountHolderName: Yup.string(),
  branchName: Yup.string(),
  IFSC_code: Yup.string(),
  bankAddress: Yup.string()
});

const Overview = ({ profileBasicData, profileSpecificData }) => {
  const [isBasicDataEditing, setisBasicDataEditing] = useState(false);
  const [isSpecificDataEditing, setIsSpecificDataEditing] = useState(false);

  const [image, setImage] = useState(profileBasicData.userImage);
  const [file, setFile] = useState(null);

  const [basicData, setBasicData] = useState(profileBasicData);
  const [specificData, setSpecificData] = useState(profileSpecificData);

  const fileInputRef = useRef(null);

  const userSpecificInfo = useSelector((state) => state.auth.userSpecificData);
  console.log(`🚀 ~ Overview ~ userSpecificInfo:`, userSpecificInfo);

  const formik = useFormik({
    initialValues: {
      userName: profileBasicData.userName || '',
      userEmail: profileBasicData.userEmail || '',
      address: profileBasicData.address || '',
      city: profileBasicData.city || '',
      state: profileBasicData.state || '',
      pinCode: profileBasicData.pinCode || '',
      contactNumber: profileBasicData.contactNumber || '',
      alternateContactNumber: profileBasicData.alternateContactNumber || ''
    },
    validationSchema: basicDataValidationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        formData.append('_id', profileBasicData._id);
        formData.append('userName', values.userName);
        formData.append('userEmail', values.userEmail);
        formData.append('address', values.address);
        formData.append('city', values.city);
        formData.append('state', values.state);
        formData.append('pinCode', values.pinCode);
        formData.append('contactNumber', values.contactNumber);
        formData.append('alternateContactNumber', values.alternateContactNumber);

        if (file) {
          formData.append('userImage', file);
        }

        const result = await dispatch(updateUserBasicDetails(formData));
        if (result.payload.success) {
          setBasicData((prevState) => ({
            ...prevState,
            ...values,
            userImage: file ? URL.createObjectURL(file) : prevState.userImage
          }));
          dispatch(
            openSnackbar({
              open: true,
              message: result.payload.message,
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: true
            })
          );
          setisBasicDataEditing(false);
        }
      } catch (error) {
        dispatch(
          openSnackbar({
            open: true,
            message: error?.message || 'Something went wrong',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
    }
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBasicDataEditClick = () => setisBasicDataEditing(true);
  const handleBasicDataCancelClick = () => {
    setisBasicDataEditing(false);
    formik.resetForm();
    setImage(profileBasicData.userImage);
    setFile(null);
  };

  const specificFormik = useFormik({
    initialValues: {
      cabProviderLegalName: profileSpecificData?.cabProviderLegalName || '',
      contactPersonName: profileSpecificData?.contactPersonName || '',
      PAN: profileSpecificData?.PAN || '',
      GSTIN: profileSpecificData?.GSTIN || '',
      officeAddress: profileSpecificData?.officeAddress || '',
      officeCity: profileSpecificData?.officeCity || '',
      officeState: profileSpecificData?.officeState || '',
      officePinCode: profileSpecificData?.officePinCode || '',
      workEmail: profileSpecificData?.workEmail || '',
      workMobileNumber: profileSpecificData?.workMobileNumber || '',
      workLandLineNumber: profileSpecificData?.workLandLineNumber || '',
      bankName: profileSpecificData?.bankName || '',
      accountNumber: profileSpecificData?.accountNumber || '',
      accountHolderName: profileSpecificData?.accountHolderName || '',
      branchName: profileSpecificData?.branchName || '',
      IFSC_code: profileSpecificData?.IFSC_code || '',
      bankAddress: profileSpecificData?.bankAddress || ''
    },
    validationSchema: specificDataValidationSchema,
    onSubmit: async (values) => {
      try {
        console.log({ data: values });

        if (userSpecificInfo) {
          console.log('UPDATE API');

          const result = await dispatch(updateUserSpecificDetails({ data: values }));
          if (result.payload.success) {
            setSpecificData((prevState) => ({
              ...prevState,
              ...values
            }));
            dispatch(
              openSnackbar({
                open: true,
                message: `Specific User details have been successfully updated`,
                variant: 'alert',
                alert: { color: 'success' },
                close: true
              })
            );
            setIsSpecificDataEditing(false);
          }
        } else {
          console.log('ADD API');
          const response = await dispatch(addSpecificUserDetailsCabProvider({ data: values })).unwrap();
          if (response?.status === 201) {
            dispatch(
              openSnackbar({
                open: true,
                message: 'Specific User details have been successfully added',
                variant: 'alert',
                alert: {
                  color: 'success'
                },
                close: true
              })
            );
          }
        }
      } catch (error) {
        dispatch(
          openSnackbar({
            open: true,
            message: error?.message || 'Something went wrong',
            variant: 'alert',
            alert: { color: 'error' },
            close: true
          })
        );
      }
    }
  });

  const handleSpecificDataEditClick = () => setIsSpecificDataEditing(true);
  const handleSpecificDataCancelClick = () => {
    setIsSpecificDataEditing(false);
    specificFormik.resetForm();
  };

  useEffect(() => {
    setBasicData(profileBasicData);
  }, [profileBasicData]);

  useEffect(() => {
    setSpecificData(profileSpecificData);
  }, [profileSpecificData]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4} md={4} xl={4}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MainCard
              title={
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                  <Typography variant="h5">Personal Information</Typography>
                  {!isBasicDataEditing && (
                    <IconButton onClick={handleBasicDataEditClick}>
                      <Edit fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack position="relative" spacing={2.5} alignItems="center" mb={2}>
                    <Avatar alt="Avatar" size="xl" src={image} />
                    {isBasicDataEditing && (
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: '50%',
                          right: '50%',
                          transform: 'translate(150%, 150%)',
                          bgcolor: 'background.paper',
                          boxShadow: 2,
                          p: 0,
                          width: '2em',
                          height: '2em',
                          '&:hover': {
                            bgcolor: 'grey.300'
                          }
                        }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                    <input accept="image/*" type="file" onChange={handleImageChange} style={{ display: 'none' }} ref={fileInputRef} />
                  </Stack>
                </Grid>

                {isBasicDataEditing ? (
                  <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          label="Username"
                          name="userName"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={formik.values.userName}
                          onChange={formik.handleChange}
                          error={formik.touched.userName && Boolean(formik.errors.userName)}
                          helperText={formik.touched.userName && formik.errors.userName}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Email"
                          name="userEmail"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={formik.values.userEmail}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Address"
                          name="address"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={formik.values.address}
                          onChange={formik.handleChange}
                          error={formik.touched.address && Boolean(formik.errors.address)}
                          helperText={formik.touched.address && formik.errors.address}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="City"
                          name="city"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={formik.values.city}
                          onChange={formik.handleChange}
                          error={formik.touched.city && Boolean(formik.errors.city)}
                          helperText={formik.touched.city && formik.errors.city}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="State"
                          name="state"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={formik.values.state}
                          onChange={formik.handleChange}
                          error={formik.touched.state && Boolean(formik.errors.state)}
                          helperText={formik.touched.state && formik.errors.state}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Pin Code"
                          name="pinCode"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={formik.values.pinCode}
                          onChange={formik.handleChange}
                          error={formik.touched.pinCode && Boolean(formik.errors.pinCode)}
                          helperText={formik.touched.pinCode && formik.errors.pinCode}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Phone Number"
                          name="contactNumber"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={formik.values.contactNumber}
                          onChange={formik.handleChange}
                          error={formik.touched.contactNumber && Boolean(formik.errors.contactNumber)}
                          helperText={formik.touched.contactNumber && formik.errors.contactNumber}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Alternate Phone Number"
                          name="alternateContactNumber"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={formik.values.alternateContactNumber}
                          onChange={formik.handleChange}
                          error={formik.touched.alternateContactNumber && Boolean(formik.errors.alternateContactNumber)}
                          helperText={formik.touched.alternateContactNumber && formik.errors.alternateContactNumber}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={2} justifyContent="center">
                          <Button variant="outlined" color="secondary" onClick={handleBasicDataCancelClick}>
                            Cancel
                          </Button>
                          <Button variant="contained" color="primary" type="submit" disabled={!formik.dirty || formik.isSubmitting}>
                            Update
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </form>
                ) : (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary">
                        Username
                      </Typography>
                      <Typography color="secondary">{basicData.userName || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary">
                        Email
                      </Typography>
                      <Typography color="secondary">{basicData.userEmail || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary">
                        Address
                      </Typography>
                      <Typography color="secondary">
                        {basicData?.address && basicData?.city && basicData?.state && basicData?.pinCode
                          ? `${basicData.address}, ${basicData.city}, ${basicData.state} - ${basicData.pinCode}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary">
                        Phone Number
                      </Typography>
                      <Typography color="secondary">{basicData.contactNumber || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary">
                        Alternate Phone Number
                      </Typography>
                      <Typography color="secondary">{basicData.alternateContactNumber || 'N/A'}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={8} md={8} xl={8}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MainCard
              title={
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                  <Typography variant="h5">Specific Information</Typography>
                  {!isSpecificDataEditing && (
                    <IconButton onClick={handleSpecificDataEditClick}>
                      <Edit fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
            >
              <FormikProvider value={formik}>
                <form onSubmit={specificFormik.handleSubmit}>
                  {isSpecificDataEditing ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Cab Provider Legal Name"
                          name="cabProviderLegalName"
                          value={specificFormik.values.cabProviderLegalName}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.cabProviderLegalName && Boolean(specificFormik.errors.cabProviderLegalName)}
                          helperText={specificFormik.touched.cabProviderLegalName && specificFormik.errors.cabProviderLegalName}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Contact Person Name"
                          name="contactPersonName"
                          value={specificFormik.values.contactPersonName}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.contactPersonName && Boolean(specificFormik.errors.contactPersonName)}
                          helperText={specificFormik.touched.contactPersonName && specificFormik.errors.contactPersonName}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Work Mobile Number"
                          name="workMobileNumber"
                          value={specificFormik.values.workMobileNumber}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.workMobileNumber && Boolean(specificFormik.errors.workMobileNumber)}
                          helperText={specificFormik.touched.workMobileNumber && specificFormik.errors.workMobileNumber}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Work Landline Number"
                          name="workLandLineNumber"
                          value={specificFormik.values.workLandLineNumber}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.workLandLineNumber && Boolean(specificFormik.errors.workLandLineNumber)}
                          helperText={specificFormik.touched.workLandLineNumber && specificFormik.errors.workLandLineNumber}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Work Email"
                          name="workEmail"
                          value={specificFormik.values.workEmail}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.workEmail && Boolean(specificFormik.errors.workEmail)}
                          helperText={specificFormik.touched.workEmail && specificFormik.errors.workEmail}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="PAN"
                          name="PAN"
                          value={specificFormik.values.PAN}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.PAN && Boolean(specificFormik.errors.PAN)}
                          helperText={specificFormik.touched.PAN && specificFormik.errors.PAN}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="GSTIN"
                          name="GSTIN"
                          value={specificFormik.values.GSTIN}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.GSTIN && Boolean(specificFormik.errors.GSTIN)}
                          helperText={specificFormik.touched.GSTIN && specificFormik.errors.GSTIN}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Office Address"
                          name="officeAddress"
                          value={specificFormik.values.officeAddress}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.officeAddress && Boolean(specificFormik.errors.officeAddress)}
                          helperText={specificFormik.touched.officeAddress && specificFormik.errors.officeAddress}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Office City"
                          name="officeCity"
                          value={specificFormik.values.officeCity}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.officeCity && Boolean(specificFormik.errors.officeCity)}
                          helperText={specificFormik.touched.officeCity && specificFormik.errors.officeCity}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Office State"
                          name="officeState"
                          value={specificFormik.values.officeState}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.officeState && Boolean(specificFormik.errors.officeState)}
                          helperText={specificFormik.touched.officeState && specificFormik.errors.officeState}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Office Pin Code"
                          name="officePinCode"
                          value={specificFormik.values.officePinCode}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.officePinCode && Boolean(specificFormik.errors.officePinCode)}
                          helperText={specificFormik.touched.officePinCode && specificFormik.errors.officePinCode}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Bank Name"
                          name="bankName"
                          value={specificFormik.values.bankName}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.bankName && Boolean(specificFormik.errors.bankName)}
                          helperText={specificFormik.touched.bankName && specificFormik.errors.bankName}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Account Holder Name"
                          name="accountHolderName"
                          value={specificFormik.values.accountHolderName}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.accountHolderName && Boolean(specificFormik.errors.accountHolderName)}
                          helperText={specificFormik.touched.accountHolderName && specificFormik.errors.accountHolderName}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Account Number"
                          name="accountNumber"
                          value={specificFormik.values.accountNumber}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.accountNumber && Boolean(specificFormik.errors.accountNumber)}
                          helperText={specificFormik.touched.accountNumber && specificFormik.errors.accountNumber}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Branch Name"
                          name="branchName"
                          value={specificFormik.values.branchName}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.branchName && Boolean(specificFormik.errors.branchName)}
                          helperText={specificFormik.touched.branchName && specificFormik.errors.branchName}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="IFSC Code"
                          name="IFSC_code"
                          value={specificFormik.values.IFSC_code}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.IFSC_code && Boolean(specificFormik.errors.IFSC_code)}
                          helperText={specificFormik.touched.IFSC_code && specificFormik.errors.IFSC_code}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Bank Address"
                          name="bankAddress"
                          value={specificFormik.values.bankAddress}
                          onChange={specificFormik.handleChange}
                          error={specificFormik.touched.bankAddress && Boolean(specificFormik.errors.bankAddress)}
                          helperText={specificFormik.touched.bankAddress && specificFormik.errors.bankAddress}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                          <Button variant="outlined" onClick={handleSpecificDataCancelClick}>
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            // disabled={!specificFormik.dirty || specificFormik.isSubmitting}
                          >
                            Save
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Grid item xs={12} sm={7} md={8} xl={9}>
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <Typography variant="h6" color="primary">
                                Basic Details
                              </Typography>
                              <List sx={{ py: 0 }}>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">Cab Provider Legal Name</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.cabProviderLegalName || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">Contact Person Name</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.contactPersonName || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">PAN</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.PAN || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">GSTIN</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.GSTIN || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                              </List>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack spacing={2.5} alignItems="left">
                          <Stack spacing={0.5} alignItems="left">
                            <Typography variant="h6" color="primary">
                              Office Address
                            </Typography>
                            <Typography color="secondary">
                              {specificData?.officeAddress &&
                              specificData?.officeCity &&
                              specificData?.officeState &&
                              specificData?.officePinCode
                                ? `${specificData.officeAddress}, ${specificData.officeCity}, ${specificData.officeState} - ${specificData.officePinCode}`
                                : 'N/A'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Grid item xs={12} sm={7} md={8} xl={9}>
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <Typography variant="h6" color="primary">
                                Contact Details
                              </Typography>
                              <List sx={{ py: 0 }}>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">Work Email</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.workEmail || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">Mobile Number</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.workMobileNumber || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">Landline Number</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.workLandLineNumber || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                              </List>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="h6" color="primary">
                                Bank Details
                              </Typography>
                              <List sx={{ py: 0 }}>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">Bank Name</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.bankName || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">Account Number</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.accountNumber || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">Account Holder Name</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.accountHolderName || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">Branch</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.branchName || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">IFSC Code</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.IFSC_code || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                                <ListItem>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography color="secondary">Address</Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <Stack spacing={0.5}>
                                        <Typography>{specificData?.bankAddress || 'N/A'}</Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </ListItem>
                              </List>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                </form>
              </FormikProvider>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Overview;
