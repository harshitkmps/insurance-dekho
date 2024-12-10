import React from "react";
import { createSelectorHook } from "react-redux";

import RFBStep from "./RFBStep";
import RFBServerValidation from "./RFBServerValidation";
import RFBCallToAction from "./RFBCallToAction";
import RFBAccordion from "./RFBAccordion";

export default function ({ context }) {
  const useSelector = createSelectorHook(context);
  const stepsLayout = useSelector(
    (state) => state.ReactFormBuilderReducer.stepsLayout
  );
  let serverMessage = useSelector(
    (state) => state.ReactFormBuilderReducer.serverMessage
  );
  let activeStep = useSelector(
    (state) => state.ReactFormBuilderReducer.activeStep
  );

  let error = useSelector((state) => state.ReactFormBuilderReducer.error);
  if (stepsLayout == "Accordion") {
    return (
        <RFBAccordion context={context}></RFBAccordion>
    );
  } else {
    return (
      <React.Fragment>
        <RFBStep context={context} activeStep={activeStep}></RFBStep>
        <RFBServerValidation
          error={error}
          serverMessage={serverMessage}
        ></RFBServerValidation>
        <RFBCallToAction context={context}></RFBCallToAction>
      </React.Fragment>
    );
  }
}
