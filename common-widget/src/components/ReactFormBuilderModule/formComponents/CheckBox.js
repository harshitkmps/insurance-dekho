/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable eqeqeq */
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";

import { createDispatchHook, createSelectorHook } from "react-redux";
import "./css/checkbox.scss";

export default function (props) {
  const useSelector = createSelectorHook(props.context);
  const useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();
  let activeStep = useSelector(
    (state) => state.ReactFormBuilderReducer.activeStep
  );
  let field = useSelector(
    (state) =>
      state.ReactFormBuilderReducer.steps[props.activeStep].fields[
        props.field.name
      ]
  );
  let step = useSelector(
    (state) => state.ReactFormBuilderReducer.steps[props.activeStep]
  );
  let customValidators = useSelector(
    (state) => state.ReactFormBuilderReducer.customValidators || {}
  );
  let handleChange = function (e) {
    if (!Array.isArray(field.value)) {
      field.value = [];
    }
    let value = [...field.value];
    if (value.indexOf(e.target.value) == -1) {
      value.push(e.target.value);
    } else {
      value.splice(value.indexOf(e.target.value), 1);
    }

    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: value,
        field: props.field.name,
      },
    });
    dispatch({
      type: "VALIDATE_FIELD_VALUE",
      payload: {
        field: field,
        customValidators: customValidators,
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
  let helperText = field.helperText;
  // delete field.helperText;
  let error = field.error;
  // delete field.error;
  return (
    <FormControl error={error} fullWidth={true} className="fb_checkbox">
      {field.label && field.label != "" && (
        <FormLabel
          className="cbTitle"
          id={field.id}
          style={{ color: "#333846" }}
        >
          {field.label}
        </FormLabel>
      )}

      <FormGroup row={true} {...field} className="fbCheckGrp">
        {field.options.map((option) => {
          let checked = field.value && field.value.indexOf(option.value) != -1;
          return (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Checkbox checked={checked} onChange={handleChange} />}
              label={option.label}
            />
          );
        })}
      </FormGroup>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}
