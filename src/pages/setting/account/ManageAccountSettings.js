/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { memo, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import { Form, FormikProvider, useFormik } from 'formik';
import { useNavigate } from 'react-router';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import * as Yup from 'yup';
import { FaRegUserCircle } from 'react-icons/fa';
import { textAlign } from '@mui/system';
import { addAccountSetting, mutateAccountSettings } from 'store/slice/cabProvidor/accountSettingSlice';
import { useFilePreview } from 'hooks/useFilePreview';
import axiosServices from 'utils/axios';

// const MAX_LOGO_WIDTH = 100;
// const MAX_LOGO_HEIGHT = 50;
// const MAX_SMALL_LOGO_WIDTH = 50;
// const MAX_SMALL_LOGO_HEIGHT = 25;
// const MAX_FAV_ICON_WIDTH = 10;
// const MAX_FAV_ICON_HEIGHT = 10;
const MAX_LOGO_WIDTH = 170;
const MAX_LOGO_HEIGHT = 50;
const MAX_SMALL_LOGO_WIDTH = 40;
const MAX_SMALL_LOGO_HEIGHT = 40;
const MAX_FAV_ICON_WIDTH = 60;
const MAX_FAV_ICON_HEIGHT = 60;

// Function to calculate sizes in bytes
function sizeInKB(value) {
  return value * 1024;
}

function sizeInMB(value) {
  return sizeInKB(value) * 1024;
}

function Config(fileSize, fileFormat, width = null, height = null, isUsed = false) {
  this.fileSize = fileSize;
  this.fileFormat = fileFormat;
  this.width = isUsed ? width : null;
  this.height = isUsed ? height : null;
  this.tempWidth = width;
  this.tempHeight = height;
}

Config.prototype.getSizeString = function () {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  let size = this.fileSize;
  let index = 0;
  while (size >= 1024 && index < sizes.length - 1) {
    size /= 1024;
    index++;
  }
  // return `${size.toFixed(2)} ${sizes[index]}`;
  return `${Math.round(size)} ${sizes[index]}`;
};

Config.prototype.getRecommendedSizeString = function () {
  if (this.tempWidth && this.tempHeight) {
    return `${this.tempWidth} x ${this.tempHeight} px`;
  }
  return 'No size recommendation';
};

// Configuration object using size functions
const CONFIG = {
  logo: new Config(sizeInMB(2), ['image/jpeg', 'image/png'], MAX_LOGO_WIDTH, MAX_LOGO_HEIGHT),
  smallLogo: new Config(sizeInMB(1), ['image/jpeg', 'image/png'], MAX_SMALL_LOGO_WIDTH, MAX_SMALL_LOGO_HEIGHT)
  // favIcon: new Config(sizeInKB(512), ['image/x-icon', 'image/png', 'image/svg+xml'], MAX_FAV_ICON_WIDTH, MAX_FAV_ICON_HEIGHT)
};

// const validationSchema = Yup.object().shape({
//   name: Yup.string().required('Name is required'),
//   title: Yup.string().required('Title is required'),
//   logo: Yup.mixed()
//     .nullable()
//     .test('fileSize', 'The file is too large', (value) => {
//       if (value) {
//         return value.size <= CONFIG.logo.fileSize; // 1MB max size
//       }
//       return true; // If no file is selected, validation passes
//     })
//     .test('fileFormat', 'Unsupported Format', (value) => {
//       if (value) {
//         return CONFIG.logo.fileFormat.includes(value.type);
//       }
//       return true; // If no file is selected, validation passes
//     }),

//   smallLogo: Yup.mixed()
//     .nullable()
//     .test('fileSize', 'The file is too large', (value) => {
//       if (value) {
//         return value.size <= CONFIG.smallLogo.fileSize; // 1MB max size
//       }
//       return true; // If no file is selected, validation passes
//     })
//     .test('fileFormat', 'Unsupported Format', (value) => {
//       if (value) {
//         return CONFIG.smallLogo.fileFormat.includes(value.type);
//       }
//       return true; // If no file is selected, validation passes
//     }),

//   favIcon: Yup.mixed()
//     .nullable()
//     .test('fileSize', 'The favicon file is too large', (value) => {
//       if (value) {
//         return value.size <= CONFIG.favIcon.fileSize;
//       }
//       return true;
//     })
//     .test('fileFormat', 'Unsupported favicon format', (value) => {
//       if (value) {
//         return CONFIG.favIcon.fileFormat.includes(value.type);
//       }
//       return true;
//     })
// });

// Dynamic error messages
function createFileValidation(config, fileType) {
  return Yup.mixed()
    .nullable()
    .test('fileSize', `${fileType} file is too large`, (value) => {
      if (value) {
        return value.size <= config.fileSize;
      }
      return true; // If no file is selected, validation passes
    })
    .test('fileFormat', `Unsupported ${fileType} format`, (value) => {
      if (value) {
        return config.fileFormat.includes(value.type);
      }
      return true;
    });
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  title: Yup.string().required('Title is required'),
  logo: createFileValidation(CONFIG.logo, 'Logo'),
  smallLogo: createFileValidation(CONFIG.smallLogo, 'Small logo')
  // favIcon: createFileValidation(CONFIG.favIcon, 'Favicon')
});

const ManageAccountSettings = memo(({ initialValues, isFirstTime }) => {
  console.log('ManageAccountSettings Render');
  console.log(initialValues);

  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Create a ref for the file input
  const fileSmallInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem('userInformation'));

  const CabProviderId = userInfo.userId;

  const handleButtonClick = () => {
    // Trigger the hidden file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFaviconButtonClick = () => {
    if (faviconInputRef.current) {
      faviconInputRef.current.click();
    }
  };

  const handleSmallLogoButtonClick = () => {
    if (fileSmallInputRef.current) {
      fileSmallInputRef.current.click();
    }
  };

  const formik = useFormik({
    initialValues: {
      // name: initialValues?.name || '',
      title: initialValues?.title || '',
      logo: null,
      smallLogo: null
      // favIcon: null
    },
    // validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        // alert('Form submitted');
        console.log(values);

        // TODO : API call FOR ADD/UPDATE (ONE API ONLY)

        const formData = new FormData();
        formData.append('cabProviderId', CabProviderId);
        formData.append('name', values.name);
        formData.append('title', values.title);
        if (values.logo) formData.append('logo', values.logo);
        if (values.favIcon) formData.append('favIcon', values.favIcon);
        if (values.smallLogo) formData.append('smallLogo', values.smallLogo);

        console.log(formData);

        // await new Promise((resolve) => setTimeout(resolve, 3000));

        // const response = {
        //   status: 200
        // };

        const response = await axiosServices.post('/accountSetting/add', formData);
        console.log(`🚀 ~ onSubmit: ~ response:`, response);
        console.log(`🚀 ~ onSubmit: ~ response:`, response.status);

        if (response.status === 201) {
          window.location.reload();
        }

        // if (response.status >= 200 && response.status < 300) {
        //   dispatch(addAccountSetting(response.data));

        //   resetForm();

        //   dispatch(
        //     openSnackbar({
        //       open: true,
        //       message: `Account details have been successfully ${isFirstTime ? 'created' : 'updated'}`,
        //       variant: 'alert',
        //       alert: {
        //         color: 'success'
        //       },
        //       close: true
        //     })
        //   );

        // navigate('/home', { replace: true });
      } catch (error) {
        console.log(error);
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

  const {
    preview: logoPreview,
    handleFileChange: handleLogoChange,
    handlePreviewChange: setLogoPreview
  } = useFilePreview(CONFIG.logo, 'logo', formik, '');
  const {
    preview: faviconPreview,
    handleFileChange: handleFaviconChange,
    handlePreviewChange: setFaviconPreview
  } = useFilePreview(CONFIG.favIcon, 'favIcon', formik, '');
  const {
    preview: smallLogoPreview,
    handleFileChange: handleSmallLogoChange,
    handlePreviewChange: setSmallLogoPreview
  } = useFilePreview(CONFIG.smallLogo, 'smallLogo', formik, '');

  useEffect(() => {
    if (!isFirstTime) {
      if (initialValues && initialValues.logo) setLogoPreview(initialValues.logo);

      if (initialValues && initialValues.favIcon) setFaviconPreview(initialValues.favIcon);

      if (initialValues && initialValues.smallLogo) setSmallLogoPreview(initialValues.smallLogo);
    }
  }, [initialValues, isFirstTime]);

  return (
    <>
      <MainCard title="Account Settings">
        <FormikProvider value={formik}>
          <Form onSubmit={formik.handleSubmit} noValidate>
            <Stack gap={2}>
              <Grid container spacing={3}>
                {/* Logo */}
                <Grid item xs={12}>
                  <Stack gap={2}>
                    {/* Logo's */}
                    <MainCard
                      title="Logo"
                      sx={{
                        '& .MuiCardHeader-root': {
                          textAlign: 'center'
                        }
                      }}
                    >
                      <Grid container spacing={2}>
                        {/* Big Logo */}
                        <Grid item xs={6}>
                          <Stack direction="column" alignItems="center" spacing={2}>
                            {/* Title */}
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Upload Logo
                            </Typography>

                            {/* Drag and Drop Zone */}
                            <div
                              onClick={handleButtonClick}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                handleLogoChange({ target: { files: [file] } });
                              }}
                              style={{
                                width: 150,
                                height: 150,
                                border: logoPreview ? 'none' : '2px dashed #1976d2',
                                borderRadius: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                background: logoPreview ? `url(${logoPreview}) no-repeat center / cover` : '#f0f0f0',
                                overflow: 'hidden'
                              }}
                              title="Click or drag an image to upload"
                            >
                              {/* Default Icon */}
                              {!logoPreview && <FaRegUserCircle style={{ fontSize: 50, color: '#90caf9' }} />}

                              {/* Hidden File Input */}
                              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
                            </div>

                            {/* Validation Feedback */}
                            {formik.touched.logo && formik.errors.logo ? (
                              <Typography variant="body2" color="error">
                                {formik.errors.logo}
                              </Typography>
                            ) : (
                              <Stack gap={1}>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray' }}>
                                  * Accepts JPEG/PNG formats up to {CONFIG.logo.getSizeString()}.
                                </Typography>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray' }}>
                                  * Recommended image size: {CONFIG.logo.getRecommendedSizeString()}.
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Grid>

                        {/* Small Logo */}
                        <Grid item xs={6}>
                          <Stack direction="column" alignItems="center" spacing={2}>
                            {/* Title */}
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Upload Small Logo
                            </Typography>

                            {/* Drag and Drop Zone */}
                            <div
                              onClick={handleSmallLogoButtonClick}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                handleSmallLogoChange({ target: { files: [file] } });
                              }}
                              style={{
                                width: 150,
                                height: 150,
                                border: smallLogoPreview ? 'none' : '2px dashed #1976d2',
                                borderRadius: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                background: smallLogoPreview ? `url(${smallLogoPreview}) no-repeat center / cover` : '#f0f0f0',
                                overflow: 'hidden'
                              }}
                              title="Click or drag an image to upload"
                            >
                              {/* Default Icon */}
                              {!smallLogoPreview && <FaRegUserCircle style={{ fontSize: 50, color: '#90caf9' }} />}

                              {/* Hidden File Input */}
                              <input ref={fileSmallInputRef} type="file" accept="image/*" hidden onChange={handleSmallLogoChange} />
                            </div>

                            {/* Validation Feedback */}
                            {formik.touched.smallLogo && formik.errors.smallLogo ? (
                              <Typography variant="body2" color="error">
                                {formik.errors.smallLogo}
                              </Typography>
                            ) : (
                              <Stack gap={1}>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray' }}>
                                  * Accepts JPEG/PNG formats up to {CONFIG.smallLogo.getSizeString()}.
                                </Typography>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray' }}>
                                  * Recommended image size: {CONFIG.smallLogo.getRecommendedSizeString()}.
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    </MainCard>

                    {/* Title */}
                    <Stack spacing={1}>
                      <InputLabel htmlFor="title" sx={{ fontWeight: 600 }}>
                        Title
                      </InputLabel>
                      <TextField
                        fullWidth
                        {...formik.getFieldProps('title')}
                        id="title"
                        type="text"
                        // label="Title"
                        placeholder="Title"
                        onBlur={formik.handleBlur}
                        error={formik.touched.title && Boolean(formik.errors.title)}
                        helperText={formik.touched.title && formik.errors.title}
                      />
                    </Stack>
                  </Stack>
                </Grid>

                {/* Fav Icon */}
                {/* <Grid item xs={12} md={6}>
                  <MainCard title="Favicon" sx={{ textAlign: 'center', padding: 3 }}>
                    <Stack direction="column" alignItems="center" spacing={2}>
                      <Typography variant="body1" color="textSecondary">
                        Add a favicon to personalize your account settings. Supported formats: .ico, .png, .svg.
                      </Typography>
                      <Avatar
                        src={faviconPreview || '/static/images/favicon-placeholder.png'} // Placeholder image
                        alt="Favicon"
                        sx={{
                          width: 64,
                          height: 64,
                          cursor: 'pointer',
                          border: '2px dashed',
                          borderColor: formik.errors.favIcon ? 'error.main' : 'primary.main',
                          '&:hover': {
                            borderColor: 'primary.dark',
                            transform: 'scale(1.05)',
                            transition: 'transform 0.3s ease, border-color 0.3s ease'
                          }
                        }}
                        onClick={handleFaviconButtonClick}
                        title="Click to upload favicon"
                      />
                      <input
                        ref={faviconInputRef}
                        type="file"
                        // accept=".ico,image/png,image/svg+xml"
                        accept="image/*"
                        hidden
                        onChange={handleFaviconChange}
                      />
                      <FormControl fullWidth sx={{ alignItems: 'center' }}>
                        <FormHelperText sx={{ fontStyle: 'italic', color: formik.errors.favIcon ? 'error.main' : 'textSecondary' }}>
                          {formik.touched.favIcon && formik.errors.favIcon ? (
                            formik.errors.favIcon
                          ) : (
                            <Stack gap={1}>
                              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray' }}>
                                * Upload a favicon file (.ico, .png, .svg, max {CONFIG.favIcon.getSizeString()}).
                              </Typography>
                              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray' }}>
                                * Recommended image size: {CONFIG.favIcon.getRecommendedSizeString()}.
                              </Typography>
                            </Stack>
                          )}
                        </FormHelperText>
                      </FormControl>
                    </Stack>
                  </MainCard>
                </Grid> */}

                {/* Name */}
                {/* <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="name" sx={{ fontWeight: 600 }}>
                      Name
                    </InputLabel>
                    <TextField
                      fullWidth
                      {...formik.getFieldProps('name')}
                      id="name"
                      type="text"
                      // label="Name"
                      placeholder="Name"
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                    />
                  </Stack>
                </Grid> */}

                {/* Title */}
                {/* <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="title" sx={{ fontWeight: 600 }}>
                      Title
                    </InputLabel>
                    <TextField
                      fullWidth
                      {...formik.getFieldProps('title')}
                      id="title"
                      type="text"
                      // label="Title"
                      placeholder="Title"
                      onBlur={formik.handleBlur}
                      error={formik.touched.title && Boolean(formik.errors.title)}
                      helperText={formik.touched.title && formik.errors.title}
                    />
                  </Stack>
                </Grid> */}

                {/* Favicon */}
                {/* <Grid item xs={12} sm={6}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="h5">Favicon</Typography>
                    <Avatar
                      src={faviconPreview || ''}
                      alt="Favicon"
                      sx={{ width: 64, height: 64, cursor: 'pointer' }}
                      title="Upload Favicon"
                      onClick={handleFaviconButtonClick}
                    ></Avatar>
                    <input ref={faviconInputRef} type="file" accept=".ico,image/png,image/svg+xml" hidden onChange={handleFaviconChange} />
                    <FormControl fullWidth sx={{ alignItems: 'center' }}>
                      <FormHelperText sx={{ fontStyle: 'italic' }}>
                        {formik.touched.favIcon && formik.errors.favIcon
                          ? formik.errors.favIcon
                          : '* Upload a favicon file (.ico, .png, .svg, max 512KB)'}
                      </FormHelperText>
                    </FormControl>
                  </Stack>
                </Grid> */}

                {/* <Grid item xs={12}>
                  <Typography variant="subtitle1">Favicon</Typography>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2 }}>
                    <Avatar
                      sx={{ width: 64, height: 64, cursor: 'pointer' }}
                      src={faviconPreview || ''}
                      onClick={() => faviconInputRef.current.click()}
                    />
                    <Button variant="contained" size="small" onClick={() => faviconInputRef.current.click()}>
                      Upload Favicon
                    </Button>
                    <input ref={faviconInputRef} type="file" accept=".ico,image/png,image/svg+xml" hidden onChange={handleFaviconChange} />
                  </Stack>
                </Grid> */}
              </Grid>

              <Divider />

              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    navigate(-1, { replace: true });
                  }}
                  title="Cancel"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  title={isFirstTime ? 'Save' : 'Update'}
                  disabled={formik.isSubmitting || !formik.dirty}
                >
                  {isFirstTime ? 'Save' : 'Update'}
                </Button>
              </Stack>
            </Stack>
          </Form>
        </FormikProvider>
      </MainCard>
    </>
  );
});

// Add displayName for debugging
ManageAccountSettings.displayName = 'ManageAccountSettings';

export default ManageAccountSettings;
