import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createDispatchHook, createSelectorHook } from "react-redux";
import Button from "@mui/material/Button";
import { Fragment } from "react";
import { goBack } from "../../redux/actions/ReactFormBuilderActions";
export default function ({ context }) {
  const useSelector = createSelectorHook(context);
  const useDispatch = createDispatchHook(context);
  const dispatch = useDispatch();
  let activeStep = useSelector(
    (state) => state.ReactFormBuilderReducer.activeStep
  );

  const stepsLayout = useSelector(
    (state) => state.ReactFormBuilderReducer.stepsLayout
  );
  let onClick = () => {
    dispatch(goBack());
  };
  if (activeStep > 0 && stepsLayout != "Accordion") {
    return (
      <Button onClick={onClick}>
        <ArrowBackIcon color="primary"></ArrowBackIcon>
      </Button>
    );
  } else {
    return <Fragment></Fragment>;
  }
}
