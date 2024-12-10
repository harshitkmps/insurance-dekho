import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { createDispatchHook, createSelectorHook } from "react-redux";
import { Grid } from "@mui/material";
import React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

import "./css/multiSelectWithoutImages.scss";

const CheckBox = (props) => {
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
  let step = useSelector(
    (state) => state.ReactFormBuilderReducer.steps[props.activeStep]
  );

  field.value = field.value || [];
  let onClick = function (e, v) {
    let values = field.value || [];

    if (values.indexOf(v) !== -1) {
      values = values.filter((i) => i != v);
    } else if(!field.disabled){
      values.push(v);
    }

    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: values,
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
  let helperText = field.helperText;
  let error = field.error;
  return (
    <FormControl error={error} fullWidth={true} className="multiselectwithoutImg">
      <FormLabel
        id={field.id}>
        {field.label}
      </FormLabel>

      <Grid
        container
        rowSpacing={2}
        columnSpacing={1}
        direction="row"
        justifyContent="left"
        alignItems="left"
        marginBottom="10px"
        className="tabcounts"
      >
        {field.options.map((option) => {
          let selected = field.value.indexOf(option.value) !== -1;
          let c=selected?"lists active":"lists";
          return (
            <Grid className={c}>
              <Card className="listbox"
                key={option.value}
                value={option.value}
                onClick={(e) => { onClick(e, option.value);
                }}
                
              >
                <Typography
                  align="center"
                  fontSize="13px"
                  noWrap
                  style={{
                    fontFamily: "'Poppins'",
                  }}
                >
                  {option.label}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
};
export default CheckBox;