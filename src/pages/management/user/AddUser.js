import { Button, Divider, Grid, Stack, Step, StepLabel, Stepper } from '@mui/material';
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import { USERTYPE } from 'constant';
import { Form, FormikProvider, useFormik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import BasicInfo from 'sections/cabprovidor/userManagement/BasicInfo';
import SpecificInfo from 'sections/cabprovidor/userManagement/SpecificInfo';
import { openSnackbar } from 'store/reducers/snackbar';
import { addSpecificUserDetails, addUserDetails, clearUserDetails, registerUser, reset } from 'store/slice/cabProvidor/userSlice';
import axiosServices from 'utils/axios';
import * as Yup from 'yup';

const steps = ['Basic details', 'Specific details'];

const basicInfoValidationSchema = Yup.object({
  userName: Yup.string().required('User Name is required').min(3, 'User Name must be at least 3 characters'),
  userEmail: Yup.string().email('Invalid email format').required('Email is required'),
  userPassword: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  userConfirmPassword: Yup.string()
    .required('Confirm Password is required')
    .oneOf([Yup.ref('userPassword'), null], 'Passwords must match'),
  contactNumber: Yup.string().matches(/^\d{10}$/, 'Contact Number must be a 10 digit number'),
  alternateContactNumber: Yup.string()
    .matches(/^\d{10}$/, 'Alternate Contact Number must be a 10 digit number')
    .notRequired(),
  address: Yup.string(),
  // userType: Yup.string().required('User Type is required'),
  pinCode: Yup.string(),
  city: Yup.string(),
  state: Yup.string()
});

const specificValidationSchema = Yup.object({
  roleId: Yup.string().required('Role is required'), // Only roleId is required
  bankName: Yup.string().nullable(),
  branchName: Yup.string().nullable(),
  accountNumber: Yup.string().nullable(),
  accountHolderName: Yup.string().nullable(),
  PAN: Yup.string().nullable(),
  IFSC_code: Yup.string().nullable(),
  bankAddress: Yup.string().nullable(),
  officeChargeAmount: Yup.string().nullable(),
  ESI_Number: Yup.string().nullable(),
  PF_Number: Yup.string().nullable()
});

const SpecificInfoInitialValues = {
  [USERTYPE.iscabProvider]: {
    roleId: '',

    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolderName: '',
    PAN: '',
    IFSC_code: '',
    bankAddress: ''

    // role_name: "",
  },
  [USERTYPE.isVendor]: {
    roleId: '',

    bankName: '',
    branchName: '',
    bankAddress: '',
    accountNumber: '',
    accountHolderName: '',
    PAN: '',
    IFSC_code: '',

    officeChargeAmount: '',
    ESI_Number: '',
    PF_Number: ''

    // role_name: "",
  }
};

const getInitialValuesForCreation = (step, userType) => {
  switch (step) {
    case 0:
      return {
        userName: '',
        userEmail: '',
        userPassword: '',
        userConfirmPassword: '',
        contactNumber: '',
        alternateContactNumber: '',
        address: '',
        userType: 7,
        pinCode: '',
        city: '',
        state: '',
        userImage: null
      };
    case 1:
      return SpecificInfoInitialValues[userType] || {};
    default:
      throw new Error('Unknown step');
  }
};

function getStepContent(step, handlePermission) {
  switch (step) {
    case 0:
      return <BasicInfo />;
    case 1:
      return <SpecificInfo handlePermission={handlePermission} />;
    default:
      throw new Error('Unknown step');
  }
}

const getPayloadForSpecificDetailsCreation = (data, userType, userID) => {
  switch (userType) {
    case USERTYPE.iscabProvider:
      return {
        data: {
          cabProviderUserId: userID,
          cabProviderUserRoleId: data.roleId,
          PAN: data.PAN,
          bankName: data.bankName,
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          branchName: data.branchName,
          IFSC_code: data.IFSC_code,
          bankAddress: data.bankAddress
        }
      };

    case USERTYPE.isVendor:
      return {
        data: {
          vendorUserId: userID,
          vendorUserRoleId: data.roleId,
          PAN: data.PAN,
          bankName: data.bankName,
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          branchName: data.branchName,
          IFSC_code: data.IFSC_code,
          bankAddress: data.bankAddress,
          officeChargeAmount: data.officeChargeAmount,
          ESI_Number: Number(data.ESI_Number) || 0,
          PF_Number: data.PF_Number
        }
      };

    default:
      throw new Error('Unknown user type');
  }
};

const AddUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [permission, setPermission] = useState(null);

  const userType = useSelector((state) => state.auth.userType);
  const userID = useSelector((state) => state.users.userDetails?._id);

  const setValidationSchema = () => {
    switch (activeStep) {
      case 0:
        return basicInfoValidationSchema;
      case 1:
        return specificValidationSchema;
      default:
        return null;
    }
  };

  const handlePermission = useCallback((result) => {
    setPermission(result);
  }, []);

  const formik = useFormik({
    initialValues: getInitialValuesForCreation(activeStep, userType),
    enableReinitialize: true,
    validationSchema: setValidationSchema(),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (activeStep === 0) {
          console.log('Tina = ', formik.isValid);
          const id = userType === USERTYPE.iscabProvider ? USERTYPE.iscabProviderUser : USERTYPE.isVendorUser;
          const formData = new FormData();
          formData.append('userImage', values.userImage);
          formData.append('userName', values.userName);
          formData.append('userEmail', values.userEmail);
          formData.append('userPassword', values.userPassword);
          formData.append('contactNumber', values.contactNumber);
          formData.append('alternateContactNumber', values.alternateContactNumber);
          formData.append('userType', id);
          formData.append('pinCode', values.pinCode);
          formData.append('city', values.city);
          formData.append('state', values.state);
          formData.append('address', values.address);

          const response = await dispatch(registerUser(formData)).unwrap();

          if (response?.status === 201) {
            dispatch(addUserDetails(response?.data));

            setActiveStep((p) => p + 1);

            dispatch(
              openSnackbar({
                open: true,
                message: 'Basic User details have been successfully added',
                variant: 'alert',
                alert: {
                  color: 'success'
                },
                close: true
              })
            );

            resetForm(); // Reset the form after successful submission

            setSubmitting(false);
          }
        } else {
          if (!permission) {
            alert('Please select role');

            return;
          }

          const payload = getPayloadForSpecificDetailsCreation(values, userType, userID);

          // const response = await dispatch(addSpecificUserDetails(payload)).unwrap();

          const payload2 = {
            data: {
              uid: userID,
              permissions: permission
            }
          };

          // const response2 = await axiosServices.post('/user/assign/specific/permission', payload2);

          const callFirstAPI = () => dispatch(addSpecificUserDetails(payload)).unwrap();

          const callSecondAPI = () => axiosServices.post('/user/assign/specific/permission', payload2);

          const results = await Promise.allSettled([callFirstAPI(), callSecondAPI()]);

          const [response, response2] = results;

          // if (response?.status === 201) {
          if (response?.status === 'fulfilled' && response2?.status === 'fulfilled') {
            resetForm(); // Reset the form after successful submission
            setSubmitting(false);

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

            dispatch(clearUserDetails());

            navigate('/management/user/view', { replace: true });
          }
        }
        // alert(JSON.stringify(values, null, 2));
      } catch (error) {
        console.log('error', error);

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

  const { handleSubmit, isSubmitting, dirty, isValid } = formik;

  const handleNext = () => {
    // Set all fields to touched
    formik.setTouched({
      userName: true,
      userEmail: true,
      userPassword: true,
      userConfirmPassword: true,
      roleId: true
    });
    if (isValid) {
      handleSubmit();
    }
  };

  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  return (
    <>
      <>
        <FormikProvider value={formik}>
          <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <Grid container spacing={2.5} justifyContent="center">
              <Grid item xs={12} md={10}>
                <MainCard>
                  <Grid container spacing={2.5} justifyContent="center">
                    <Grid item xs={12} md={6}>
                      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                        {steps.map((label) => (
                          <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    <Grid item xs={12}>
                      {getStepContent(activeStep, handlePermission)}
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    <Grid item xs={12}>
                      <Stack direction="row" justifyContent="flex-end">
                        <AnimateButton>
                          <Button variant="contained" onClick={handleNext} sx={{ my: 3, ml: 1 }} disabled={isSubmitting || !dirty}>
                            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                          </Button>
                        </AnimateButton>
                      </Stack>
                    </Grid>
                  </Grid>
                </MainCard>
              </Grid>
            </Grid>
          </Form>
        </FormikProvider>
      </>
    </>
  );
};

export default AddUser;
