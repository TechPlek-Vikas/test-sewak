// material-ui
import { Grid, List, ListItem, Stack, Typography } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import OverviewGraph from './OverviewGraph';


// ==============================|| ACCOUNT PROFILE - BASIC ||============================== //

const Overview = ({ data, data1, vendorCompanyName }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={6} xl={6}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MainCard>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack spacing={2.5} alignItems="center">
                    <Avatar alt="Avatar 1" size="xl" src={data?.userImage} />
                    <Stack spacing={0.5} alignItems="center">
                      <Typography variant="h5">{data?.userName || "N/A"}</Typography>
                      <Typography color="secondary">{data?.userEmail || "N/A"}</Typography>
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
                      {data?.address || "N/A"}
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
                      {data?.address || "N/A"}
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
                                  <Typography>{data1?.GSTIN || "N/A"}</Typography>
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
                                  <Typography>{data1?.PAN || "N/A"}</Typography>
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
                                  <Typography>{data1?.bankName || "N/A"}</Typography>
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
                                  <Typography>{data1?.accountHolderName || "N/A"}</Typography>
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
                                  <Typography>{data1?.branchName || "N/A"}</Typography>
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
                                  <Typography>{data1?.IFSC_code || "N/A"}</Typography>
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
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6} md={6} xl={6}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <OverviewGraph vendorCompanyName={vendorCompanyName}/>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Overview;
