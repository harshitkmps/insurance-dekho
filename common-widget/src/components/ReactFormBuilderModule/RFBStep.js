import { createSelectorHook, createDispatchHook } from "react-redux";
import * as React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import RFBField from "./RFBField";

export default function ({ context, activeStep }) {
  const useSelector = createSelectorHook(context);
  const useDispatch = createDispatchHook(context);
  const dispatch = useDispatch();
  const steps = useSelector((state) => state.ReactFormBuilderReducer.steps);
  
  let step = steps[activeStep] || {};
  const onLoad =
    step.onLoad ||
    function () {
      console.log("onLoad function not defined on step => " + activeStep);
    };

  React.useEffect(() => {
    onLoad(step, (newstep) => {
      dispatch({
        type: "UPDATE_STEP",
        payload: { step: newstep },
      });
    });
  }, [onLoad]);

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        {step.name}
      </Typography>
      <Typography variant="p" gutterBottom style={{
        fontSize : "13px",
        color:"#007FFF",
        fontWeight : "600",
      }}>
        {step.note ? "Note:" : ""}
      </Typography>
      <Typography variant="p" gutterBottom style={{
        fontSize : "13px",
      }}>
        {step.note ? step.note : ""}
      </Typography>
      <Grid container spacing={3} sx={{ pt: 1, pb: 1 }}>
        {Object.keys(step.fields || {}).map((field_name) => {
          if(step.fields[field_name].hide && step.fields[field_name].hide == true){
            return ""
          }
          return (
            <RFBField
              context={context}
              key={field_name}
              field={step.fields[field_name]}
              activeStep={activeStep}
            ></RFBField>
          );
        })}
      </Grid>
    </React.Fragment>
  );
}
