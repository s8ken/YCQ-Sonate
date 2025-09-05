import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MobileStepper,
  Typography
} from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

const steps = [
  {
    title: 'Welcome to Symbi Trust',
    content: 'Symbi helps you understand the trustworthiness of AI responses at a glance.',
    image: '/images/onboarding/trust-intro.html'
  },
  {
    title: 'Trust Badges',
    content: 'Look for these badges next to AI messages. They show you how reliable the information is.',
    image: '/images/onboarding/trust-badges.html'
  },
  {
    title: 'Simple by Default',
    content: 'We keep things simple, but you can always see more details by toggling "Detailed Trust Info".',
    image: '/images/onboarding/trust-details.html'
  }
];

const TrustOnboarding = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = steps.length;

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFinish = () => {
    localStorage.setItem('trustOnboardingComplete', 'true');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{steps[activeStep].title}</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 255, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Box 
            component="iframe"
            sx={{
              height: 180,
              width: '100%',
              border: 'none',
              mb: 2,
              borderRadius: 1,
              bgcolor: 'background.paper'
            }}
            src={steps[activeStep].image}
            title={steps[activeStep].title}
            frameBorder="0"
          />
          <Typography>{steps[activeStep].content}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <MobileStepper
          variant="dots"
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          sx={{ flexGrow: 1 }}
          nextButton={
            activeStep === maxSteps - 1 ? (
              <Button size="small" onClick={handleFinish}>
                Finish
              </Button>
            ) : (
              <Button size="small" onClick={handleNext}>
                Next
                <KeyboardArrowRight />
              </Button>
            )
          }
          backButton={
            <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
              <KeyboardArrowLeft />
              Back
            </Button>
          }
        />
      </DialogActions>
    </Dialog>
  );
};

export default TrustOnboarding;
