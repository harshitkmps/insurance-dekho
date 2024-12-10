import * as React from "react";
import Grid from "@mui/material/Grid";
import PreviousPage from "./PreviousPage";
import PaymentDetails from "./PaymentDetails";
import TravellerDetails from "./TravellerDetails";
import NomineeDetails from "./NomineeDetails";
import PremiumBreakup from "./PremiumBreakup";
import MakePayment from "./MakePayment";
import { createDispatchHook } from "react-redux";
import { createSelectorHook } from "react-redux";

export default function (props) {
  const useSelector = createSelectorHook(props.context);
  const useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();
  // let activeStep = useSelector(
  //   (state) => state.CommonReducer.activeStep
  // );

  let customComponents = useSelector(
    (state) => state.CommonReducer.customComponents || {}
  );
  let field = false;
  switch (props.cardType) {
    case "PreviousPage":
      field = <PreviousPage {...props}></PreviousPage>;
      break;
    case "PaymentDetails":
      field = <PaymentDetails {...props}></PaymentDetails>;
      break;
    case "TravellerDetails":
      field = <TravellerDetails {...props}></TravellerDetails>;
      break;
    case "NomineeDetails":
      field = <NomineeDetails {...props}></NomineeDetails>;
      break;
    case "PremiumBreakup":
      field = <PremiumBreakup {...props}></PremiumBreakup>;
      break;
    case "MakePayment":
      field = <MakePayment {...props}></MakePayment>;
      break;
  }

  if (!field && customComponents[props.cardType]) {
    let CustomComponent = customComponents[props.cardType];
    field = <CustomComponent {...props.field}></CustomComponent>;
  }
  return (
    <Grid item xs={12} sm={props.span || 12}>
      {field}
    </Grid>
  );
}
