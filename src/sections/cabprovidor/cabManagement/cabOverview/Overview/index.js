import { Grid, List, ListItem, Stack, Typography } from '@mui/material';
import OverviewGraph from './OverviewGraph';
import { useSelector } from 'store';
import MainCard from 'components/MainCard';
import { formatDate } from 'utils/helper';

const Overview = () => {
  const { loading, getSingleDetails: cabDetails } = useSelector((state) => state.cabs);
  console.log(`🚀 ~ Overview ~ cabDetails:`, cabDetails);

  return (
    <>
      <Grid container spacing={2}>
        {/* Details */}
        <Grid item xs={12} sm={6} md={6} xl={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <MainCard>
                <Grid container spacing={3}>
                  {/* Cab Information */}
                  <Grid item xs={12}>
                    <Stack spacing={2.5} alignItems="left">
                      <Typography variant="h6" color="primary">
                        Cab Information
                      </Typography>

                      <List sx={{ py: 0 }}>
                        {/* Cab Name */}
                        <ListItem>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography color="secondary">Cab Name</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography>{cabDetails?.vehicleName}</Typography>
                            </Grid>
                          </Grid>
                        </ListItem>

                        {/* Cab Number */}
                        <ListItem>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography color="secondary">Cab Number</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography>{cabDetails?.vehicleNumber}</Typography>
                            </Grid>
                          </Grid>
                        </ListItem>

                        {/* Cab Type */}
                        <ListItem>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography color="secondary">Cab Type</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography>{cabDetails?.vehicletype?.vehicleTypeName}</Typography>
                            </Grid>
                          </Grid>
                        </ListItem>
                      </List>
                    </Stack>
                  </Grid>

                  {/* Document Information */}
                  <Grid item xs={12}>
                    <Stack spacing={2.5} alignItems="left">
                      <Typography variant="h6" color="primary">
                        Document Information
                      </Typography>

                      <List sx={{ py: 0 }}>
                        {/* Fitness Date */}
                        <ListItem>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography color="secondary">Fitness Date</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography>{formatDate(cabDetails?.fitnessDate)}</Typography>
                            </Grid>
                          </Grid>
                        </ListItem>

                        {/* Insurance Expiry Date */}
                        <ListItem>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography color="secondary">Insurance Expiry Date</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography>{formatDate(cabDetails?.insuranceExpiryDate)}</Typography>
                            </Grid>
                          </Grid>
                        </ListItem>

                        {/* Pollution Expiry Date */}
                        <ListItem>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography color="secondary">Pollution Expiry Date</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography>{formatDate(cabDetails?.pollutionExpiryDate)}</Typography>
                            </Grid>
                          </Grid>
                        </ListItem>

                        {/* Permit Expiry Date (1 year) */}
                        <ListItem>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography color="secondary">Permit Expiry Date (1 year)</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography>{formatDate(cabDetails?.permitOneYrExpiryDate)}</Typography>
                            </Grid>
                          </Grid>
                        </ListItem>

                        {/* Permit Expiry Date (5 year's) */}
                        <ListItem>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography color="secondary">Permit Expiry Date (5 year&#39;s)</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography>{formatDate(cabDetails?.permitFiveYrExpiryDate)}</Typography>
                            </Grid>
                          </Grid>
                        </ListItem>
                      </List>
                    </Stack>
                  </Grid>
                </Grid>
              </MainCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Graph */}
        <Grid item xs={12} sm={6} md={6} xl={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <OverviewGraph />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Overview;
