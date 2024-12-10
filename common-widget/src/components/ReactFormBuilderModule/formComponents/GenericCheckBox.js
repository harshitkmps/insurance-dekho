import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { createDispatchHook, createSelectorHook } from "react-redux";
import { Grid } from "@mui/material";

import './css/GenericCheckBox.scss';

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
    (state) =>state.ReactFormBuilderReducer.steps[props.activeStep].fields[props.field.name]
  );
  const disabled=field.toDisable
  let handleChange = function (e) {
    if (!Array.isArray(field.value)) {
      field.value = [];
    }
    let value = [...field.value];
    if (value.indexOf(e.target.value) == -1) {
      value = [e.target.value];
    } else {
      value = [];
    }
    if (field.onClick) {
      field.onClick(e, step, (newstep) => {
        if (newstep) {
          dispatch({
            type: "UPDATE_STEP",
            payload: { step: newstep },
          });
        }
      });
    }

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
        field: props.field,
      },
    });
  };
  let helperText = field.helperText;
  let error = field.error;
  let label2 = (
    <div>
      {" "}
      {field.label}
    </div>
  );
  return (
 
   !disabled && <FormControl error={error} fullWidth={true} className="genericCB">
    <Grid container>
       <Grid item xs={12} sm={3}></Grid>
       <Grid item xs={12} sm={8}>  <FormGroup row={true} {...field}>
        {field.options.map((option) => {
          let checked = field.value && field.value.indexOf(option.value) != -1;
          return (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Checkbox checked={checked} onChange={handleChange} />}
              label={label2}
            />
          );
        })}
      </FormGroup>
      <FormHelperText>{helperText}</FormHelperText></Grid>
    </Grid>
    

      
    </FormControl>

  );
}
