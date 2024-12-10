import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
export default function ({ serverMessage, error }) {
  return (
    <Box sx={{ mt: 1, mb: 1 }} className="fb_servermessage"  style={{ margin:"0px" }} >
      {error && serverMessage && (
        <Alert style={{borderRadius:"8px", padding:"2px 12px", margin:"0px",  fontFamily:"poppins", fontSize:"12px" }} severity="error">{serverMessage}</Alert>
      )}
      {!error && serverMessage && (
        <Alert severity="success">{serverMessage}</Alert>
      )}
    </Box>
  );
}
