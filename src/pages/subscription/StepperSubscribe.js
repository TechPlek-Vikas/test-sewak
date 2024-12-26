import { useState } from 'react';

// material-ui
import { Button, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';

// project-imports
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import Subscription from './Subscription';
import Register from 'pages/auth/auth1/register';
import { useNavigate } from 'react-router';
// step options
const steps = ['Subscription', 'Register'];

const getStepContent = (
  step,
  handleNext,
  handleBack,
  setErrorIndex,
  subscriptionData,
  setSubscriptionData,
  registerData,
  setRegisterData,
  accountSettingData,
  setAccountSettingData,
  userId,
  setUserId
) => {
  switch (step) {
    case 0:
      return (
        <Subscription
          handleNext={handleNext}
          setErrorIndex={setErrorIndex}
          subscriptionData={subscriptionData}
          setSubscriptionData={setSubscriptionData}
        />
      );
    case 1:
      return (
        <Register
          handleNext={handleNext}
          handleBack={handleBack}
          setErrorIndex={setErrorIndex}
          registerData={registerData}
          setRegisterData={setRegisterData}
          // setUserId={setUserId}
        />
      );
    default:
      throw new Error('Unknown step');
  }
};

const StepperSubscribe = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [subscriptionData, setSubscriptionData] = useState({});
  const [registerData, setRegisterData] = useState({});
  const [accountSettingData, setAccountSettingData] = useState({});
  const [errorIndex, setErrorIndex] = useState(null);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  console.log("userId",userId);
  
  const handleNext = () => {
    if (activeStep < steps.length) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setErrorIndex(null); // Clear any previous errors
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleReset = () => {
    setSubscriptionData({});
    setRegisterData({});
    setAccountSettingData({});
    setActiveStep(0);
  };

  return (
    <MainCard
      sx={{
        width: '80%',
        height: '90%',
        margin: '80px auto 10px',
      }}
    >
      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
        {steps.map((label, index) => {
          const labelProps = {};

          if (index === errorIndex) {
            labelProps.optional = (
              <Typography variant="caption" color="error">
                Error
              </Typography>
            );

            labelProps.error = true;
          }

          return (
            <Step key={label}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <>
        {activeStep === steps.length ? (
          <Stack spacing={2} alignItems="center">
            <Typography variant="h3" align="center" gutterBottom>
              User Added Successfully.
            </Typography>
            <Stack direction="row" justifyContent="flex-end">
              <AnimateButton>
                <Button variant="contained" onClick={navigate('/auth')}>
                  Next Step
                </Button>
              </AnimateButton>
            </Stack>
          </Stack>
        ) : (
          <>
            {getStepContent(
              activeStep,
              handleNext,
              handleBack,
              setErrorIndex,
              subscriptionData,
              setSubscriptionData,
              registerData,
              setRegisterData,
              accountSettingData,
              setAccountSettingData,
              userId,
              setUserId
            )}
            {activeStep === 2 && (
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="text" onClick={handleNext} sx={{ my: 3, ml: 1 }}>
                  Skip
                </Button>
              </Stack>
            )}
          </>
        )}
      </>
    </MainCard>
  );
};

export default StepperSubscribe;
