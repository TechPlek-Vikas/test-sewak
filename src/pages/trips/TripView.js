import { useEffect, useState } from 'react';

// material-ui
import { Divider, Fade, CardContent, Modal, Stack, Typography, Button, Grid, CircularProgress } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import axiosServices from 'utils/axios';
import { formatDateUsingMoment } from 'utils/helper';

export default function TransitionsModal({ isOpen, onClose, selectedTripId }) {
  const [tripDetails, setTripDetails] = useState(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Fetch trip details when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setIsApiLoading(true);
      axiosServices
        .get(`/assignTrip/details/by?tripId=${selectedTripId}`)
        .then((response) => {
          setTripDetails(response.data.data);
        })
        .catch((error) => {
          console.error('Error fetching trip details:', error);
        })
        .finally(() => {
          setIsApiLoading(false);
        });
    }
  }, [isOpen, selectedTripId]);

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
            width: '50%', // Adjust the width as needed
            maxWidth: '500px', // Set a maximum width
          }}
        >
          {isApiLoading ? (
            <CardContent>
              <CircularProgress size={30} />
            </CardContent>
          ) : tripDetails ? (
            <>
              <CardContent>
                <Grid container spacing={1}>
                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Company Name:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.companyID?.company_name}</Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Trip Date:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{formatDateUsingMoment(tripDetails?.tripDate, 'YYYY-MM-DD')}</Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Trip Time:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.tripTime}</Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Zone Name:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.zoneNameID?.zoneName}</Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Zone Type:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.zoneTypeID?.zoneTypeName}</Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Cab:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.vehicleNumber?.vehicleNumber}</Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Cab Type:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.vehicleTypeID?.vehicleTypeName}</Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Driver:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.driverId?.userName}</Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Guard:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.guard}</Typography>
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
                     Vendor Guard Price:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.vendorGuardPrice || 0}</Typography>
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
                      Company Rate:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.companyRate}</Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Vendor Rate:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.vendorRate}</Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Driver Rate:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.driverRate}</Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Additional Rate:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.addOnRate}</Typography>
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
                      Vendor Penalty:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.vendorPenalty || 0}</Typography>
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
                      Location:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.location}</Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="textSecondary" color="textSecondary">
                      Remarks:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="textSecondary">{tripDetails?.remarks}</Typography>
                  </Grid>
                </Grid>
              </CardContent>

              <Divider />
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
                <Button color="error" size="small" onClick={onClose}>
                  Close
                </Button>
              </Stack>
            </>
          ) : (
            <CardContent>
              <Typography>No trip details available.</Typography>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button color="error" size="small" onClick={onClose}>
                  Close
                </Button>
              </Stack>
            </CardContent>
          )}
        </MainCard>
      </Fade>
    </Modal>
  );
}
