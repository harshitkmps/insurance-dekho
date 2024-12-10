/* eslint-disable import/no-anonymous-default-export */
import React from "react";
import TextField from "@mui/material/TextField";
import { createDispatchHook } from "react-redux";
import { createSelectorHook } from "react-redux";
import { get } from "lodash";

export default function (props) {
  const useSelector = createSelectorHook(props.context);
  const useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();
  // let activeStep = useSelector(
  //   (state) => state.ReactFormBuilderReducer.activeStep
  // );
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

  let handleFocus = function (e) {
    if (field.onFocus && field.value) {
      field.onFocus(e, step)
      if (field.value !== e.target.value) {
        dispatch({
          type: "UPDATE_FIELD_VALUE",
          payload: {
            value: field.value,
            field: field.name,
          },
        });
      }
    }
  }

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

  if(!get(props,'field.showField',true)) {
    return null
  } 

  return (
    <React.Fragment>
      <TextField
        style={{
          background: "#F5F5F6",
          borderRadius: "8px",
        }}
        value={""}
        {...field}
        onBlur={validateFieldValue}
        InputProps={InputProps}
        onChange={handleChange}
        onFocus={handleFocus}
        fullWidth={true}
      ></TextField>
    </React.Fragment>
  );
}
