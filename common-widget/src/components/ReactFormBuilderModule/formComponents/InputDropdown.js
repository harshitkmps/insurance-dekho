/* eslint-disable import/no-anonymous-default-export */
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import React, { useState, useEffect } from "react";
import flag_india from "../../../../src/img/flag-india.png";
import flag_uae from "../../../../src/img/flag-uae.png"
import TextField from "@mui/material/TextField";
import { get } from 'lodash';

import "./css/inputDropdown.scss";


import { createDispatchHook, createSelectorHook } from "react-redux";

export default function (props) {
  const useSelector = createSelectorHook(props.context);
  const useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();
  const [mobileSelected, setSelected] = useState(false)
  const flagMap = {
    'india': flag_india,
    'uae': flag_uae,
  };

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

  const codeMap = {};
  field.options.map((country) => {
    codeMap[country.fullName] = country.code
  })

  useEffect(() => {
    if (field.value) {
      let code = codeMap[field.extraValue]
      let num = field.value
      num = num.replace(code, '')
      num = num.trim()
      if (num && !mobileSelected) setSelected(true)
    }
  }, [field.value])


  let handleCountryChange = function (e) {
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        extraValue: e.target.value,
        field: props.field.name,
      },
    });
    if (field.value) {
      dispatch({
        type: "UPDATE_FIELD_VALUE",
        payload: {
          value: `${codeMap[e.target.value]}  `,
          field: props.field.name,
        },
      });
    } else {
      setSelected(false)
    }
    if (field.onChange) {
      field.onChange(e, step, (newstep) => {
        dispatch({
          type: "UPDATE_STEP",
          payload: { step: newstep },
        });
      });
    }
  };


  let handleMobileChange = function (e) {
    const num = e.target.value;
    const code = codeMap[field.extraValue];
    const numWithoutCode = num.replace(code, '').trim();
    const parsed = parseInt(numWithoutCode);

    if (numWithoutCode.length && (isNaN(parsed) || parsed.toString().length !== numWithoutCode.length)) {
      return;
    }

    const newValue = `${code}  ${numWithoutCode}`;

    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: newValue,
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
  };


  let handleFocus = function (e) {
    setSelected(true)
    let num = e.target.value
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: num ? num : `${codeMap[field.extraValue]}  `,
        field: props.field.name,
      },
    });
    if (props.field.onFocus) {
      props.field.onFocus(e, step)
    }
  }


  let handleMobileBlur = function (e) {
    let num = e.target.value
    let code = codeMap[field.extraValue]
    num = num.replace(code, '')
    num = num.trim()
    if (!num) setSelected(false)
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: num ? `${code}  ${num}` : '',
        field: props.field.name,
      },
    });
    validateFieldValue(e)
  }

  let handleKeyDown = function (e) {
    let input = document.getElementById(`${props.field.id}`)
    let len = get(codeMap[field.extraValue],'length',3) + 2
    if(e.target.selectionStart < len && input.setSelectionRange){
        input.setSelectionRange(len,len)
    }
  }

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

  let InputProps = {};
  if (field.readOnly) {
    InputProps = { disableUnderline: "true", readOnly: true };
  } else if (field.variant === "filled") {
    InputProps = { disableUnderline: "true" };
  } else {
    InputProps = {};
  }

  return (
    <FormControl className="CustomMobField" error={field.error} fullWidth={true}>
      <Select
        {...field}
        value={field.extraValue}
        labelId={field.id + "_label"}
        id={field.id + "_select"}
        onChange={handleCountryChange}
        disableUnderline
        MenuProps={{
          classes: { paper: 'dropdownStyle' },
        }}
      >
        {field.options.map((option) => {
          if (field.extraValue === option.fullName) {
            return (
              <MenuItem key={option.key} value={option.fullName} style={{ display: "none" }}>
                {option.label}
              </MenuItem>
            );
          }
          return (
            <MenuItem className="CustomSelDrop" key={option.key} value={option.fullName}>
              <div>{option.label}</div>
              <img src={flagMap[option.key]} alt={`flag_${option}`} />
            </MenuItem>
          );
        })}
      </Select>
      <span className="CountryDisableArea"></span>
      <TextField
        {...field}
        value={field.value ? field.value : mobileSelected ? `${codeMap[field.extraValue]}  ` : ''}
        label={mobileSelected ? field.label : `(${codeMap[field.extraValue]})  ${field.label}`}
        InputProps={InputProps}
        inputProps={{ maxLength: 15, inputmode: "numeric" }}
        onChange={handleMobileChange}
        onBlur={handleMobileBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        fullWidth={true}
      ></TextField>
    </FormControl>
  );
}
