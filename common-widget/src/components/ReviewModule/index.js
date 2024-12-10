import React from "react";
import PreviousPage from "./PreviousPage";
import PaymentDetails from "./PaymentDetails";
import TravellerDetails from "./TravellerDetails";
import NomineeDetails from "./NomineeDetails";
import PremiumBreakup from "./PremiumBreakup";
import MakePayment from "./MakePayment";
import { createDispatchHook, createSelectorHook } from "react-redux";
import RMCards from "./RMCards";
function Review({ context }) {
  const useSelector = createSelectorHook(context);
  const useDispatch = createDispatchHook(context);
  const dispatch = useDispatch();
  // dispatch(
  //   initReactFormBuilder({
  //     ...moduleOptions.formBuilder,
  //     formName: formName,
  //   })
  // );
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  return (
    <>
      <div>
        <RMCards context={context}></RMCards>
      </div>
    </>
  );
}

export default Review;
