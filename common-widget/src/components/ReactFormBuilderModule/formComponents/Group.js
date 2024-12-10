import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createDispatchHook, createSelectorHook } from "react-redux";
import RFBField from "../RFBField";

import "./css/row.scss";

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

  return (
    <div
      onClick={handleChange}
      className={
        field.className ? field.className : "rowS_pop"
      }
    >
      {field.label ? (
        <p className="titletext">{field.label}</p>
      ) : null}
      <Grid container spacing={0}>
        {Object.keys(field.children || {}).map((child_name) => {
          return (
            <Grid
              item
              className={field.children[child_name].className?field.children[child_name].className:"GroupItem"}
              xs={
                field.children[child_name].mobile
                  ? field.children[child_name].mobile
                  : field.children[child_name].size
                  ? field.children[child_name].size
                  : "auto"
              }
              sm={
                field.children[child_name].size
                  ? field.children[child_name].size
                  : "auto"
              }
            >
              <RFBField
                context={props.context}
                field={field.children[child_name]}
                activeStep={props.activeStep}
              />
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}
