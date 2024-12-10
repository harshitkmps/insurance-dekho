/* eslint-disable no-unused-vars */
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { createDispatchHook, createSelectorHook } from "react-redux";
import { Grid, Paper, IconButton } from "@mui/material";
import React from "react";

import "./css/cardradio.scss";



function CardWithIconAndLabel(props) {
  if (props.icon) {
    return (
      <Paper className="fb_cardradio"
        variant="outlined"
        style={{
          border: props.selected ? "2px solid #007FFF" : "",
        }}
        onClick={() => {
          props.onClick(props.value);
        }}
      >
        <IconButton className="iconCircle">
          <img src={props.icon} alt="" />
        </IconButton>
        <div className="radioTxt">{props.label}
        </div>
      </Paper>
    );
  } else {
    return (
      <Paper
        variant="outlined" className="fb_cardradio"
        style={{
          border: props.selected ? "2px solid #007FFF" : "",
        }}
        onClick={() => {
          props.onClick(props.value);
        }}
      >
        <IconButton className="iconCircle"></IconButton>
        <div className="radioTxt">
          {props.label}
        </div>
      </Paper>
    );
  }
}

const CheckBox = (props) => {
  const useSelector = createSelectorHook(props.context);
  const useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();
  let field = useSelector(
    (state) =>
      state.ReactFormBuilderReducer.steps[props.activeStep].fields[props.field.name]
  );
  let step = useSelector(
    (state) => state.ReactFormBuilderReducer.steps[props.activeStep]
  );
  let onClick = function (v) {
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
      field.onChange(v, step, (newstep) => {
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
  let error = field.error;

  return (
    <>
      <FormControl error={error} fullWidth={true}>
        <FormLabel style={{color: "#333846"}} sx={{ fontSize: '15px', fontWeight: 'bold', mb: 1 }} id={field.id}>{field.label}</FormLabel>
        <Grid
          container
          spacing={3}
          direction="row"
          justifyContent="center"
          alignItems="stretch"
        >
          {field.options.map((option) => {
            return (
              <Grid item xs={6} sm={6} style={
                {
                  flexwrap: "wrap",            
                  display: "flex",
                }}>
                <CardWithIconAndLabel
                  selected={option.value == field.value}
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  icon={option.icon}
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
