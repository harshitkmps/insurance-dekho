import Box from "@mui/material/Box";
import { createDispatchHook, createSelectorHook } from "react-redux";
import styled from "@emotion/styled";

import arrow from '../../../img/arrow.svg'

export default function (props) {
  const useSelector = createSelectorHook(props.context);
  const useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();
  let activeStep = useSelector(
    (state) => state.ReactFormBuilderReducer.activeStep
  );
  let step = useSelector(
    (state) => state.ReactFormBuilderReducer.steps[activeStep]
  );
  let field = useSelector(
    (state) =>
      state.ReactFormBuilderReducer.steps[props.activeStep].fields[
        props.field.name
      ]
  );
  let customValidators = useSelector(
    (state) => state.ReactFormBuilderReducer.customValidators || {}
  );
  const eventListener = useSelector(
    (state) => state.CommonReducer.moduleOptions.eventListener
  );


  let onSubmit = () => {};
  try {
    onSubmit = useSelector(
      (state) => state.ReactFormBuilderReducer.steps[activeStep].onSubmit
    );
  } catch (e) {
    console.log(e);
  }

  let resolve = function (payload) {
    dispatch({
      type: "HANDLE_SUBMIT_SUCCESS",
      payload: { message: (payload && payload.message) || "" },
    });
  };
  let reject = function (payload) {
    dispatch({
      type: "HANDLE_SUBMIT_FAILURE",
      payload: { message: (payload && payload.message) || "" },
    });
  };
  let submitStep = function (e) {
    dispatch({
      type: "VALIDATE_SUBMIT_FORM_STEP",
      payload: { step: step, customValidators: customValidators },
    });
      let data = {};
      for (let field in step.fields) {
        data[field] = step.fields[field].value;
      }
      
      if (step.onSubmit) {
        onSubmit(data, resolve, reject,step,(newstep) => {
          if (newstep) {
            dispatch({
              type: "UPDATE_STEP",
              payload: { step: newstep },
            });
          }
        },
        (valid)=>{
          if(valid)
          {
            console.log("submitted form")
            eventListener("HANDLE_SUBMIT", data, resolve, reject, step, (newstep) => {
              if (newstep) {
                dispatch({
                  type: "UPDATE_STEP",
                  payload: { step: newstep },
                });
              }
            });
          }
        }
        );
      }
  };

  const Button = styled.button`
    background: #f34653;
    height: 52px;
    box-shadow: 0px 8px 8px rgba(243, 70, 83, 0.2);
    width: 100%;
    border-radius: 8px;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
  `;
  return (
    <Box sx={{width: '100%'  }} className={`ctaBtn ${step.submitButtonSticky ? "ctaBtnSticky" : ""}`}  fullWidth>
    {field.heading?<p className="errorText">{field.heading}</p>:null}
    <Button className={step.submitButtonDisabled?"disabled":""}  onClick={submitStep} variant="contained"  sx={{ mt: 0, ml: 0,  }}>
        {(step && step.submitButtonLabel) || "Submit"} 
        <img src={arrow} alt='' style={{marginLeft:"8px", verticalAlign:"middle" }}/>
        <i className={step.submitButtonLoader ? 'whiteCircle_m' : ''}></i>
      </Button>
    </Box>
  );
}