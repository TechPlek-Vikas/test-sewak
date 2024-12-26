// material-ui
import { Grid, Stack, Typography } from '@mui/material';
import LogoMain from 'components/logo/logoOrganisation/LogoMain';
// import LogoMain from 'components/logo/LogoMain';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';

// project-imports
import AuthWrapper2 from 'sections/auth/AuthWrapper2';


// ================================|| LOGIN ||================================ //

const Login = () => {

  return (
    <AuthWrapper2>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ textAlign: 'left' }}>
          <LogoMain />
        </Grid>
       
        <Grid item xs={12}>
        <Stack direction="column" justifyContent="space-between" alignItems="left" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
        <Typography variant="h1" fontSize={"52px"}>Welcome to the </Typography>
        <Typography variant="h1" fontSize={"52px"} color={"#ffb724"}>Sewak</Typography>
        </Stack>
        </Grid>
       
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="left" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography color={"#959595"} fontSize={"1.01rem"} fontWeight={"500"}>Enter your valid email and password to continue.</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin/>
        </Grid>
      </Grid>
    </AuthWrapper2>
  );
};

export default Login;
