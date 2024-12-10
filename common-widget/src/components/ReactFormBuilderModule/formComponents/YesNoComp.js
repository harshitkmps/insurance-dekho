/* eslint-disable no-unused-vars */
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { createDispatchHook, createSelectorHook } from "react-redux";
import { Grid, Paper, IconButton, Box } from "@mui/material";
import React, { useState } from "react";

import "./css/yesno.scss";

function CardWithIconAndLabel(props) {
  return (
    <Grid
      container
      style={{
        cursor: "pointer",
        width: "55px",
        height: "32px",
        background: "#FFFFFF",
        border: props.selected
          ? "2px solid #007FFF"
          : "2px solid rgba(51, 56, 70, 0.1)",
        borderRadius: "38px",
        textAlign: "center",
        display: "inline-block",
      }}
      onClick={(e) => {
        props.onClick(props.value,e);
      }}
    >
      <Grid
        item
        style={{
          cursor: "hand",
          fontFamily: "Poppins",
          fontWeight: "bold",
          fontSize: "13px",
          color: " #333846",
          lineHeight: "32px",
        }}
      >
        {props.label}
      </Grid>
    </Grid>
  );
}

const CheckBox = (props) => {
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
  let onClick = function (v,e) {
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: v,
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
    <>
      <FormControl error={error} fullWidth={true} className="yesno">
        <FormLabel id={field.id}>{field.label}</FormLabel>
        <Grid
          container
          alignContent="center"
          direction="row"
          style={{
            gap: "8px",
          }}
        >
          {field.options.map((option) => {
            return (
              <Grid item style={{ cursor: "hand" }}>
                <CardWithIconAndLabel
                  selected={option.value == field.value}
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  onClick={onClick}
                />
              </Grid>
            );
          })}
        </Grid>

        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
};
export default CheckBox;
