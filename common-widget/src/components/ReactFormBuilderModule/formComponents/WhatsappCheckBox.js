import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { createDispatchHook, createSelectorHook } from "react-redux";

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
      },
    });
  };
  let helperText = field.helperText;
  // delete field.helperText;
  let error = field.error;
  // delete field.error;
  let label2 = (
    <div>
      {" "}
      Get Details on {" "}
      <img
        src="/common-widgets/icons/whatsapp-gray.svg"
        alt=""
        style={{ padding: "0px 2px", position:"relative", top:"3px" }}
      />{" "}
      WhatsApp
    </div>
  );
  return (
    <FormControl error={error} fullWidth={true}>
      <FormGroup row={true} {...field}>
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

      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}
