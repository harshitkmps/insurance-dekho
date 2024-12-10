import * as constants from "../constants";

/**
 * Redux Reducer : "FormBuilderReducer"
 * Purpose : Reducer provides a new state after state manipulation on a certain action
 */
let defaultState = {};

const ReactFormBuilderReducer = (state = defaultState, action) => {
  switch (action.type) {
    case constants.INIT_RFB:
      return { ...state, ...action.payload };
    case constants.UPDATE_FIELD_VALUE: {
      let steps = [...state.steps];
      if(action.payload.hasOwnProperty('extraValue')){
        steps[state.activeStep].fields[action.payload.field].extraValue =
        action.payload.extraValue;
        return { ...state, steps: steps };
      }
      steps[state.activeStep].fields[action.payload.field].value =
        action.payload.value;
      return { ...state, steps: steps };
    }
    case constants.SET_ACTIVE_STEP: {
      return { ...state, activeStep: action.payload.activeStep };
    }
    case constants.VALIDATE_FIELD_VALUE:
      return { ...state };
    case constants.VALIDATE_SUBMIT_FORM_STEP:
      return { ...state, steps: [...state.steps] };

    case constants.HANDLE_SUBMIT_SUCCESS: {
      let steps = [...state.steps];
      let activeStep = state.activeStep;
      steps[activeStep]['submitted'] = true
      //steps[activeStep]['submitButtonLoader'] = false
      if (steps[state.activeStep + 1]) {
        activeStep = activeStep + 1;
      }
      return {
        ...state,
        error: false,
        serverMessage: action.payload.message,
        activeStep: activeStep,
      };
    }
    case constants.HANDLE_SUBMIT_FAILURE:
      let steps = [...state.steps];
      let activeStep = state.activeStep;
      //steps[activeStep]['submitButtonLoader'] = false
      return { ...state, error: true, serverMessage: action.payload.message, steps: [...steps] };

    case constants.UPDATE_STEP: {
      let steps = state.steps;
      let activeStep = state.activeStep;
      steps[activeStep] = {...action.payload.step};
      return { ...state, steps: [...steps] };
    }
    case constants.GO_BACK: {
      let steps = [...state.steps];
      let activeStep = state.activeStep;
      if (steps[state.activeStep - 1]) {
        activeStep = activeStep - 1;
      }
      return {
        ...state,
        activeStep: activeStep,
      };
    }

    default: {
      return state;
    }
  }
};
export default ReactFormBuilderReducer;
