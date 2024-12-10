import React from "react";
import RFBProgress from "./RFBProgress";
export default function ({ context, children }) {
  return (
    <React.Fragment>
      <RFBProgress context={context}></RFBProgress>
      {children}
    </React.Fragment>
  );
}
