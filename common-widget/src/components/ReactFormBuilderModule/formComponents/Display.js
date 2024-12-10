import React from "react";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Grid } from "@mui/material";
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

  function onClickplus(v, e) {
    if (v < field.maxValue) {
      v = field.value + 1;
      field.clickedPlus = true;
      field.clickedMinus = false;
    }
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: v,
        field: props.field.name,
      },
    });
    // console.log(field.value)
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
  }
  function onClickminus(v, e) {
    if (v > 0) {
      v = field.value - 1;
      field.clickedPlus = false;
      field.clickedMinus = true;
    }
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: v,
        field: props.field.name,
      },
    });
    //  console.log(field.value)
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
  }
  return (
    <FormControl fullWidth={true} disabled={field.disabled}>
      <Grid
        container
        spacing={1}
        style={{
            background: "#F2F9FF",          
          alignContent: "center",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "row",
          padding: "8px 20px 8px 12px",
          borderRadius: "12px",
          fontFamily:"Poppins",
        }}
      >
        <Grid style={{width: "32px"}}>
          <img src={field.image} />
        </Grid>
        <Grid style={{marginLeft: "12px"}}>
          <FormLabel style={{fontSize: "15px", fontWeight: "bold", fontFamily:"Poppins", color:"#333846" }}>{field.label}</FormLabel><br></br>
          <FormLabel style={{
            fontSize:"10px",fontFamily:"Poppins",color:"#333846" 
          }}>{field.num}</FormLabel>
        </Grid>
      </Grid>
    </FormControl>
  );
}
