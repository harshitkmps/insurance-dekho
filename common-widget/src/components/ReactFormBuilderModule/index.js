import React from "react";
import { createDispatchHook, createSelectorHook } from "react-redux";
import getRandomHash from "../../utils/getRandomHash";

import RFBContainer from "./RFBContainer";
import RFBWhizard from "./RFBWhizard";
import RFBWhizardLayout from "./RFBWhizardLayout";
import RFBHeader from "./RFBHeader";
import RFBFooter from "./RFBFooter";
import RFBSteps from "./RFBSteps";
import { initReactFormBuilder } from "../../redux/actions/ReactFormBuilderActions";

export default function ReactFormBuilder({ context }) {
  const formName = getRandomHash(7);
  const useSelector = createSelectorHook(context);
  const useDispatch = createDispatchHook(context);
  const dispatch = useDispatch();
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );

  dispatch(
    initReactFormBuilder({
      ...moduleOptions.formBuilder,
      formName: formName,
    })
  );

  return (
    <div id={formName}>
      <RFBContainer context={context}>
        <RFBHeader  context={context}></RFBHeader>
        <RFBWhizard context={context}>
          <RFBWhizardLayout context={context}>
            <RFBSteps context={context}></RFBSteps>
          </RFBWhizardLayout>
        </RFBWhizard>
        <RFBFooter context={context}></RFBFooter>
      </RFBContainer>
    </div>
  );
}
