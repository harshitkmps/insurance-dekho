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
  let handleChange = function (e) {
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
  };
  let helperText = field.helperText;
  // delete field.helperText;
  let error = field.error;
  // delete field.error;
  return (
    <Grid
      container
      style={{
        background: "linear-gradient(97.28deg, #FFEBF1 0%, #EBF5FF 94.46%)",
        borderRadius: "8px",
        alignContent: "center",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        fontSize: "10px",
        width: "320px",
        height: "64px",
      }}
    >
      <Grid width="10" height="20" item xs={1} sm={1}>
        {" "}
        <img src="/common-widgets/icons/idea2.svg" />
      </Grid>
      <Grid item xs={11} sm={11}>
        {" "}
        {field.label}
      </Grid>
    </Grid>
  );
}
