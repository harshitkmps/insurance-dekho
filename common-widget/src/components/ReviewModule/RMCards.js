import { createSelectorHook, createDispatchHook } from "react-redux";
import * as React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import RMCard from "./RMCard";

export default function ({ context }) {
  const useSelector = createSelectorHook(context);
  const useDispatch = createDispatchHook(context);
  const dispatch = useDispatch();
  const cards = useSelector((state) => state.CommonReducer.moduleOptions.Cards);

  // const onLoad =
  //   step.onLoad ||
  //   function () {
  //     console.log("onLoad function not defined on step => " + activeStep);
  //   };

  //   React.useEffect(() => {
  //     onLoad(step, (newstep) => {
  //       dispatch({
  //         type: "UPDATE_STEP",
  //         payload: { step: newstep },
  //       });
  //     });
  //   }, [onLoad]);

  return (
    <React.Fragment>
      {/* <Typography variant="h6" gutterBottom>
        {step.name}
      </Typography> */}

      <Grid container spacing={1} sx={{ pt: 1, pb: 1 }}>
        {Object.keys(cards || {}).map((cardType) => {
          return (
            <RMCard
              context={context}
              {...cards[cardType]}
              key={cardType}
              //   field={step.fields[field_name]}
              //   activeStep={activeStep}
            ></RMCard>
          );
        })}
      </Grid>
    </React.Fragment>
  );
}
