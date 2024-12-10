import React from "react";
import TextField from "@mui/material/TextField";
import { createDispatchHook } from "react-redux";
import { createSelectorHook } from "react-redux";
import axios from "axios";
import { useEffect } from "react";

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
      state.ReactFormBuilderReducer.steps[props.activeStep].fields[props.field.name]
  );
  let customValidators = useSelector(
    (state) => state.ReactFormBuilderReducer.customValidators || {}
  );
  let handleChange = function (e) {
    let fieldValue = e.target.value;
    if (fieldValue.length == 6 && !isNaN(fieldValue)) {
      axios
        .get(
          "https://masterdata.insurancedekho.com/api/v1/master/pincode?&limit=1&pincode=" +
            fieldValue
        )
        .then((res) => {
          res = res.data;

          if (
            res.data != undefined &&
            res.data != "" &&
            res.data[0] != undefined
          ) {
            let pincodeObj = res.data[0];
            let key = `${pincodeObj.cityName} (${fieldValue})`;
            let newData = {};
            if (fieldValue != undefined && fieldValue != "") {
              let pCode = key.match(/[0-9]{6}/g);
              newData["city_name"] = key.replace(/\([0-9]{6}\)/, "").trim();
              newData["city"] = pincodeObj.cityId;
              if (field.stateRequired == false) {
                newData["selectedValue"] = fieldValue; //key
              } else {
                newData["selectedValue"] = key;
              }
              newData["pincode"] = (pCode && pCode[0]) || "";
              newData["state_name"] = pincodeObj.stateName;
              newData["city_id"] = pincodeObj.cityId;
              newData["state_id"] = pincodeObj.stateId;

              dispatch({
                type: "UPDATE_FIELD_VALUE",
                payload: {
                  value: newData,
                  field: props.field.name,
                },
              });
              field.error = false;
              field.helperText = "";
              dispatch({
                type: "VALIDATE_FIELD_VALUE",
                payload: {
                  field: field,
                  customValidators: customValidators,
                },
              });
            }
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
          } else {
            dispatch({
              type: "UPDATE_FIELD_VALUE",
              payload: {
                value: { selectedValue: fieldValue },
                field: props.field.name,
              },
            });
            field.error = true;
            field.helperText = "Invalid Pincode";
            dispatch({
              type: "VALIDATE_FIELD_VALUE",
              payload: {
                field: field,
                customValidators: customValidators,
              },
            });
          }
        });
    } else if(fieldValue.length <= 6) {
      let val = { selectedValue: fieldValue}
      if(fieldValue == ""){
        val = ""
      }
      dispatch({
        type: "UPDATE_FIELD_VALUE",
        payload: {
          value: val,
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


  let v = field.value || {};
  useEffect(()=>{
    if (v && v.selectedValue && v.selectedValue.length == 6 && !isNaN(v.selectedValue) && !v.pincode){
      handleChange({target:{value:v.selectedValue}})
    }
  }, [v.selectedValue])
  let InputProps = {};
  if (field.variant == "filled") {
    InputProps = { disableUnderline: true };
  }
  return (
    <React.Fragment>
      <TextField
        style={{
          background: "#F5F5F6",
          borderRadius:"8px"
        }}
        {...field}
        InputProps={InputProps}
        onChange={handleChange}
        onBlur={validateFieldValue}
        fullWidth={true}
        value={v && v.selectedValue ? v.selectedValue : ""}
      ></TextField>
    </React.Fragment>
  );
}
