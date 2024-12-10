import Box from "@mui/material/Box";
import { createDispatchHook, createSelectorHook } from "react-redux";
import styled from "@emotion/styled";

import arrow from '../../img/arrow.svg';
import './RFBCallToAction.css'

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
    //step.submitButtonDisabled = true;
    dispatch({
      type: "VALIDATE_SUBMIT_FORM_STEP",
      payload: { step: step, customValidators: customValidators },
    });

    let data = {};
    for (let field in step.fields) {
      data[field] = step.fields[field].value;
    }
    if (Object.keys(step.errors || {}).length == 0) {
      eventListener("HANDLE_SUBMIT", data, resolve, reject, step, (newstep) => {
        if (newstep) {
          //newstep.submitButtonDisabled = false;
          dispatch({
            type: "UPDATE_STEP",
            payload: { step: newstep },
          });
        }
      });
      if (onSubmit) {
        onSubmit(data, resolve, reject,step,(newstep) => {
          if (newstep) {
            //newstep.submitButtonDisabled = false;
            dispatch({
              type: "UPDATE_STEP",
              payload: { step: newstep },
            });
          }
        });
      }
    } else if (step.handleSubmitOnValidationFail) {
      eventListener("HANDLE_SUBMIT_VALIDATION_FAILURE", data, resolve, reject, step, (newstep) => {
        if (newstep) {
          dispatch({
            type: "UPDATE_STEP",
            payload: { step: newstep },
          });
        }
      })
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
    <Box sx={{width: '100%'  }} className={`ctaBtn ${step.submitButtonSticky ? "ctaBtnSticky" : ""} ${step.disableClassOnSubmit ? 'disable':''}`}  fullWidth>
    { !step.hideSubmitButton && <Button disabled={step && step.submitButtonDisabled} onClick={submitStep} variant="contained"  sx={{ mt: 0, ml: 0,  }}>
        {(step && step.submitButtonLabel) || "Submit"} 
        {!step.hideSubmitButtonIcon && <img src={arrow} style={{ marginLeft: "8px", verticalAlign: "middle" }} />}
        {step.showSubmitBtnAnimation &&  <span className='arrow-animation'><img src="/common-widgets/icons/arrow-animation.gif" title="arrow" alt="arrow" width="22" height="22" /></span>}
        <i className={step.submitButtonLoader ? 'whiteCircle_m' : ''}></i>
      </Button>}
    </Box>
  );
}