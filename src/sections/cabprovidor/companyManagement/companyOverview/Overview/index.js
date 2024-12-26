// material-ui
import { Grid, List, ListItem, Stack, Typography } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import OverviewGraph from './OverviewGraph';
import AccessControlWrapper from 'components/common/guards/AccessControlWrapper';
import { USERTYPE } from 'constant';
import InvoiceStats from './InvoiceStats';

const avatarImage = require.context('assets/images/users', true);

// ==============================|| ACCOUNT PROFILE - BASIC ||============================== //

const Overview = ({ data }) => {
  console.log('data', data);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={6} xl={6}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MainCard>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack spacing={2.5} alignItems="center">
                    <Avatar alt="Avatar 1" size="xl" src={avatarImage(`./default.png`)} />
                    <Stack spacing={0.5} alignItems="center">
                      <Typography variant="h5">{data?.company_name || 'N/A'}</Typography>
                      <Typography color="secondary">{data?.company_email || 'N/A'}</Typography>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Stack spacing={2.5} alignItems="left">
                    <Stack spacing={0.5} alignItems="left">
                      <Typography variant="h6" color="primary">
                        Billing Address
                      </Typography>
                      <Typography color="secondary">
                        {data?.address && data?.city && data?.state && data?.postal_code
                          ? `${data.address}, ${data.city}, ${data.state} - ${data.postal_code}`
                          : 'N/A'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={2.5} alignItems="left">
                    <Stack spacing={0.5} alignItems="left">
                      <Typography variant="h6" color="primary">
                        Shipping Address
                      </Typography>
                      <Typography color="secondary">
                        {data?.address && data?.city && data?.state && data?.postal_code
                          ? `${data.address}, ${data.city}, ${data.state} - ${data.postal_code}`
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
                          Other Details
                        </Typography>
                        <List sx={{ py: 0 }}>
                          <ListItem>
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={6}>
                                <Stack spacing={0.5}>
                                  <Typography color="secondary">Customer Type</Typography>
                                </Stack>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Stack spacing={0.5}>
                                  <Typography>Business</Typography>
                                </Stack>
                              </Grid>
                            </Grid>
                          </ListItem>
                          <ListItem>
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={6}>
                                <Stack spacing={0.5}>
                                  <Typography color="secondary">Default Currency</Typography>
                                </Stack>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Stack spacing={0.5}>
                                  <Typography>INR</Typography>
                                </Stack>
                              </Grid>
                            </Grid>
                          </ListItem>
                          <ListItem>
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={6}>
                                <Stack spacing={0.5}>
                                  <Typography color="secondary">GST Treatment</Typography>
                                </Stack>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Stack spacing={0.5}>
                                  <Typography>Registered Business-Regular</Typography>
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
                                  <Typography>{data?.GSTIN || 'N/A'}</Typography>
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
                                  <Typography>{data?.PAN || 'N/A'}</Typography>
                                </Stack>
                              </Grid>
                            </Grid>
                          </ListItem>
                        </List>
                      </Grid>
                      <AccessControlWrapper allowedUserTypes={[USERTYPE.iscabProvider]}>
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
                                    {/* <Typography>HDFC</Typography> */}
                                    <Typography>N/A</Typography>
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
                                    {/* <Typography>Shiv</Typography> */}
                                    <Typography>N/A</Typography>
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
                                    {/* <Typography>Patel Nagar</Typography> */}
                                    <Typography>N/A</Typography>
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
                                    {/* <Typography>07AAFCL6776MZ</Typography> */}
                                    <Typography>N/A</Typography>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </ListItem>
                          </List>
                        </Grid>
                      </AccessControlWrapper>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6} md={6} xl={6}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* <OverviewGraph /> */}
            <InvoiceStats />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Overview;
