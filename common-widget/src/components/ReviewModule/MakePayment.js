import React from "react";
import { Grid, Card, Button } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import './makepayment.css'

function MakePayment(props) {
  return (
    <div className="makepay">
      <Card style={{boxShadow:"none", borderRadius:"0", padding:"0 24px"}}>
        <CardContent style={{ padding: "0" }}>
          <Grid container direction="row" style={{ padding: "0" }}>
            <Grid item xs={6}>
              <span
                style={{
                  fontSize: "19px", fontWeight:"bold"
                }}
              >
                {props.amount}
              </span>
              <span
                style={{
                  fontSize: "10px", color:"rgba(51, 56, 70, 0.7)"
                }}
              >
                {" "}
                {props.amountSubheading}
              </span>
            
              <div
                style={{ display:"block", marginTop:"4px" }}
              >
                <span  style={{ fontWeight:"bold",
                  borderBottom: "2px dotted #333846", color:"#333846", fontSize: "12px",
                  textDecoration: "none"
                }} onClick={()=>{if(props.onPremiumClick){props.onPremiumClick()}}}>Premium Breakup</span>
              </div>
            </Grid>
            <Grid item xs={6} style={{ textAlign: "right" }}>
              <Button
                variant="contained"
                onClick={props.onCTAClick}
                style={{
                  backgroundColor: "#F34653",
                  textTransform: "none",
                  padding: "0 12px",
                  height:"44px", borderRadius:"8px", boxShadow:"none", fontSize:"13px"
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Make Payment
                <i className={props.showLoader ? 'whiteCircle_m' : ''}></i>
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
}

export default MakePayment;
