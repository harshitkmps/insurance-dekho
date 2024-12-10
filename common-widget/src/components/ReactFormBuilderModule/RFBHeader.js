import Typography from "@mui/material/Typography";
import { Fragment } from "react";
import RFBBack from "./RFBBack";
import { createSelectorHook } from "react-redux";

import './RFBHeader.css';

export default function ({ context }) {
  const useSelector = createSelectorHook(context);

 

  let heading = useSelector((state) => state.ReactFormBuilderReducer.heading);
  return (
    <Fragment>
      <RFBBack context={context}></RFBBack>
      {heading && <Typography component="h1" variant="h1" align="left" style={{marginTop: "20px", fontFamily: "Poppins",
      fontWeight: "600", fontSize: "27px"
    }}>
        {heading}
      </Typography>}
    </Fragment>
  );
}
