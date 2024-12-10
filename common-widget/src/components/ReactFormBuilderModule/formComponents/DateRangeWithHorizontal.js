import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { createDispatchHook, createSelectorHook } from "react-redux";

import "./css/daterange.scss";

export default function(props) {
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
  let v=field.closed
  let handleChange = function (item) {
    if(item.selection['endDate'] && (item.selection['endDate']>item.selection['startDate'])){
      v=true;
    }
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: item.selection,
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
      field.onChange(item, step, (newstep) => {
        if (newstep) {
          dispatch({
            type: "UPDATE_STEP",
            payload: { step: newstep },
          });
        }
      });
    }
  };

  field.value = field.value || {}
  field.value.startDate = field.value.startDate || new Date()
  field.value.endDate = field.value.endDate || new Date()

  const selectionRange = {
    startDate: field.value.startDate,
    endDate: field.value.endDate,
    key: 'selection',
  }
  return (
     !v && <DateRange className="fb_daterange"
      onChange={(item)=> {handleChange(item)}}
      direction={field.orientation?field.orientation:"horizontal"}
      minDate={field.minDate}
      maxDate={field.maxDate}
      months={field.month?field.month:2}
      ranges={[selectionRange]}      
      />
  );
}