/* eslint-disable import/no-anonymous-default-export */
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import FormHelperText from "@mui/material/FormHelperText";

import { createDispatchHook, createSelectorHook } from "react-redux";

export default function (props) {
  const useSelector = createSelectorHook(props.context);
  const useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();

  let step = useSelector(
    (state) => state.ReactFormBuilderReducer.steps[props.activeStep]
  );
  let field = useSelector(
    (state) =>
      state.ReactFormBuilderReducer.steps[props.activeStep].fields[props.field.name]
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
        dispatch({
          type: "UPDATE_STEP",
          payload: { step: newstep },
        });
      });
    }
  };

  let validateFieldValue = (e) => {
    dispatch({
      type: "VALIDATE_FIELD_VALUE",
      payload: {
        field: field
      },
    });
    if (field.onBlur) {
      field.onBlur(e);
    }
  }

  let helperText = field.helperText;

  return (
    <FormControl error={field.error} fullWidth={true}>
      <InputLabel id={field.id + "_label"}>{field.label}</InputLabel>
      <Select
        value=""
        {...field}
        labelId={field.id + "_label"}
        id={field.id + "_select"}
        label={field.label}
        onChange={handleChange}
        onBlur={validateFieldValue}
      >
        {field.options.map((option) => {
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}
