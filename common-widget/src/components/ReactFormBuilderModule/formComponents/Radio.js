/* eslint-disable import/no-anonymous-default-export */
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Box from "@mui/material/Box";

import './css/radio.scss';

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
  let step = useSelector(
    (state) => state.ReactFormBuilderReducer.steps[props.activeStep]
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
  if (field.appearence == "buttonRadio") {
    return (
      <FormControl error={error} fullWidth={true}>
        <FormLabel id={field.id}>{field.label}</FormLabel>
        <RadioGroup value="" {...field} onChange={handleChange}>
          {field.options.map((option) => {
            return (
              <FormControlLabel
                style={{
                  border: "1px solid rgba(51, 56, 70, 0.1)",
                  borderRadius: "8px",
                  margin: "8px",
                  padding: "8px",
                  background: "#FFFFFF",
                }}
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            );
          })}
        </RadioGroup>
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    );
  } else {
    return (
      <FormControl className="radioProposal" 
        error={error}
        fullWidth={true}
       
        style={{
          background : field.background == "gray" ? "#F5F5F6" : ""

        }}
      >
        <FormLabel id={field.id}>{field.label}</FormLabel>
        <RadioGroup className="radiogrp" value="" {...field} onChange={handleChange}>
          {field.options.map((option) => {
            return (
              <FormControlLabel
                key={option.value}
                value={option.value}
                labelPlacement={field.labelPlacement}
                control={<Radio />}
                label={option.label}
              />
            );
          })}
        </RadioGroup>
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    );
  }
}
