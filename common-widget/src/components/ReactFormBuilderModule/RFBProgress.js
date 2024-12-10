import Stepper from "@mui/material/Stepper";
import { createSelectorHook } from "react-redux";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
export default function ({ context }) {
  const useSelector = createSelectorHook(context);
  const stepsLayout = useSelector(
    (state) => state.ReactFormBuilderReducer.stepsLayout
  );
  const steps = useSelector((state) => state.ReactFormBuilderReducer.steps);
  const activeStep = useSelector(
    (state) => state.ReactFormBuilderReducer.activeStep
  );
  const progressBarType = useSelector(
    (state) => state.ReactFormBuilderReducer.progressBarType
  );
  if (steps.length <= 1 || stepsLayout == "Accordion") {
    return null;
  }
  if (progressBarType)
  {
    return (
      <Stepper activeStep={activeStep} sx={{ pt: 2, pb: 2 }} >
      {steps.map((step, index) => (
        <Step key={index}>
          <StepLabel></StepLabel>
        </Step>
      ))}
    </Stepper>
  );
  }
  else 
  {
    return (
    <Stepper activeStep={activeStep} sx={{ pt: 2, pb: 2 }}>
      {steps.map((step, index) => (
        <Step key={index}>
          <StepLabel>{step.name}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );}
}
