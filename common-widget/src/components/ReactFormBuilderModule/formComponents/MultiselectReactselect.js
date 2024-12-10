import * as React from "react";
import { createDispatchHook } from "react-redux";
import { createSelectorHook } from "react-redux";
import FormHelperText from "@mui/material/FormHelperText";
import ReactSelect from "react-select";


 import "../multiselectDrop.css";

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
  let handleChange= function(e, newVal) {
    if (!Array.isArray(field.value)) {
      field.value = [];
    }
    let value = [...field.value];
    if (newVal["option"]!= undefined){
        value.push(newVal["option"]);
    }
    else if (newVal["removedValue"] != undefined) {
      value.splice(value.indexOf(newVal["removedValue"]), 1);
    } else {
      for (let i in newVal["removedValues"]) {
        value.splice(value.indexOf(newVal["removedValues"][i]));
      }
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
  return (
    <div>
      <ReactSelect
        isMulti
        name="colors"
        isOptionDisabled={(option) => field.disabled}
        placeholder={field.label}
        options={field.options}
        className="basic-multi-select multiSelectDrop"
        classNamePrefix="Add More multiselUi"
        value={[...field.value]}
        styles={{
          multiValue: (styles) => {
            return {
              ...styles,
              backgroundColor: "#E5F2FF",
            };
          },
          multiValueLabel: (base) => ({
            ...base,
            backgroundColor: "#E5F2FF",
            color: "#333846",
          }),
          multiValueRemove: (styles) => ({
            ...styles,
            color: "#007FFF",
            ":hover": {},
          }),
        }}
        onChange={handleChange}
        components={{
          DropdownIndicator: () => null, // Remove dropdown icon
        }}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </div>
  );
}
