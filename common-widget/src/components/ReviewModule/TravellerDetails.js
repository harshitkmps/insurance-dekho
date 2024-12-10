import React from "react";
import { Grid, Card } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import './paymentdetail.css'

function TravellerDetails(props) {
  return (
    <div className="fb_DetailC ownerdetail" >
      <Card className="detailCard">
        <CardContent className="innerWrap">
          <h2 className={props.addressClass||""}>{props.heading}</h2>
          <Grid container direction="row">
            <Grid style={{ fontSize:"15px", color:"#333846", fontWeight:"600" }}
              item
              xs={6}
            >{props.subheading}
            </Grid>
              {props.readOnly && props.readOnly == true ?
                <Grid></Grid> :
                <Grid className="dotborderLink plandlink">
                <span onClick={props.edit} > Edit</span>
                </Grid> 
              }
          </Grid>
          {props.Proposer.map((option) =>
            Object.entries(option).map((option2) => (
              <div >
                <Grid
                  container
                  // spacing={26}
                  direction="row"
                  style={{ padding: "16px 0px 0px", fontSize:"13px" }}
                >
                  {option2[0] === 'title' ? 
                    <React.Fragment>
                      <Grid item xs={4} style={{ fontSize:"15px", fontWeight:"600" }}>
                        <span>{option2[1]}</span>
                      </Grid>
                    </React.Fragment>
                    :
                    <React.Fragment>
                      <Grid item xs={4} style={{ fontSize:"13px" }}>
                        <span>{option2[0]}</span>
                      </Grid>
                      <Grid item xs={6}  style={{ fontSize:"13px" }}>
                        <span>{option2[1]}</span>
                      </Grid>
                    </React.Fragment>
                  }
                </Grid>
              </div>
            ))
          )}
          {props.Members.map((option) =>
            Object.entries(option).map((option2) => (
              <div>
                <Grid
                  container
                  // spacing={26}
                  direction="row"
                  style={{ padding: "16px 0px 0px" }}
                >
                  <Grid item xs={4} style={{ fontSize:"13px" }}>
                    <span>{option2[0]}</span>
                  </Grid>
                  <Grid item xs={6} style={{ fontSize:"13px" }}>
                    <span>{option2[1]}</span>
                  </Grid>
                </Grid>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TravellerDetails;
