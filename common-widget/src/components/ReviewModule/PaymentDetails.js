import React from "react";
import { Grid, Card } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import { createDispatchHook, createSelectorHook } from "react-redux";
import ProposalScoreCard from "./ProposalScoreCard";

import './paymentdetail.css'

function PaymentDetails(props) {
  // props.Details.map((option) =>
  //   Object.entries(option).map((option2) => console.log(option2[0], option2[1]))
  // );
  return (
    <div className="fb_DetailC cardfirst">
      <Card className="detailCard" >
        <CardContent className="innerWrap">
          {props.heading && <h2>{props.heading}</h2>}
          <Grid container spacing={0} direction="row" alignItems="center">
            <Grid className="brandLogo">
              <img src={props.insurerLogo} alt=""></img>
            </Grid>
            <Grid className="brandNam black3 bold">
           {props.insurerName}
             <span> {props.insurerPlan} </span>
            </Grid>
            {/* <Grid className="dotborderLink plandlink">
              <span>Plan Details</span>
            </Grid> */}
          </Grid>
          {props.Details.map((option) =>
            Object.entries(option).map((option2) => (
              <div>
                <Grid
                  container
                  // spacing={26}
                  direction="row"
                  style={{ padding: "16px 0px 0px", fontSize:"13px" }}
                >
                  <Grid item xs={6} style={{ fontSize:"13px", color:"#333846" }}>
                    <span>{option2[0]}</span>
                  </Grid>
                  <Grid item xs={6} style={{ textAlign: "right", fontSize:"13px", color:"#333846" }}>
                    <span>
                      <b>{option2[1]}</b>
                    </span>
                  </Grid>
                </Grid>
              </div>
            ))
          )}
         {!props.hidePremium && <Grid
            container
            // spacing={20}
            direction="row"
            style={{ padding: "16px 0px 0px" }}
          >
            <Grid item xs={6} style={{ fontSize:"13px", color:"#333846", fontWeight:"600" }}>
           Total Premium
            </Grid>
            <Grid item xs={6} style={{ fontSize:"17px", color:"#333846", fontWeight:"600", textAlign: "right" }}>
              <span
              >
                {props.amount}
              </span>
              <span style={{ fontSize:"10px", display:"block", color:"rgba(51, 56, 70, 0.7)",}}>
                {props.amountSubheading}
              </span>
            </Grid>
          </Grid>}
          {props.scorecard && <Grid>
            <ProposalScoreCard 
              points={props.points} 
              showScore={props.showScore}
              getScores={props.getScores}
              buttonLoading={props.buttonLoading}
            />
          </Grid>}
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentDetails;
