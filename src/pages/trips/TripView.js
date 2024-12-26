import { useEffect, useState } from 'react';

// material-ui
import { Divider, Fade, CardContent, Modal, Stack, Typography, Button, Grid, CircularProgress } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import { formatDateUsingMoment } from 'utils/helper';

export default function TransitionsModal({ isOpen, onClose, selectedTripId }) {
  const [tripDetails, setTripDetails] = useState(selectedTripId);
  console.log({ tripDetails });
  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
    >
      <Fade in={isOpen}>
        <MainCard
          title="Trip Details"
          modal
          darkTitle
          content={false}
          sx={{
            width: '100%', // Adjust the width as needed
            maxWidth: '900px' // Set a maximum width
          }}
        >
          {
            <>
              <CardContent>
                <Stack direction="row" spacing={1} justifyContent={'space-around'} alignItems={'center'} sx={{ pb: 2 }}>
                  <Grid item>
                    <Typography variant="h5" color="textSecondary">
                      Trip Information
                    </Typography>
                    <Divider />
                  </Grid>
                  <Grid item>
                    <Typography variant="h5" color="textSecondary">
                      Price Information
                    </Typography>
                    <Divider />
                  </Grid>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Grid container spacing={1}>
                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Company Name:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.companyID?.company_name || "N/A"}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Trip Date:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.tripDate ? formatDateUsingMoment(tripDetails?.tripDate, 'YYYY-MM-DD'): 'N/A'}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Trip Time:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.tripTime || "N/A"}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Zone Name:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.zoneNameID?.zoneName || "N/A"}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Zone Type:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.zoneTypeID?.zoneTypeName || "N/A"}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Cab:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.vehicleNumber?.vehicleNumber || "N/A"}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Cab Type:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.vehicleTypeID?.vehicleTypeName || "N/A"}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Driver:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.driverId?.userName || "N/A"}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Location:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.location || "N/A"}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Remarks:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.remarks || "N/A"}</Typography>
                    </Grid>
                  </Grid>

                  <Grid container spacing={1}>
                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Company Rate:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.companyRate || 0}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Company Guard Price:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.companyGuardPrice || 0}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Company Penalty:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.companyPenalty || 0}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Vendor Rate:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.vendorRate || 0}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Vendor Guard Price:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.vendorGuardPrice || 0}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Vendor Penalty:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.vendorPenalty || 0}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Driver Rate:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.driverRate || 0}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Driver Guard Price:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.driverGuardPrice || 0}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Driver Penalty:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.driverPenalty || 0}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Addional Charges:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.addOnRate || 0}</Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                      MCD Charges:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.mcdCharge || 0}</Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography variant="textSecondary" color="textSecondary">
                        Toll Charges:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="textSecondary">{tripDetails?.tollCharge || 0}</Typography>
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>

              <Divider />
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                <Button color="error" size="small" onClick={onClose}>
                  Close
                </Button>
              </Stack>
            </>
          }
        </MainCard>
      </Fade>
    </Modal>
  );
}
