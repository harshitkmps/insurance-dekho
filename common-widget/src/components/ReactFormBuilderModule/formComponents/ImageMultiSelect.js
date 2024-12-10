import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { createDispatchHook, createSelectorHook } from "react-redux";
import { Grid } from "@mui/material";
import React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

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
    } else {
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
  // delete field.helperText;
  let error = field.error;
  // delete field.error;
  return (
    <FormControl error={error} fullWidth={true}>
      <FormLabel
        id={field.id}
        style={{
          fontFamily: "Poppins",
          fontSize: "12px",
          color: "#66686B",
          marginBottom: "16px",
          fontWeight:"600",
          color:"#333846",
        }}
      >
        {field.label}
      </FormLabel>

      <Grid
        container
        rowSpacing={2}
        columnSpacing={1}
        direction="row"
        justifyContent="center"
        alignItems="center"
        marginBottom="24px"
        className="petcounts"
      >
        {field.options.map((option) => {
          let selected = field.value.indexOf(option.value) !== -1;
          return (
            <Grid item xs={4} sm={3}>
              <Card
                style={{
                  cursor: "hand",
                  border: selected ? "1px solid #007FFF" : "",
                  boxShadow: "0px 2px 8px rgba(99, 99, 99, 0.16)",
                  borderRadius: "8px",
                }}
                key={option.value}
                value={option.value}
                onClick={(e) => {
                  if (!field.disabled) onClick(e, option.value);
                }}
                sx={{
                  height: 100,
                }}
              >
                <CardMedia
                  component="img"
                  width="100%"
                  height="75"
                  image={option.icon}
                />
                <Typography
                  align="center"
                  fontSize="12px"
                  noWrap
                  style={{
                    padding: "4px 0",
                    fontFamily: "'Poppins'",
                    // textOverflow: "ellipsis", overflow: "hidden"
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
