import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createDispatchHook, createSelectorHook } from "react-redux";
import RFBField from "../RFBField";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

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
    <Drawer anchor={"bottom"} open={props.field.open} onClose={handleChange}>
      <div
        onClick={() => {
        }}
        className={
          props.field.className ? props.field.className : "rowS_pop"
        }
      >
        <IconButton className="drawerCrossButton" onClick={handleChange}>
          <ClearIcon />
        </IconButton>
        {props.field.label && <h1>{props.field.label}</h1>}
        <Grid container spacing={0} className={field.gridName?field.gridName:"DrawerGrid"}>
          {Object.keys(props.field.children || {}).map((child_name) => {
            if (props.field.children[child_name].hide === true) {
              return "";
            }
            return (
              <Grid
                item
                className={
                  field.children[child_name].className
                    ? field.children[child_name].className
                    : "DrawerItem"
                }
                xs={
                  props.field.children[child_name].mobile
                    ? props.field.children[child_name].mobile
                    : props.field.children[child_name].size
                    ? props.field.children[child_name].size
                    : "auto"
                }
                sm={
                  props.field.children[child_name].size
                    ? props.field.children[child_name].size
                    : "auto"
                }
              >
                <RFBField
                  context={props.context}
                  field={props.field.children[child_name]}
                  activeStep={props.activeStep}
                />
              </Grid>
            );
          })}
        </Grid>
      </div>
    </Drawer>
  );
}