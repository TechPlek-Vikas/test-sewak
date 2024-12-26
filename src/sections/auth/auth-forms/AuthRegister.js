/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  Link,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project-imports
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import { Eye, EyeSlash } from 'iconsax-react';
import { faker } from '@faker-js/faker';

// ============================|| JWT - REGISTER ||============================ //

const AuthRegister = () => {
  // eslint-disable-next-line no-unused-vars
  const { register } = useAuth();
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();

  const [level, setLevel] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    changePassword('');
  }, []);

  return (
    <>
      <Formik
        initialValues={{
          // userEmail: 'cp10@gmail.com',
          // userName: 'cp10',
          // userPassword: 'Asdf@123',
          userEmail: '',
          userName: '',
          userPassword: '',
          userType: 1,
          pinCode: faker.string.numeric(6),
          contactNumber: faker.string.numeric(10),
          alternateContactNumber: faker.string.numeric(10),
          submit: null
        }}
        validationSchema={Yup.object().shape({
          userEmail: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          userPassword: Yup.string().max(255).required('Password is required'),
          userName: Yup.string().max(255).required('Username is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const formData = new FormData();
            formData.append('userEmail', values.userEmail);
            formData.append('userPassword', values.userPassword);
            formData.append('userName', values.userName);

            formData.append('contactNumber', values.contactNumber);
            formData.append('alternateContactNumber', values.alternateContactNumber);
            formData.append('userType', values.userType);
            formData.append('pinCode', values.pinCode);

            const response = await register(formData);
            console.log("response", response);
            // setUserId(response.data.data?._id);

            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              dispatch(
                openSnackbar({
                  open: true,
                  message: 'Your registration has been successfully completed.',
                  variant: 'alert',
                  alert: {
                    color: 'success'
                  },
                  close: false
                })
              );

              navigate('/auth', { replace: true });
            }
          } catch (err) {
            console.error('Error at AuthRegister = ', err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              dispatch(
                openSnackbar({
                  message: err?.response?.data?.message || err.message || 'Error registering user',
                  variant: 'error',
                  open: true,
                  close: true
                })
              );

              setErrors({ submit: err?.response?.data?.message || err.message });

              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} autoComplete="off">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="username" required>
                    Username
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.userName && errors.userName)}
                    id="userName"
                    value={values.userName}
                    name="userName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Demo Inc."
                    inputProps={{ autoComplete: 'off' }}
                  />
                  {touched.userName && errors.userName && (
                    <FormHelperText error id="helper-text-userName">
                      {errors.userName}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="userEmail-signup" required>
                    Email Address
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.userEmail && errors.userEmail)}
                    id="userEmail-login"
                    type="userEmail"
                    value={values.userEmail}
                    name="userEmail"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="demo@company.com"
                    inputProps={{ autoComplete: 'off' }}
                  />
                  {touched.userEmail && errors.userEmail && (
                    <FormHelperText error id="helper-text-userEmail-signup">
                      {errors.userEmail}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="userPassword-signup" required>
                    Password
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.userPassword && errors.userPassword)}
                    id="userPassword-signup"
                    type={showPassword ? 'text' : 'password'} // Use 'password' instead of 'userPassword'
                    value={values.userPassword}
                    name="userPassword"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle userPassword visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <Eye /> : <EyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="******"
                    inputProps={{ autoComplete: 'new-password' }}
                  />
                  {touched.userPassword && errors.userPassword && (
                    <FormHelperText error id="helper-text-userPassword-signup">
                      {errors.userPassword}
                    </FormHelperText>
                  )}
                </Stack>
                {/* <FormControl fullWidth sx={{ mt: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1" fontSize="0.75rem">
                        {level?.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </FormControl> */}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  By Signing up, you agree to our &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    Terms of Service
                  </Link>
                  &nbsp; and &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    Privacy Policy
                  </Link>
                </Typography>
              </Grid>
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Create Account
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthRegister;
