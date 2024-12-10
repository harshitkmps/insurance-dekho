/* eslint-disable import/no-anonymous-default-export */
import FormControl from "@mui/material/FormControl";
import Button from '@mui/material/Button';

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
  };
  let helperText = field.helperText;
  delete field.helperText;
  let error = field.error;
  delete field.error;
    return (
    <FormControl error={error} fullWidth={true}>
      {
        field.onClick ? 
          <Button variant="contained" disabled={field.disabled} onClick={(e)=>field.onClick(e)}>{field.label}</Button> 
            : 
          <Button variant="contained">{field.label}</Button>
      }
    </FormControl>
  );
}
