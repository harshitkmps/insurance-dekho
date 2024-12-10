import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { createDispatchHook, createSelectorHook } from "react-redux";
import { Grid } from "@mui/material";

import "./css/switch.scss";

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
  let handleChange = function (e) {
    e.target.value = e.target.checked ? "yes" : "no";
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: e.target.value,
        field: props.field.name,
      },
    });
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
  };

  let helperText = field.helperText;
  // delete field.helperText;
  let error = field.error;
  // delete field.error;
  return (
    <FormControl className="fb_swtichWrap" error={error} fullWidth={true}>
      <FormLabel id={field.id}>{field.label}</FormLabel>
      <Grid
        container
        spacing={0}
        direction="row"
        alignItems="center"
        justifyContent="center"
        display="inline-block"

      >
        <FormGroup row={true} {...field}>
          <Grid item xs={8} sm={9} className="switchlabl">
            {field.question}
          </Grid>
          <Grid item xs={4} sm={3}>
            <FormControlLabel className="tabyesno"
              control={
                <Switch
                  onChange={handleChange}
                  defaultChecked={field.value == "yes"}
                />
              }
              label={field.value == "yes" ? "Yes" : "No" }
              labelPlacement={field.labelPlacement}
            />
          </Grid>
        </FormGroup>
      </Grid>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}
