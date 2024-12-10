import React from "react";
import { Grid, Card, Button } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function PremiumBreakup(props) {
  return (
    <div  className="fb_DetailC">
      <Card className="detailCard">
        <CardContent  className="innerWrap">
        <h2>{props.heading}</h2>
         
          {props.Premium.map((option) =>
            Object.entries(option).map((option2) => (
              <div>
                <Grid
                  container
                  direction="row"
                  style={{ padding: "0px 0px 16px" }}
                >
                  <Grid item xs={6} style={{ fontSize:"13px" }}>
                    <span>{option2[0]}</span>
                  </Grid>
                  <Grid item xs={6} style={{ textAlign: "right", fontSize:"13px" }}>
                    <span>{option2[1]}</span>
                  </Grid>
                </Grid>
              </div>
            ))
          )}
          <Grid container direction="row" style={{ padding: "16px 0px 0px", fontSize:"13px", borderTop:"1px solid rgba(51, 56, 70, 0.1)" }}>
            <Grid item xs={6}>
              <span>Total Payable</span>
            </Grid>
            <Grid item xs={6} style={{ textAlign: "right",fontSize:"15px", fontWeight:"bold" }}>
              <span>
                {props.TotalPayable}
              </span>
            </Grid>
          </Grid>

              {!props.hideInsureNow &&<div style={{ margin: "20px 0px 0px" }}> 
                <button className="lightbutton" title="Insure Now" onClick={()=>props.onCTAClick()}>Insure Now</button>
              </div>}

        </CardContent>
      </Card>
    </div>
  );
}

export default PremiumBreakup;
