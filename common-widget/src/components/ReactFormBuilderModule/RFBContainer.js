import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Paper from "@mui/material/Paper";
import Typography from '@mui/material/Typography';
import { createDispatchHook, createSelectorHook } from "react-redux";

const theme = createTheme();
export default function (props) {

  const useSelector = createSelectorHook(props.context);
  let activeStep = useSelector(
    (state) => state.ReactFormBuilderReducer.activeStep
  );

  let step = useSelector(
    (state) => state.ReactFormBuilderReducer.steps[activeStep]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container className="MainForm" component="main" style={{padding: "0" }} maxWidth="sm" sx={{ mb: 4 }}>
        {/** Paper component is taken as a base layout as we have identified it as the best possible background component of any container*/}
        <Paper style={{backgroundColor: "transparent" }}  sx={{ my: { xs: 0, md: 0 }}} elevation={0}>
          {props.children}
        </Paper>
       {step.terms && 
        <Typography mt={2} align="center" fontSize={10} gutterBottom component="p">
         <div dangerouslySetInnerHTML={{ __html: step.terms}}></div>
         </Typography>
      }
       
      </Container>
    </ThemeProvider>
  );
}
