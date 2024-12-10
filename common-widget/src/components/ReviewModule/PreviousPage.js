import React from "react";
import { Grid, Card } from "@mui/material";
import CardContent from "@mui/material/CardContent";
function PreviousPage(props) {
  return (
    <div
      style={{ display: "flex", justifyContent: "center", padding: "10px 0px" }}
    >
      <Card
        sx={{
          width: 360,
          maxheight: 400,
        }}
        style={{ padding: "0px 5px" }}
      >
        <CardContent>
          <img src={props.logo} alt="" onClick={props.previous}></img>
        </CardContent>
      </Card>
    </div>
  );
}

export default PreviousPage;
