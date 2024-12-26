import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as Yup from 'yup';

// material-ui
import { Button, FormHelperText, Grid, Link, InputAdornment, InputLabel, OutlinedInput, Stack } from '@mui/material';

// third-party
import { ArrowRight, Eye, EyeSlash, Sms } from 'iconsax-react';

// project imports
import useScriptRef from 'hooks/useScriptRef';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import { credentials, EMAIL_REGEX_PATTERN, MOBILE_NUMBER_REGEX_PATTERN } from 'constant';
import useAuth from 'hooks/useAuth';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

// Validation schema with email or phone
const validationSchema = Yup.object().shape({
  identifier: Yup.string()
    .required('Email or phone number is required')
    .test('is-valid-identifier', 'Must be a valid email or phone number', (value) => {
      return EMAIL_REGEX_PATTERN.test(value) || MOBILE_NUMBER_REGEX_PATTERN.test(value);
    }),
  password: Yup.string().max(255).required('Password is required')
});

// ============================|| JWT - LOGIN ||============================ //

const AuthLogin = () => {
  const { login } = useAuth();
  const scriptedRef = useScriptRef();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Formik
        initialValues={{
          // email: credentials.email,
          // password: credentials.password
          // email: '',
          identifier: '',
          password: ''
        }}
        // validationSchema={Yup.object().shape({
        //   email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
        //   password: Yup.string().max(255).required('Password is required')
        // })}
        validationSchema={validationSchema}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const isEmail = EMAIL_REGEX_PATTERN.test(values.identifier);
            const payload = isEmail
              ? { userEmail: values.identifier, userPassword: values.password }
              : { userMobileNumber: values.identifier, userPassword: values.password };

            console.log(`🚀 ~ onSubmit= ~ payload:`, payload);

            await login(payload);
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);

              // alert('Login done');
            }
          } catch (err) {
            if (err.response.status === 400) {
              dispatch(
                openSnackbar({
                  open: true,
                  message: err.response.data.message,
                  variant: 'alert',
                  alert: {
                    color: 'error'
                  },
                  close: true
                })
              );
            }
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {/* <Stack spacing={1}>
                  <InputLabel htmlFor="email-login" style={{ color: 'black', fontWeight: '600' }}>
                    What is your Email?
                  </InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    color="secondary"
                    fullWidth
                    startAdornment={
                      <InputAdornment position="start">
                        <Sms />
                      </InputAdornment>
                    }
                  />
                  {touched.email && errors.email && (
                    <FormHelperText error id="standard-weight-helper-text-email-login">
                      {errors.email}
                    </FormHelperText>
                  )}
                </Stack> */}

                <Stack spacing={1}>
                  <InputLabel htmlFor="identifier-login" style={{ color: 'black', fontWeight: '600' }}>
                    Email or Phone
                  </InputLabel>
                  <OutlinedInput
                    id="identifier-login"
                    type="text"
                    value={values.identifier}
                    name="identifier"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter email or phone number"
                    color="secondary"
                    fullWidth
                    startAdornment={
                      <InputAdornment position="start">
                        <Sms />
                      </InputAdornment>
                    }
                  />
                  {touched.identifier && errors.identifier && (
                    <FormHelperText error id="standard-weight-helper-text-identifier-login">
                      {errors.identifier}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-login" style={{ color: 'black', fontWeight: '600' }}>
                    Password
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    id="password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    color="secondary"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <Eye /> : <EyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter password"
                  />
                  {touched.password && errors.password && (
                    <FormHelperText error id="standard-weight-helper-text-password-login">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              {/* {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )} */}
              <Grid item xs={9}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    style={{ backgroundColor: 'black' }}
                  >
                    Login to your account <ArrowRight />
                  </Button>
                </AnimateButton>
              </Grid>

              <Grid item xs={12} sx={{ mt: -1 }}>
                <Stack direction="column" justifyContent="space-between" alignItems="left" spacing={1}>
                  <Link variant="h6" component={RouterLink} to="/auth/register" color="#959595" fontWeight={'500'}>
                    Create an account?
                  </Link>

                  <Link variant="h6" component={RouterLink} to="/auth/forgot-password" color="#959595" fontWeight={'500'}>
                    Forgot Password?
                  </Link>
                </Stack>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

AuthLogin.propTypes = {
  forgot: PropTypes.string
};

export default AuthLogin;
