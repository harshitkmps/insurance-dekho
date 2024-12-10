import React from "react";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Grid } from "@mui/material";
import { createDispatchHook, createSelectorHook } from "react-redux";
import FormHelperText from "@mui/material/FormHelperText";

import "./css/checkBoxCounter.scss";

export default function (props) {
  const useSelector = createSelectorHook(props.context);
  const useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();
  let activeStep = useSelector(
    (state) => state.ReactFormBuilderReducer.activeStep
  );
  let field = useSelector(
    (state) =>
      state.ReactFormBuilderReducer.steps[props.activeStep].fields[props.field.name]
  );

  let step = useSelector(
    (state) => state.ReactFormBuilderReducer.steps[props.activeStep]
  );

  function onClickplus(v, e) {
    if (v < field.maxValue) {
      v = field.value + 1;
      field.clickedPlus = true;
      field.clickedMinus = false;
    }
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: v,
        field: props.field.name,
      },
    });
    // console.log(field.value)
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
  function onClickminus(v, e) {
    if (v > 0) {
      v = field.value - 1;
      field.clickedPlus = false;
      field.clickedMinus = true;
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
  let helperText = field.helperText;
  // delete field.helperText;
  return (
    <FormControl className="fb_checkData" fullWidth={true} disabled={field.disabled}>
      <Grid className="recorddiv"
        container
        spacing={1}
        style={{
          border:
            field.value > 0
              ? "2px solid #007FFF "
              : "2px solid rgba(51, 56, 70, 0.1)",
        }}
        onClick={(e)=>{
          if(field.value == 0){
            if (!field.disabled)
              onClickplus(1,e);
          }else{
            onClickminus(0,e);
          }
        }}
      >
        <Grid  className="memberIcon">
          <img src={field.image} />
        </Grid>
        <Grid className="familyName">
          <FormLabel>{field.label}</FormLabel>
        </Grid>
        {
          <Grid className="soncount">
            <Grid className="plusminusdata">
            <a  onClick={(e) => {e.stopPropagation(); onClickminus(field.value, e);}}>-</a>
            <span>{field.value}</span>
            <a onClick={(e) => { e.stopPropagation(); if (!field.disabled) onClickplus(field.value, e);}}>+</a>
          </Grid>
         </Grid>
        }
      </Grid>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}
