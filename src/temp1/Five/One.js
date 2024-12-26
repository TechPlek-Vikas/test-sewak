import React from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Grid, Box } from '@mui/material';

const validationSchema = Yup.object()
  .shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email address').nullable(),
    phone: Yup.string()
      .matches(/^[0-9]+$/, 'Phone number should contain only numbers')
      .nullable()
  })
  .test('email-or-phone', 'Either email or phone is required', function (values) {
    const { email, phone } = values;
    if (!email && !phone) {
      return this.createError({
        path: 'email', // Highlight email field by default
        message: 'Either email or phone is required'
      });
    }
    return true;
  });

const One = () => {
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      phone: '',
      city: ''
    },
    validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    }
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} sx={{ maxWidth: 600, margin: '0 auto' }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              aria-required="true"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email ? formik.errors.email : 'Enter your email or phone number'}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={
                formik.touched.phone && formik.errors.phone ? formik.errors.phone : 'Enter your phone number if email is not provided'
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.city && Boolean(formik.errors.city)}
              helperText={formik.touched.city && formik.errors.city}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!formik.isValid || formik.isSubmitting}
                sx={{ minWidth: 120 }}
              >
                Submit
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </FormikProvider>
  );
};

export default One;
