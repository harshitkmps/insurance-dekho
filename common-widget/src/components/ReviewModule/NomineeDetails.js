import React from "react";
import { Grid, Card } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import PdfIcon from '../../img/ic-pdf.svg';
import './paymentdetail.css'

function NomineeDetails(props) {
  return (
    <div className="fb_DetailC dogdetail" >
      <Card className="detailCard">
        <CardContent  className="innerWrap">
        <h2>{props.subheading}</h2>
          <Grid container direction="row">
              {props.readOnly && props.readOnly == true ?
                <Grid></Grid> :
                <Grid className="dotborderLink plandlink">
                <span onClick={props.edit} > Edit</span>
                </Grid> 
              }
          </Grid>
          {props.Nominee.map((option) =>
            Object.entries(option).map((option2) => (
              <div>
                <Grid
                  container
                  direction="row"
                  style={{ padding: "16px 0px 0px" }}
                >
                  <Grid item xs={4} style={{ fontSize:"13px", color:"#333846" }}>
                    <span>{option2[0]}</span>
                  </Grid>
                  <Grid item xs={8} style={{ fontSize:"13px", color:"#333846" }}>
                    <span>{option2[1]}</span>
                  </Grid>
                </Grid>
              </div>
            ))
          )}

          {props.images && props.images.length > 0 && (
            <div>
              <Grid
                container
                direction="row"
                style={{ padding: "20px 0px 0px" }}
              >
                <Grid item xs={4}>
                  <span>Documents</span>
                </Grid>
                <Grid item xs={8}>
                  {props.images.map((image) => (
                    <Card className="photos"
                      style={{
                        cursor: "hand",
                      }}
                      key={image.value}
                      value={image.value}
                      sx={{
                        height: 80,
                        width:80,
                      }}
                    >
                      {image.value == "pdf" ? 
                      <CardMedia
                        component="img"
                        image={PdfIcon}
                        sx={{
                          height: 32,
                          width:32
                        }}
                        onClick={()=>{
                          window.open(image.link, '_blank', 'noopener,noreferrer');
                        }}
                      />:
                      <CardMedia
                        component="img"
                        image={image.link}
                        onClick={()=>{
                          window.open(image.link, '_blank', 'noopener,noreferrer');
                        }}
                      />}
                    </Card>
                  ))}
                </Grid>
              </Grid>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default NomineeDetails;
