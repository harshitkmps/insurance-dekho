import FormLabel from "@mui/material/FormLabel";
import { createDispatchHook, createSelectorHook } from "react-redux";

export default function (props) {
  const useSelector = createSelectorHook(props.context);
  let activeStep = useSelector(
    (state) => state.ReactFormBuilderReducer.activeStep
  );
  let field = useSelector(
    (state) =>
      state.ReactFormBuilderReducer.steps[props.activeStep].fields[props.field.name]
  );
  let style = {}
  if(field.note == "note")
  {
    style = {
    fontFamily: "Poppins",
    fontWeight: "normal",
    fontSize: "12px",
    lineHeight: "23px",
    color: " #333846",}
  }
  else
  {
    style={
      fontFamily: "Poppins",
      fontWeight: "bold",
      fontSize: "15px",
      lineHeight: "23px",
      color: " #333846",
    }
  }
  return (
    <FormLabel
      style={style}
    >
      {field.label}
    </FormLabel>
  );
}
