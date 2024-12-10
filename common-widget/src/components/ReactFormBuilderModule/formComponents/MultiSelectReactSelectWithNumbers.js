import * as React from "react";
import { createDispatchHook } from "react-redux";
import { createSelectorHook } from "react-redux";
import FormHelperText from "@mui/material/FormHelperText";
import ReactSelect, { components } from "react-select";
import backicon from "../../../img/v2_arrow_left.svg";

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
    (state) => state.ReactFormBuilderReducer.steps[props.activeStep].fields[props.field.name]
  );
  let maxToShow = field.maxToShow?field.maxToShow:2;
  
  let customValidators = useSelector(
    (state) => state.ReactFormBuilderReducer.customValidators || {}
  );

  const onDivClick = (e) => {
    if (field.onDivClick) {
      field.onDivClick(e, step, (newstep) => {
        if (newstep) {
          dispatch({
            type: "UPDATE_STEP",
            payload: { step: newstep },
          });
        }
      });
    }
    
  };

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
      field.onChange(e, step,newVal,  (newstep) => {
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
  let helperText = field.helperText;

  const MultiValue = ({ index, getValue, ...props }) => {
    if(field.dropDownOpen){
      maxToShow=1000;
    }
    const overflow = getValue()
      .slice(maxToShow)
      .map((x) => x.label);
  
    return index < maxToShow ? (
      <components.MultiValue {...props} />
    ) : null;
  };

  const MoreSelectedBadge = () => {
    let items=field.value.slice(maxToShow)
    .map((x) => x.label);
  
    const handleDropdownToggle = () => {
      field.dropDownOpen=!field.dropDownOpen
    };
  
    
  
    const style = {
      marginLeft: "auto",
      fontSize: "13px",
      fontWeight:500,
      order: 99,
    };
  
    const title = items.join(", ");
    const length = items.length;
    const label =maxToShow===1000?'': `+ ${length} ${length !== 1 ? "" : ""} countries`;
    return (
      <div onClick={handleDropdownToggle} className="multiCountryContainer">
        <div className="multiContry" style={style} title={title}>
          {label}{" "}
          <img
            className={field.dropDownOpen?"upArrow":"downArrow"}
            src={backicon}
            alt=""
            
          />
          
        </div>
      </div>
    );
  };
 
  return (
    <div onClick={onDivClick} className="multiSelContainer">
      <p className="titleText">{field.label}</p>
      
      <div className={field.dropDownOpen?"optionsContainer dropdownActive":"optionsContainer "}>
      <ReactSelect
        isMulti
        name="colors"
        isOptionDisabled={(option) => field.disabled}
        placeholder={field.placeholder}
        isDisabled={field.isDisabled?field.isDisabled:false}       
        options={field.options}
        className="basic-multi-select multiSelWno"
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
        components={{ MultiValue }}
      />
      <FormHelperText>{helperText}</FormHelperText>
      {field.value.length>(field.maxToShow?field.maxToShow:2) &&<MoreSelectedBadge ></MoreSelectedBadge>}
      </div>
    </div>
  );
}
