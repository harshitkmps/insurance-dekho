import React, { useEffect } from "react";
import { createDispatchHook, createSelectorHook } from "react-redux";
import RFBStep from "./RFBStep";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RFBServerValidation from "./RFBServerValidation";
import RFBCallToAction from "./RFBCallToAction";


const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ExpandMoreIcon sx={{ fontSize: "1.5rem" }} />}
    {...props}
  />
))(({ theme }) => ({}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({}));

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({}));

export default function ({ context }) {
  const useSelector = createSelectorHook(context);
  const useDispatch = createDispatchHook(context);
  const dispatch = useDispatch();
  const steps = useSelector((state) => state.ReactFormBuilderReducer.steps);
  let activeStep = useSelector(
    (state) => state.ReactFormBuilderReducer.activeStep
  );

  const [expanded, setExpanded] = React.useState(steps[activeStep].heading);

  const handleChange = (panel, activeStep) => (event, newExpanded) => {
    let submitted = {}
    steps.forEach((step) => {
      submitted[step.heading] = step.submitted;
    });

    let submittedIndex = Object.keys(submitted);
    let lastIndex = submittedIndex.indexOf(panel) - 1
    if(lastIndex == -1 || steps[lastIndex].submitted == true){
      setExpanded(newExpanded ? panel : false);
      dispatch({
        type: "SET_ACTIVE_STEP",
        payload: { activeStep: activeStep },
      });
    }
  };

  useEffect(() => {
    setExpanded(steps[activeStep].heading)
  }, [activeStep])

  let serverMessage = useSelector(
    (state) => state.ReactFormBuilderReducer.serverMessage
  );

  let error = useSelector((state) => state.ReactFormBuilderReducer.error);

  return (
    <React.Fragment>
      {steps &&
        steps.map((step, index) => {
          return (
            <Accordion
              expanded={expanded === step.heading}
              onChange={handleChange(step.heading, index)}
            >
              <AccordionSummary
                aria-controls="panel1d-content"
                id="panel1d-header"
              >
                <Typography>{step.heading}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <RFBStep context={context} activeStep={index}></RFBStep>
                <RFBServerValidation
                  error={error}
                  serverMessage={serverMessage}
                ></RFBServerValidation>
                <RFBCallToAction context={context}></RFBCallToAction>
              </AccordionDetails>
            </Accordion>
          );
        })}
    </React.Fragment>
  );
}
