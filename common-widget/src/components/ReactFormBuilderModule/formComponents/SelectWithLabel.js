import React from "react";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import Autocomplete from "@mui/material/Autocomplete";
import "./css/SelectWithLabel.scss";
import { createDispatchHook, createSelectorHook } from "react-redux";
import { FormLabel } from "@mui/material";
import { Grid } from "@mui/material";

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
      state.ReactFormBuilderReducer.steps[props.activeStep].fields[
        props.field.name
      ]
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
  };

  let helperText = field.helperText;
  let commonSelect = (
    <Autocomplete
      disablePortal
      {...field}
      onChange={handleChange}
      onBlur={validateFieldValue}
      renderInput={(params) => (
        <TextField
          variant="filled"
          className="dropper"
          {...params}
          label={field.labelAuto}
        />
      )}
    />
  );
  return (
    <FormControl error={field.error} className="fb_selectWlabel " fullWidth>
      {field.title ? (
        <Grid container className="fb_row">
          <Grid item xs={4} sm={5} className="leftLabel">
            <FormLabel>{field.title}</FormLabel>
          </Grid>
          <Grid item xs={8} sm={7}>{commonSelect}</Grid>
        </Grid>
      ) : (
        commonSelect
      )}
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}