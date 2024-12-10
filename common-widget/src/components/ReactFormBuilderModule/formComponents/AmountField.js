/* eslint-disable import/no-anonymous-default-export */
import React, { Fragment } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import { createDispatchHook } from "react-redux";
import { createSelectorHook } from "react-redux";

const AmountField = (props) => {
  const useSelector = createSelectorHook(props.context);
  const useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();

  let step = useSelector(
    (state) => state.ReactFormBuilderReducer.steps[props.activeStep]
  );
  let field = useSelector(
    (state) =>
      state.ReactFormBuilderReducer.steps[props.activeStep].fields[
        props.field.name
      ]
  );
  let customValidators = useSelector(
    (state) => state.ReactFormBuilderReducer.customValidators || {}
  );

  let convertNumberPosition = function (labelValue) {
    let newVal;
    // seven Zeroes for crore
    if(Number(labelValue)<1000){return ''}
    if(Math.abs(Number(labelValue)) >= 1.0e+7) {
        newVal = Math.abs(Number(labelValue)) / 1.0e+7 + ""
        newVal = newVal.slice(0,4) + " Cr"
    }
    else if(Math.abs(Number(labelValue)) >= 1.0e+5) {
        newVal = Math.abs(Number(labelValue)) / 1.0e+5 + ""
        newVal = newVal.slice(0,4) + " Lakh"
    }
    else if(Math.abs(Number(labelValue)) >= 1.0e+3) {
        newVal = Math.abs(Number(labelValue)) / 1.0e+3 + ""
        newVal = newVal.slice(0,4) + " k"
    }
    else {
        newVal = Math.abs(Number(labelValue))
    }
    return newVal;
  }

  let handleChange = function (e) {
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: e.target.value,
        field: props.field.name,
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
  };

  let validateFieldValue = (e) => {
    dispatch({
      type: "VALIDATE_FIELD_VALUE",
      payload: {
        field: field,
        customValidators: customValidators,
      },
    });
    if (field.onBlur) {
      field.onBlur(e);
    }
  }

  let InputProps = {};
  if (field.readOnly) {
    InputProps = { disableUnderline: true, readOnly: true };
  } else if (field.variant === "filled") {
    InputProps = { disableUnderline: true };
  } else {
    InputProps = {};
  }

  return (
    <React.Fragment>
      <TextField
        style={{
          background: "#F5F5F6",
          borderRadius: "8px",
        }}
        InputProps={{...InputProps,
          endAdornment: <InputAdornment position="end" sx={{
            '& .MuiTypography-root.MuiTypography-body1':{
            color: "#000",
            fontSize: "11.5px",},
            alignItems: "baseline",
          }}>{convertNumberPosition(field.value) ? convertNumberPosition(field.value) : <Fragment/>}</InputAdornment>,
        }}
        value={""}
        {...field}
        onBlur={validateFieldValue}
        onChange={handleChange}
        fullWidth={true}
      >
      </TextField>
    </React.Fragment>
  );
}

export default AmountField
