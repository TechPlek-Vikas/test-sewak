import { useState, Fragment, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Chip, Grid, List, ListItem, ListItemText, Stack, Switch, Typography } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import { borderColor, fontSize, fontWeight } from '@mui/system';
import { fetchsubscriptionPlan } from 'store/slice/cabProvidor/subscriptionSlice';
import { dispatch } from 'store';

// plan list
const plans = [
  {
    active: true,
    title: 'Basic',
    description: '03 Services',
    price: 69,
    permission: [0, 1, 2]
  },
  {
    active: false,
    title: 'Standard',
    description: '05 Services',
    price: 129,
    permission: [0, 1, 2, 3, 4]
  },
  {
    active: false,
    title: 'Premium',
    description: '08 Services',
    price: 599,
    permission: [0, 1, 2, 3, 4, 5, 6, 7]
  }
];

const planList = [
  'One End Product', // 0
  'No attribution required', // 1
  'TypeScript', // 2
  'Figma Design Resources', // 3
  'Create Multiple Products', // 4
  'Create a SaaS Project', // 5
  'Resale Product', // 6
  'Separate sale of our UI Elements?' // 7
];

// ==============================|| PRICING ||============================== //

const Subscription = ({ handleNext }) => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [timePeriod, setTimePeriod] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const priceListDisable = {
    opacity: 0.4,
    textDecoration: 'line-through'
  };

  const priceActivePlan = {
    padding: 3,
    borderRadius: 1,
    bgcolor: theme.palette.primary.lighter,
    boxShadow: '1px 1px 14px 1px #c1c1c1',
    borderColor: 'rgb(215 215 215 / 65%)'
  };
  const price = {
    fontSize: '40px',
    fontWeight: 700,
    lineHeight: 1
  };

  const handlePlanSelection = (planTitle) => {
    setSelectedPlan(planTitle);
    handleNext();
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await dispatch(fetchsubscriptionPlan());
      if (result?.payload?.success) {
        setData(result.payload.data);
      }
    };
    fetchData();
  }, [dispatch]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} justifyContent="space-between">
          <Stack spacing={0}>
            <Typography variant="h5">Quality is never an accident. It is always the result of intelligent effort</Typography>
            <Typography color="textSecondary">It makes no difference what the price is; it all makes sense to us.</Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="subtitle1" color={timePeriod ? 'textSecondary' : 'textPrimary'}>
              Billed Yearly
            </Typography>
            <Switch checked={timePeriod} onChange={() => setTimePeriod(!timePeriod)} inputProps={{ 'aria-label': 'container' }} />
            <Typography variant="subtitle1" color={timePeriod ? 'textPrimary' : 'textSecondary'}>
              Billed Monthly
            </Typography>
          </Stack>
        </Stack>
      </Grid>
      <Grid item container spacing={3} xs={12} alignItems="center">
        {data.map((plan, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <MainCard sx={plan.highlight ? priceActivePlan : { padding: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box>
                    <Grid container spacing={3}>
                      {plan.highlight && (
                        <Grid item xs={12} sx={{ textAlign: 'center' }}>
                          <Chip label={plan.tag} color="primary" />
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Stack spacing={0} textAlign="center">
                          <Typography variant="h4">{plan.name}</Typography>
                           {/* <Typography>{plan.description}</Typography>  */}
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={0} alignItems="center">
                          <Typography variant="h2" sx={price}>
                            ₹{plan.cost}
                          </Typography>
                          {/* <Typography variant="h6" color="textSecondary">
                            Lifetime
                          </Typography> */}
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          color={plan.title === 0 ? 'primary' : 'secondary'}
                          variant={plan.title === 0 ? 'contained' : 'outlined'}
                          fullWidth
                          onClick={() => handlePlanSelection(plan.title)}
                          sx={{
                            backgroundColor: plan.highlight ? 'rgb(70, 128, 255)' : 'transparent',
                            color: plan.highlight ? '#fff' : 'inherit',
                            borderColor: plan.highlight ? '#fff' : 'inherit',
                            ':hover': {
                              backgroundColor: plan.highlight ? 'white' : 'rgb(70, 128, 255)',
                              color: plan.highlight ? 'inherit' : '#fff',
                              borderColor: plan.highlight ? 'grey' : '#fff'
                            }
                          }}
                          disabled={!plan.highlight}
                        >
                          {plan.title === selectedPlan ? 'Selected' : 'Select Plan'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <List
                    sx={{
                      m: 0,
                      p: 0,
                      '&> li': {
                        px: 0,
                        py: 0.625
                      }
                    }}
                    component="ul"
                  >
                    <Grid item xs={12}>
                      <Stack spacing={2} textAlign="center" sx={!plan.highlight ? priceListDisable : {}}>
                        <Typography>Max Cabs: {plan.maxCabs === -1 ? 'Unlimited' : plan.maxCabs}</Typography>
                        <Typography>Max Drivers: {plan.maxDrivers < -1 ? 'Unlimited' : plan.maxDrivers}</Typography>
                        <Typography>
                          Max Users on Vendors: {plan.maxUsersOnEachVendors === -1 ? 'Unlimited' : plan.maxUsersOnEachVendors}
                        </Typography>
                        <Typography>
                          Max Users on Company: {plan.maxUsersOnEachCompany === -1 ? 'Unlimited' : plan.maxUsersOnEachCompany}
                        </Typography>
                        <Typography>
                          Max Users on Cab Providers:{' '}
                          {plan.maxUsersOnEachCabProviders === -1 ? 'Unlimited' : plan.maxUsersOnEachCabProviders}
                        </Typography>
                      </Stack>
                    </Grid>
                    {/* {planList.map((list, i) => (
                      <Fragment key={i}>
                        <ListItem 
                        sx={!plan.permission.includes(i) ? priceListDisable : {}}
                        >
                          {plan.permission.includes(i) && (
                            <span style={{ fontSize: '20px', fontWeight: 'bold', margin: '0px 8px 0px 0px' }}>&#10003;</span>
                          )}
                          <ListItemText primary={list} sx={{ textAlign: 'left' }} />
                        </ListItem>
                      </Fragment>
                    ))} */}
                  </List>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        ))}
      </Grid>
      {/* {selectedPlan && (
        <Grid item xs={12} sx={{ textAlign: 'right' }}>
          <Button variant="contained" color="primary" onClick={handleNext}>
            Next
          </Button>
        </Grid>
      )} */}
    </Grid>
  );
};

export default Subscription;