import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import { createDispatchHook, createSelectorHook } from "react-redux";
import "../tripstartend.css";
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
  const handleChange = (e) => {
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
  };

        
  let fieldProps = field;
  let helperText = field.helperText;

        return (
          <div className='tripSEUi' onClick={handleChange}>
            <Box
                component="button"
                sx={{}}
            >
            <Typography className="titletext2" variant="body1" style={{fontWeight:"normal" }}>{field.title}</Typography>
            <Typography className="titletext2" variant="body2" style={{fontWeight:"500" }}> {field.label}</Typography>
            <FormHelperText>{helperText}</FormHelperText>
            </Box>
            </div>
        );

}

