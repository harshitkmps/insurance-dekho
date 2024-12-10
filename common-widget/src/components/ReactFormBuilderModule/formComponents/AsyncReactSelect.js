import * as React from "react";
import { createDispatchHook } from "react-redux";
import { createSelectorHook } from "react-redux";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import AsyncSelect from "react-select/async";
import './css/Modal.scss'
export default function CustomizedHook(props) {
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
  let handleChange= function(e) {    
    let value = [e];

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


  
  const promiseOptions = (inputValue) =>
    new Promise((resolve) => {
      if(field.loadOptions){
        field.loadOptions(inputValue, step, resolve);
      }else{
        console.error("field.loadOptions(inputValue, step, resolve); must be defined in AsyncReactSelect")
      }
    });

    

  let helperText = field.helperText;
  // delete field.helperText;
  return (
    <FormControl error={field.error} fullWidth={true}>
      <AsyncSelect
        isClearable
        {...field}
        placeholder={field.label}
        options={field.options}
        className="basic-multi-select fb_asyncDropper"
        value={[...field.value]}
        onChange={handleChange}
        onBlur={validateFieldValue}
        loadOptions={promiseOptions}
        defaultOptions={field.defaultOptions || []}
        components={{
          DropdownIndicator: () => null,
        }}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}
