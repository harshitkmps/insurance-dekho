import React from "react";
import TextField from "@mui/material/TextField";
import { createDispatchHook } from "react-redux";
import { createSelectorHook } from "react-redux";
import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";

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
  let customValidators = useSelector(
    (state) => state.ReactFormBuilderReducer.customValidators || {}
  );
  let handleChange = function (e, values, action, selected) {
     let value = field.value || "";
     if (action == "selectOption") {
       value = selected.option.value;
     } else if (action == "clear") {
       value = "";
     }
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: value,
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


  let helperText = field.helperText;
  // delete field.helperText;
  return (
    <React.Fragment>
      <FormControl error={field.error} fullWidth={true}>
        <Autocomplete
          disablePortal
          {...field}
          onChange={handleChange}
          onBlur={validateFieldValue}
          renderInput={(params) => (
            <TextField {...params} label={field.label} variant="filled" />
          )}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </React.Fragment>
  );
}
