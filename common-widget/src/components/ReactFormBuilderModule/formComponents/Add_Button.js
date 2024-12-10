import React,{useState} from 'react';
import Typography from '@mui/material/Typography';
import { createDispatchHook, createSelectorHook } from "react-redux";
import { Grid } from "@mui/material";
import './css/Add_Button.scss';
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
    (state) =>state.ReactFormBuilderReducer.steps[props.activeStep].fields[props.field.name]
  );
  let disabled=field.disabled
  const handleChange =(e) => {
    

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

 

  const blueColor = '#007FFF'; 
  
        return (

      
          <Typography
            variant="body1" className='addfam'
            sx={{
              color: disabled ? 'gray' : blueColor,
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? '0.3' : '1',
            }}
            onClick={!disabled ? handleChange : null}
          >
            {`+ ${field.label}`}
          </Typography>
         
         
        );

}
