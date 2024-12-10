import React from "react";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Grid } from "@mui/material";
import { createDispatchHook, createSelectorHook } from "react-redux";

import "./css/checkboxicon.scss";

export default function (props) {
  const useSelector = createSelectorHook(props.context);
  const useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();
  let activeStep = useSelector(
    (state) => state.ReactFormBuilderReducer.activeStep
  );
  let step = useSelector(
    (state) => state.ReactFormBuilderReducer.steps[props.activeStep]
  );
  let field = useSelector(
    (state) =>
      state.ReactFormBuilderReducer.steps[props.activeStep].fields[props.field.name]
  );
  function handleContainer(c, v, e) {
    if (field.disabled) return;
    if (field.clicked == false && v == 0) {
      v = 1;
      field.clicked = true;
    } else if (field.clicked == true && v == 1) {
      v = 0;
      field.clicked = false;
    }
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: v,
        field: props.field.name,
      },
    });
    //  console.log(field.value)
    dispatch({
      type: "VALIDATE_FIELD_VALUE",
      payload: {
        field: field,
      },
    });

    if (field.onChange) {
      field.onChange(e, step, (newstep) => {
        if (newstep) {
          dispatch({
            type: "UPDATE_STEP",
            payload: { step: newstep },
          });
        }
      });
    }
  }
  return (
    <FormControl className="fb_checkData" fullWidth={true} disabled={field.disabled}>
      <Grid className="recorddiv"
        container
        spacing={1}
        style={{
          border:
            !field.disabled && field.clicked && field.value > 0
              ? "2px solid #007FFF "
              : "2px solid rgba(51, 56, 70, 0.1)",
        }}
        onClick={(e) => handleContainer(field.clicked, field.value, e)}
      >
        <Grid  className="memberIcon">
          <img src={field.image} />
        </Grid>
        <Grid className="familyName">
          <FormLabel>{field.label}</FormLabel>
        </Grid>
        {field.clicked && field.value > 0 && (
          <>
            <Grid
              item
              xs={1}
              sm={1}
              style={{
                alignItems: "center",
              }}
            ></Grid>

            <Grid
              item
              xs={2}
              sm={2}
              style={{
                alignItems: "center",
              }}
            ></Grid>
            <Grid
              item
              xs={1}
              sm={1}
              style={{
                alignItems: "center",
              }}
            ></Grid>
          </>
        )}
      </Grid>
    </FormControl>
  );
}
